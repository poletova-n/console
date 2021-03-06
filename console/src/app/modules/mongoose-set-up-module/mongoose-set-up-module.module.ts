import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { CommonModule } from "@angular/common";
import { AppRoutingModule } from "../app-module/Routing/app-routing.module";
import { FormsModule } from "@angular/forms";
import { NgJsonEditorModule } from "ang-jsoneditor";
import { CodemirrorModule } from "@ctrl/ngx-codemirror";
import { MongooseSetUpComponent } from "./components/mongoose-set-up/mongoose-set-up.component";
import { NodesComponent } from "./components/mongoose-set-up/set-up-steps/nodes/nodes.component";
import { ScenariosComponent } from "./components/mongoose-set-up/set-up-steps/scenarios-set-up/scenarios/scenarios.component";
import { ConfigurationEditingRootComponent } from "./components/mongoose-set-up/set-up-steps/configuration-set-up/control-editing-root/control-editing-root.component";
import { ConfigurationEditingComponent } from "./components/mongoose-set-up/set-up-steps/configuration-set-up/configuration-editing/configuration-editing.component";
import { SetUpFooterComponent } from "./components/mongoose-set-up/set-up-footer/set-up-footer.component";
import { ControlApiService } from "src/app/core/services/control-api/control-api.service";
import { MonitoringApiService } from "src/app/core/services/monitoring-api/monitoring-api.service";
import { DateFormatPipe } from "src/app/common/date-format-pipe";


@NgModule({
  imports: [
    CommonModule,
    AppRoutingModule,
    FormsModule,
    // NOTE: Dependencies
    NgJsonEditorModule,
    CodemirrorModule
  ],
  declarations: [
    MongooseSetUpComponent,
    NodesComponent,
    ScenariosComponent,
    ConfigurationEditingRootComponent,
    ConfigurationEditingComponent,
    SetUpFooterComponent,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [
    ControlApiService,
    MonitoringApiService,
    DateFormatPipe
  ],
  bootstrap: [
    MongooseSetUpComponent
  ],

})
export class MongooseSetUpModuleModule { }
