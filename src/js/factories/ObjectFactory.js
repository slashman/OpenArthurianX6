const circular = require('circular-functions');

const AppearanceFactory = require('../AppearanceFactory');
const PlayerStateMachine = require('../PlayerStateMachine');
const Stairs = require('../objects/Stairs');
const Lever = require('../objects/Lever');
const Sign = require('../objects/Sign');

const ObjectFactory = {
	init(objectTypes) {
		this.definitions = [];
		objectTypes.forEach(ot => this.definitions[ot.id] = ot);
	},
	setGame(game) {
		this.game = game;
	},
	createObject: function(objectData){
		let gameObject;
		if (objectData.type == 'Stairs') {
			gameObject = new Stairs();
		} else if (objectData.type == 'Lever') {
			gameObject = new Lever();
		} else if (objectData.type == 'Sign') {
			gameObject = new Sign();
		} else {
			gameObject = {};
		}
		Object.assign(gameObject, objectData, objectData.properties);
		delete gameObject.properties;
		if (gameObject.defid) {
			gameObject.def = this.getDefinitionById(gameObject.defid);
		}
		gameObject.sprite = this.getSpriteForObject(this.game, gameObject);
		return gameObject;
	},
	getDefinitionById(id) {
		return this.definitions[id];
	},
	getSpriteForObject: function(game, gameObject) {
		const appearance = AppearanceFactory.getAppearance(gameObject.getAppearanceId());
		const sprite = game.add.sprite(0, 0, appearance.tileset, appearance.i);
		if (gameObject.hidden) {
			sprite.visible = false;
		} else {
			sprite.visible = true;
		}
		sprite.inputEnabled = true;
		sprite.events.onInputDown.add(() => { 
			if (game.input.activePointer.rightButton.isDown) {
				// OAX6.PlayerStateMachine.useMouseCommand({x: item.x, y: item.y});  // TODO: Similar to doors
			}
		});
		return sprite;
	},
};
module.exports = ObjectFactory;