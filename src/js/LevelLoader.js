const Level = require('./Level.class');
const NPCFactory = require('./NPCFactory');
const MobFactory = require('./MobFactory');
const ItemFactory = require('./ItemFactory');

const LevelLoader = {
	init(game, maps) {
		this.__levels = {};
		this.__maps = {};
		maps.forEach(m => this.__maps[m.name] = m);
		this.game = game;
	},

	openLevel(mapId, player) {
		console.log(`Loading level ${mapId}`);
		const mapData = this.__maps[mapId];
		if (!mapData) {
			throw new Error(`Map ${mapId} not loaded`);
		}
		let level;
		if (this.__levels[mapId]) {
			level = this.loadLevel(mapData);
		} else {
			level = this.createLevel(mapData);
		}
		player.level = level;
		player.relocate(mapData.start.x, mapData.start.y);
		level.addMob(player);
		player.party.forEach(function(partyMember) {
			partyMember.level = level;
			partyMember.relocate(mapData.start.x, mapData.start.y);
			level.addMob(partyMember);
		});
	},

	createLevel: function(mapData){
		const level = new Level();
		const tiledMap = this.loadTiledMap(mapData.name);
		const mobsData = tiledMap.mobs;
		const itemsData = tiledMap.items;

		level.setSolidMask(tiledMap.solidMask);
		mobsData.forEach((mobData) => this.loadMob(mobData, level));
		itemsData.forEach((itemData) => this.loadItem(itemData, level));
		
		return level;
	},
	loadTiledMap: function(mapId){
		var map = this.game.add.tilemap(mapId);
		map.addTilesetImage('terrain', 'terrain');
		map.addTilesetImage('items', 'items');
		map.addTilesetImage('monsters', 'monsters');
		var terrainLayer = map.createLayer('Terrain', false, false, OAX6.UI.mapLayer);
		map.createLayer('Vegetation', false, false, OAX6.UI.mapLayer);
		map.createLayer('Buildings', false, false, OAX6.UI.mapLayer);
		map.createLayer('Objects', false, false, OAX6.UI.mapLayer);
		terrainLayer.resizeWorld();
		this.game.camera.deadzone = new Phaser.Rectangle(192, 144, 0, 0);
		return {
			mobs: this.loadTiledMapMobs(map),
			items: this.loadTiledMapItems(map),
			solidMask: this.loadTiledMapSolidMask(map)
		};
	},
	loadTiledMapItems: function(map) {
		const layerIndex = map.getLayerIndex('Items');
		if (layerIndex === null) {
			return [];
		}
		const w = map.width;
		const h = map.height;
		const data = [];
		for (let x = 0; x < w; x++) {
			for (let y = 0; y < h; y++) {
				const tile = map.getTile(x, y, 'Items');
				if (tile !== null) {
					const mobType = tile.properties.type || 'mob';
					const itemId = tile.properties.id;
					const amount = tile.properties.amount || 1;
					data.push({
						id: itemId,
						amount,
						x: x,
						y: y
					});
				}
			}
		}
		return data;
	},
	loadTiledMapMobs: function(map) {
		const layerIndex = map.getLayerIndex('Mobs');
		if (layerIndex === null) {
			return [];
		}
		const w = map.width;
		const h = map.height;
		const mobData = [];
		for (let x = 0; x < w; x++) {
			for (let y = 0; y < h; y++) {
				const tile = map.getTile(x, y, 'Mobs');
				if (tile !== null) {
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
	loadMob: function(mobData, level){
		let mob = null;
		if (mobData.type === 'npc'){
			mob = NPCFactory.buildNPC(this.game, mobData.id, level, mobData.x, mobData.y, 0);
		} else {
			mob = MobFactory.buildMob(this.game, mobData.id, level, mobData.x, mobData.y, 0);
		}

		mob.sprite.inputEnabled = true;
		mob.sprite.events.onInputDown.add(() => { OAX6.runner.showMobInfo(mob); });

		level.addMob(mob);
	},
	loadItem: function(itemData, level) {
		const item = ItemFactory.createItem(itemData.id, itemData.amount);
		level.addItem(item, itemData.x, itemData.y);
	}
};

module.exports = LevelLoader;