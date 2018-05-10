window.PIXI   = require('phaser/build/custom/pixi');
window.p2     = require('phaser/build/custom/p2');
window.Phaser = require('phaser/build/custom/phaser-split');

const UI = require('./UI');
const LevelLoader = require('./LevelLoader');

const NPCsData = require('./data/NPCs');
const MobTypeData = require('./data/MobTypes');
const ItemsData = require('./data/Items');
const AppearancesData = require('./data/Appearances');

const NPCFactory = require('./NPCFactory');
const MobFactory = require('./MobFactory');
const PlayerFactory = require('./PlayerFactory');
const AppearanceFactory = require('./AppearanceFactory');
const ItemFactory = require('./ItemFactory');

const PlayerStateMachine = require('./PlayerStateMachine');

const Timer = require('./Timer');

const Dialogs = require('./Dialogs');
const Inventory = require('./Inventory');

const OAX6 = {
	run: function(){
		console.log("Running OAX6");
		NPCFactory.init(NPCsData);
		MobFactory.init(MobTypeData);
		AppearanceFactory.init(AppearancesData);
		ItemFactory.init(ItemsData);
		UI.launch(this.startGame.bind(this));
	},
	startGame: function(game){
		Timer.init(game);
		PlayerStateMachine.init(game);
		ItemFactory.setGame(game);
		
		const firstLevel = this.loadLevel(game);
		const player = PlayerFactory.buildPlayer(UI, game, firstLevel, 12, 15, 0);
		const shamino = NPCFactory.buildNPC(game, 'shamino', firstLevel, 13, 16, 0);
		const dupre = NPCFactory.buildNPC(game, 'dupre', firstLevel, 12, 17, 0);
		player.addMobToParty(shamino);
		player.addMobToParty(dupre);
		firstLevel.addMob(player);
		firstLevel.addMob(shamino);
		firstLevel.addMob(dupre);
		Dialogs.init(game);
		Inventory.init(game);
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