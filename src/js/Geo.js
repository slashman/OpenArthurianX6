/* jshint node: true */
"use strict";

const DIRECTION_NAMES = {
	"0:-1": "North",
	"0:1": "South",
	"1:0": "East",
	"-1:0": "West",
};

const Geo = {
	getDirectionName: function(v){
		return DIRECTION_NAMES[v.x+":"+v.y];
	}
};

module.exports = Geo;