import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface Result {
  data: any
}

@Injectable()
export class ConfigService {
  constructor(private http: HttpClient) { }
  durationUrl = "http://localhost:9090/api/v1/query?query=mongoose_duration_mean";
  bandwidthUrl = "http://localhost:9090/api/v1/query?query=mongoose_byte_rate_mean";
  successOpUrl = "http://localhost:9090/api/v1/query?query=mongoose_success_op_rate_mean";
  failedOpUrl = "http://localhost:9090/api/v1/query?query=mongoose_failed_op_rate_mean";
  latencyMinUrl = "http://localhost:9090/api/v1/query?query=mongoose_latency_min";
  latencyMaxUrl = "http://localhost:9090/api/v1/query?query=mongoose_latency_max";

  getDuration() {
    return this.http.get(this.durationUrl);
  }

  getBandwidth(timestamp = 1) {
    return this.http.get(this.bandwidthUrl + "[" + timestamp + "s]");
  }

  getSuccessOperations(timestamp = 1) {
    return this.http.get(this.successOpUrl + "[" + timestamp + "s]");
  }

  getFailedOperations(timestamp = 1) {
    return this.http.get(this.failedOpUrl + "[" + timestamp + "s]");
  }

  getLatencyMin(timestamp = 1) {
    return this.http.get(this.latencyMinUrl + "[" + timestamp + "s]");
  }

  getLatencyMax(timestamp = 1) {
    return this.http.get(this.latencyMaxUrl + "[" + timestamp + "s]");
  }
}
