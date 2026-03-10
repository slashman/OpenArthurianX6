const DIRECTION_NAMES: Record<string, string> = {
	"0:-1": "North",
	"0:1": "South",
	"1:0": "East",
	"-1:0": "West",
	"0:0": "Here"
};

export type Point = {
	x: number, y: number
}

const Geo = {
	flatDist: function(xa: number, ya: number, xb: number, yb: number): number{
		return Math.abs(xb-xa)+Math.abs(yb-ya);
	},
	getDirectionName: function(v: Point): string{
		return DIRECTION_NAMES[v.x+":"+v.y];
	}
};

export default Geo;