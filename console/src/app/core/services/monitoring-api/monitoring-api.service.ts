import { Injectable } from "@angular/core";
import { Constants } from "src/app/common/constants";
import { BehaviorSubject, Observable, of } from "rxjs";
import { MongooseRunRecord } from "../../models/run-record.model";
import { PrometheusApiService } from "../prometheus-api/prometheus-api.service";
import { MongooseRunStatus } from "../../models/mongoose-run-status";
import { mergeMap, map, catchError } from "rxjs/operators";
import { MongooseMetrics } from "../mongoose-api-models/MongooseMetrics";
import { MongooseApi } from "../mongoose-api-models/MongooseApi.model";
import { HttpClient } from "@angular/common/http";
import { ControlApiService } from "../control-api/control-api.service";


@Injectable({
  providedIn: 'root'
})
export class MonitoringApiService {

  private readonly MONGOOSE_HTTP_ADDRESS = Constants.Http.HTTP_PREFIX + Constants.Configuration.MONGOOSE_HOST_IP;
  private currentMongooseRunRecords$: BehaviorSubject<MongooseRunRecord[]> = new BehaviorSubject<MongooseRunRecord[]>([]);

  // NOTE: availableLogs is a list of logs provided by Mongoose. Key is REST API's endpoint for fetching the log, ...
  // ... value is a displaying name. 
  private availableLogs: Map<String, String> = new Map<String, String>();

  // MARK: - Lifecycle 

  constructor(private prometheusApiService: PrometheusApiService,
    private controlApiService: ControlApiService,
    private http: HttpClient) {
    this.setUpService();
  }

  // MARK: - Public

  public getStatusForMongooseRecord(targetRecordRunId: string): Observable<MongooseRunStatus> {
    // NOTE: As for now, we're checking status for Mongoose run overtall, not just Run ID. 
    return this.controlApiService.isMongooseRunActive(targetRecordRunId).pipe(
      map(isMongooseRunActive => { 
        if (isMongooseRunActive) { 
          return MongooseRunStatus.Running;
        }
        return MongooseRunStatus.Finished;
      })
    )
  }

  public getCurrentMongooseRunRecords(): Observable<MongooseRunRecord[]> {
    return this.currentMongooseRunRecords$.asObservable().pipe(
      map(records => {
        // NOTE: Records are being sorted for order retaining. This ...
        // ... is useful while updating Run Records table. 
        records = this.sortMongooseRecordsByStartTime(records);
        return records;
      })
    );
  }

  public getMongooseRunRecordsFiltredByStatus(status: string): Observable<MongooseRunRecord[]> {
    return this.getCurrentMongooseRunRecords().pipe(
      map(records => {
        return this.filterRunfiltredRecordsByStatus(records, status);
      })
    )
  }

  public getMongooseRunRecordByLoadStepId(loadStepId: String): Observable<MongooseRunRecord> {
    if (loadStepId = "") { 
      throw Error("Load step ID hasn't been saved.");
    }
    return this.getCurrentMongooseRunRecords().pipe(
      map(records => {
        let record = this.findMongooseRecordByLoadStepId(records, loadStepId);
        return record;
      },
        error => {
          console.error(`Something went wrong during filtring records by status: ${error.message}`);
        })
    );
  }

  // NOTE: Returning hard-coded metrics name in order to test the UI first.
  public getAvailableLogNames(): String[] {
    let availableLogsName = Array.from(this.availableLogs.values());
    return availableLogsName;
  }

  // NOTE: Fetching duration for the target run record 
  public getDuration(targetRecord: MongooseRunRecord): Observable<any> {

    // NOTE: Duration won't change if Mongoose run has finished. 
    if (targetRecord.getStatus() == MongooseRunStatus.Finished) {
      return;
    }

    let targetMetrics = MongooseMetrics.PrometheusMetrics.DURATION;
    let targetMetricLabels = MongooseMetrics.PrometheusMetricLabels.ID;

    var targetLabels = new Map<String, String>();
    targetLabels.set(targetMetricLabels, targetRecord.getLoadStepId());

    return this.prometheusApiService.getDataForMetricWithLabels(targetMetrics, targetLabels).pipe(
      map(runRecordsResponse => {
        let prometheusQueryResult = this.extractRunRecordsFromMetricLabels(runRecordsResponse);
        let firstElementIndex = 0;
        return prometheusQueryResult[firstElementIndex].getDuration();
      })
    )
  }

  public getLogApiEndpoint(displayingLogName: String): String {
    // NOTE: Finding first matching key. Key is an API's endpoint.
    var targetEndpoint: String = "";
    Array.from(this.availableLogs.keys()).forEach(key => {
      if (this.availableLogs.get(key) == displayingLogName) {
        targetEndpoint = key;
      }
    });
    return targetEndpoint;
  }

  public updateRecord(targetRecord: MongooseRunRecord): Observable<MongooseRunRecord> {
    // NOTE: Duration won't change if Mongoose run has finished. 
    if (targetRecord.getStatus() == MongooseRunStatus.Finished) {
      return;
    }

    let targetMetrics = MongooseMetrics.PrometheusMetrics.DURATION;
    let targetMetricLabels = MongooseMetrics.PrometheusMetricLabels.ID;

    var targetLabels = new Map<String, String>();
    targetLabels.set(targetMetricLabels, targetRecord.getLoadStepId());

    return this.prometheusApiService.getDataForMetricWithLabels(targetMetrics, targetLabels).pipe(
      map(runRecordsResponse => {
        let prometheusQueryResult = this.extractRunRecordsFromMetricLabels(runRecordsResponse);
        let firstElementIndex = 0;
        let fetchedRecord = prometheusQueryResult[firstElementIndex];
        return fetchedRecord;
      })
    )
  }


  public getLog(stepId: String, logName: String): Observable<any> {
    let logsEndpoint = MongooseApi.LogsApi.LOGS;
    let targetUrl = "";
    let delimiter = "/";
    let emptyValue = "";
    if (stepId == emptyValue) {
      console.error(`Step ID for required log "${logName}" hasn't been found.`);
      // NOTE: HTTP request on this URL will return error. 
      // The error will be handled and Mongoose's run status would be set to 'unavailable'. 
      // This is done in case Mongoose has been reloaded, but Prometheus still stores its metrics.
      targetUrl = this.MONGOOSE_HTTP_ADDRESS + logsEndpoint + delimiter + logName;
    } else {
      targetUrl = this.MONGOOSE_HTTP_ADDRESS + logsEndpoint + delimiter + stepId + delimiter + logName;
    }
    return this.http.get(targetUrl, { responseType: 'text' });
  }

  public getMongooseRunRecords(): Observable<MongooseRunRecord[]> {
    return this.prometheusApiService.getExistingRecordsInfo().pipe(
      map(
        metricsArray => {
          let runRecords: MongooseRunRecord[] = this.extractRunRecordsFromMetricLabels(metricsArray);
          // NOTE: Records are being sorted for order retaining. This ...
          // ... is useful while updating Run Records table. 
          runRecords = this.sortMongooseRecordsByStartTime(runRecords);
          // NOTE: Using behavior subject object in order to reduce amount of HTTP requests.
          this.currentMongooseRunRecords$.next(runRecords);
          return runRecords;
        },
        error => {
          let misleadingMsg = `An error has occured while loading Mongoose run records: ${error}`;
          console.error(misleadingMsg);
          alert(misleadingMsg)
          let emptyRecordsArray: MongooseRunRecord[] = [];
          return emptyRecordsArray;
        }
      )
    )
  }

  // MARK: - Private 

  private sortMongooseRecordsByStartTime(records: MongooseRunRecord[]): MongooseRunRecord[] {
    return records.sort((lhs, rhs) => {
      let hasLhsStartedEarlier = (Number(lhs.getStartTime()) < Number(rhs.getStartTime()));
      let valueTrue = 1;
      let valueFalse = -1;
      return hasLhsStartedEarlier ? valueTrue : valueFalse;
    });
  }

  private extractRunRecordsFromMetricLabels(rawMongooseRunData: any): MongooseRunRecord[] {

    var runRecords: MongooseRunRecord[] = [];
    console.log(`rawMongooseRunData: ${JSON.stringify(rawMongooseRunData)}`);

    // NOTE: Looping throught found Mongoose Run Records 
    for (var processingRunIndex in rawMongooseRunData) {
      // NOTE: Static run data contains non-computed values of Mongoose Run. 
      let metricsTag = "metric";
      let staticRunData = rawMongooseRunData[processingRunIndex][metricsTag];

      // MARK: - Retrieving static data 
      let runIdTag = "run_id";
      let runId = this.fetchLabelValue(staticRunData, runIdTag);

      let loadStepIdTag = "load_step_id";
      let loadStepId = this.fetchLabelValue(staticRunData, loadStepIdTag);

      let startTimeTag = "start_time";
      let startTime = this.fetchLabelValue(staticRunData, startTimeTag);

      let nodesListTag = "nodes_list";
      let nodesList = this.fetchLabelValue(staticRunData, nodesListTag);

      let userCommentTag = "user_comment";
      let userComment = this.fetchLabelValue(staticRunData, userCommentTag);

      // NOTE: Any computed info is stored within "value" field of JSON. ...
      // ... As for 21.03.2019, it's duration (position 1) and Prometheus DB index (position 0)
      let valuesTag = "value"; // NOTE: "Value" fetches Duration. 
      let computedRunData = rawMongooseRunData[processingRunIndex][valuesTag];

      // MARK: - Retrieving computed data.
      let durationIndex = 1;
      let duration = computedRunData[durationIndex];

      const mongooseRunStatus$ = this.getStatusForMongooseRecord(runId);

      let currentRunRecord = new MongooseRunRecord(runId, loadStepId, mongooseRunStatus$, startTime, nodesList, duration, userComment);
      runRecords.push(currentRunRecord);
    }

    return runRecords;
  }

  private fetchLabelValue(metricJson: any, label: string): any {
    let targetValue = metricJson[label];
    var isValueEmpty: Boolean = (targetValue == undefined);
    let emptyValue = "";
    return isValueEmpty ? emptyValue : targetValue;
  }

  // NOTE: Setting up service's observables 
  private setUpService() {
    this.configurateAvailableLogs();
  }

  private configurateAvailableLogs() {
    // NOTE: Key is a REST API endpoint's name, value is displaying name. 
    // NOTE: Endpoints can be found at https://github.com/emc-mongoose/mongoose/tree/master/doc/interfaces/api/remote#logs
    this.availableLogs.set("Config", "Configuration");
    this.availableLogs.set("Cli", "Command line arguments dump");
    this.availableLogs.set("Error", "Error messages");
    this.availableLogs.set("OpTraces", "Load operation traces");

    this.availableLogs.set("metrics.File", "Load step periodic metrics");
    this.availableLogs.set("metrics.FileTotal", "Load step total metrics log");
    this.availableLogs.set("metrics.threshold.File", "Load step periodic threshold metrics");
    this.availableLogs.set("metrics.threshold.FileTotal", "Load step total threshold metrics log");

    this.availableLogs.set("Messages", "Generic messages");
    this.availableLogs.set("Scenario", "Scenario dump");
  }

  private findMongooseRecordByLoadStepId(records: MongooseRunRecord[], id: String): MongooseRunRecord {
    if (records.length == 0) {
      let misleadingMsg = "Records list is empty, thus no record can be found.";
      throw new Error(misleadingMsg);
    }

    let targerRecord: MongooseRunRecord;
    records.filter(record => {
      if (record.getLoadStepId() == id) {
        targerRecord = record;
      }
    });

    if (!targerRecord) {
      // NOTE: Returning 'False' if record hasn't been found.
      let misleadingMsg = "Mongoose Run record with ID " + id + " hasn't been found.";
      throw new Error(misleadingMsg);
    }
    return targerRecord;
  }

  public filterRunfiltredRecordsByStatus(records: MongooseRunRecord[], requiredStatus: string): MongooseRunRecord[] {
    if (requiredStatus.toString() == MongooseRunStatus.All) {
      return records;
    }
    // NOTE: Iterating over existing tabs, filtring them by 'status' property.
    var requiredfiltredRecords: MongooseRunRecord[] = [];
    for (var runRecord of records) {
      if (runRecord.getStatus() == requiredStatus) {
        requiredfiltredRecords.push(runRecord);
      }
    }
    return requiredfiltredRecords;
  }

  private isLogFileExist(loadStepId: String, logName: String): Observable<any> {
    return this.getLog(loadStepId, logName).pipe(
      map(hasConfig => hasConfig = of(true)),
      catchError(hasConfig => hasConfig = of(false))
    );
  }
}
