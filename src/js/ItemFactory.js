const Random = require('./Random');
const Stat = require('./Stat.class');

const ItemFactory = {
	init: function(itemData){
		this.itemsMap = [];
		this.itemData = itemData;
	},
	getAppearance: function(id){
		return this.appearancesMap[id];
	},
	getRandomWeapon: function(){
		const def = Random.from(this.itemData);
		const weapon = {
			defId: def.id,
			name: def.name,
			damage: new Stat(def.damage)
		};
		return weapon;
	}
};

module.exports = ItemFactory;