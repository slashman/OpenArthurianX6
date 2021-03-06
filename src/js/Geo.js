const DIRECTION_NAMES = {
	"0:-1": "North",
	"0:1": "South",
	"1:0": "East",
	"-1:0": "West",
	"0:0": "Here"
};

const Geo = {
	flatDist: function(xa, ya, xb, yb){
		return Math.abs(xb-xa)+Math.abs(yb-ya);
	},
	getDirectionName: function(v){
		return DIRECTION_NAMES[v.x+":"+v.y];
	}
};

module.exports = Geo;