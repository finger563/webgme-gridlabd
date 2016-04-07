

define(['q'], function(Q) {
    'use strict';
    return {
	loadPowerModel: function(core, modelNode) {
	    var self = this;
	    var modelAttributes = core.getAttributeNames(modelNode);
	    self.model = {
		name: core.getAttribute(modelNode, 'name'),
		attributes: {},
		modelObjects: []   // used to store the objects for handling pointers
	    };
	    modelAttributes.map(function(modelAttr) {
		self.model.attributes[modelAttr] = core.getAttribute(modelNode, modelAttr);
	    });
	    return core.loadSubTree(modelNode)
		.then(function(nodes) {
		    nodes.map(function(node) {
			var nodeName = core.getAttribute(node, 'name'),
			nodePath = core.getPath(node),
			nodeType = core.getAttribute(core.getBaseType(node), 'name'),
			attributes = core.getAttributeNames(node),
			childPaths = core.getChildrenPaths(node),
			pointers = core.getPointerNames(node),
			sets = core.getSetNames(node),
			nodeObj = {
			    name: nodeName,
			    path: nodePath,
			    type: nodeType,
			    childPaths: childPaths,
			    attributes: {},
			    pointers: {},
			    sets: {}
			};
			attributes.map(function(attribute) {
			    nodeObj.attributes[attribute] = core.getAttribute(node, attribute);
			});
			pointers.map(function(pointer) {
			    nodeObj.pointers[pointer] = core.getPointerPath(node, pointer);
			});
			sets.map(function(set) {
			    nodeObj.sets[set] = core.getMemberPaths(node, set);
			});
			self.model.modelObjects.push(nodeObj);
		    });
		    self.resolvePointers();
		    return self.model;
		});
	},
	resolvePointers: function() {
	    var self = this;
	    self.model.modelObjects.map(function(obj) {
		obj.childPaths.map(function(childPath) {
		    var dst = self.model.modelObjects.filter(function (c) { return c.path == childPath; })[0];
		    if (dst) {
			var key = dst.type + 's';
			if (!obj[key]) {
			    obj[key] = [];
			}
			obj[key].push(dst);
		    }
		});
		for (var pointer in obj.pointers) {
		    var path = obj.pointers[pointer];
		    var dst = self.model.modelObjects.filter(function (c) { return c.path == path; })[0];
		    if (dst)
			obj[pointer] = dst;
		}
		for (var set in obj.sets) {
		    var paths = obj.sets[set];
		    var dsts = [];
		    paths.map(function(path) {
			var dst = self.model.modelObjects.filter(function (c) { return c.path == path; })[0];
			if (dst)
			    dsts.push(dst);
		    });
		    obj[set] = dsts;
		}
		var key = obj.type + 's';
		if (!self.model[key]) {
		    self.model[key] = [];
		}
		self.model[key].push(obj);
	    });
	},
    }
});
