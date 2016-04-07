/* Generated file based on ejs templates */
define([], function() {
    return {
    "GLM.ejs": "<% for ( var attr in model.attributes) { \n     var val = model.attributes[attr];\n     if (commands[attr] && val) { -%>\n#<%- commands[attr] %> <%- attr %>=<%- val %>;\n<%   }\n   } -%>\n\n<% model.schedules.map(function(schedule) { -%>\nschedule <%- schedule.name %> {\n<%   schedule.schedule_entrys.map(function(entry) {\n       if (entry.value) { -%>\n    <%- entry.minutes %> <%- entry.hours %> <%- entry.days %> <%- entry.months %> <%- entry.weekdays %> <%- entry.value %>;\n<%     } \n       else { -%>\n    <%- entry.minutes %> <%- entry.hours %> <%- entry.days %> <%- entry.months %> <%- entry.weekdays %>;\n<%     }\n     }); -%>\n}\n<% }); -%>\n"
}});