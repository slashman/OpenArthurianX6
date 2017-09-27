"use strict";

function Stat(max){
	this.max = max;
	this.current = max;
}

module.exports = Stat;

Stat.prototype = {
	replenish: function(){
		this.current = this.max;
	},
	regenerate: function(){
		if (this.current < this.max)
			this.current++;
	},
	increase: function(value){
		if (this.current < this.max)
			this.current += value;
		if (this.current > this.max)
			this.current = this.max;
	},
	increaseOpenly: function(value){
		this.current += value;
	},
	recoverProportion: function(proportion){
		var missing = this.max - this.current;
		this.increase(Math.round(missing*proportion));
	},
	recoverProportionOfTotal: function(proportion){
		this.increase(Math.round(this.max*proportion));
	},
	reduce: function(value){
		if (this.current > 0)
			this.current-= value;
		if (this.current < 0)
			this.current = 0;
	},
	extend: function(value){
		this.max += value;
		this.current += value;
	},
	multiply: function(value){
		this.max *= value;
		this.current *= value;
	},
	contract: function(value){
		this.max -= value;
		if (this.max < 0)
			this.max = 0;
		if (this.current > this.max)
			this.current = this.max;
	},
	getText: function(){
		return this.current + "/" + this.max;
	},
	getProportion: function(){
		if (this.max === 0)
			return 0;
		else
			return this.current / this.max;
	},
	notFull: function(){
		return this.current !== this.max;
	},
	empty: function(){
		return this.current <= 0;
	},
	getRemaining: function(){
		return this.max - this.current;
	}
};