module.exports = {
	chance: function(c) {
		return Math.random() * 100 <= c;
	},
	num: function(low, hi){
		return Math.floor(Math.random() * (hi - low + 1))+low;
	},
  fnum: function(low, hi){
    return Math.random() * (hi - low + 1) + low;
  },
	from: function(array){
		return array[this.num(0,array.length-1)];
	}
}