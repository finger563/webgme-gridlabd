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
    'q',
    './cola.min'
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

    ImportGLM.prototype.notify = function(level, msg) {
	var self = this;
	self.logData += msg + '\n';
	if (!self.logDebug && level == 'debug')
	    return;
	var prefix = self.projectId + '::' + self.projectName + '::' + level + '::';
	if (level=='error')
	    self.logger.error(msg);
	else if (level=='debug')
	    self.logger.debug(msg);
	else if (level=='info')
	    self.logger.info(msg);
	else if (level=='warning')
	    self.logger.warn(msg);
	self.createMessage(self.activeNode, msg, level);
	self.sendNotification(prefix+msg);
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
    ImportGLM.prototype.main = function (callback) {
        // Use self to access core, project, result, logger etc from PluginBase.
        // These are all instantiated at this point.
        var self = this,
        nodeObject;

	self.runningOnClient = false;
        if (typeof WebGMEGlobal !== 'undefined') {
	    self.runningOnClient = true;
        }

        self.updateMETA(self.metaTypes);

        // Default fails
        self.result.success = false;
	self.logData = '';

	// fill this out before creating the WebGME nodes
	self.newModel = {
	    base: 'Model',
	    children: [],
	    attributes: []
	};

	var currentConfig = self.getCurrentConfig(),
	glmFileHash = currentConfig.glmFile;
	self.logDebug = currentConfig.logDebug;
	self.iterations = currentConfig.iterations;
	self.linkDistance = currentConfig.linkDistance;
	self.nodeSize = currentConfig.nodeSize;

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
		return self.layoutObjects();
	    })
	    .then(function() {
		return self.createModelArtifacts();
	    })
	    .then(function() {
		// This will save the changes. If you don't want to save;
		// exclude self.save and call callback directly from this scope.
		return self.save('ImportGLM updated model.');
	    })
	    .then(function() {
		return self.blobClient.putFile(self.modelName+'.log', self.logData);
	    })
	    .then(function(hash) {
		self.result.addArtifact(hash);
	    })
	    .then(function() {
		self.result.setSuccess(true);
		callback(null, self.result);
	    })
	    .catch(function(err) {
		return self.blobClient.putFile(self.modelName+'.log', self.logData)
		    .then(function(hash) {
			self.result.addArtifact(hash);
			self.notify('error', err);
			self.result.setSuccess(false);
			callback(err, self.result);
		    });
	    });
    };

    var delimeter = '/';

    ImportGLM.prototype.objectNamePrefix = function(obj) {
	return obj.base + delimeter + obj.type + delimeter;
    };

    ImportGLM.prototype.objectToKey = function(obj) {
	return this.objectNamePrefix(obj) + obj.name;
    };

    ImportGLM.prototype.nameToKey = function(name, dict) {
	var self = this;
	self.notify('debug', 'Looking up key for '+name);
	var keys = Object.keys(dict);
	var suffix = delimeter + name;
	var objKeys = keys.filter(function(val) {return val.substr(-suffix.length)===suffix;});
	var objKey = '';
	if (objKeys.length)
	    objKey = objKeys[0];
	self.notify('debug', 'Got key: '+objKey + ' for ' + name);
	return objKey;
    };

    ImportGLM.prototype.nameToObject = function(name, dict) {
	var self = this;
	var objKey = self.nameToKey(name, dict);
	var p = dict[objKey];
	if (!p) { // didn't find the name
	    // map from objName (e.g. node:412) to actual name (e.g. node_412)
	    name = name.replace(/:/g,'/');
	    objKey = self.nameToKey(name, dict);
	    p = dict[objKey];
	}
	if (!p) {
	    self.notify('error', "Couldn't get object by name: " + name);
	}
	return p;
    };

    ImportGLM.prototype.parseObjectsFromGLM = function(glmFile) {
	// fill out self.newModel
	var self = this,
	    objDict = {},
	    objID = {},
	    objByDepth = [],
	    results;
	// remove the comments
	glmFile = self.removeComments(glmFile);
	// fix any possible syntax issues
	glmFile = self.fixSyntax(glmFile);
	// split the file into lines
	var lines = glmFile.split('\n');
	var line_num = 0;
	lines.map((line) => {
	    self.notify('debug', 'parsing line number: '+line_num+':'+line);
	    line_num++;
	    var macro_regex = /^#/gm,
		module_def_regex = /module\s+(\w+);/,
		container_regex = /(\w+)(?:\s+(\w+))?:?([\.\d]+)?\s*{/,
		container_end_regex = /(^|[^\S]+)};?/;
	    if (macro_regex.test(line)) {
		// parse macros
		var obj = self.parseMacro(line, self.newModel);
		obj._line_def = line_num;
		self.newModel.children.push(obj);
	    }
	    else if (results=module_def_regex.exec(line)) {
		// simple module def
		var obj = self.getObjStub(line);
		obj._line_def = line_num;
		obj.base = 'module';
		obj.name = results[1];
		var key = self.objectToKey(obj);
		objDict[key] = obj;
		self.newModel.children.push(obj);
	    }
	    else if (container_regex.test(line)) {
		// start object / module / class / clock / schedule
		var obj = self.getObjStub(line);
		obj._line_def = line_num;
		var key = self.objectToKey(obj);
		if (objDict[key]) {
		    if (!objID[obj.type]) {
			objID[obj.type] = 0;
		    }
		    obj.name += '_' + objID[obj.type];
		    objID[obj.type]++;
		}
		self.notify('debug','pushing '+key);
		objByDepth.push(obj);
	    }
	    else if (container_end_regex.test(line)) {
		// end object / module / class / clock / schedule
		var obj = objByDepth.pop();
		// work out parent
		var key = self.objectToKey(obj);
		self.notify('debug', 'popped ' + key);
		if (obj.base == 'object' && objByDepth.length > 0) {
		    obj.parent = objByDepth[objByDepth.length-1];
		}
		// add to model
		self.newModel.children.push(obj);
		objDict[key] = obj;
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
	var keys = Object.keys(objDict);
	keys.map((key) => {
	    var obj = objDict[key];
	    var pAttr = obj.attributes.find((a) => { return a.name == 'parent'; });
	    if (pAttr) {
		self.notify('debug', 'Updating parent for ' + self.objectToKey(obj));
		var parentName = pAttr.value;
		var p = self.nameToObject(parentName, objDict);
		// set the parent
		obj.parent = p;
		// remove the parent attribute
		var index = obj.attributes.indexOf(pAttr);
		if (index >= 0) {
		    obj.attributes.splice( index, 1 );
		}
	    }
	});
	// convert attributes that should be pointers according to the META
	keys.map((key) => {
	    var obj = objDict[key];
	    var metaNode = self.objToMeta(obj);
	    if (!metaNode)
		return;
	    var ptrNames = self.filterPointerNames(self.core.getPointerNames(metaNode));
	    if (!ptrNames.length)
		return;
	    self.notify('debug', 'Checking pointer attributes for ' + self.objectToKey(obj));
	    for (var i = obj.attributes.length - 1; i >= 0; i--) {
		var attr = obj.attributes[i];
		self.notify('debug', 'checking attribute ' + attr.name + ' to see if it is a pointer.');
		if (ptrNames.indexOf(attr.name) > -1) {
		    self.notify('debug', 'updating attribute ' + attr.name + ' to pointer');
		    var ptrObjName = attr.value;
		    var p = self.nameToObject(ptrObjName, objDict)
		    obj.pointers.push({
			name: self.convertPointerName(attr.name),
			value: p
		    });
		    self.notify('debug', 'pointer goes to: ' + p.name);
		    obj.attributes.splice(i, 1);
		}
	    }
	});
    };

    ImportGLM.prototype.convertPointerName = function(ptrName) {
	if (ptrName == 'from')
	    ptrName = 'src';
	else if (ptrName == 'to')
	    ptrName = 'dst';
	return ptrName;
    };

    ImportGLM.prototype.filterPointerNames = function(ptrNames) {
	ptrNames.splice(ptrNames.indexOf('base'), 1);
	ptrNames[ptrNames.indexOf('src')] = 'from';
	ptrNames[ptrNames.indexOf('dst')] = 'to';
	return ptrNames;
    };
    
    ImportGLM.prototype.objToMeta = function(obj) {
	var metaNode = null;
	if (obj.base == 'object') {
	    if (obj.type) {
		metaNode = this.META[obj.type];
	    }
	}
	else if (obj.base) {
	    metaNode = this.META[obj.base];
	}
	return metaNode;
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
	var container_regex = /(\w+)(?:\s+(\w+))?:?([\.\d]+)?\s*{/gm,
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
		obj.attributes.push({
		    name: 'Type',
		    value: obj.type
		});
		if (results[3])
		    obj.name = this.parseObjectName(results[3], obj);
	    }
	    obj.name = obj.name || obj.type || obj.base;
	}
	return obj;
    };

    ImportGLM.prototype.removeComments = function(str) {
	var regex = /(?:[\s]+|^|;)\/\/.*$/gm;
	return str.replace(regex, '').replace(/\r/gm,'');
    };
    
    ImportGLM.prototype.fixSyntax = function(str) {
	var regex = /};\s*object/gm;
	str = str.replace(regex, '};\nobject');
	regex = /}\s*object/gm;
	str = str.replace(regex, '}\nobject');
	return str;
    };
    
    ImportGLM.prototype.parseMacro = function(line) {
	// parses anything in GLM that starts with '#'
	var self = this,
	    obj;
	if (line.indexOf('#setenv') > -1)
	    obj = self.parseVariable(line);
	else if (line.indexOf('#set') > -1 || line.indexOf('#define') > -1) 
	    obj = self.parseGlobal(line);
	else if (line.indexOf('#include') > -1)
	    obj = self.parseInclude(line);
	return obj;
    };


    ImportGLM.prototype.parseInclude = function(line) {
	// includes set by: #include "<filename>"
	var self = this,
	    name = null,
	    value = null,
	    type = null,
	    obj,
	    regex = /#include\s+"(\S+)"/gi,
	    results = regex.exec(line);
	if (results) {
	    name = results[1];
	}
	obj = {
	    name: name,
	    base: 'Include',
	    attributes: []
	};
	return obj;
    };

    ImportGLM.prototype.parseGlobal = function(line) {
	// globals set by: #set <global>="<value>"
	//             or: #define <global>="<value>"
	var self = this,
	    name = null,
	    value = null,
	    type = null,
	    obj,
	    regex = /#(define|set)\s+(\S+)\s*=\s*([^;]+);?/gi,
	    results = regex.exec(line);
	if (results) {
	    type = results[1];
	    name = results[2];
	    value = results[3];
	}
	obj = {
	    name: name,
	    base: 'Global',
	    attributes: [
		{
		    name: 'Value',
		    value: value
		},
		{
		    name: 'Type',
		    value: type
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
		name: 'timestamp',
		value: results[1]
	    });
	}
	else if (results = st_regex.exec(line)) {
	    obj.attributes.push({
		name: 'stoptime',
		value: results[1]
	    });
	}
	else if (results = tz_regex.exec(line)) {
	    obj.attributes.push({
		name: 'timezone',
		value: results[1]
	    });
	}
	return obj;
    };

    ImportGLM.prototype.parseScheduleLine = function(line, obj) {
	var self = this,
	    id = obj.children.length,
	    pattern = /([\s]+[\d\*\.]+[\-,\.\d]*)+/gi,
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
	    var variable = {
		base: "Variable",
		name: results[1],
		attributes: [
		    {
			name: "Expression",
			value: results[2]
		    }
		]
	    };
	    obj.children.push(variable);
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
	    /*
	    if (results[1] == 'name' && obj.name)
		return obj;
	    */
	    var attr = {
		name: results[1],
		value: results[2].replace(/'/g,'').replace(/"/g,'')
	    };
	    obj.attributes.push(attr);
	    if (attr.name == 'name') {
		self.notify('debug', 'Updating name from '+obj.name+' to '+attr.value);
		obj.name = attr.value;
	    }
	}
	return obj;
    };

    ImportGLM.prototype.isLink = function(obj) {
	var src = null, dst = null;
	for (var p in obj.pointers) {
	    var ptr = obj.pointers[p];
	    if (ptr.name === 'src')
		src = ptr;
	    else if (ptr.name === 'dst')
		dst = ptr;
	    else if (src && dst)
		break;
	}
	return (src && dst);
    };

    ImportGLM.prototype.isNode = function(obj) {
	var self = this;
	return !self.isLink(obj);
    };

    ImportGLM.prototype.layoutObjects = function() {
	var self = this;
	// go through all of newModel's children and lay them out
	// (only the ones which do not have both a 'src' and a 'dst'
	// pointer
	//var objects = self.newModel.children.filter(function(c) { return self.isNode(c); });
	//var links = self.newModel.children.filter(function(c) { return self.isLink(c); });
	var nodes = [];
	var links = [];

	self.notify('info','Laying out objects, note this may take a while.');

	var getIndexOfObjWithAttr = function(array, attr, value) {
	    for(var i = 0; i < array.length; i++) {
		if(array[i][attr] === value) {
		    return i;
		}
	    }
	    return -1;
	}

	var minx = 0, miny=0;
	if (self.newModel.children) {
	    for (var i=0; i<self.newModel.children.length; i++) {
		var child = self.newModel.children[i];
		if (self.isNode(child)) {
		    nodes.push({
			"name":self.objectToKey(child),
			"original": i
		    });
		}
	    }
	    self.newModel.children.map(function(child) {
		if (self.isLink(child)) {
		    var srcPtr = child.pointers.find(function(p) { return p.name == 'src'; });
		    var dstPtr = child.pointers.find(function(p) { return p.name == 'dst'; });
		    //self.notify('warning', child.name + ' has ' + srcPtr + ' and ' + dstPtr);
		    var src = srcPtr.value;
		    var dst = dstPtr.value;
		    var srcKey = self.objectToKey(src);
		    var dstKey = self.objectToKey(dst);
		    var srcIndex = getIndexOfObjWithAttr(nodes, 'name', srcKey);
		    var dstIndex = getIndexOfObjWithAttr(nodes, 'name', dstKey);
		    if (dstIndex == -1 || srcIndex == -1) {
			self.notify('error', 'Couldnt get src/dst for '+child.name);
			self.notify('error', 'Looking up '+srcKey + ' and '+dstKey);
		    }
		    else {
			links.push({
			    "source": srcIndex,
			    "target": dstIndex,
			});
		    }
		}
		else if (child.parent) {
		    // now add visualized pointers!
		    self.notify('debug', 'Converting parent to link for ' + child.name);
		    var src = child;
		    var dst = child.parent;
		    var srcKey = self.objectToKey(src);
		    var dstKey = self.objectToKey(dst);
		    var srcIndex = getIndexOfObjWithAttr(nodes, 'name', srcKey);
		    var dstIndex = getIndexOfObjWithAttr(nodes, 'name', dstKey);
		    if (dstIndex == -1 || srcIndex == -1) {
			self.notify('error', 'Couldnt get parent for '+child.name);
			self.notify('error', 'Looking up '+srcKey + ' and '+dstKey);
		    }
		    else {
			links.push({
			    "source": srcIndex,
			    "target": dstIndex,
			});
		    }
		}
	    });
	}
	var width = nodes.length * 5,
	    height = nodes.length * 5;
	var d3cola = cola.d3adaptor()
	    .linkDistance(self.linkDistance)
	    .avoidOverlaps(true)
	    .defaultNodeSize(self.nodeSize)
	    .size([width, height]);

	d3cola
	    .nodes(nodes)
	    .links(links)         
	    .symmetricDiffLinkLengths(10)
	    .start(self.iterations, self.iterations, self.iterations);
	
	nodes.map(function(node) {
	    if (node.x < minx)
		minx = node.x;
	    if (node.y < miny)
		miny = node.y;
	});

	self.notify('debug', 'minx, miny: ' + minx + ', '+miny);

	nodes.map(function(node) {
	    var realNode = self.newModel.children[node.original];
	    var newx = (node.x - minx) * 2 + 50, // minx,miny will always be negative
		newy = (node.y - miny) * 2 + 50;
	    var newPos = {x: newx, y: newy}; 
	    self.notify('debug', 'Updating position of ' + node.name + ', ' + realNode.name + ' to ' + JSON.stringify(newPos));
	    realNode._position = newPos;
	});
	self.notify('debug', 'layed out nodes: '+nodes.length);
	self.notify('debug', 'layed out links: '+links.length);
    };

    // When saving the objects, need to check against META to figure out what the relevant pointers and attributes are:
    // self.core.getValidAttributeNames(self.META[<type>])
    // self.core.getValidPointerNames(self.META[<type>])
    
    ImportGLM.prototype.saveObject = function(obj, parentNode) {
	var self = this;
	var base = obj.type;
	if (!self.META[base])
	    base = obj.base;
	if (!self.META[base])
	    base = "Object";
	parentNode = parentNode || self.newModel.node;
	var parentName = self.core.getAttribute(parentNode, 'name');
	if ( base == null ) {
	    self.notify('warning', 'Encountered null base object! Child of ' + parentName + ', name: ' + obj.name + ', defined on line: ' + obj._line_def);
	    return;
	}
	self.notify('debug', "Creating object " + obj.name + " of type " + base + " from " + self.META[base]);
	var newNode = self.core.createNode({parent: parentNode, base: self.META[base]});
	if (obj._position) {
	    self.notify('debug', 'Setting position of new object to '+JSON.stringify(obj._position));
	    self.core.setRegistry(newNode, 'position', obj._position);
	}
	obj.node = newNode;
	if (obj.attributes) {
	    obj.attributes.map((attr) => {
		// set any attributes here
		self.core.setAttribute(newNode, attr.name, attr.value);
	    });
	}
	var name = obj.name || obj.type || obj.base;
	self.core.setAttribute(newNode, 'name', name);
	if (obj.children) {
	    obj.children.map((child) => {
		// create any children here
		if (!child.node)
		    self.saveObject(child, newNode);
	    });
	}
	if (obj.pointers) {
	    obj.pointers.map((ptr) => {
		// create any pointers here
		if (!ptr.value.node)
		    self.saveObject(ptr.value);
		self.core.setPointer(newNode, ptr.name, ptr.value.node);
	    });
	}
	if (obj.parent) {
	    // create parent object with src/dst here
	    if (!obj.parent.node) {
		self.saveObject(obj.parent);
	    }
	    var parent = self.core.createNode({parent: self.newModel.node, base: self.META.Parent});
	    self.core.setPointer(parent, 'src', obj.node);
	    self.core.setPointer(parent, 'dst', obj.parent.node);
	}
    };

    ImportGLM.prototype.createModelArtifacts = function() {
	// use self.newModel
	var self = this;
	self.saveObject(self.newModel, self.activeNode);
    };

    return ImportGLM;
});
