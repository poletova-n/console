import { NodeConfig } from "src/app/core/services/ip-addresses/nodeConfig";

export class MongooseSetupInfoModel { 

    configuration: Object; // NOTE: Configuration is represented with JSON 
    scenario: String; // NOTE: As for 22.02.2019, 'Scenario' is a JavaScript code
    nodesData: String[]; 

    private readonly DEFAULT_CONFIGURATION = "";
    private readonly DEFAULT_SCENARIO = "Load.run();";
    private readonly DEFAULT_NODES_DATA = [];

    constructor() { 
        this.configuration = this.DEFAULT_CONFIGURATION;
        this.scenario = this.DEFAULT_SCENARIO;
        this.nodesData = this.DEFAULT_NODES_DATA;
    }
}