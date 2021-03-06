const scenarioInfo = require('./ScenarioInfo');

const Loader = {
	load: function(game){
		scenarioInfo.maps.forEach(function(map){
			// TODO: Load on the fly! else the entire chunk model doesn't make sense.
			const mapId = `chunk_${map.x}-${map.y}`;
			game.load.tilemap(mapId, 'scenario/maps/'+map.filename, null, Phaser.Tilemap.TILED_JSON);
		});
		// TODO: Load the tileset based on the content packs related to the scenario
		game.load.image('monsters', 'assets/monsters.png');
		game.load.image('terrain', 'assets/terrain.png');
		game.load.image('dialogBack', 'assets/dialogBack.png')
		game.load.image('title', 'assets/title.png')
		game.load.image('bookBack', 'assets/tempBook.png')
		game.load.image('messageBack', 'assets/messageBack.png')
		game.load.image('inventory', 'assets/inventory.png')
		game.load.image('uiVariants', 'assets/uiVariants_8x8.png')
		game.load.image('mobDescription', 'assets/mobDescription.png')
		game.load.image('blank', 'assets/blank.png')
		game.load.image('white', 'assets/white.png')

		game.load.spritesheet('player', 'assets/player.png', 16, 16);
		game.load.spritesheet('mobs', 'assets/mobs.png', 16, 16);
		game.load.spritesheet('items', 'assets/items.png', 16, 16);
		game.load.spritesheet('terrain', 'assets/terrain.png', 16, 16);

		game.load.spritesheet('celestialBodies', 'assets/celestialBodies.png', 32, 32);
		game.load.spritesheet('skies', 'assets/skies.png', 96, 42);

		game.load.spritesheet('ui', 'assets/ui.png', 16, 16);

		game.load.spritesheet('portraits', 'assets/portraits.png', 20, 20);

		game.load.bitmapFont('pixeled', 'assets/font.png', 'assets/font.fnt');

		game.load.image('containerMedium', 'assets/containerMedium.png');
		game.load.image('mobContainer', 'assets/mobContainer.png');
		game.load.image('backpackContainer', 'assets/backpack_test.png');

		game.load.image('gravestone', 'assets/gravestone.png');
		

		game.load.bitmapFont('grayFont', 'assets/grayFont.png', 'assets/font.fnt');
		game.load.bitmapFont('dark', 'assets/darkFont.png', 'assets/font.fnt');

		// game.load.audio('notes-piano', ['assets/keys.mp3']);
		game.load.audio('notes-lute', ['assets/lute.ogg']);
		game.load.audio('notes-harpsichord', ['assets/harpsichord.ogg']);
	}
}

module.exports = Loader;