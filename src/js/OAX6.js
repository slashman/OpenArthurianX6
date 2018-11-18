window.PIXI   = require('phaser/build/custom/pixi');
window.p2     = require('phaser/build/custom/p2');
window.Phaser = require('phaser/build/custom/phaser-split');

const UI = require('./UI');
const SkyBox = require('./SkyBox');
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
const Bus = require('./Bus');

const Dialogs = require('./Dialogs');
const MessageBox = require('./MessageBox');
const MobDescription = require('./MobDescription');
const Inventory = require('./Inventory');

const scenarioInfo = require('./ScenarioInfo');

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
		PlayerStateMachine.init(game);
		ItemFactory.setGame(game);
		
		const startingState = scenarioInfo.startingState;

		const player = PlayerFactory.buildPlayer(UI, game, undefined, startingState.x, startingState.y, 0);

		const firstLevel = this.loadLevel(game);

		player.level = firstLevel;
		
		firstLevel.addMob(player);
		Bus.listen('addToParty', npc => player.addMobToParty(npc));

		startingState.party.forEach(function(partyMember) {
			const npc = NPCFactory.buildNPC(game, partyMember.id, firstLevel, partyMember.x, partyMember.y, 0);
			player.addMobToParty(npc);
			firstLevel.addMob(npc);
		});
		Dialogs.init(game);
		MessageBox.init(game);
		Inventory.init(game);
		MobDescription.init(game);
		if (startingState.scene) {
			UI.showScene(startingState.scene);
		}
		if (startingState.minuteOfDay !== undefined) {
			SkyBox.setMinuteOfDay(startingState.minuteOfDay);
		}
	},
	loadLevel: function(game){
		const startingState = scenarioInfo.startingState;
		return LevelLoader.loadLevel(game, startingState.map);
	},
	showMobInfo: function(mob) {
		MobDescription.showMob(mob);
	}
};

window.OAX6 = {
	runner: OAX6,
	UI: UI,
	Timer: Timer
};

module.exports = OAX6;