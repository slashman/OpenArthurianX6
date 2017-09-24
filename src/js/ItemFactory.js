const Random = require('./Random');

const ItemFactory = {
	init: function(itemData){
		this.itemsMap = [];
		this.itemData = itemData;
	},
	getAppearance: function(id){
		return this.appearancesMap[id];
	},
	getRandomWeapon: function(){
		return Random.from(this.itemData);
	}
}

module.exports = ItemFactory;