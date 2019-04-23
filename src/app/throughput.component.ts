import { Component, OnInit } from '@angular/core';
import {ConfigService, Result} from "./config/config.service";
@Component({
  selector: 'Throughput',
  templateUrl: './throughput.component.html',
  styleUrls: ['./throughput.component.css'],
  providers: [ConfigService]
})
export class ThroughputComponent implements OnInit {
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
    {data: [], label: 'Success operations'},
    {data: [], label: 'Failed operations'}
  ];

  showOperations() {
    const self = this;
    const timestamp = Math.round(Date.now() / 1000);
    this.configService.getSuccessOperations(timestamp).subscribe((resSuccess: Result) => {
      self.configService.getFailedOperations(timestamp).subscribe((resFailed: Result) => {
        const valSuccess = resSuccess.data.result[0].values[0];
        const valFailed = resFailed.data.result[0].values[0];

        self.barChartData[0].data.push(valSuccess[1]);
        self.barChartData[1].data.push(valFailed[1]);
        self.barChartLabels.push(valSuccess[0]);
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
