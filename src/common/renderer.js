

define(['q'], function(Q) {
    'use strict';
    return {
	renderGLM: function(model, core, META) {
	    var fileData = '';
	    // Globals
	    if (model.Global_list) {
		model.Global_list.map((obj) => {
		    fileData += `#set ${obj.name}=${obj.Value};\n`;
		});
	    }
	    // Variables
	    if (model.Variable_list) {
		model.Variable_list.map((obj) => {
		    fileData += `#setenv ${obj.name}=${obj.Expression};\n`;
		});
	    }
	    // Modules
	    if (model.module_list) {
		model.module_list.map((obj) => {
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
	    if (model.class_list) {
		model.class_list.map((c) => {
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
	    if (model.clock_list) {
		model.clock_list.map((clock) => {
		    fileData += `clock \{\n`;
		    for (var attr in clock.attributes) {
			if (attr == 'name' || clock.attributes[attr].length == 0)
			    continue;
			if (clock.attributes[attr].indexOf(' ') > -1)
			    fileData += `  ${attr} '${clock.attributes[attr]}';\n`;
			else
			    fileData += `  ${attr} ${clock.attributes[attr]};\n`;
		    }
		    fileData += `\};\n`;
		});
	    }
	    // Schedules
	    if (model.schedule_list) {
		model.schedule_list.map((sched) => {
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
	    model.childPaths.map((childPath) => {
		var child = model.pathDict[childPath];
		if (core.isTypeOf(child.node, META.Object)) {
		    var nameRegex = /[a-zA-Z\-_]/g;
		    var nameTest = nameRegex.exec(child.name);
		    fileData += `object ${child.type}`;
		    if (!nameTest)
			fileData += `:${child.name}`;
		    fileData += ` \{\n`;
		    for (var attr in child.attributes) {
			if (child.attributes[attr]) {
			    if (attr == 'name' && !nameTest) {
				continue;
			    }
			    fileData += `  ${attr} ${child.attributes[attr]};\n`;
			}
		    }
		    for (var ptr in child.pointers) {
			var ptrObj = model.pathDict[child.pointers[ptr]];
			if (ptrObj) {
			    var ptrName = ptr;
			    if (ptr == 'src' || ptr == 'dst') {
				ptrName = (ptr == 'src') ? 'from' : 'to';
			    }
			    var nameRegex = /[a-zA-Z\-_]/g;
			    if (!nameRegex.exec(ptrObj.name))
				fileData += `  ${ptrName} ${ptrObj.type}:${ptrObj.name};\n`;
			    else
				fileData += `  ${ptrName} ${ptrObj.name};\n`;
			}
		    }
		    fileData += `\};\n`;
		}
	    });
	    return fileData;
	},
    }
});
