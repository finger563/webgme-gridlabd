

define([], function() {
    'use strict';
    return {
	getDataFromLog: function(log) {
	    // <time>,<market 1 price>,<market 2 price>
	    // or
	    // <time>,<total power seen by generator>
	    var re = /([0-9\.]+),([0-9\.]+)(?:,([0-9\.]+))?/gi;
	    var result = re.exec(log);
	    if (!result)
		return null; // bad log, no data
	    var log_data;
	    if (result[3]) {
		// <time>,<market 1 price>,<market 2 price>
		log_data = {
		    "Generator 1 Price": {
			name: "Generator 1 Price",
			data: []
		    },
		    "Generator 2 Price": {
			name: "Generator 2 Price",
			data: []
		    }
		};
	    }
	    else {
		// <time>,<total power seen by generator>
		log_data = {
		    "Total Power": {
			name: "Total Power",
			data: []
		    }
		};
	    }
	    var keys = Object.keys(log_data);
	    while(result != null) {
		var time = parseFloat(result[1]);
		var data1 = parseFloat(result[2]);
		log_data[keys[0]].data.push([time, data1]);
		if (results[3]) {
		    var data2 = parseFloat(result[3]);
		    log_data[keys[1]].data.push([time, data2]);
		}
		result = re.exec(log);
	    }
	    return log_data;
	},
    }
});
