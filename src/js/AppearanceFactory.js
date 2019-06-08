const circular = require('circular-functions');

const AppearanceFactory = {
	init: function(appearancesData){
		this.appearancesMap = [];
		appearancesData.forEach(this.loadTileset.bind(this));
	},
	loadTileset: function(tilesetData){
		if (tilesetData.mobs) for (var mobsData of tilesetData.mobs){
			this.appearancesMap[mobsData.id] = Object.assign({tileset: tilesetData.tileset}, mobsData);
			this.appearancesMap[mobsData.id]._c = circular.setSafe();
		}
		if (tilesetData.items) for (var itemsData of tilesetData.items){
			this.appearancesMap[itemsData.id] = Object.assign({tileset: tilesetData.tileset}, itemsData);
			this.appearancesMap[itemsData.id]._c = circular.setSafe();
		}
	},
	getAppearance: function(id){
		return this.appearancesMap[id];
	}
}

module.exports = AppearanceFactory;