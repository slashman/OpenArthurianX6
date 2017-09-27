const Level = require('./Level.class')
const NPCFactory = require('./NPCFactory')
const ItemFactory = require('./ItemFactory')

const LevelLoader = {
	loadLevel: function(game){
		const level = new Level();
		const tiledMap = this.loadTiledMap(game);
		const mobsData = tiledMap.mobs;
		const itemsData = tiledMap.items;

		level.setSolidMask(tiledMap.solidMask);
		mobsData.forEach((mobData) => this.loadMob(game, mobData, level));
		itemsData.forEach((itemData) => this.loadItem(game, itemData, level));
		
		return level;
	},
	loadTiledMap: function(game){
		var map = game.add.tilemap('covetous3'); //TODO: Read from Scenario data
		map.addTilesetImage('terrain', 'terrain');
		map.addTilesetImage('items', 'items');
		map.addTilesetImage('monsters', 'monsters');
		var terrainLayer = map.createLayer('Terrain', false, false, OAX6.UI.mapLayer);
		map.createLayer('Vegetation', false, false, OAX6.UI.mapLayer);
		map.createLayer('Buildings', false, false, OAX6.UI.mapLayer);
		map.createLayer('Objects', false, false, OAX6.UI.mapLayer);
		terrainLayer.resizeWorld();
		game.camera.deadzone = new Phaser.Rectangle(192, 144, 0, 0);

		return {
			mobs: this.loadTiledMapMobs(),
			items: this.loadTiledMapItems(),
			solidMask: this.loadTiledMapSolidMask(map)
		}
	},
	loadTiledMapItems: function() {
		return [
			{
				id: 'fish',
				amount: 1,
				x: 10,
				y: 14
			}
		];
	},
	loadTiledMapMobs: function() {
		return [
				{
					type: 'npc',
					id: 'iolo',
					x: 10,
					y: 4
				},
				{
					type: 'npc',
					id: 'shamino',
					x: 13,
					y: 6
				},
				{
					type: 'npc',
					id: 'shamuru',
					x: 7,
					y: 10
				}
			]
	},
	loadTiledMapSolidMask: function(map) {
		let w = map.width,
			h = map.height,
			solidMask = [];

		for (let x=0;x<w;x++) {
			solidMask[x] = [];
			for (let y=0;y<h;y++) {
				solidMask[x][y] = map.hasTile(x, y, "SolidTiles");
			}
		}

		return solidMask;
	},
	loadMob: function(game, mobData, level){
		const mob = NPCFactory.buildNPC(game, mobData.id, level, mobData.x, mobData.y, 0);
		level.addMob(mob);
	},
	loadItem: function(game, itemData, level) {
		const item = ItemFactory.createItem(itemData.id);
		level.addItem(item, itemData.x, itemData.y);
		console.log(item);
	}
}

module.exports = LevelLoader;