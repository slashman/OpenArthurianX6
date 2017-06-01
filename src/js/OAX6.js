window.PIXI   = require('phaser/build/custom/pixi');
window.p2     = require('phaser/build/custom/p2');
window.Phaser = require('phaser/build/custom/phaser-split');

const UI = require('./UI');

const OAX6 = {
	run: function(){
		console.log("Running OAX6");
		UI.init(this.loadLevel.bind(this));
	},
	loadLevel: function(){
		
	}
};

window.OAX6 = OAX6;

module.exports = OAX6;