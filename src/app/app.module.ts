import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { ChartsModule } from 'ng2-charts';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatTabsModule} from '@angular/material';
import {MatIconModule} from '@angular/material';
import {ThroughputComponent} from "./throughput.component";
import {LatencyComponent} from "./latency.component";
import {BandwidthComponent} from "./bandwidth.component";
import {DurationComponent} from "./duration.component";

@NgModule({
  declarations: [
    AppComponent,
    ThroughputComponent,
    LatencyComponent,
    BandwidthComponent,
    DurationComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    ChartsModule,
    BrowserAnimationsModule,
    MatTabsModule,
    MatIconModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
