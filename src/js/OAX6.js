window.PIXI   = require('phaser/build/custom/pixi');
window.p2     = require('phaser/build/custom/p2');
window.Phaser = require('phaser/build/custom/phaser-split');

const UI = require('./UI');
const LevelLoader = require('./LevelLoader');

const NPCsData = require('./data/NPCs');
const AppearancesData = require('./data/Appearances');

const NPCFactory = require('./NPCFactory');
const PlayerFactory = require('./PlayerFactory');
const AppearanceFactory = require('./AppearanceFactory');

const PlayerStateMachine = require('./PlayerStateMachine');

const Timer = require('./Timer');

const Dialogs = require('./Dialogs');

const OAX6 = {
	run: function(){
		console.log("Running OAX6");
		NPCFactory.init(NPCsData);
		AppearanceFactory.init(AppearancesData);
		UI.launch(this.startGame.bind(this));
	},
	startGame: function(game){
		Timer.init(game);
		PlayerStateMachine.init(game);
		
		const firstLevel = this.loadLevel(game);
		const player = PlayerFactory.buildPlayer(UI, game, firstLevel, 12, 12, 0);
		player.act();

		Dialogs.init(game);
	},
	loadLevel: function(game){
		return LevelLoader.loadLevel(game);
	}
};

window.OAX6 = {
	runner: OAX6,
	UI: UI,
	Timer: Timer
};

module.exports = OAX6;