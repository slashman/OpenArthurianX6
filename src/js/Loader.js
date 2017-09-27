const scenarioInfo = require('./ScenarioInfo');

const Loader = {
	load: function(game){
		scenarioInfo.maps.forEach(function(map){
			game.load.tilemap(map.name, 'scenario/maps/'+map.filename, null, Phaser.Tilemap.TILED_JSON);
		});
		// TODO: Load the tileset based on the content packs related to the scenario
		game.load.image('monsters', 'assets/monsters.png');
		game.load.image('terrain', 'assets/terrain.png');
		game.load.image('dialogBack', 'assets/dialogBack.png')

		game.load.spritesheet('player', 'assets/player.png', 16, 16);
		game.load.spritesheet('mobs', 'assets/mobs.png', 16, 16);
		game.load.spritesheet('items', 'assets/items.png', 16, 16);

		game.load.spritesheet('ui', 'assets/ui.png', 16, 16);

		game.load.bitmapFont('pixeled', 'assets/font.png', 'assets/font.fnt');
	}
}

module.exports = Loader;