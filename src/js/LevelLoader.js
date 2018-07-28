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
			mobs: this.loadTiledMapMobs(),
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
	loadTiledMapMobs: function() {
		return [ 
				/*{
					type: 'mob',
					id: 'demon',
					x: 10,
					y: 4
				},
				{
					type: 'mob',
					id: 'demon',
					x: 13,
					y: 6
				},
				{
					type: 'mob',
					id: 'demon',
					x: 10,
					y: 6
				},
				{
					type: 'mob',
					id: 'demon',
					x: 13,
					y: 7
				},
				{
					type: 'mob',
					id: 'demon',
					x: 11,
					y: 6
				},
				{
					type: 'mob',
					id: 'demon',
					x: 13,
					y: 8
				}/*/,
				{
					type: 'npc',
					id: 'kram',
					x: 7,
					y: 10
				}/**/
			];
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
			mob.alignment = 'a';
		}
		level.addMob(mob);
	},
	loadItem: function(game, itemData, level) {
		const item = ItemFactory.createItem(itemData.id, itemData.amount);
		level.addItem(item, itemData.x, itemData.y);
	}
};

module.exports = LevelLoader;