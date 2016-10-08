

define(['q'], function(Q) {
    'use strict';
    return {
	renderGLM: function(model, core, META) {
	    var self = this;
	    var fileData = '';
	    var root = model.root;

	    // used for ensuring children are serialized after parents
	    self.serializedObjects = [];

	    // Includes
	    if (root.Include_list) {
		root.Include_list.map((obj) => {
		    fileData += `#include "${obj.name}"\n`;
		});
	    }
	    // Globals
	    if (root.Global_list) {
		root.Global_list.map((obj) => {
		    if (obj.Type == 'set')
			fileData += `#${obj.Type} ${obj.name}=${obj.Value};\n`;
		    else if (obj.Type == 'define')
			fileData += `#${obj.Type} ${obj.name}=${obj.Value}\n`;
		});
	    }
	    // Variables
	    if (root.Variable_list) {
		root.Variable_list.map((obj) => {
		    fileData += `#setenv ${obj.name}=${obj.Expression};\n`;
		});
	    }
	    // Modules
	    if (root.module_list) {
		root.module_list.map((obj) => {
		    if (obj.Variable_list || obj.class_list) {
			fileData += `module ${obj.name} \{\n`;
			// module variables
			if (obj.Variable_list) {
			    obj.Variable_list.map((v) => {
				fileData += `  ${v.name} ${v.Expression};\n`;
			    });
			}
			// module classes
			if (obj.class_list) {
			    obj.class_list.map((c) => {
				fileData += `  class ${c.name} \{\n`;
				// class properties
				if (c.PropertyDef_list) {
				    c.PropertyDef_list.map((p) => {
					if (p.Unit)
					    fileData += `    ${p.Type} ${p.name}[${p.Unit}];\n`;
					else
					    fileData += `    ${p.Type} ${p.name};\n`;
				    });
				}
				fileData += `  \};\n`;
			    });
			}
			fileData += `\};\n`;
		    }
		    else {
			fileData += `module ${obj.name};\n`;
		    }
		});
	    }
	    // Classes
	    if (root.class_list) {
		root.class_list.map((c) => {
		    fileData += `class ${c.name} \{\n`;
		    // class properties
		    if (c.PropertyDef_list) {
			c.PropertyDef_list.map((p) => {
			    if (p.Unit)
				fileData += `  ${p.Type} ${p.name}[${p.Unit}];\n`;
			    else
				fileData += `  ${p.Type} ${p.name};\n`;
			});
		    }
		    fileData += `\};\n`;
		});
	    }
	    // Clock
	    if (root.clock_list) {
		root.clock_list.map((clock) => {
		    fileData += `clock \{\n`;
		    for (var attr in clock.attributes) {
			if (attr == 'name' || clock.attributes[attr].length == 0)
			    continue;
			if (clock.attributes[attr].indexOf(' ') > -1 || clock.attributes[attr].indexOf('+') > -1)
			    fileData += `  ${attr} '${clock.attributes[attr]}';\n`;
			else
			    fileData += `  ${attr} ${clock.attributes[attr]};\n`;
		    }
		    fileData += `\};\n`;
		});
	    }
	    // Schedules
	    if (root.schedule_list) {
		root.schedule_list.map((sched) => {
		    fileData += `schedule ${sched.name} \{\n`;
		    if (sched.Entry_list) {
			sched.Entry_list.map((entry) => {
			    fileData += `  ${entry.Minutes} ${entry.Hours} ${entry.Days} ${entry.Months} ${entry.Weekdays}`;
			    if (entry.Value.length)
				fileData += ` ${entry.Value}`;
			    fileData += '\n';
			});
		    }
		    fileData += `\};\n`;
		});
	    }
	    // Objects
	    root.childPaths.map((childPath) => {
		fileData += self.renderObject(model, core, META, childPath);
	    });
	    return fileData;
	},
	renderObject: function(model, core, META, childPath) {
	    var self = this;
	    var child = model.objects[childPath];
	    var ptrData = '';
	    var childData = '';
	    if (self.serializedObjects.indexOf(childPath) == -1 && core.isTypeOf(child.node, META.Object)) {
		console.log('Rendering: ' + child.name);
		var nameRegex = /[a-zA-Z\-_]/g;
		var nameTest = nameRegex.exec(child.name);
		if (child.meta_type) {
		    childData += `object ${child.meta_type}`;
		}
		else {
		    childData += `object ${child.type}`;
		}
		if (!nameTest)
		    childData += `:${child.name}`;
		childData += ` \{\n`;
		for (var attr in child.attributes) {
		    if (child.attributes[attr]) {
			if (attr == 'name' && !nameTest) {
			    continue;
			}
			if (attr == 'meta_type') {
			    continue;
			}
			childData += `  ${attr} ${child.attributes[attr]};\n`;
		    }
		}
		for (var ptr in child.pointers) {
		    var ptrPath = child.pointers[ptr];
		    var ptrObj = model.objects[ptrPath];
		    if (ptrObj) {
			if (self.serializedObjects.indexOf(ptrPath) == -1) {
			    ptrData += self.renderObject(model, core, META, ptrPath);
			}
			var ptrName = ptr;
			if (ptr == 'src' || ptr == 'dst') {
			    ptrName = (ptr == 'src') ? 'from' : 'to';
			}
			var nameRegex = /[a-zA-Z\-_]/g;
			if (!nameRegex.exec(ptrObj.name))
			    childData += `  ${ptrName} ${ptrObj.type}:${ptrObj.name};\n`;
			else
			    childData += `  ${ptrName} ${ptrObj.name};\n`;
		    }
		}
		childData += `\};\n`;
		self.serializedObjects.push(childPath);
	    }
	    return ptrData + childData;
	},
    }
});
