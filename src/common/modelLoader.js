

define(['q'], function(Q) {
    'use strict';
    return {
	loadPowerModel: function(core, META, modelNode, rootNode) {
	    var self = this;
	    self.core = core;
	    self.rootNode = rootNode;
	    var modelAttributes = self.core.getAttributeNames(modelNode);
	    self.model = {
		name: self.core.getAttribute(modelNode, 'name'),
		children: [],
		attributes: {}
	    };
	    modelAttributes.map(function(modelAttr) {
		self.model.attributes[modelAttr] = self.core.getAttribute(modelNode, modelAttr);
	    });
	    return self.core.loadSubTree(modelNode)
		.then(function(nodes) {
		    nodes.map(function(node) {
			var nodeName = self.core.getAttribute(node, 'name'),
			nodePath = self.core.getPath(node),
			attributes = self.core.getAttributeNames(node),
			childPaths = self.core.getChildrenPaths(node),
			pointers = self.core.getPointerNames(node),
			sets = self.core.getSetNames(node),
			nodeObj = {
			    name: nodeName,
			    path: nodePath,
			    children: childPaths,
			    attributes: {},
			    pointers: {},
			    sets: {}
			};
			attributes.map(function(attribute) {
			    nodeObj.attributes[attribute] = self.core.getAttribute(node, attribute);
			});
			pointers.map(function(pointer) {
			    nodeObj.pointers[pointer] = self.core.getPointerPath(node, pointer);
			});
			sets.map(function(set) {
			    nodeObj.sets[set] = self.core.getMemberPaths(node, set);
			});
			self.model.children.push(nodeObj);
		    });
		    self.resolvePointers();
		    return self.model;
		});
	},
	resolvePointers: function() {
	    var self = this;
	    self.model.children.map(function(obj) {
		var childPaths = obj.children;
		var kids = [];
		childPaths.map(function(childPath) {
		    var dst = self.model.children.filter(function (c) { return c.path == childPath; })[0];
		    if (dst)
			kids.push(dst);
		});
		obj.children = kids;
		for (var pointer in obj.pointers) {
		    var path = obj.pointers[pointer];
		    var dst = self.model.children.filter(function (c) { return c.path == path; })[0];
		    if (dst)
			obj.pointers[pointer] = dst;
		}
		for (var set in obj.sets) {
		    var paths = obj.sets[set];
		    var dsts = [];
		    paths.map(function(path) {
			var dst = self.model.filter(function (c) { return c.path == path; })[0];
			if (dst)
			    dsts.push(dst);
		    });
		    objects.sets[set] = dsts;
		}
	    });
	},
    }
});
