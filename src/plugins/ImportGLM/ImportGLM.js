/*globals define*/
/*jshint node:true, browser:true*/

/**
 * Generated by PluginGenerator 0.14.0 from webgme on Mon Apr 04 2016 15:12:25 GMT-0700 (PDT).
 */

define([
    'plugin/PluginConfig',
    'text!./metadata.json',
    'plugin/PluginBase',
    'gridlabd/meta',
    'q'
], function (
    PluginConfig,
    pluginMetadata,
    PluginBase,
    MetaTypes,
    Q) {
    'use strict';

    pluginMetadata = JSON.parse(pluginMetadata);

    /**
     * Initializes a new instance of ImportGLM.
     * @class
     * @augments {PluginBase}
     * @classdesc This class represents the plugin ImportGLM.
     * @constructor
     */
    var ImportGLM = function () {
        // Call base class' constructor.
        PluginBase.call(this);
        this.pluginMetadata = pluginMetadata;
        this.metaTypes = MetaTypes;
    };

    /**
     * Metadata associated with the plugin. Contains id, name, version, description, icon, configStructue etc.
     * This is also available at the instance at this.pluginMetadata.
     * @type {object}
     */
    ImportGLM.metadata = pluginMetadata;

    // Prototypal inheritance from PluginBase.
    ImportGLM.prototype = Object.create(PluginBase.prototype);
    ImportGLM.prototype.constructor = ImportGLM;

    /**
     * Main function for the plugin to execute. This will perform the execution.
     * Notes:
     * - Always log with the provided logger.[error,warning,info,debug].
     * - Do NOT put any user interaction logic UI, etc. inside this method.
     * - callback always has to be called even if error happened.
     *
     * @param {function(string, plugin.PluginResult)} callback - the result callback
     */
    ImportGLM.prototype.main = function (callback) {
        // Use self to access core, project, result, logger etc from PluginBase.
        // These are all instantiated at this point.
        var self = this,
        nodeObject;

        self.updateMETA(self.metaTypes);

        // Default fails
        self.result.success = false;

	// fill this out before creating the WebGME nodes
	self.newModel = {
	    children: [],
	    attributes: []
	};

	var currentConfig = self.getCurrentConfig(),
	glmFileHash = currentConfig.glmFile;

        // Using the coreAPI to make changes.
        nodeObject = self.activeNode;

	self.blobClient.getMetadata(glmFileHash)
	    .then(function(glmMetaData) {
		var splitName = glmMetaData.name.split(".");
		var newName = "";
		for (var i=0;i<splitName.length-1;i++) {
		    newName += splitName[i];
		}
		self.modelName = newName;
		self.newModel.name = newName;
		//self.logger.error('loaded model: ' + self.modelName);
	    })
	    .then(function() {
		return self.blobClient.getObjectAsString(glmFileHash)
	    })
	    .then(function(glmFile) {
		return self.parseObjectsFromGLM(glmFile);
	    })
	    .then(function() {
		//return self.createModelArtifacts();
	    })
	    .then(function() {
		// This will save the changes. If you don't want to save;
		// exclude self.save and call callback directly from this scope.
		//return self.save('ImportGLM updated model.');
	    })
	    .then(function() {
		self.result.setSuccess(true);
		callback(null, self.result);
	    })
	    .catch(function(err) {
		self.logger.error('ERROR:: '+err);
		self.result.setSuccess(false);
		callback(null, self.result);
	    });
    };

    ImportGLM.prototype.parseObjectsFromGLM = function(glmFile) {
	// fill out self.newModel
	var self = this,
	    objDict = {},
	    objByDepth = [],
	    results;
	// remove the comments
	glmFile = self.removeComments(glmFile);
	// split the file into lines
	var lines = glmFile.split('\n');
	lines.map((line) => {
	    var macro_regex = /^#/gm,
		module_def_regex = /module\s+(\w+);/gm,
		container_regex = /(\w+)\s+(\w+)?:?([\.\d]+)?\s*{/gm,
		container_end_regex = /};?/gm;
	    if (macro_regex.test(line)) {
		var obj = self.parseMacro(line, self.newModel);
		self.newModel.children.push(obj);
	    }
	    else if (results=module_def_regex.exec(line)) {
		// simple module def
		var obj = self.getObjStub(line);
		obj.base = 'module';
		obj.name = results[1];
		objDict[obj.name] = obj;
		self.newModel.children.push(obj);
	    }
	    else if (container_regex.test(line)) {
		// start object / module / class / clock / schedule
		var obj = self.getObjStub(line);
		if (objDict[obj.name]) // for the case of modules
		    obj = objDict[obj.name];
		objByDepth.push(obj);
	    }
	    else if (container_end_regex.test(line)) {
		// end object / module / class / clock / schedule
		var obj = objByDepth.pop();
		// work out parent
		if (obj.base == 'object' && objByDepth.length > 0) {
		    obj.parent = objByDepth[objByDepth.length-1];
		}
		// add to model
		self.newModel.children.push(obj);
		if (obj.name)
		    objDict[obj.name] = obj;
	    }
	    else if (line.length > 0 && objByDepth.length){
		var obj = objByDepth[objByDepth.length - 1];
		// parse based on the specific type
		if (obj.base == 'object') {
		    obj = self.parseObjectLine(line, obj);
		}
		else if (obj.base == 'class') {
		    obj = self.parseClassLine(line, obj);
		}
		else if (obj.base == 'module') {
		    obj = self.parseModuleLine(line, obj);
		}
		else if (obj.base == 'clock') {
		    obj = self.parseClockLine(line, obj);
		}
		else if (obj.base == 'schedule') {
		    obj = self.parseScheduleLine(line, obj);
		}
	    }
	});
	// handle 'parent' attributes here
	Object.keys(objDict).map((key) => {
	    var obj = objDict[key];
	    var pAttr = obj.attributes.find((a) => { return a.name == 'parent'; });
	    if (pAttr) {
		var parentName = pAttr.value;
		// map from parentName (e.g. node:412) to actual name (e.g. 412)
		parentName = parentName.replace(/\w+:/g,'');
		var p = objDict[parentName];
		// set the parent
		obj.parent = p;
		// remove the parent attribute
		var index = obj.attributes.indexOf(pAttr);
		if (index >= 0) {
		    obj.attributes.splice( index, 1 );
		}
	    }
	});
	return self.blobClient.putFile('model.json', JSON.stringify(self.newModel, null, 2))
	    .then((hash) => {
		self.result.addArtifact(hash);
	    });
    };
    

    var objNames = {};

    ImportGLM.prototype.parseObjectName = function(name, obj) {
	name = name.replace(/[^:]*:/g,'');
	if (obj.base == 'object') {
	    var index = name.indexOf('..');
	    if (index == 0) { // ..<count>
		if (objNames[obj.type] == undefined) {
		    objNames[obj.type] = 0;
		}
		name = obj.type + objNames[obj.type];
		objNames[obj.type]++;
	    }
	    else if (index > 0) { // <start id>..<end id>
		var splits = name.split('..');
		var startId = +splits[0];
		var endId = +splits[1];
		if (objNames[obj.type] == undefined) {
		    objNames[obj.type] = startId;
		}
		name = obj.type + objNames[obj.type];
		objNames[obj.type]++;
	    }
	}
	return name;
    }

    ImportGLM.prototype.getObjStub = function(line) {
	var container_regex = /(\w+)\s+(\w+)?:?([\.\d]+)?\s*{/gm,
	    obj = {
		name: null,
		type: null,
		base: null,
		parent: null,
		attributes: [],
		children: [],
		pointers: []
	    },
	    results = container_regex.exec(line);
	if (results) {
	    obj.base = results[1];
	    if (obj.base == 'clock') {
	    }
	    else if (obj.base == 'schedule' ||
		     obj.base == 'module' ||
		     obj.base == 'class') {
		obj.name = results[2];
	    }
	    else if (obj.base == 'object') {
		obj.type = results[2];
		if (results[3])
		    obj.name = this.parseObjectName(results[3], obj);
	    }
	}
	return obj;
    };

    ImportGLM.prototype.removeComments = function(str) {
	var regex = /(?:[\s]+|^|;)\/\/.*$/gm;
	return str.replace(regex, '');
    };
    
    ImportGLM.prototype.parseMacro = function(line) {
	// parses anything in GLM that starts with '#'
	var self = this,
	    obj;
	if (line.indexOf('#setenv') > -1)
	    obj = self.parseVariable(line);
	else
	    obj = self.parseGlobal(line);
	return obj;
    };

    ImportGLM.prototype.parseGlobal = function(line) {
	// globals set by: #set <global>="<value>"
	//             or: #define <global>="<value>"
	var self = this,
	    name = null,
	    value = null,
	    obj,
	    regex = /#(?:define|set)\s+(\S+)\s*=\s*([\S]+);?/gim,
	    results = regex.exec(line);
	if (results) {
	    name = results[1];
	    value = results[2];
	}
	obj = {
	    name: name,
	    base: 'Global',
	    attributes: [
		{
		    name: 'Value',
		    value: value
		}
	    ]
	};
	return obj;
    };

    ImportGLM.prototype.parseVariable = function(line) {
	// environment variables set by: #setenv <variable>=<expression>
	var self = this,
	    name = null,
	    value = null,
	    obj,
	    regex = /#setenv\s+(\S+)\s*=\s*([\w '"]+);?/gim,
	    results = regex.exec(line);
	if (results) {
	    name = results[1];
	    value = results[2];
	}
	obj = {
	    name: name,
	    base: 'Variable',
	    attributes: [
		{
		    name: 'Expression',
		    value: value
		}
	    ]
	};
	self.logger.error(obj);
	return obj;
    };

    ImportGLM.prototype.parseClockLine = function(line, obj) {
	var self = this,
	    ts_regex = /timestamp\s+'([^\/\n\r\v;]*)';?/gi,
	    st_regex = /stoptime\s+'([^\/\n\r\v;]*)';?/gi,
	    tz_regex = /timezone\s+([^\/\n\r\v;]*);?/gi,
	    results;
	if (results = ts_regex.exec(line)) {
	    obj.attributes.push({
		name: 'Timestamp',
		value: results[1]
	    });
	}
	else if (results = st_regex.exec(line)) {
	    obj.attributes.push({
		name: 'Stoptime',
		value: results[1]
	    });
	}
	else if (results = tz_regex.exec(line)) {
	    obj.attributes.push({
		name: 'Timezone',
		value: results[1]
	    });
	}
	return obj;
    };

    ImportGLM.prototype.parseScheduleLine = function(line, obj) {
	var self = this,
	    id = obj.children.length,
	    pattern = /([\s]+[\d\*\.]+[\-\.\d]*)+/gi,
	    matches = pattern.exec(line);
	if (matches) {
	    var splits = matches[0].split(new RegExp(" |\t|\s|;",'g')).filter(function(obj) {return obj.length > 0;});
	    if ( splits.length >= 5 ) {
		var entry = {
		    base: 'Entry',
		    name: 'Entry_' + id,
		    attributes: [
			{
			    name: "Minutes",
			    value: splits[0]
			},
			{
			    name: "Hours",
			    value: splits[1]
			},
			{
			    name: "Days",
			    value: splits[2]
			},
			{
			    name: "Months",
			    value: splits[3]
			},
			{
			    name: "Weekdays",
			    value: splits[4]
			}
		    ]
		};
		if (splits.length > 5)
		    entry.attributes.push({
			name: "Value",
			value: splits[5]
		    });
		obj.children.push(entry)
	    }
	    else {
		throw new String('Schedule ' + obj.name + ' has improperly formmated entry: ' + line);
	    }
	}
	return obj;
    };

    ImportGLM.prototype.parseModuleLine = function(line, obj) {
	// <variable> <expression>; 
	var self = this,
	    attr_regex = /(\w+)\s+([^;]*);/g,
	    results;
	if (results = attr_regex.exec(line)) {
	    var attr = {
		name: results[1],
		value: results[2]
	    };
	    obj.attributes.push(attr);
	}
	return obj;
    };

    ImportGLM.prototype.parseClassLine = function(line, obj) {
	// <type> <property>[<unit>]; 
	var self = this,
	    attr_regex = /(\w+)\s+(\w+)(?:\[(\w+)\])?;/g,
	    results;
	if (results = attr_regex.exec(line)) {
	    var propDef = {
		base: "PropertyDef",
		name: results[2],
		attributes: [
		    {
			name: "Type",
			value: results[1]
		    }
		]
	    };
	    if (results[3]) {
		propDef.attributes.push({
		    name: "Unit",
		    value: results[3]
		});
	    }
	    obj.children.push(propDef);
	}
	return obj;
    };

    ImportGLM.prototype.parseObjectLine = function(line, obj) {
	var self = this,
	    attr_regex = /(\w+)\s+([^;]*);?/g,
	    results;
	if (results = attr_regex.exec(line)) {
	    var attr = {
		name: results[1],
		value: results[2]
	    };
	    obj.attributes.push(attr);
	    if (attr.name == 'name') {
		obj.name = attr.value;
	    }
	}
	return obj;
    };

    // When saving the objects, need to check against META to figure out what the relevant pointers and attributes are:
    // self.core.getValidAttributeNames(self.META[<type>])
    // self.core.getValidPointerNames(self.META[<type>])
    
    ImportGLM.prototype.saveObject = function(obj) {
	var self = this;
	var base = obj.type || obj.base;
	var newNode = self.core.createNode({parent: self.newModel.node, base: self.META[base]});
	self.core.setAttribute(newNode, 'name', obj.name);
	obj.attributes.map((attr) => {
	    // set any attributes here
	    self.core.setAttribute(newNode, attr.name, attr.value);
	});
	obj.pointers.map((ptr) => {
	    // create any pointers here
	    var ptrObj = self.createdObjects[ptr.target];
	    if (!ptrObj) {
		self.saveObject(ptr.target);
	    }
	    self.core.setPointer(newNode, ptr.name, ptrObj.node);
	});
	obj.node = newNode;
	if (obj.parent) {
	    // create parent object with src/dst here
	    var parentObj = self.createdObjects[obj.parent];
	    if (!parentObj) {
		self.saveObject(obj.parent);
	    }
	    var parent = self.core.createNode({parent: self.newModel.node, base: self.META.Parent});
	    self.core.setPointer(parent, 'src', obj.node);
	    self.core.setPointer(parent, 'dst', parentObj);
	}
	self.createdObjects[obj.name] = obj;
    };

    ImportGLM.prototype.createModelArtifacts = function() {
	// use self.newModel
	var self = this;
	self.createdObjects = {};
	var modelMetaNode = self.META.Model;
	var modelNode = self.core.createNode({parent: self.activeNode, base: modelMetaNode});
	self.core.setAttribute(modelNode, 'name', self.newModel.name);
	self.newModel.attributes.map((attr) => {
	    self.core.setAttribute(modelNode, attr.name, attr.value);
	});
	self.newModel.node = modelNode;
	self.newModel.children.map(function(obj) {
	    self.saveObject(obj, modelNode);
	});
    };

    return ImportGLM;
});
