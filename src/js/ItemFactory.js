const circular = require('circular-functions');

const Stat = require('./Stat.class');
const AppearanceFactory = require('./AppearanceFactory');
const Item = require('./Item.class');
const Door = require('./Door.class');

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
		const appearance = AppearanceFactory.getAppearance(def.appearance);
		item.sprite = this.game.add.sprite(0, 0, appearance.tileset, appearance.i);
		item.sprite.visible = false;
		item.def.appearance = appearance;
		if (def.flyAppearance) {
			item.def.flyAppearance = AppearanceFactory.getAppearance(def.flyAppearance);
		}
		return item;
	},
	// TODO: Move this somewhere else, the Door class has nothing to do with Item. Move the definitions too?
	createDoor: function(id, level){
		const def = this.itemsMap[id];
		const door = new Door();
		door.def = Object.assign({}, def);
		const openAppearance = AppearanceFactory.getAppearance(def.openAppearance);
		const closedAppearance = AppearanceFactory.getAppearance(def.closedAppearance);
		door.def.openAppearance = openAppearance;
		door.def.closedAppearance = closedAppearance;
		door.sprite = this.game.add.sprite(0, 0, openAppearance.tileset, closedAppearance.i);
		door.sprite.visible = false;
		door.level = level;
		door.open = false; // Closed by default
		return door;
	}
};
module.exports = ItemFactory;