import { Component, OnInit, ViewChild, ViewChildren, ElementRef } from '@angular/core';
import { IpAddressService } from 'src/app/core/services/ip-addresses/ip-address.service';
import { JsonEditorComponent, JsonEditorOptions } from 'ang-jsoneditor';
import { Constants } from 'src/app/common/constants';
import { ControlApiService } from 'src/app/core/services/control-api/control-api.service';
import { MongooseSetUpService } from 'src/app/mongoose-set-up/mongoose-set-up-service/mongoose-set-up.service';


@Component({
  selector: 'app-configuration-editing',
  templateUrl: './configuration-editing.component.html',
  styleUrls: ['./configuration-editing.component.css']
})

export class ConfigurationEditingComponent implements OnInit {

  readonly CONFIGURATION_FILENAME = Constants.FileNames.CUSTOM_CONFIGURATION_FILENAME;

  // JSON Editor properties
  @ViewChild(JsonEditorComponent) editor: JsonEditorComponent;
  @ViewChild("apply-button-content-wrppaer") applyNewValueBtn: ElementRef;
  public jsonEditorOptions: JsonEditorOptions;
  // @PARAM jsonEditorData is the data which was originally in JSON 
  public jsonEditorData: any = this.mongooseSetUpService.unprocessedConfiguration;
  // currentJsonEditorData is data which was modified from the UI. It's ...
  // ... sing to compare edited and current values of JSON 
  public currentJsonEditorData: any; 
  
  // Component properties 

  public hasJsonEdited: Boolean = false


  constructor(private ipService: IpAddressService, 
    private controlApiService: ControlApiService,
    private mongooseSetUpService: MongooseSetUpService) {
    this.fetchConfigurationFromMongoose();
    this.configureJsonEditor();
  }

  // MARK: - Lifecycle 
  
  ngOnInit() {}

  ngOnDestroy() { 
    console.log("Destroying configuration component. Saved configuration: " + JSON.stringify(this.currentJsonEditorData));
     // NOTE: Saving up an ubcomfirmed configuration in order to let user edit it later if he'd like to. 
    this.mongooseSetUpService.unprocessedConfiguration = JSON.stringify(this.currentJsonEditorData);
  }

  // NOTE: Private methods

  private fetchConfigurationFromMongoose() { 
    this.controlApiService.getMongooseConfiguration(Constants.Configuration.MONGOOSE_HOST_IP).subscribe(
      configuration => { 
        // TODO: Add entred nodes into configuration 
        this.mongooseSetUpService.unprocessedConfiguration = configuration; 
      },
      error => { 
        // TODO: Hadnel error correctly. Maybe retry fetching the configuration? 
        const misleadingMsg = Constants.Alerts.SERVER_DATA_NOT_AVALIABLE;
        alert(misleadingMsg);
      }
    )

  }
  
  private configureJsonEditor() {
    this.jsonEditorOptions = new JsonEditorOptions()

    // NOTE: JSON Editor could be customized using the following fields: 
    // ... this.editorOptions.mode = 'code'; - it'd customize the displaying of actual JSON; ...
    // ... ... avaliable modes are: code', 'text', 'tree', 'view'
    // ... this.editorOptions.schema = schema; - it'd customize the displaying of JSON editor 
    this.jsonEditorOptions.modes = ['code', 'text', 'tree', 'view']; // set all allowed modes
    // this.jsonEditorData = {
    //   products: [{
    //     name: 'car',
    //     product: [{
    //       name: 'honda',
    //       model: [
    //         { id: 'civic', name: 'civic' },
    //         { id: 'accord', name: 'accord' },
    //         { id: 'crv', name: 'crv' },
    //         { id: 'pilot', name: 'pilot' },
    //         { id: 'odyssey', name: 'odyssey' }
    //       ]
    //     }]
    //   }]
    // };

    this.currentJsonEditorData = this.jsonEditorData; 
    // NOTE: Setting up value for MongooseSetUp service in debug purposes.
    this.mongooseSetUpService.unprocessedConfiguration = this.jsonEditorData;
   
    // NOTE: You could also configure JSON Editor's nav bar tools using the view child's fields.
    // ... example:
    // ... this.jsonEditorOptions.statusBar = false;
    // ... this.jsonEditorOptions.navigationBar = false;
    // ... this.jsonEditorOptions.search = false;

  }

  // NOTE: Callback which is observing whether the JSON value has been updated from editor
  public onJsonUpdated(editedJson) { 
    this.hasJsonEdited = !(editedJson === this.currentJsonEditorData);
    this.hasJsonEdited ? this.mongooseSetUpService.unprocessedConfiguration = editedJson : console.log("Nothing to be applied.");
  }


  onApplyButtonClicked() { 
    this.controlApiService.runMongoose(JSON.stringify(this.currentJsonEditorData));
    alert("New configuration has been applied.");
    this.hasJsonEdited = false;
  }

}