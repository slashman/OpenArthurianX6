const Stat = require('./Stat.class');
const AppearanceFactory = require('./AppearanceFactory');

const ItemFactory = {
	init: function(itemData){
		this.itemsMap = [];
		this.itemData = itemData;
		itemData.forEach(item=>this.itemsMap[item.id] = item);
	},
	setGame: function(game){
		this.game = game;
	},
	getAppearance: function(id){
		return this.appearancesMap[id];
	},
	createItem: function(id){
		const def = this.itemsMap[id];
		const appearance = AppearanceFactory.getAppearance(def.appearance);
		const item = Object.assign({},def);
		if (item.damage){
			item.damage = new Stat(item.damage);
		}
		item.sprite = this.game.add.sprite(0, 0, appearance.tileset, appearance.i);
		item.sprite.visible = false;
		item.appearance = appearance;
		return item;
	}
};

module.exports = ItemFactory;