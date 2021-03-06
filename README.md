# Mongoose Web UI 
Provides web interface for Mongoose - storage performance testing tool maintained by Dell EMC. 

# 1. Overview 

Web UI lets you configure, run and monitor Mongoose. 

## 1.1 Launching

Mongoose launching process is divided in 3 steps: 
* nodes selection; 
* configuration set up; 
* scenario set up; 

### 1.1.1 Nodes selection 

![](screenshots/setup/nodes/nodes-selection.png)
Mongoose could be launched on multiple nodes. You could add and select nodes on the first step of set up. Added nodes will be remained within the UI. 

## 1.2 Configuring 
![](screenshots/setup/configuration/configuration.png)

Configuration is being fetched via Mongoose REST API. You could change it via the UI. 
The changed configuration would be passed to Mongoose /run POST request as a parameter. 

## 1.3 Scenario 
Mongoose's scenarios are writtign in JavaScript. It's possibl to write JavaScript code in the UI using code editor. 
![](screenshots/setup/scenario/scenario_general.png)

Scenarios could be both loaded and saved into the file system. 
![](screenshots/setup/scenario/scenario_buttons.png)


## 1.2 Monitoring runs 

### 1.2.1 Runs table 
Discovered Mongoose's runs are displayed within the runs table. 
![](screenshots/runs-table/runs_table_filled.png)

There's 3 possible status of Mongoose runs: 
* Finished - means Mongoose run has finished and its logs are available; 
* Running - means Mongoose is still performing the benchmark and results are not yet available. Althought, some of the details are available; 
* Unavailable - means info about Mongoose run has been found on the server, but the related data is lost or couldn't be loaded. 

You could see Mongoose run status or run details by pressing the status icon. 
<img src="screenshots/runs-table/run_table_finished_results.png" style="width:10%;
    height:auto;">

![](screenshots/runs-table/run_table_finished_results.png)
![](screenshots/runs-table/run_table_running_details.png)



# 2. Configuration 

UI's configuration depends on the parameters listen within .env file.

## 2.1 Deploying ports 
The following parameters are being used to specify deploying ports of the services: 
 
* CONSOLE_PORT - for Mongoose Web UI; 
* GRAFANA_PORT - for Grafana; 
* PROMETHEUS_PORT - for Prometheus; 
* MONGOOSE_PORT - for Mongoose; 

## 2.2 Image versions 
The following parameters are being used to specify docker image version of a specific service: 
* CONSOLE_VER - Mongoose Web UI image version; 
* PROMETHEUS_VER - Prometheus image version; 
* GRAFANA_VER - Grafana image version; 


## 2.3 Container configuration 

### 2.3.1 Network
The following parameters are being used to organize internal network within the container: 

* IMAGES_NETWORK_BRIDGE_BASE_SUBNET - base subnet of container's network; 
* IMAGES_NETWORK_BRIDGE_BASE_SUBNET_SLOTS - amount of slots within the network; 
* PROMETHEUS_IMAGE_IP - *internal (image)* IP of Prometheus within the container; 
* NODE_SERVER_IMAGE_IP - *internal (image)* IP of Node JS server within the container; 

### 2.3.2 Prometheus 
Prometheus configuration is being rewritten in a runtime in order to add targets dynamically. 
To implement this, we're using internal container volume. 
* PROMETHEUS_CONFIGURATION_PATH - full path for Prometheus configuration; 
* PROMETHEUS_CONFIGURATION_FOLDER_PATH - path to Prometheus folder; 

## 2.4 Other parameters 

* MONGOOSE_HOST - specifies host of an initially loaded Mongoose; 

# 3. Build and run 

## 3.1 Build 

### 3.1.1 Build docker image 

Docker image is being builted via Gradle. To build Docker image, use: 
> $ ./gradlew buildImage

### 3.1.2 Build project 
Mongoose Web UI has been made with Angular 7.0. You could build it just like any Angular app. 
> $ ng build 

## 3.2 Run 

### 3.2.1 Run via docker-compose 
Mongoose Web UI could be ran via docker compose. 
It'd build a container that contains Mongoose Web UI and Prometheus. 
> $ docker-compose up 

### 3.2.2 Run in development mode 
Mongoose Web UI has been build with Angular CLI. It could be ran in development mode using the appropriate command: 
> $ ng serve 


# 4. Deploying 

Mongoose image is being loaded into the [docker hub](https://hub.docker.com/r/emcmongoose/mongoose-console)

* It's possible to push Docker image to docker hub via gradle: 
> $ docker login
> $ ./gradlew pushImage 
