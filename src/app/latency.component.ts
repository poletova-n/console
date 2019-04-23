import { Component, OnInit } from '@angular/core';
import {ConfigService, Result} from "./config/config.service";
import {formatDate} from "@angular/common";
@Component({
  selector: 'Latency',
  templateUrl: './latency.component.html',
  styleUrls: ['./latency.component.css'],
  providers: [ConfigService]
})
export class LatencyComponent implements OnInit {
  constructor(private configService: ConfigService) {
    this.showOperations = this.showOperations.bind(this);
  }

  public barChartOptions = {
    scaleShowVerticalLines: false,
    responsive: true
  };
  public barChartLabels = [];
  public barChartType = 'line';
  public barChartLegend = true;
  public barChartData = [
    {data: [], label: 'Latency max'},
    {data: [], label: 'Latency min'}
  ];

  showOperations() {
    const self = this;
    this.configService.getLatencyMax(2).subscribe((resSuccess: Result) => {

      self.configService.getLatencyMin(2).subscribe((resFailed: Result) => {
        if (resSuccess.data.result.length > 0) {
          const valSuccess = resSuccess.data.result[0].values[0];
          self.barChartData[0].data.push(valSuccess[1]);
        }
        else {
          self.barChartData[0].data.push(self.barChartData[0].data[self.barChartData[0].data.length - 1]);
        }

        if (resFailed.data.result.length > 0) {
          const valFailed = resFailed.data.result[0].values[0];
          self.barChartData[1].data.push(valFailed[1]);
        }
        else {
          self.barChartData[1].data.push(self.barChartData[1].data[self.barChartData[1].data.length - 1]);
        }

        self.barChartLabels.push(formatDate(Date.now(), 'mediumTime', 'en-US'));
        if (this.barChartLabels.length >= 20){
          this.barChartData[0].data.shift();
          this.barChartData[1].data.shift();
          this.barChartLabels.shift();
        }

      })
    })
  }

  ngOnInit() {
    setInterval(this.showOperations, 2000);
  }
}
