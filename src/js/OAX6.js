window.PIXI   = require('phaser/build/custom/pixi');
window.p2     = require('phaser/build/custom/p2');
window.Phaser = require('phaser/build/custom/phaser-split');

const UI = require('./UI');
const LevelLoader = require('./LevelLoader');

const NPCsData = require('./data/NPCs');
const AppearancesData = require('./data/Appearances');

const NPCFactory = require('./NPCFactory');
const AppearanceFactory = require('./AppearanceFactory');

const OAX6 = {
	run: function(){
		console.log("Running OAX6");
		NPCFactory.init(NPCsData);
		AppearanceFactory.init(AppearancesData);
		UI.init(this.loadLevel.bind(this));
	},
	loadLevel: function(game){
		LevelLoader.loadLevel(game);
	}
};

window.OAX6 = OAX6;

module.exports = OAX6;