const AppearanceFactory = {
	init: function(appearancesData){
		this.appearancesMap = [];
		appearancesData.forEach(this.loadTileset.bind(this));
	},
	loadTileset: function(tilesetData){
		for (var mobsData of tilesetData.mobs){
			this.appearancesMap[mobsData.id] = Object.assign({tileset: tilesetData.tileset}, mobsData);
		}
	},
	getAppearance: function(id){
		return this.appearancesMap[id];
	}
}

module.exports = AppearanceFactory;