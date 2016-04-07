

define(['q'], function(Q) {
    'use strict';
    return {
	loadPowerModel: function(core, modelNode) {
	    var self = this;
	    var modelAttributes = core.getAttributeNames(modelNode);
	    self.model = {
		name: core.getAttribute(modelNode, 'name'),
		children: [],
		attributes: {}
	    };
	    modelAttributes.map(function(modelAttr) {
		self.model.attributes[modelAttr] = core.getAttribute(modelNode, modelAttr);
	    });
	    return core.loadSubTree(modelNode)
		.then(function(nodes) {
		    nodes.map(function(node) {
			var nodeName = core.getAttribute(node, 'name'),
			nodePath = core.getPath(node),
			attributes = core.getAttributeNames(node),
			childPaths = core.getChildrenPaths(node),
			pointers = core.getPointerNames(node),
			sets = core.getSetNames(node),
			nodeObj = {
			    name: nodeName,
			    path: nodePath,
			    children: childPaths,
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
