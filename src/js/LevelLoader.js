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

		level.setSolidMasks(tiledMap.masks.solidMasks);
		level.setOpaqueMasks(tiledMap.masks.opaqueMasks);
		mobsData.forEach((mobData) => this.loadMob(mobData, level));
		itemsData.forEach((itemData) => this.loadItem(itemData, level));
		if (doorsData) {
			doorsData.forEach((doorData) => this.loadDoor(tiledMap.map, doorData, level));
		}
		return level;
	},
	__getLayerPrefix(z) {
		return z == 0 ? '' : (z + 1) + ' - ';
	},
	loadTiledMap: function(mapId){
		var map = this.game.add.tilemap(mapId);
		map.addTilesetImage('terrain', 'terrain');
		map.addTilesetImage('items', 'items');
		map.addTilesetImage('monsters', 'monsters');
		function createLayerIfExists(layerName, group) {
			if (map.getLayerIndex(layerName) != null) {
				return map.createLayer(layerName, false, false, group);
			}
		}
		let aTerrainLayer;
		const allDoors = [];
		for (let z = 0; z < 3; z++) {
			const prefix = this.__getLayerPrefix(z);
			const terrainLayer = createLayerIfExists(prefix + 'Terrain', OAX6.UI.floorLayers[z].mapLayer); // TODO: Are we keeping the previous layer when we transition to a new map?
			if (z == 0) {
				aTerrainLayer = terrainLayer;
			}
			createLayerIfExists(prefix + 'Vegetation', OAX6.UI.floorLayers[z].mapLayer);
			createLayerIfExists(prefix + 'Buildings', OAX6.UI.floorLayers[z].mapLayer);
			createLayerIfExists(prefix + 'Objects', OAX6.UI.floorLayers[z].mapLayer);
			if (map.objects[prefix + 'Doors']) {
				map.objects[prefix + 'Doors'].forEach(door => {
					door.z = z;
					allDoors.push(door);
				});
			}
		}

		aTerrainLayer.resizeWorld();
		this.game.camera.deadzone = new Phaser.Rectangle(400 / 2 - 8, 300 / 2 - 8, 0, 0);
		return {
			map: map,
			mobs: this.loadTiledMapMobs(map),
			items: this.loadTiledMapItems(map),
			doors: allDoors,
			masks: this.loadTiledMasks(map)
		};
	},
	loadTiledMapItems: function(map) {
		const w = map.width;
		const h = map.height;
		const data = [];
		for (let z = 0; z < 3; z++) {
			const layerId = this.__getLayerPrefix(z) + 'Items';
			const layerIndex = map.getLayerIndex(layerId);
			if (layerIndex === null) {
				continue;
			}
			for (let x = 0; x < w; x++) {
				for (let y = 0; y < h; y++) {
					const tile = map.getTile(x, y, layerId);
					if (tile !== null) {
						const itemId = tile.properties.id;
						const amount = tile.properties.amount || 1;
						data.push({
							id: itemId,
							amount,
							x: x,
							y: y,
							z: z
						});
					}
				}
			}
		}
		return data;
	},
	loadTiledMapMobs: function(map) {
		const w = map.width;
		const h = map.height;
		const mobData = [];

		for (let z = 0; z < 3; z++) {
			const layerId = this.__getLayerPrefix(z) + 'Mobs';
			const layerIndex = map.getLayerIndex(layerId);
			if (layerIndex === null) {
				continue;
			}
			for (let x = 0; x < w; x++) {
				for (let y = 0; y < h; y++) {
					const tile = map.getTile(x, y, layerId);
					if (tile !== null) {
						const mobType = tile.properties.type || 'mob';
						const mobTypeId = tile.properties.id;
						mobData.push({
							type: mobType,
							id: mobTypeId,
							x: x,
							y: y,
							z: z
						});
					}
				}
			}
		}
		return mobData;
	},
	loadTiledMasks: function(map) {
		let w = map.width,
			h = map.height,
			solidMasks = [],
			opaqueMasks = [];

		for (let z = 0; z < 3; z++) {
			const solidLayerId = this.__getLayerPrefix(z) + 'SolidTiles';
			const opaqueLayerId = this.__getLayerPrefix(z) + 'OpaqueTiles';
			if (map.getLayerIndex(solidLayerId) == null) {
				continue;
			}
			const solidMask = [];
			const opaqueMask = [];
			solidMasks[z] = solidMask;
			opaqueMasks[z] = opaqueMask;

			for (let x = 0; x < w; x++) {
				solidMask[x] = [];
				opaqueMask[x] = [];
				for (let y = 0; y < h; y++) {
					solidMask[x][y] = map.hasTile(x, y, solidLayerId);
					opaqueMask[x][y] = map.hasTile(x, y, opaqueLayerId);
				}
			}
		}

		return { solidMasks, opaqueMasks };
	},
	loadMob: function(mobData, level){
		let mob = null;
		if (mobData.type === 'npc'){
			mob = NPCFactory.buildNPC(this.game, mobData.id, level, mobData.x, mobData.y, mobData.z);
		} else {
			mob = MobFactory.buildMob(this.game, mobData.id, level, mobData.x, mobData.y, mobData.z);
		}
		level.addMob(mob);
	},
	loadItem: function(itemData, level) {
		const item = ItemFactory.createItem(itemData.id, itemData.amount);
		level.addItem(item, itemData.x, itemData.y, itemData.z);
	},
	loadDoor: function(map, doorData, level) {
		const door = ItemFactory.createDoor(doorData.properties.id, level);

		door.lock = doorData.properties.lock;

		level.addDoor(door, doorData.x / map.tileWidth, doorData.y / map.tileHeight - 1, doorData.z);
		level.setSolidAndOpaque(doorData.x / map.tileWidth, doorData.y / map.tileHeight - 1, doorData.z, true);
	},
	/**
	 * Initializes the data for the different levels from a savegame
	 */
	setLevelsData: function (levelData) {
		this.__levels = levelData;
	},
	restoreLevel: function (level) {
		const tiledMap = this.loadTiledMap(level.mapId, level);
		level.setSolidMasks(tiledMap.masks.solidMasks);
		level.setOpaqueMasks(tiledMap.masks.opaqueMasks);
		level.doors.forEach((door) => {
			OAX6.UI.addItemSprite(door, door.x, door.y, door.z);
			OAX6.UI.floorLayers[door.z].doorsLayer.add(door.sprite); // Override group
			door.updateSolidAndOpaque();
		});
		level.activate();
		level.activateAll();
	}
};

module.exports = LevelLoader;