import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {ConfigService, Result} from "./config/config.service";
import {formatDate} from "@angular/common";
@Component({
  selector: 'Duration',
  templateUrl: './duration.component.html',
  styleUrls: ['./duration.component.css'],
  providers: [ConfigService]
})
export class DurationComponent implements OnInit {
  constructor(private configService: ConfigService) {
    this.showConfig = this.showConfig.bind(this);
  }
  public barChartOptions = {
    scaleShowVerticalLines: false,
    responsive: true
  };
  public barChartLabels = [];
  public barChartType = 'line';
  public barChartLegend = true;
  public barChartData = [
    {data: [], label: 'mean duration'},
  ];

  showConfig() {
    this.configService.getDuration()
      .subscribe((data:Result) =>  {
        this.barChartData[0].data.push(data.data.result[0].value[1]);
        this.barChartLabels.push(formatDate(Math.round(data.data.result[0].value[0] * 1000), 'mediumTime', 'en-US'));
        if (this.barChartData[0].data.length >= 20){
          this.barChartData[0].data.shift();
          this.barChartLabels.shift();
        }

      });
  }

  ngOnInit() {
    setInterval(this.showConfig, 2000);
  }
}
