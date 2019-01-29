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
const Storage = require('./Storage');

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
		Dialogs.init(game);
		MessageBox.init(game);
		Inventory.init(game);
		MobDescription.init(game);
		LevelLoader.init(game, scenarioInfo.maps);

		if (Storage.saveGameExists()) {
			this.loadGame(game);
		} else {
			this.newGame(game);
		}
	},
	newGame: function(game) {
		const startingState = scenarioInfo.startingState;
		const player = PlayerFactory.buildPlayer(game, undefined, 0, 0, 0);
		UI.player = player;
		Bus.listen('addToParty', npc => player.addMobToParty(npc));
		startingState.party.forEach(function(partyMember) {
			const npc = NPCFactory.buildNPC(game, partyMember.id, undefined, 0, 0, 0);
			player.addMobToParty(npc);
		});
		LevelLoader.openLevel(startingState.map, player);

		if (startingState.scene) {
			UI.showScene(startingState.scene);
		}
		if (startingState.minuteOfDay !== undefined) {
			SkyBox.setMinuteOfDay(startingState.minuteOfDay);
		}
	},
	loadGame: function(game) {
		const loadedGame = Storage.loadGame();
		const player = loadedGame.player;
		UI.player = player;
		Bus.listen('addToParty', npc => player.addMobToParty(npc));
		LevelLoader.setLevelsData(loadedGame.levels);
		player.level.activate();
		SkyBox.setMinuteOfDay(loadedGame.minuteOfDay);
	},
	/*loadLevel: function(game){
		const startingState = scenarioInfo.startingState;
		return LevelLoader.loadLevel(game, startingState.map);
	},*/
	showMobInfo: function(mob) {
		MobDescription.showMob(mob);
	}
};

window.OAX6 = {
	runner: OAX6,
	UI: UI,
	Timer: Timer,
	LevelLoader
};

module.exports = OAX6;