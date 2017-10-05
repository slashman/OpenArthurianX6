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
		const player = PlayerFactory.buildPlayer(UI, game, firstLevel, 12, 5, 0);
		const partyMember1 = NPCFactory.buildNPC(game, 'iolo', firstLevel, 11, 6, 0);
		partyMember1.alignment = 'b';
		const partyMember2 = NPCFactory.buildNPC(game, 'iolo', firstLevel, 13, 6, 0);
		partyMember2.alignment = 'b';
		const partyMember3 = NPCFactory.buildNPC(game, 'iolo', firstLevel, 12, 7, 0);
		partyMember3.alignment = 'b';
		player.addMobToParty(partyMember1);
		player.addMobToParty(partyMember2);
		player.addMobToParty(partyMember3);
		firstLevel.addMob(player);
		firstLevel.addMob(partyMember1);
		firstLevel.addMob(partyMember2);
		firstLevel.addMob(partyMember3);
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