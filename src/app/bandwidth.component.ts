import { Component, OnInit } from '@angular/core';
import {ConfigService, Result} from "./config/config.service";
import {formatDate} from "@angular/common";
@Component({
  selector: 'Bandwidth',
  templateUrl: './bandwidth.component.html',
  styleUrls: ['./bandwidth.component.css'],
  providers: [ConfigService]
})
export class BandwidthComponent implements OnInit {
  constructor(private configService: ConfigService) {
    this.showBandwidth = this.showBandwidth.bind(this);
  }
  public barChartOptions = {
    scaleShowVerticalLines: false,
    responsive: true
  };
  public barChartLabels = [];
  public barChartType = 'line';
  public barChartLegend = true;
  public barChartData = [
    {data: [], label: 'Byte per second'},
  ];

  showBandwidth() {
    this.configService.getBandwidth(2).subscribe((data: Result) => {
      console.log(data.data.result);
      if (data.data.result.length > 0) {
        this.barChartData[0].data.push(data.data.result[0].values[0][1]);
        this.barChartLabels.push(formatDate(Math.round(data.data.result[0].values[0][0] * 1000), 'mediumTime', 'en-US'));
      }
      else {
        this.barChartData[0].data.push( this.barChartData[0].data[ this.barChartData[0].data.length - 1]);
        this.barChartLabels.push(formatDate(Date.now(), 'mediumTime', 'en-US'));
      }

      if (this.barChartData[0].data.length >= 20){
        this.barChartData[0].data.shift();
        this.barChartLabels.shift();
      }
    });
  }

  ngOnInit() {
    setInterval(this.showBandwidth, 2000);
  }
}
