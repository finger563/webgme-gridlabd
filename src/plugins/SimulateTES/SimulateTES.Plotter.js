

define(['d3', 'underscore'], function() {
    'use strict';
    return {
	plotData: function(data) {
	    var self = this;
	    var _ = require('underscore');
	    if (_.isEmpty(data))
		return;

	    var d3 = require('d3');
	    var Q = require('q');
	    var jsdom = require('jsdom').jsdom;

	    var htmlStub = '<html><body><svg id="plot"></svg></body></html>';

	    var deferred = Q.defer();

	    var names = Object.keys(data);

	    var bandPos = [-1, -1];
	    var pos;

	    // extent returns array: [min, max]
	    var maxXs = Object.keys(data).map(function(key) {
		return d3.extent(data[key].data, function(xy) { return xy[0]; })[1];
	    });
	    var maxYs = Object.keys(data).map(function(key) {
		return d3.extent(data[key].data, function(xy) { return xy[1]; })[1];
	    });
	    var xdomain = d3.max(maxXs);
	    var ydomain = d3.max(maxYs); 

	    var colors = ["steelblue", "green", "red", "purple", "lavender", "orange", "yellow", "blue", "grey"];
	    var colorMap = {};
	    var tmp =0;
	    for (var key in data) {
		colorMap[key] = colors[tmp];
		tmp++;
		if (tmp >= colors.length)
		    tmp = 0;
	    }

	    var margin = {
		top: 40,
		right: 40,
		bottom: 50,
		left: 60
	    }
	    var width = 760 - margin.left - margin.right;
	    var height = 250 - margin.top - margin.bottom;

	    var x = d3.scale.linear()
		.domain([0, xdomain])
		.range([0, width]);

	    var y = d3.scale.linear()
		.domain([0, ydomain])
		.range([height, 0]);

	    var xAxis = d3.svg.axis()
		.scale(x)
		.orient("bottom");

	    var yAxis = d3.svg.axis()
		.scale(y)
		.orient("left");

	    var line = d3.svg.line()
		.interpolate("basis")
		.x(function(d) {
		    return x(d[0]);
		})
		.y(function(d) {
		    return y(d[1]);
		});

	    jsdom.env(
		"<html><body></body></html>",
		[ 'http://d3js.org/d3.v3.min.js' ],
		function (err, window) {
		    var svg = window.d3.select("body")
			.append("svg")
			.attr('preserveAspectRatio', 'xMinYMin meet')
			.attr('viewBox', '0 0 '+(width+margin.left+margin.right) + ' '+(height +margin.bottom+margin.top))
			.classed('svg-content-responsive', true)
			.append("g")
			.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
		    //.attr("width", "100%")
		    //.attr("height", height + margin.top + margin.bottom)

		    // add axes
		    svg.append("g")
			.attr("class", "x axis")
			.call(xAxis)
			.style('fill', 'none')
			.style('stroke', '#000')
			.style('shape-rendering', 'crispEdges')
			.attr("transform", "translate(0," + height + ")");

		    svg.append("g")
			.attr("class", "y axis")
			.style('fill', 'none')
			.style('stroke', '#000')
			.style('shape-rendering', 'crispEdges')
			.call(yAxis)

		    // add clipping for plot
		    svg.append("clipPath")
			.attr("id", "clip")
			.append("rect")
			.attr("width", width)
			.attr("height", height);

		    // add data
		    for (var alias in data) {
			svg.append("path")
			    .datum(data[alias].data)
			    .attr("class", "line line" + alias)
			    .attr("clip-path", "url(#clip)")
			    .style("stroke", colorMap[alias])
			    .attr("d", line);
		    }

		    var longestName = names.sort(function (a, b) { return b.length - a.length; })[0];
		    var legendWidth = longestName.length * 5 + 10;
		    // add legend   
		    var legend = svg.append("g")
			.style('padding', '5px')
			.style('font', '10px sans-serif')
			.style('background', 'yellow')
			.style('box-shadow', '2px 2px 1px #888')
			.attr("class", "legend")
			.attr("height", 100)
			.attr("width", legendWidth * 2)
			.attr('transform', 'translate(0, 0)');

		    legend.selectAll('g').data(names)
			.enter()
			.append('g')
			.each(function(d, i) {
			    var g = d3.select(this);
			    g.append("rect")
				.attr("x", width - legendWidth)
				.attr("y", i*25)
				.attr("width", 10)
				.attr("height", 10)
				.style("fill", colorMap[d]);
			    
			    g.append("text")
				.attr("x", width - legendWidth + 10)
				.attr("y", i * 25 + 8)
				.attr("height",30)
				.attr("width",legendWidth)
				.style("fill", "black")
				.text(d);

			});
		    deferred.resolve(window.d3.select("body").html());
		}
	    );
	    return deferred.promise;
	},
    }
});
