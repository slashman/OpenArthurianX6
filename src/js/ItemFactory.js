const circular = require('circular-functions');

const Stat = require('./Stat.class');
const AppearanceFactory = require('./AppearanceFactory');
const Item = require('./Item.class');
const Door = require('./Door.class');
const MobDescription = require('./MobDescription');
const PlayerStateMachine = require('./PlayerStateMachine');

const ItemFactory = {
	init: function(itemData){
		this.itemsMap = [];
		this.itemData = itemData;
		itemData.forEach(item=> {
			this.itemsMap[item.id] = item;
		});
	},
	setGame: function(game){
		this.game = game;
	},
	getAppearance: function(id){
		return this.appearancesMap[id];
	},
	createItem: function(id, quantity){
		const def = this.itemsMap[id];
		const item = new Item();
		if (quantity !== undefined) {
			item.quantity = quantity;
		} else {
			item.quantity = 1;
		}
		if (def.damage){
			item.damage = new Stat(def.damage);
		}
		item.def = Object.assign({}, def);
		item.defid = def.id;
		item.sprite = this.getSpriteForItem(this.game, item);
		return item;
	},
	getDefinition: function(defid) {
		return Object.assign({}, this.itemsMap[defid]);
	},
	getSpriteForItem: function(game, item) {
		const { def } = item;
		const appearance = AppearanceFactory.getAppearance(def.appearance);
		const sprite = game.add.sprite(0, 0, appearance.tileset, appearance.i);
		sprite.visible = false;
		sprite.inputEnabled = true;
		sprite.events.onInputDown.add(() => { 
			if (game.input.activePointer.rightButton.isDown) {
				MobDescription.showItem(item); 
			}
		});
		return sprite;
	},
	// TODO: Move this somewhere else, the Door class has nothing to do with Item. Move the definitions too?
	createDoor: function(id, level){
		const def = this.itemsMap[id];
		const door = new Door();
		door.defid = id;
		door.def = Object.assign({}, def);
		door.open = false; // Closed by default
		door.sprite = this.getDoorSprite(this.game, door);
		door.level = level;
		return door;
	},
	getDoorSprite: function (game, door) {
		const appearance = AppearanceFactory.getAppearance(door.open ? door.def.openAppearance : door.def.closedAppearance);
		const sprite = game.add.sprite(0, 0, appearance.tileset, appearance.i);
		// door.sprite.visible = false; ???
		sprite.inputEnabled = true;
		sprite.events.onInputDown.add(() => { 
			if (game.input.activePointer.leftButton.isDown) {
				OAX6.PlayerStateMachine.openDoor(door);
			}
		});
		return sprite;
	}
};
module.exports = ItemFactory;