const Chunk = require('./Chunk.class');
const NPCFactory = require('./NPCFactory');
const MobFactory = require('./MobFactory');
const ItemFactory = require('./ItemFactory');
const ObjectFactory = require('./factories/ObjectFactory');

const MAX_TILE_LAYERS_PER_FLOOR = 10;

/**
 * This class loads a single "chunk" of the world from a tiled file + metadata
 */
const ChunkLoader = {
	init(game, maps) {
		this.__chunks = {};
		this.__maps = {};
		maps.forEach(m => {
			const mapId = `chunk_${m.x}-${m.y}`;
			this.__maps[mapId] = m;
		});
		this.game = game;
	},

	getChunk(chunkX, chunkY, world) {
		const mapId = `chunk_${chunkX}-${chunkY}`;
		if (this.__chunks[mapId]) {
			return this.__chunks[mapId]; // TODO: Verify this works
		} else {
			const mapData = this.__maps[mapId];
			if (!mapData) {
				throw new Error(`Map ${mapId} not loaded`);
			}
			console.log(`Loading chunk ${mapId}`);
			const chunkData =  this.createChunk(mapData, world);
			this.__chunks[mapId] = chunkData.chunk;
			chunkData.mobs.forEach(m => m.activate());
			return chunkData.chunk;
		}
	},

	createChunk: function(mapData, world){
		const chunk = new Chunk();
		const mapId = `chunk_${mapData.x}-${mapData.y}`;
		chunk.mapId = mapId;
		const tiledMap = this.loadTiledMap(mapId, mapData, world);
		const mobsData = tiledMap.mobs;
		const itemsData = tiledMap.items;
		const objectsData = tiledMap.objects;

		chunk.setSolidMasks(tiledMap.masks.solidMasks);
		chunk.setOpaqueMasks(tiledMap.masks.opaqueMasks);
		const mobs = mobsData.map((mobData) => this.loadMob(mobData, world));
		itemsData.forEach((itemData) => this.loadItem(itemData, chunk));
		if (objectsData) {
			objectsData.forEach((objectData) => {
				if (objectData.type == 'Door') {
					this.loadDoor(tiledMap.map, objectData, chunk);
				} else {
					this.loadObject(tiledMap.map, objectData, chunk);
				}
			});
		}
		return {
			chunk,
			mobs
		}
	},
	__getLayerPrefix(z) {
		return z == 0 ? '' : (z + 1) + ' - ';
	},
	/**
	 * Creates a Sprite with a texture representing a given layer of the map
	 */
	createMapLayerSprite(map, world, mapData, name, layerName, group) {
		var tile = null;
		var dx = 0;
		var dy = 0;
		var cls = true;
		map.layer = layerName;
		const tilesetStamps = [];
		const chunkPixelSize = world.chunkSize * map.tileWidth;
		this.tilesets.forEach(ts => {
			tilesetStamps[ts.name] = this.game.add.sprite(0, 0, ts.name);
		});
		const texture = this.game.add.renderTexture(chunkPixelSize, chunkPixelSize);
		for (var y = 0; y < world.chunkSize; y++) {
			for (var x = 0; x < world.chunkSize; x++) {
				tile = map.getTile(x, y);
				if (tile) {
					const tileIndex = tile.index;
					const tileset = this.tilesets.find(t => tileIndex >= t.firstgid && tileIndex < t.firstgid + t.total);
					const stamp = tilesetStamps[tileset.name];
					stamp.frame = tile.index - tileset.firstgid;
					texture.renderXY(stamp, dx, dy, cls);
					cls = false;
				}
				dx += map.tileWidth;
			}
			dx = 0;
			dy += map.tileHeight;
		}
		const sprite = this.game.add.sprite(mapData.x * chunkPixelSize, mapData.y * chunkPixelSize, texture, false, group);
		sprite.name = name;
	},
	loadTiledMap: function(mapId, mapData, world){
		var map = this.game.add.tilemap(mapId);
		this.tilesets = [];
		this.tilesets.push(map.addTilesetImage('terrain', 'terrain'));
		this.tilesets.push(map.addTilesetImage('items', 'items'));
		
		const objects = [];
		const mobs = [];
		const items = [];
		for (let z = 0; z < 3; z++) {
			const prefix = this.__getLayerPrefix(z);
			for (let i = 1; i <= MAX_TILE_LAYERS_PER_FLOOR; i++) {
				const layerName = prefix + 'Tiles ' + i;
				if (map.getLayerIndex(layerName) != null) {
					this.createMapLayerSprite(map, world, mapData, mapId + '-' + layerName, layerName, OAX6.UI.floorLayers[z].mapLayer);
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
					mob.x += mapData.x * world.chunkSize;
					mob.y += mapData.y * world.chunkSize;
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

		//this.game.camera.deadzone = new Phaser.Rectangle(this.game.width / 2 - 8, this.game.height / 2 - 8, 0, 0);
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
	loadMob: function(mobData, world){
		let mob = null;
		if (mobData.type === 'NPC'){
			mob = NPCFactory.buildNPC(this.game, mobData.npcId, world, mobData.x, mobData.y, mobData.z);
		} else {
			mob = MobFactory.buildMob(this.game, mobData.mobId, world, mobData.x, mobData.y, mobData.z);
		}
		world.addMob(mob);
		return mob;
	},
	loadItem: function(itemData, chunk) {
		const item = ItemFactory.createItem(itemData);
		chunk.addItem(item, itemData.x, itemData.y, itemData.z);
	},
	loadDoor: function(map, doorData, chunk) {
		const door = ItemFactory.createDoor(doorData.properties.doorTypeId, chunk);

		door.lock = doorData.properties.lockItemId;
		Object.assign(door, doorData.properties);

		chunk.addDoor(door, doorData.x / map.tileWidth, doorData.y / map.tileHeight - 1, doorData.z);
		chunk.setSolidAndOpaque(doorData.x / map.tileWidth, doorData.y / map.tileHeight - 1, doorData.z, true, true);
	},
	loadObject: function(map, objectData, chunk) {
		const object = ObjectFactory.createObject(objectData);
		chunk.addObject(object, objectData.x / map.tileWidth, objectData.y / map.tileHeight - 1, objectData.z);
	},
	/**
	 * Initializes the data for the different chunks from a savegame
	 */
	setChunksData: function (chunksData) {
		this.__chunks = chunksData;
	},
	restoreChunk: function (chunk) {
		const tiledMap = this.loadTiledMap(chunk.mapId, chunk); // TODO: Test
		chunk.setSolidMasks(tiledMap.masks.solidMasks);
		chunk.setOpaqueMasks(tiledMap.masks.opaqueMasks);
		chunk.doors.forEach((door) => {
			OAX6.UI.addItemSprite(door, door.x, door.y, door.z);
			OAX6.UI.floorLayers[door.z].objectsLayer.add(door.sprite); // Override group
			door.updateSolidAndOpaque();
		});
		chunk.objects.forEach(object => {
			OAX6.UI.locateEntitySpriteInWord(object, object.isFloor ? 'floorLayer' : 'objectsLayer');
		});
		chunk.activate();
	}
};

module.exports = ChunkLoader;