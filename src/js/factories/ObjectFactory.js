const circular = require('circular-functions');

const AppearanceFactory = require('../AppearanceFactory');
const PlayerStateMachine = require('../PlayerStateMachine');
const Stairs = require('../objects/Stairs');

const ObjectFactory = {
	setGame(game) {
		this.game = game;
	},
	createObject: function(objectData){
		let gameObject;
		if (objectData.type == 'Stairs') {
			gameObject = new Stairs();
		}
		Object.assign(gameObject, objectData, objectData.properties);
		delete gameObject.properties;
		gameObject.sprite = this.getSpriteForObject(this.game, gameObject);
		return gameObject;
	},
	getSpriteForObject: function(game, gameObject) {
		const appearance = AppearanceFactory.getAppearance(gameObject.appearanceId);
		const sprite = game.add.sprite(0, 0, appearance.tileset, appearance.i);
		sprite.visible = true;
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