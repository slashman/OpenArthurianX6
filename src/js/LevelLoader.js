const Level = require('./Level.class');
const NPCFactory = require('./NPCFactory');
const MobFactory = require('./MobFactory');
const ItemFactory = require('./ItemFactory');
const PlayerStateMachine = require('./PlayerStateMachine');
const Inventory = require('./Inventory');
const MobDescription = require('./MobDescription');

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
			level = this.__levels[mapId]; // TODO: Verify this works
		} else {
			level = this.createLevel(mapData);
		}
		player.level = level;
		player.relocate(mapData.start.x, mapData.start.y); // Might need to store last player location on level, or gateway based on current level
		level.addMob(player);
		player.party.forEach(function(partyMember) {
			partyMember.level = level;
			partyMember.relocate(mapData.start.x, mapData.start.y);
			level.addMob(partyMember);
		});
		level.activateAll();
	},

	createLevel: function(mapData){
		const level = new Level();
		level.mapId = mapData.name;
		const tiledMap = this.loadTiledMap(mapData.name);
		const mobsData = tiledMap.mobs;
		const itemsData = tiledMap.items;
		const doorsData = tiledMap.doors;

		level.setSolidMask(tiledMap.masks.solidMask);
		level.setOpaqueMask(tiledMap.masks.opaqueMask);
		mobsData.forEach((mobData) => this.loadMob(mobData, level));
		itemsData.forEach((itemData) => this.loadItem(itemData, level));
		if (doorsData) {
			doorsData.forEach((doorData) => this.loadDoor(tiledMap.map, doorData, level));
		}
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
		//map.createLayer('Doors', false, false, OAX6.UI.doorsLayer);
		terrainLayer.resizeWorld();
		this.game.camera.deadzone = new Phaser.Rectangle(400 / 2 - 8, 300 / 2 - 8, 0, 0);
		return {
			map: map,
			mobs: this.loadTiledMapMobs(map),
			items: this.loadTiledMapItems(map, 'Items'),
			doors: map.objects.Doors,
			masks: this.loadTiledMasks(map)
		};
	},
	loadTiledMapItems: function(map, layerId) {
		const layerIndex = map.getLayerIndex(layerId);
		if (layerIndex === null) {
			return [];
		}
		const w = map.width;
		const h = map.height;
		const data = [];
		for (let x = 0; x < w; x++) {
			for (let y = 0; y < h; y++) {
				const tile = map.getTile(x, y, layerId);
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
	loadTiledMasks: function(map) {
		let w = map.width,
			h = map.height,
			solidMask = [],
			opaqueMask = [];

		for (let x=0;x<w;x++) {
			solidMask[x] = [];
			opaqueMask[x] = [];
			for (let y=0;y<h;y++) {
				solidMask[x][y] = map.hasTile(x, y, "SolidTiles");
				opaqueMask[x][y] = map.hasTile(x, y, "OpaqueTiles");
			}
		}

		return { solidMask, opaqueMask };
	},
	loadMob: function(mobData, level){
		let mob = null;
		if (mobData.type === 'npc'){
			mob = NPCFactory.buildNPC(this.game, mobData.id, level, mobData.x, mobData.y, 0);
		} else {
			mob = MobFactory.buildMob(this.game, mobData.id, level, mobData.x, mobData.y, 0);
		}
		level.addMob(mob);
	},
	loadItem: function(itemData, level) {
		const item = ItemFactory.createItem(itemData.id, itemData.amount);
		level.addItem(item, itemData.x, itemData.y);
	},
	loadDoor: function(map, doorData, level) {
		const door = ItemFactory.createDoor(doorData.properties.id, level);

		door.lock = doorData.properties.lock;

		level.addDoor(door, doorData.x / map.tileWidth, doorData.y / map.tileHeight - 1);
		level.setSolid(doorData.x / map.tileWidth, doorData.y / map.tileHeight - 1, true);
	},
	/**
	 * Initializes the data for the different levels from a savegame
	 */
	setLevelsData: function (levelData) {
		this.__levels = levelData;
	},
	restoreLevel: function (level) {
		const tiledMap = this.loadTiledMap(level.mapId, level);
		level.setSolidMask(tiledMap.masks.solidMask);
		level.setOpaqueMask(tiledMap.masks.opaqueMask);
		level.doors.forEach((door) => {
			OAX6.UI.addItemSprite(door, door.x, door.y);
			OAX6.UI.doorsLayer.add(door.sprite); // Override group
			level.setSolid(door.x, door.y, true);
		});
		level.activate();
		level.activateAll();
	}
};

module.exports = LevelLoader;