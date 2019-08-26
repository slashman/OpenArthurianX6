const Level = require('./Level.class');
const NPCFactory = require('./NPCFactory');
const MobFactory = require('./MobFactory');
const ItemFactory = require('./ItemFactory');
const ObjectFactory = require('./factories/ObjectFactory');
const PlayerStateMachine = require('./PlayerStateMachine');
const Inventory = require('./Inventory');
const MobDescription = require('./MobDescription');

const MAX_TILE_LAYERS_PER_FLOOR = 10;

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
		const objectsData = tiledMap.objects;

		level.setSolidMasks(tiledMap.masks.solidMasks);
		level.setOpaqueMasks(tiledMap.masks.opaqueMasks);
		mobsData.forEach((mobData) => this.loadMob(mobData, level));
		itemsData.forEach((itemData) => this.loadItem(itemData, level));
		if (objectsData) {
			objectsData.forEach((objectData) => {
				if (objectData.type == 'Door') {
					this.loadDoor(tiledMap.map, objectData, level);
				} else {
					this.loadObject(tiledMap.map, objectData, level);
				}
			});
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
		function createLayerIfExists(layerName, group) {
			if (map.getLayerIndex(layerName) != null) {
				return map.createLayer(layerName, false, false, group);
			}
		}
		let aTerrainLayer;
		const objects = [];
		const mobs = [];
		const items = [];
		for (let z = 0; z < 3; z++) {
			const prefix = this.__getLayerPrefix(z);
			for (let i = 1; i <= MAX_TILE_LAYERS_PER_FLOOR; i++) {
				const layer = createLayerIfExists(prefix + 'Tiles ' + i, OAX6.UI.floorLayers[z].mapLayer); // TODO: Are we keeping the previous layers when we transition to a new map? Remove them!
				if (z == 0 && i == 1) {
					aTerrainLayer = layer;
				}
			}
			if (map.objects[prefix + 'Objects']) {
				map.objects[prefix + 'Objects'].forEach(object => {
					object.z = z;
					objects.push(object);
				});
			}
			if (map.objects[prefix + 'Mobs']) {
				map.objects[prefix + 'Mobs'].forEach(mob => {
					mob.z = z;
					this.__processTiledObject(map, mob);
					mobs.push(mob);
				});
			}
			if (map.objects[prefix + 'Items']) {
				map.objects[prefix + 'Items'].forEach(item => {
					item.z = z;
					this.__processTiledObject(map, item);
					items.push(item);
				});
			}
		}

		aTerrainLayer.resizeWorld();
		this.game.camera.deadzone = new Phaser.Rectangle(this.game.width / 2 - 8, this.game.height / 2 - 8, 0, 0);
		this.game.camera.bounds = null;
		return {
			map,
			mobs,
			items,
			objects,
			masks: this.loadTiledMasks(map)
		};
	},
	__processTiledObject(map, _object) {
		Object.assign(_object, _object.properties);
		_object.x = _object.x / map.tileWidth;
		_object.y = _object.y / map.tileHeight - 1;
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
		if (mobData.type === 'NPC'){
			mob = NPCFactory.buildNPC(this.game, mobData.npcId, level, mobData.x, mobData.y, mobData.z);
		} else {
			mob = MobFactory.buildMob(this.game, mobData.mobId, level, mobData.x, mobData.y, mobData.z);
		}
		level.addMob(mob);
	},
	loadItem: function(itemData, level) {
		const item = ItemFactory.createItem(itemData.itemId, itemData.amount);
		level.addItem(item, itemData.x, itemData.y, itemData.z);
	},
	loadDoor: function(map, doorData, level) {
		const door = ItemFactory.createDoor(doorData.properties.doorTypeId, level);

		door.lock = doorData.properties.lockItemId;
		Object.assign(door, doorData.properties);

		level.addDoor(door, doorData.x / map.tileWidth, doorData.y / map.tileHeight - 1, doorData.z);
		level.setSolidAndOpaque(doorData.x / map.tileWidth, doorData.y / map.tileHeight - 1, doorData.z, true);
	},
	loadObject: function(map, objectData, level) {
		const object = ObjectFactory.createObject(objectData);
		level.addObject(object, objectData.x / map.tileWidth, objectData.y / map.tileHeight - 1, objectData.z);
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
			OAX6.UI.floorLayers[door.z].objectsLayer.add(door.sprite); // Override group
			door.updateSolidAndOpaque();
		});
		level.objects.forEach(object => {
			OAX6.UI.locateEntitySpriteInWord(object, object.isFloor ? 'floorLayer' : 'objectsLayer');
		});
		level.activate();
		level.activateAll();
	}
};

module.exports = LevelLoader;