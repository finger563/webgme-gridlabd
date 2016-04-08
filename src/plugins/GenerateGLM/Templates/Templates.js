/* Generated file based on ejs templates */
define([], function() {
    return {
    "GLM.ejs": "<% for ( var attr in model.attributes) { \n     var val = model.attributes[attr];\n     if (commands[attr] && val != null && val.length > 0) { -%>\n#<%- commands[attr] %> <%- attr %>=<%- val %>;\n<%   }\n   } -%>\n\n<% if (model.clocks) {\nmodel.clocks.map(function(clock) { -%>\nclock {\n  timestamp '<%- clock.timestamp %>';\n  stoptime '<%- clock.stoptime %>';\n  timezone <%- clock.timezone %>;\n}\n\n<% }); \n   } -%>\n<% if (model.powerflows) {\nmodel.powerflows.map(function(obj) { -%>\nmodule <%- obj.type %> {\n<%   for (var attr in obj.attributes) { \n       if ( attr == undefined ) continue;\n       if ( attr == 'name' ) continue;\n       var val = obj.attributes[attr];\n       if ( val == undefined || val == null || val.length == 0 ) continue; -%>\n  <%- attr %> <%- val %>;\n<%   } -%>\n}\n\n<% }); \n   } -%>\n<% if (model.residentials) {\nmodel.residentials.map(function(obj) { -%>\nmodule <%- obj.type %> {\n<%   for (var attr in obj.attributes) { \n       if ( attr == 'name' ) continue;\n       var val = obj.attributes[attr]; \n       if ( val == undefined || val == null || val.length == 0 ) continue; -%>\n  <%- attr %> <%- val %>;\n<%   } -%>\n}\n\n<% });\n   } -%>\n<% if (model.schedules) {\nmodel.schedules.map(function(schedule) { -%>\nschedule <%- schedule.name %> {\n<%   if( schedule.schedule_entrys ) {\n     schedule.schedule_entrys.map(function(entry) {\n       if (entry.value) { -%>\n    <%- entry.minutes %> <%- entry.hours %> <%- entry.days %> <%- entry.months %> <%- entry.weekdays %> <%- entry.value %>;\n<%     } \n       else { -%>\n    <%- entry.minutes %> <%- entry.hours %> <%- entry.days %> <%- entry.months %> <%- entry.weekdays %>;\n<%     }\n     }); -%>\n}\n\n<% }});\n   } -%>\n<% childTypes.map(function(childType) {\n      var listName = childType + 's';\n      if (model[listName] == undefined) return;\n      model[listName].map(function(obj) { -%>\nobject <%- obj.type %><% if (/[a-zA-Z_]/.test(obj.name) == false) { %>:<%- obj.name.replace(/\\-/g,'') %><% } %> {\n<%  \tif (/[a-zA-Z_]/.test(obj.name) == false) { obj.attributes.name = undefined; }\n        var ptrs = {};\n\tif (pointerDict[obj.type]) {\n          var keys = Object.keys(pointerDict[obj.type]);\n          keys.map(function(key) { ptrs[pointerDict[obj.type][key]] = true; });\n        }\n        for (var attr in obj.attributes) {\n\t  var val = obj.attributes[attr];\n          if (ptrs[attr]) continue;\n          if (val == undefined || val == null || val.length == 0) continue; -%>\n  <%- attr %> <%- val %>;\n<%\t} -%>\n<%  \tfor (var ptr in obj.pointers) {\n\t  var dst = obj[ptr]; \n          if (!pointerDict[obj.type] || !pointerDict[obj.type][ptr]) continue;\n          if (dst == undefined) continue; -%>\n  <%- pointerDict[obj.type][ptr] %> <%- dst.type %>:<%- dst.name %>;\n<%\t} -%>\n }\n\n<%      });\n  }); -%>\n"
}});