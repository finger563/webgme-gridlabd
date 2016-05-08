/*globals define*/
/*jshint node:true, browser:true*/

/**
 * Generated by PluginGenerator 1.7.0 from webgme on Thu May 05 2016 13:51:44 GMT-0700 (PDT).
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
     * Initializes a new instance of UpdateGLDMeta.
     * @class
     * @augments {PluginBase}
     * @classdesc This class represents the plugin UpdateGLDMeta.
     * @constructor
     */
    var UpdateGLDMeta = function () {
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
    UpdateGLDMeta.metadata = pluginMetadata;

    // Prototypical inheritance from PluginBase.
    UpdateGLDMeta.prototype = Object.create(PluginBase.prototype);
    UpdateGLDMeta.prototype.constructor = UpdateGLDMeta;

    /**
     * Main function for the plugin to execute. This will perform the execution.
     * Notes:
     * - Always log with the provided logger.[error,warning,info,debug].
     * - Do NOT put any user interaction logic UI, etc. inside this method.
     * - callback always has to be called even if error happened.
     *
     * @param {function(string, plugin.PluginResult)} callback - the result callback
     */
    UpdateGLDMeta.prototype.main = function (callback) {
        // Use self to access core, project, result, logger etc from PluginBase.
        // These are all instantiated at this point.
        var self = this;

        self.updateMETA(self.metaTypes);

	var currentConfig = self.getCurrentConfig(),
	    metaFileHash = currentConfig.gldModHelp;

	self.blobClient.getMetadata(metaFileHash)
	    .then(function(glmMetaData) {
		var splitName = glmMetaData.name.split(".");
		var newName = "";
		for (var i=0;i<splitName.length-1;i++) {
		    newName += splitName[i];
		}
		self.logger.info('loaded: ' + newName);
		return self.blobClient.getObjectAsString(metaFileHash);
	    })
	    .then(function(metaFile) {
		return self.parseObjectsFromFile(metaFile);
	    })
	    .then(function() {
		return self.createModelArtifacts();
	    })
	    .then(function() {
		return self.save('UpdateGLDMeta updated model meta.');
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
    
    UpdateGLDMeta.prototype.parseObjectsFromFile = function(fileStr) {
	var self = this,
	    class_regex = /class (\w+) {/g,
	    class_end_regex = /}$/gm,
	    lines = fileStr.split('\n'),
	    results,
	    objects = {},
	    currentObj,
	    objStrings = [],
	    depth = 0;
	lines.map((line) => {
	    if (results = class_regex.exec(line)) {
		depth++;
		if (depth === 1) {
		    var name = results[1];
		    if (objects[name] === undefined) {
			self.logger.info('got class: ' + name);
			currentObj = {
			    name: name,
			    attributes: [],
			    pointers: [],
			    base: undefined
			};
			objStrings = [];
		    }
		}
	    }
	    else if (class_end_regex.test(line)) {
		if (depth === 1) {
		    currentObj = self.parseObjectString(currentObj, objStrings);
		    objects[currentObj.name] = currentObj;
		    objStrings = [];
		}
		depth--;
	    }
	    else if (depth === 1) {
		objStrings.push(line);
	    }
	});
	self.objects = objects;
    };

    UpdateGLDMeta.prototype.parseObjectString = function (obj, lines) {
	var self = this,
	    attr_regex = /(\w+)\s([\w]+)(\[\S+\])?;/g,
	    enum_set_regex = /(enumeration|set)\s\{([\S ]+)\}\s(\w+);/g,
	    value_regex = /(\w+)=(\d+)/gi,
	    results;

	var convertAttrToType = function(attr) {
	    if (attr === 'complex' ||
		attr === 'set' ||
		attr === 'enumeration' ||
		attr === 'loadshape' ||
		attr === 'enduse' ||
		attr === 'timestamp' ||
		attr.indexOf('char') > -1)
		return 'string';
	    else if (attr.indexOf('int') > -1)
		return 'integer';
	    else if (attr === 'double')
		return 'float';
	    else if (attr === 'bool')
		return 'bool';
	    else
		return undefined;
	};

	var isPointer = function(attr) {
	    return attr === 'object';
	};

	var isParent = function(attr) {
	    return attr === 'parent';
	};

	lines.map((line) => {
	    if (results = attr_regex.exec(line)) {
		var kind = convertAttrToType(results[1]);
		if (kind === undefined) { // must be object or parent
		    if (isParent(results[1])) {
			obj.base = results[2];
		    }
		    else if (isPointer(results[1])) {
			var ptr = {
			    name: results[2]
			};
			obj.pointers.push(ptr);
		    }
		}
		else {
		    var attr = {
			name: results[2],
			type: kind,
			units: results[3]
		    };
		    obj.attributes.push(attr);
		    //obj[attr.name] = attr;
		}
	    }
	    else if (results = enum_set_regex.exec(line)) {
		var kind = convertAttrToType(results[1]),
		    enums = [];
		var vals = value_regex.exec(results[2]);
		while (vals) {
		    enums.push(vals[1]);
		    vals = value_regex.exec(results[2]);
		}
		if (results[1] === 'set' && // need to combine the entries
		    enums.indexOf('UNKNOWN') == -1) {
		    var combinations = function (string)
		    {
			var result = [];
			var loop = function (start,depth,prefix)
			{
			    for(var i=start; i<string.length; i++)
			    {
				var next = prefix+string[i];
				if (depth > 0)
				    loop(i+1,depth-1,next);
				else
				    result.push(next);
			    }
			}
			for(var i=0; i<string.length; i++)
			{
			    loop(0,i,'');
			}
			return result;
		    }
		    enums = combinations(enums.join(''));
		}
		var attr = {
		    name: results[3],
		    type: kind,
		    "enum": enums
		};
		obj.attributes.push(attr);
		//obj[attr.name] = attr;
	    }
	});
	//self.logger.info(JSON.stringify(obj, null, 2));
	return obj;
    };

    UpdateGLDMeta.prototype.createModelArtifacts = function() {
	var self = this,
	    names = Object.keys(self.objects);
	self.createdObjects = [];
	self.nodeMap = {};
	names.map((name) => {
	    var obj = self.objects[name];
	    if (self.createdObjects.indexOf(obj.name) == -1) {
		var base = obj.base;
		var bases = [];
		while (base) {
		    bases.push(base);
		    base = self.objects[base].base;
		}
		//self.logger.info('bases: ' + bases);
		for (var i= bases.length-1; i>=0; i--) {
		    if (self.createdObjects.indexOf(bases[i]) == -1) {
			var b = self.objects[bases[i]];
			self.createMetaNode(b.name, b.base, b.attributes, b.pointers);
			self.createdObjects.push(bases[i]);
		    }
		}
		self.createMetaNode( obj.name, obj.base, obj.attributes, obj.pointers );
		self.createdObjects.push(name);
	    }
	});
    };

    var prevY = 100;

    UpdateGLDMeta.prototype.createMetaNode = function(name, base, attrs, ptrs) {
	if (this.META[name] || this.nodeMap[name]) {
	    this.logger.warn('"' + name + '" already exists!');
	    return;
	}

	if (!this.META.Language) {
	    throw new String('Must have Language folder!');
	}

	if (!this.META.Object) {
	    throw new String('Must have Object base type!!');
	}

	// set METAAspectSet of the ROOT node (means it is META)
	//  adds to the meta sheet
	//   : core.addMember(self.rootNode, 'MetaAspectSet', node)
	//  adds to a tab of the meta sheet
	//   : var set = self.core.getSetNames(self.rootNode).find(name => name !== 'MetaAspectSet');
	//   : core.addMember(this.rootNode, set, node);
	// need to position the nodes in the meta sheet!
	// means we can create meta-sheets for each of the loaded files! :D
	
	// USEFUL FUNCTIONS:
	//   core.setAspectMetaTarget(node, name, target)
	//   core.getFCO(node)
	//   core.getAllMetaNodes(node)
	//   core.getChildrenMeta(node)
	//   core.getAttributeNames(node)
	//   core.getAttributeMeta(node, name)
	//   core.getBase(node)
	//   core.getBaseType(node)
	//   core.getPointerNames(node)
	//   core.getPointerMeta(node, name)
	//   core.getRegistryNames(node)
	//   core.getRegistry(node, name)
	//   core.getSetNames(node)

	// require:
	//   META.Language
	//   META.Model
	//   META.Object
	//   META.Module
	//   META.Class
	//   META.Parent

	if (!base) {
	    base = this.META.Object;
	}
	else {
	    base = this.nodeMap[base];
	}

	var node = this.core.createNode({
	    parent: this.META.Language,
	    base: base
	});
	this.core.setAttribute(node, 'name', name);
	this.nodeMap[name] = node;

	// add to the META sheet
	this.core.addMember(this.rootNode, 'MetaAspectSet', node);

	// add to the specific sheet
	var set = this.core.getSetNames(this.rootNode)
	    .find(name => name !== 'MetaAspectSet');
	this.core.addMember(this.rootNode, set, node);

	// position the node based on the position of the most recently created node on that sheet
	this.core.setRegistry(node, 'position', {x: 100, y: prevY})
	prevY += 100;

	// set the attributes
	if (attrs) {
	    attrs.forEach((attr, index) => {
		var name = attr.name;
		var desc = attr;
		desc.argindex = index;
		this.addAttribute(name, node, desc);
	    });
	}
	/*
	// set the pointers
	if (ptrs) {
	    ptrs.map((ptr) => {
		var name = ptr.name;
		var desc = ptr;
		this.addPointer(name, node, desc);
	    });
	}
	*/
    };

    UpdateGLDMeta.prototype.addAttribute = function(name, node, desc) {
	var initial,
	    schema = {};

	schema.type = desc.type || 'integer';

	if (desc.min !== undefined) {
	    schema.min = +desc.min;
	}
	if (desc.max !== undefined) {
	    schema.max = +desc.max;
	}
	if (desc.infer) {
	    schema.infer = desc.infer;
	}
	if (desc.enum) {
	    schema.enum = desc.enum;
	}
	schema.argindex = desc.argindex;
	this.core.setAttributeMeta(node, name, schema);

	// determine and set the initial value for the attribute
	initial = desc.hasOwnProperty('default') ? desc.default : desc.min || null;
	if (schema.type === 'boolean') {
	    initial = initial !== null ? initial : false;
	}
	if (initial !== null) {
	    this.core.setAttribute(node, name, initial);
	}
    };

    UpdateGLDMeta.prototype.addPointer = function(name, node, desc) {
	if (name == 'from')
	    name = 'src';
	else if (name == 'to')
	    name = 'dst';
	this.core.setPointerMetaTarget(node, name, this.nodeMap[desc.target], desc.min || -1, desc.max || -1);
    };

    return UpdateGLDMeta;
});
