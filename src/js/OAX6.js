window.PIXI   = require('phaser-ce/build/custom/pixi');
window.p2     = require('phaser-ce/build/custom/p2');
window.Phaser = require('phaser-ce/build/custom/phaser-split');

const UI = require('./UI');
const SkyBox = require('./SkyBox');
const ChunkLoader = require('./ChunkLoader');

const NPCsData = require('./data/NPCs');
const MobTypeData = require('./data/MobTypes');
const ItemsData = require('./data/Items');
const AppearancesData = require('./data/Appearances');
const ObjectTypes = require('./data/ObjectTypes');

const NPCFactory = require('./NPCFactory');
const MobFactory = require('./MobFactory');
const PlayerFactory = require('./PlayerFactory');
const AppearanceFactory = require('./AppearanceFactory');
const ItemFactory = require('./ItemFactory');
const ObjectFactory = require('./factories/ObjectFactory');
const Storage = require('./Storage');

const PlayerStateMachine = require('./PlayerStateMachine');

const Timer = require('./Timer');
const Bus = require('./Bus');

const scenarioInfo = require('./ScenarioInfo');
const World = require('./model/World.class');
const WorldLoader = require('./WorldLoader');

const OAX6 = {
	run: function(){
		console.log("Running OAX6");
		NPCFactory.init(NPCsData);
		MobFactory.init(MobTypeData);
		AppearanceFactory.init(AppearancesData);
		ItemFactory.init(ItemsData);
		ObjectFactory.init(ObjectTypes);
		UI.launch(this.startGame.bind(this));
	},
	startGame: function(game){
		PlayerStateMachine.init(game);
		ItemFactory.setGame(game);
		ObjectFactory.setGame(game);
		ChunkLoader.init(game, scenarioInfo.maps);

		this.playerStateMachine = PlayerStateMachine;

		this.playerStateMachine.switchState(PlayerStateMachine.TITLE);

		game.canvas.oncontextmenu = function (e) {
			e.preventDefault();
		};
	},
	newGame: function(game) {
		const startingState = scenarioInfo.startingState;
		const player = PlayerFactory.buildPlayer(game, undefined, 0, 0, 0);
		UI.setActiveMob(player);
		UI.player = player; // TODO: Remove
		const world = new World();
		world.setConfig(scenarioInfo.config);
		player.world = world;
		if (startingState.minuteOfDay !== undefined) {
			world.initMinuteOfDay(startingState.minuteOfDay);
		} else {
			world.initMinuteOfDay(0);
		}
		
		Bus.listen('addToParty', npc => player.addMobToParty(npc));
		Bus.listen('removeFromParty', npc => player.removeFromParty(npc));
		startingState.party.forEach(function(partyMember) {
			const npc = NPCFactory.buildNPC(game, partyMember.id, undefined, 0, 0, 0);
			player.addMobToParty(npc);
		});
		WorldLoader.openWorld(startingState.position, player, world);
		UI.updateFOV();

		if (startingState.scene) {
			UI.showScene(startingState.scene);
		}
		
	},
	loadGame: function(game) {
		const player = Storage.loadGame(game);
		PlayerStateMachine.player = player;
		UI.setActiveMob(player);
		UI.player = player; // TODO: Remove
		Bus.listen('addToParty', npc => player.addMobToParty(npc));
		Bus.listen('removeFromParty', npc => player.removeFromParty(npc));
		WorldLoader.restoreWorld(player.world);
		UI.updateFOV();
		UI.restoreComponentState();
	}
};

window.OAX6 = {
	runner: OAX6,
	UI: UI,
	Timer: Timer,
	ChunkLoader,
	NPCFactory,
	MobFactory,
	ItemFactory,
	AppearanceFactory,
	PlayerStateMachine,
	ObjectFactory
};

module.exports = OAX6;