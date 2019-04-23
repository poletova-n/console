import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface Result {
  data: any
}

@Injectable()
export class ConfigService {
  constructor(private http: HttpClient) { }
  durationUrl = "http://localhost:9090/api/v1/query?query=mongoose_duration_mean";

  getDuration() {
    return this.http.get(this.durationUrl);
  }
}
