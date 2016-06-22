/*globals define*/
/*jshint node:true, browser:true*/

/**
 * Generated by PluginGenerator 0.14.0 from webgme on Mon Jun 20 2016 10:43:18 GMT-0500 (Central Daylight Time).
 */

define([
    'plugin/PluginConfig',
    'plugin/PluginBase',
    'text!./metadata.json',
    'common/util/ejs', // for ejs templates
    'common/util/xmljsonconverter', // used to save model as json
    'plugin/SimulateTESCluster/SimulateTESCluster/Templates/Templates',
    'plugin/SimulateTESCluster/SimulateTESCluster/SimulateTESCluster.Parser',
    'plugin/SimulateTESCluster/SimulateTESCluster/SimulateTESCluster.Plotter',
    'text!./task_template.json.tpl',
    'gridlabd/meta',
    'gridlabd/modelLoader',
    'gridlabd/remote_utils',
    'gridlabd/renderer',
    'q'
], function (
    PluginConfig,
    PluginBase,
    pluginMetadata,
    ejs,
    Converter,
    TEMPLATES,
    Parser,
    Plotter,
    marathonTaskTemplate,
    MetaTypes,
    loader,
    utils,
    renderer,
    Q) {
    'use strict';

    pluginMetadata = JSON.parse(pluginMetadata);

    // fixed vars
    var marathonIP = "129.59.107.73";
    var marathonUser = 'ubuntu';
    var marathonKey = '/home/jeb/.ssh/id_rsa_marathon';

    var marathonUrl = "10.100.0.11";
    var inputfilesServerHost = "10.100.0.11";
    var inputfilesServerPort = 8081;
    var LATEST_DOCKER_TAG = {
	JAVA: 'v5',
	CPP: 'v2',
	OMNET: 'v3'
    }

    var logPathBase = "/mnt/nfs/demo-share/";


    /**
     * Initializes a new instance of SimulateTESCluster.
     * @class
     * @augments {PluginBase}
     * @classdesc This class represents the plugin SimulateTESCluster.
     * @constructor
     */
    var SimulateTESCluster = function () {
        // Call base class' constructor.
        PluginBase.call(this);
        this.pluginMetadata = pluginMetadata;
        this.metaTypes = MetaTypes;
    };

    SimulateTESCluster.metadata = pluginMetadata;

    // Prototypal inheritance from PluginBase.
    SimulateTESCluster.prototype = Object.create(PluginBase.prototype);
    SimulateTESCluster.prototype.constructor = SimulateTESCluster;

    SimulateTESCluster.prototype.notify = function(level, msg) {
	var self = this;
	var prefix = self.projectId + '::' + self.projectName + '::' + level + '::';
	var max_msg_len = 100;
	if (level=='error')
	    self.logger.error(msg);
	else if (level=='debug')
	    self.logger.debug(msg);
	else if (level=='info')
	    self.logger.info(msg);
	else if (level=='warning')
	    self.logger.warn(msg);
	self.createMessage(self.activeNode, msg, level);
	if (msg.length < max_msg_len)
	    self.sendNotification(prefix+msg);
	else {
	    var splitMsgs = utils.chunkString(msg, max_msg_len);
	    splitMsgs.map(function(splitMsg) {
		self.sendNotification(prefix+splitMsg);
	    });
	}
    };

    /**
     * Main function for the plugin to execute. This will perform the execution.
     * Notes:
     * - Always log with the provided logger.[error,warning,info,debug].
     * - Do NOT put any user interaction logic UI, etc. inside this method.
     * - callback always has to be called even if error happened.
     *
     * @param {function(string, plugin.PluginResult)} callback - the result callback
     */
    SimulateTESCluster.prototype.main = function (callback) {
        // Use self to access core, project, result, logger etc from PluginBase.
        // These are all instantiated at this point.
        var self = this,
            modelNode;

	self.result.success = false;

        if (typeof WebGMEGlobal !== 'undefined') {
	    var msg = 'You must run this plugin on the server!';
	    self.notify('error', msg);
	    callback(new Error(msg), self.result);
        }

	self.updateMETA(self.metaTypes);

	// What did the user select for our configuration?
	var currentConfig = self.getCurrentConfig();
	self.simulationTime = currentConfig.simulationTime;
	self.delayMean = currentConfig.delayMean;
	self.delayStdDev = currentConfig.delayStdDev;
	self.community1 = currentConfig.community1;
	self.community2 = currentConfig.community2;
	self.generator1 = currentConfig.generator1;
	self.generator2 = currentConfig.generator2;
	self.returnZip = currentConfig.returnZip;

	var path = require('path');
	var filendir = require('filendir');
	self.root_dir = path.join(process.cwd(), 
				  'generated', 
				  self.project.projectId, 
				  self.branchName,
				  'models');

	// FEDERATION STUFF
	// should be unique!
	var timestamp = (new Date()).getTime();
	var fedNumber = Math.floor(Math.random() * 250 + 1);
	var federateGroupName = "tesdemo2016-" + fedNumber;
	var weaveNet = "10.33."+ fedNumber + ".0";
	var federateFolder = "tesdemo2016_"+fedNumber+"_"+timestamp;

	self.generationDir = path.join(self.root_dir, federateGroupName);
	self.remoteInputDir = "/home/ubuntu/demo-inputs/"+federateGroupName;
	self.remoteOutputDir = "/home/ubuntu/demo-outputs/"+federateGroupName + "/" + federateFolder;

	self.federateGroupName = federateGroupName;
	self.weaveNet = weaveNet;
	self.federateFolder = federateFolder;
	// END FEDERATION STUFF

        modelNode = self.activeNode;
	self.modelName = self.core.getAttribute(modelNode, 'name');
	self.fileName = self.modelName + '.glm';

	return loader.loadModel(self.core, modelNode)
	    .then(function(powerModel) {
		self.powerModel = powerModel;
	    })
	    .then(function() {
		return self.renderModel();
	    })
	    .then(function() {
		return self.writeInputs();
	    })
	    .then(function() {
		return self.copyInputs();
	    })
	    .then(function() {
		return self.runSimulation();
	    })
	    .then(function() {
		return self.copyArtifacts();
	    })
	    .then(function() {
		return self.plotLogs();
	    })
	    .then(function() {
		self.result.success = true;
		self.notify('info', 'Simulation Complete.');
		callback(null, self.result);
	    })
	    .catch(function(err) {
		self.notify('error', err);
		self.result.success = false;
		callback(err, self.result);
	    });
    };

    SimulateTESCluster.prototype.renderModel = function() {
	var self = this;
	self.notify('info', 'Rendering GLM');
	self.fileData = renderer.renderGLM(self.powerModel, self.core, self.META);
    };

    SimulateTESCluster.prototype.getFederationManagerTaskData = function() {
	var Mustache = require('mustache');
	var path = require('path');
	var federationManagerData = {
	    federateGroupName: this.federateGroupName,
	    federateName: "federation-manager",
	    dockerExecuteScript: "/root/Projects/c2wt/generated/TES2016Demo/scripts/docker-scripts/baseline-Dep/docker-execute--FederationManager.sh",
	    cpu: 0.6,
	    mem: 1024,
	    dockerImageName: "c2wtng/tesdemo2016_java",
	    dockerImageTag: LATEST_DOCKER_TAG.JAVA,
	    dockerHostName: "fedmgr.net."+this.federateGroupName,
	    marathonUrl: marathonUrl,
	    inputfilesServerHost: inputfilesServerHost,
	    inputfilesServerPort: inputfilesServerPort,
	    weaveNet: this.weaveNet,
	    inputfilesList: "inputs/"+this.federateGroupName+"/script.xml",
	    dockerVolumeLogPath: logPathBase+this.federateGroupName+"/"+this.federateFolder+"/fedmgr"
	};

	var taskData = Mustache.render(marathonTaskTemplate, federationManagerData);
	return taskData;
    };

    SimulateTESCluster.prototype.getCommunityDemandControllerTaskData = function(idx) {
	var Mustache = require('mustache');
	var path = require('path');
	var communityDemandControllerData = {
	    federateGroupName: this.federateGroupName,
	    federateName: "community"+idx+"-demandcontroller",
	    dockerExecuteScript: "/root/Projects/c2wt/generated/TES2016Demo/scripts/docker-scripts/baseline-Dep/docker-execute--Community"+idx+"DemandController.sh && sleep 20",
	    cpu: 0.4,
	    mem: 512,
	    dockerImageName: "c2wtng/tesdemo2016_cpp",
	    dockerImageTag: LATEST_DOCKER_TAG.CPP,
	    dockerHostName: "c"+idx+"demandctrl.net."+this.federateGroupName,
	    marathonUrl: marathonUrl,
	    inputfilesServerHost: inputfilesServerHost,
	    inputfilesServerPort: inputfilesServerPort,
	    weaveNet: this.weaveNet,
	    inputfilesList: "inputs/"+this.federateGroupName+"/Community"+idx+"DemandController.config",
	    dockerVolumeLogPath: logPathBase+this.federateGroupName+"/"+this.federateFolder+"/communitydemandcontroller"+idx
	};

	var taskData = Mustache.render(marathonTaskTemplate, communityDemandControllerData);
	return taskData;
    };

    SimulateTESCluster.prototype.getGeneratorPriceControllerTaskData = function(idx) {
	var Mustache = require('mustache');
	var path = require('path');
	var generatorPriceControllerData = {
	    federateGroupName: this.federateGroupName,
	    federateName: "generator"+idx+"-pricecontroller",
	    dockerExecuteScript: "/root/Projects/c2wt/generated/TES2016Demo/scripts/docker-scripts/baseline-Dep/docker-execute--Generator"+idx+"PriceController.sh && sleep 20",
	    cpu: 0.4,
	    mem: 512,
	    dockerImageName: "c2wtng/tesdemo2016_cpp",
	    dockerImageTag: LATEST_DOCKER_TAG.CPP,
	    dockerHostName: "gpc"+idx+".net."+this.federateGroupName,
	    marathonUrl: marathonUrl,
	    inputfilesServerHost: inputfilesServerHost,
	    inputfilesServerPort: inputfilesServerPort,
	    weaveNet: this.weaveNet,
	    inputfilesList: "inputs/"+this.federateGroupName+"/Generator"+idx+"PriceController.config",
	    dockerVolumeLogPath: logPathBase+this.federateGroupName+"/"+this.federateFolder+"/generatorpricecontroller"+idx
	};
	var taskData = Mustache.render(marathonTaskTemplate, generatorPriceControllerData);
	return taskData;
    };

    SimulateTESCluster.prototype.getGridlabdTaskData = function() {
	var Mustache = require('mustache');
	var path = require('path');
	var gridlabdData = {
	    federateGroupName: this.federateGroupName,
	    federateName: "gridlabd",
	    dockerExecuteScript: "/root/Projects/c2wt/generated/TES2016Demo/scripts/docker-scripts/baseline-Dep/docker-execute--GridlabDFederate.sh && sleep 20",
	    cpu: 0.6,
	    mem: 768,
	    dockerImageName: "c2wtng/tesdemo2016_cpp",
	    dockerImageTag: LATEST_DOCKER_TAG.CPP,
	    dockerHostName: "gridlabd.net."+this.federateGroupName,
	    marathonUrl: marathonUrl,
	    inputfilesServerHost: inputfilesServerHost,
	    inputfilesServerPort: inputfilesServerPort,
	    weaveNet: this.weaveNet,
	    inputfilesList: "inputs/"+this.federateGroupName+"/model.glm",
	    dockerVolumeLogPath: logPathBase+this.federateGroupName+"/"+this.federateFolder+"/gridlabd"
	};

	var taskData = Mustache.render(marathonTaskTemplate, gridlabdData);
	return taskData;
    };

    SimulateTESCluster.prototype.getMapperTaskData = function() {
	var Mustache = require('mustache');
	var mapperData = {
	    federateGroupName: this.federateGroupName,
	    federateName: "mapper",
	    dockerExecuteScript: "/root/Projects/c2wt/generated/TES2016Demo/scripts/docker-scripts/baseline-Dep/docker-execute--Mapper.sh && sleep 20",
	    cpu: 0.6,
	    mem: 1024,
	    dockerImageName: "c2wtng/tesdemo2016_java",
	    dockerImageTag: LATEST_DOCKER_TAG.JAVA,
	    dockerHostName: "mapper.net."+this.federateGroupName,
	    marathonUrl: marathonUrl,
	    inputfilesServerHost: inputfilesServerHost,
	    inputfilesServerPort: inputfilesServerPort,
	    weaveNet: this.weaveNet,
	    inputfilesList: "",
	    dockerVolumeLogPath: logPathBase+this.federateGroupName+"/"+this.federateFolder+"/mapper"
	};

	var taskData = Mustache.render(marathonTaskTemplate, mapperData);
	return taskData;
    };

    SimulateTESCluster.prototype.getOmnetTaskData = function() {
	var Mustache = require('mustache');

	var omnetData = {
	    federateGroupName: this.federateGroupName,
	    federateName: "omnet",
	    dockerExecuteScript: "/root/Projects/c2wt/generated/TES2016Demo/scripts/docker-scripts/baseline-Dep/docker-execute--OmnetFederate.sh && sleep 20",
	    cpu: 0.6,
	    mem: 1024,
	    dockerImageName: "c2wtng/tesdemo2016_omnet",
	    dockerImageTag: LATEST_DOCKER_TAG.OMNET,
	    dockerHostName: "omnet.net."+this.federateGroupName,
	    marathonUrl: marathonUrl,
	    inputfilesServerHost: inputfilesServerHost,
	    inputfilesServerPort: inputfilesServerPort,
	    weaveNet: this.weaveNet,
	    inputfilesList: "",
	    dockerVolumeLogPath: logPathBase+this.federateGroupName+"/"+this.federateFolder+"/omnet"
	};

	var taskData = Mustache.render(marathonTaskTemplate, omnetData);
	return taskData;
    };

    SimulateTESCluster.prototype.writeInputs = function() {
	var self = this,
	    basePath = self.generationDir,
	    inputFiles = {
		"model.glm": self.fileData,
		"Community1DemandController.config": JSON.stringify({ "Threshold": +self.community1 }, null, 2),
		"Community2DemandController.config": JSON.stringify({ "Threshold": +self.community2 }, null, 2),
		"Generator1PriceController.config": JSON.stringify({ "Threshold": +self.generator1 }, null, 2),
		"Generator2PriceController.config": JSON.stringify({ "Threshold": +self.generator2 }, null, 2),
		"script.xml": ejs.render(
		    TEMPLATES['script.xml.ejs'], 
		    { 
			simEnd: self.simulationTime,
			delayMean: self.delayMean,
			delayStdDev: self.delayStdDev
		    })
	    },
	    fs = require('fs'),
	    path = require('path'),
	    filendir = require('filendir');
	
	self.notify('info', 'Creating input files');

	var fileNames = Object.keys(inputFiles);
	var tasks = fileNames.map((fileName) => {
	    var deferred = Q.defer();
	    var data = inputFiles[fileName];
	    filendir.writeFile(path.join(basePath, fileName), data, (err) => {
		if (err) {
		    deferred.reject('Couldnt write ' + fileName + ': ' + err);
		}
		else {
		    deferred.resolve();
		}
	    });
	    return deferred.promise;
	});

	return Q.all(tasks)
	    .then(function() {
		self.notify('info', 'Generated artifacts.');
	    });
    };

    SimulateTESCluster.prototype.copyInputs = function() {
	var self = this,
	    srcDir = self.generationDir,
	    dstDir = self.remoteInputDir,
	    host = marathonIP,
	    user = marathonUser,
	    key = marathonKey;
	
	self.notify('info', 'Copying inputs to marathon');

	// scp the inputs over into the host
	return utils.mkdirRemote(dstDir, host, user, key)
	    .then(function () {
		return utils.copyToHost(srcDir, dstDir, host, user, key);
	    });
	
    };

    SimulateTESCluster.prototype.runSimulation = function() {
	var self = this;

	self.notify('info', 'Starting Simulation');	
	
	return self.startFederates()
	    .then(function() {
		return self.monitorContainers();
	    });
    };

    SimulateTESCluster.prototype.startFederates = function() {
	// run-cpp-feds.sh
	var self = this;

	var federationManagerTaskJSON = self.getFederationManagerTaskData();
	var community1DemandControllerTaskJSON = self.getCommunityDemandControllerTaskData(1);
	var community2DemandControllerTaskJSON = self.getCommunityDemandControllerTaskData(2);
	var generator1PriceControllerTaskJSON = self.getGeneratorPriceControllerTaskData(1);
	var generator2PriceControllerTaskJSON = self.getGeneratorPriceControllerTaskData(2);
	var gridlabdTaskJSON = self.getGridlabdTaskData();
	var mapperTaskJSON = self.getMapperTaskData();
	var omnetTaskJSON = self.getOmnetTaskData();

	/*
	self.logger.info(federationManagerTaskJSON);
	self.logger.info(community1DemandControllerTaskJSON);
	self.logger.info(community2DemandControllerTaskJSON);
	self.logger.info(generator1PriceControllerTaskJSON);
	self.logger.info(generator2PriceControllerTaskJSON);
	self.logger.info(gridlabdTaskJSON);
	*/

	self.notify('info', 'POSTing config data to marathon');

	var sleep = function(seconds) {
	    var deferred = Q.defer();
	    //self.notify('info', 'sleeping for ' + seconds + ' seconds');
	    setTimeout(function() {
		deferred.resolve();
	    }, seconds*1000);
	    return deferred.promise;
	}
	
	var host = marathonIP;
	var port = 8080;
	var path = '/v2/apps';

	self.notify('info', 'POSTing FedMgr data');
	return utils.POST(host, port, path, federationManagerTaskJSON)
	    .then(function(body) {
		//self.notify('info', 'Response: ' + body);
		return sleep(1);
	    })
	    .then(function() {
		self.notify('info', 'POSTing Community1DemandController data');
		return utils.POST(host, port, path, community1DemandControllerTaskJSON);
	    })
	    .then(function(body) {
		//self.notify('info', 'Response: ' + body);
		return sleep(2);
	    })
	    .then(function() {
		self.notify('info', 'POSTing Community2DemandController data');
		return utils.POST(host, port, path, community2DemandControllerTaskJSON);
	    })
	    .then(function(body) {
		//self.notify('info', 'Response: ' + body);
		return sleep(2);
	    })
	    .then(function() {
		self.notify('info', 'POSTing Generator1PriceController data');
		return utils.POST(host, port, path, generator1PriceControllerTaskJSON);
	    })
	    .then(function(body) {
		//self.notify('info', 'Response: ' + body);
		return sleep(2);
	    })
	    .then(function() {
		self.notify('info', 'POSTing Generator2PriceController data');
		return utils.POST(host, port, path, generator2PriceControllerTaskJSON);
	    })
	    .then(function(body) {
		//self.notify('info', 'Response: ' + body);
		return sleep(2);
	    })
	    .then(function() {
		self.notify('info', 'POSTing GridlabD data');
		return utils.POST(host, port, path, gridlabdTaskJSON);
	    })
	    .then(function(body) {
		//self.notify('info', 'Response: ' + body);
		return sleep(2);
	    })
	    .then(function() {
		self.notify('info', 'POSTing Mapper data');
		return utils.POST(host, port, path, mapperTaskJSON);
	    })
	    .then(function(body) {
		//self.notify('info', 'Response: ' + body);
		return sleep(2);
	    })
	    .then(function() {
		self.notify('info', 'POSTing Omnet data');
		return utils.POST(host, port, path, omnetTaskJSON);
	    });
    };

    SimulateTESCluster.prototype.monitorContainers = function() {
	var self = this;
	var host = marathonIP;
	var port = 8080;
	var path = '/v2/groups/' + this.federateGroupName;

	// curl http://demo-c2wt-master:8080/v2/groups/{{
	// federateGroupName }} -- if you're polling this, it'll give
	// you results back while running. when it's done, should give
	// back a reply like this: {"message":"Group '/tesdemo2016'
	// does not exist"}%
	var deferred = Q.defer();

	var queryFunc = function() {
	    utils.GET(host, port, path)
		.then(function(result) {
		    if (result.indexOf('does not exist') == -1) {
			setTimeout(queryFunc, 1000);
		    }
		    else {
			deferred.resolve();
		    }
		});
	};

	self.notify('info', 'Monitoring ' + this.federateGroupName);

	queryFunc();
	
	return deferred.promise;
    };

    SimulateTESCluster.prototype.copyArtifacts = function() {
	var self = this;
	var path = require('path');
	var localPath = path.join(self.generationDir,'outputs');
	var remotePath = self.remoteOutputDir + '/*';
	var host = marathonIP;
	var user = marathonUser;
	var key = marathonKey;
	
	self.notify('info', 'Copying output.');

	return utils.copyFromHost(remotePath, localPath, host, user, key)
	    .then(function() {
		return new Promise(function(resolve, reject) {
		    var zlib = require('zlib'),
		    tar = require('tar'),
		    fstream = require('fstream'),
		    input = localPath;

		    var bufs = [];
		    var packer = tar.Pack()
			.on('error', function(e) { reject(e); });

		    var gzipper = zlib.Gzip()
			.on('error', function(e) { reject(e); })
			.on('data', function(d) { bufs.push(d); })
			.on('end', function() {
			    var buf = Buffer.concat(bufs);
			    self.blobClient.putFile('output.tar.gz',buf)
				.then(function (hash) {
				    self.result.addArtifact(hash);
				    resolve();
				})
				.catch(function(err) {
				    reject(err);
				})
				    .done();
			});

		    var reader = fstream.Reader({ 'path': input, 'type': 'Directory' })
			.on('error', function(e) { reject(e); });

		    reader
			.pipe(packer)
			.pipe(gzipper);
		})
	    })
	    .then(function() {
		self.notify('info', 'Created archive.');
	    });
    };

    SimulateTESCluster.prototype.plotLogs = function() {
	var self = this;
	var path = require('path');
	var fs = require('fs');
	var basePath = path.join(self.generationDir, 'outputs');
	var controllers = [
	    "Community1DemandController",
	    "Community2DemandController",
	    "Generator1PriceController",
	    "Generator2PriceController"
	];

	self.notify('info', 'Plotting logs.');

	var tasks = controllers.map((controller) => {
	    var fileName = path.join(basePath, controller + '.log');
	    var deferred = Q.defer();
	    // load the file
	    fs.readFile(fileName, (err, data) => {
		if (err) {
		    deferred.reject('Couldnt open ' + fileName + ': ' + err);
		    return;
		}
		var logData = Parser.getDataFromLog(data);
		Plotter.logger = self.logger;
		Plotter.plotData(logData)
		    .then((svgHtml) => {
			var resultFileName = controller + '.svg';
			self.blobClient.putFile(resultFileName, svgHtml)
			    .then((hash) => {
				self.result.addArtifact(hash);
				var resultUrl = '/rest/blob/download/' + hash + '/' + resultFileName;
				self.createMessage(self.activeNode, controller + ' log plot:' + svgHtml, 'info');
				deferred.resolve();
			    })
			    .catch((err) => {
				deferred.reject('Couldnt add ' + resultFileName +' to blob');
			    });
		    });
	    });
	    return deferred.promise;
	});
	return Q.all(tasks);
    };

    return SimulateTESCluster;
});
