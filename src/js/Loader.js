const Loader = {
	load: function(game){
		const scenarioListener = game.load.onFileComplete.add(function(progress, cacheKey, success) {
			if (cacheKey === 'scenario' && success) {
				scenarioListener.detach();
				const scenarioInfo = game.cache.getJSON('scenario');
				scenarioInfo.maps.forEach(function(map){
					const mapId = `chunk_${map.x}-${map.y}`;
					game.load.tilemap(mapId, 'scenario/maps/'+map.filename, null, Phaser.Tilemap.TILED_JSON);
				});
			}
		});

		const assetsListener = game.load.onFileComplete.add(function(progress, cacheKey, success) {
			if (cacheKey === 'assets' && success) {
				assetsListener.detach();
				const assetsInfo = game.cache.getJSON('assets');
				assetsInfo.assets.forEach(function(asset) {
					switch (asset.type) {
						case 'image':
							game.load.image(asset.key, asset.url);
							break;
						case 'spritesheet':
							game.load.spritesheet(asset.key, asset.url, asset.width, asset.height);
							break;
						case 'bitmapFont':
							game.load.bitmapFont(asset.key, asset.textureUrl, asset.atlasUrl);
							break;
						case 'audio':
							game.load.audio(asset.key, asset.url);
							break;
					}
				});
			}
		});

		game.load.json('scenario', 'scenario/scenario.json');
		game.load.json('assets', 'scenario/assets.json');

		game.load.json('mobTypes', 'scenario/mobTypes.json');
		game.load.json('appearances', 'scenario/appearances.json');
		game.load.json('items', 'scenario/items.json');
		game.load.json('npcs', 'scenario/npcs.json');
		game.load.json('objectTypes', 'scenario/objectTypes.json');
	}
}

module.exports = Loader;