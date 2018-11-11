const Level = require('./Level.class');
const NPCFactory = require('./NPCFactory');
const MobFactory = require('./MobFactory');
const ItemFactory = require('./ItemFactory');

const LevelLoader = {
	loadLevel: function(game, mapId){
		const level = new Level();
		const tiledMap = this.loadTiledMap(game, mapId);
		const mobsData = tiledMap.mobs;
		const itemsData = tiledMap.items;

		level.setSolidMask(tiledMap.solidMask);
		mobsData.forEach((mobData) => this.loadMob(game, mobData, level));
		itemsData.forEach((itemData) => this.loadItem(game, itemData, level));
		
		return level;
	},
	loadTiledMap: function(game, mapId){
		var map = game.add.tilemap(mapId);
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
			mobs: this.loadTiledMapMobs(map),
			items: this.loadTiledMapItems(),
			solidMask: this.loadTiledMapSolidMask(map)
		};
	},
	loadTiledMapItems: function() {
		return [
			{
				id: 'fish',
				amount: 1,
				x: 15,
				y: 14
			},
      {
        id: 'ironBolt',
        amount: 8,
        x: 18,
        y: 15
      },
			{
				id: 'ironBolt',
				amount: 6,
				x: 16,
				y: 15
			},
      {
        id: 'ironBolt',
        amount: 1,
        x: 14,
        y: 15
      },
      {
        id: 'ironBolt',
        amount: 9,
        x: 12,
        y: 15
      }
		];
	},
	loadTiledMapMobs: function(map) {
		const w = map.width;
		const h = map.height;
		const mobData = [];
		for (let x = 0; x < w; x++) {
			for (let y = 0; y < h; y++) {
				const tile = map.getTile(x, y, 'Mobs');
				if (tile !== null) {
					console.log(tile.properties);
					const mobType = tile.properties.type || 'mob';
					const mobTypeId = tile.properties.id;
					mobData.push({
						type: mobType,
						id: mobTypeId,
						x: x,
						y: y
					});
				}
			}
		}
		return mobData;
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
		let mob = null;
		if (mobData.type === 'npc'){
			mob = NPCFactory.buildNPC(game, mobData.id, level, mobData.x, mobData.y, 0);
		} else {
			mob = MobFactory.buildMob(game, mobData.id, level, mobData.x, mobData.y, 0);
		}

		mob.sprite.inputEnabled = true;
		mob.sprite.events.onInputDown.add(() => { OAX6.runner.showMobInfo(mob); });

		level.addMob(mob);
	},
	loadItem: function(game, itemData, level) {
		const item = ItemFactory.createItem(itemData.id, itemData.amount);
		level.addItem(item, itemData.x, itemData.y);
	}
};

module.exports = LevelLoader;