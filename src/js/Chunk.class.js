const circular = require('circular-functions');
const PF = require('pathfinding');

function Chunk(){
	this.items = [];
	this.doors = []; // TODO: Merge with objects?
	this.objects = [];
	this.objectsMap = [];
	this.solidMasks = null;
	this.opaqueMasks = null;
	this.pfGrids = [];
	this.currentTurnCounter = 0;
	this.isChunkContainer = true;
	this._c = circular.register('Chunk');
}

circular.registerClass('Chunk', Chunk, {
	transients: {
		solidMasks: true,
		opaqueMasks: true,
		pfGrids: true
	}
});

Chunk.prototype = {
	isSolid: function(x, y, z){
		if (this.solidMasks[z][x][y]) {
			return true;
		}
		return false;
	},
	isOpaque: function(x, y, z){
		return this.opaqueMasks[z][x][y];
	},
	setSolidAndOpaque: function(x, y, z, solid, opaque) {
		this.solidMasks[z][x][y] = solid;
		this.opaqueMasks[z][x][y] = opaque;
		this.updatePathfindingGrid(z);
	},
	_transpose: function(m) {
		return m[0].map((x,i) => m.map(x => x[i]));
	},
	setOpaqueMasks: function(opaqueMasks) {
		this.opaqueMasks = opaqueMasks;
	},
	setSolidMasks: function(solidMasks) {
		this.solidMasks = solidMasks;
		solidMasks.forEach((solidMask, z) => {
			this.updatePathfindingGrid(z);
		})
		
	},
	
	addItem: function(item, x, y, z) {
		OAX6.UI.addItemSprite(item, x, y, z);
		item.container = this;
		item.isOnFloor = true;
		item.x = x;
		item.y = y;
		item.z = z;
		if (item.def.solid) {
			this.setSolidAndOpaque(x, y, z, true, false);
		}
		this.items.push(item);
	},
	returnItem (item) {
		OAX6.UI.addItemSprite(item, item.x, item.y, item.z);
		this.items.push(item);
	},
	addDoor: function(door, x, y, z) {
		OAX6.UI.addItemSprite(door, x, y, z);
		OAX6.UI.floorLayers[z].objectsLayer.add(door.sprite); // Override group
		this.doors.push(door);
	},
	addObject: function(object, x, y, z) {
		object.x = x;
		object.y = y;
		object.z = z;
		OAX6.UI.locateEntitySpriteInWord(object, object.isFloor ? 'floorLayer' : 'objectsLayer');
		this.objects.push(object);
		if (!this.objectsMap[z]) {
			this.objectsMap[z] = [];
		}
		if (!this.objectsMap[z][x]) {
			this.objectsMap[z][x] = [];
		}
		this.objectsMap[z][x][y] = object;
	},
	removeItem: function(item) {
		if (item.def.solid) {
			this.setSolidAndOpaque(item.x, item.y, item.z, false, false);
		}
		this.items.splice(this.items.indexOf(item), 1);
		OAX6.UI.removeItemSprite(item);
	},
	getItemAt: function(x, y, z) {
		for (var i=0,item; item=this.items[i]; i++) {
			if (item.x == x && item.y == y && item.z == z) {
				return item;
			}
		}

		return null;
	},
	getDoorAt: function(x, y, z) {
		for (var i = 0, door; door = this.doors[i]; i++) {
			if (door.x == x && door.y == y && door.z == z) {
				return door;
			}
		}

		return null;
	},
	getDoorById(doorId) {
		return this.doors.find(d => d.doorId == doorId);
	},
	getObjectAt: function(x, y, z) {
		if (!this.objectsMap[z]) {
			return undefined;
		}
		if (!this.objectsMap[z][x]) {
			return undefined;
		}
		return this.objectsMap[z][x][y];
	},
	// Readies the chunk for the player to use it
	activate() {
		this.setSolidMasks(this.solidMasks); // Initializes the pfGrids
		this.items.forEach(item => OAX6.UI.addItemSprite(item, item.x, item.y, item.z));
	},
	destroy() {
		this.destroyed = true;
		this.items = null;
		this.doors = null;
		this.objects = null;
		this.objectsMap = null;
		this.solidMasks = null;
		this.opaqueMasks = null;
		this.pfGrids = null;
		this.currentTurnCounter = 0;
	},
	/**
	 * Should by called anytime a "solid" tile changes status
	 */
	updatePathfindingGrid(z) {
		const solidMask = this.solidMasks[z];
		const pfMask = this._transpose(solidMask).map(a=>a.map(c=>c===true?1:0));
		this.pfGrids[z]= new PF.Grid(pfMask);
	}
};

module.exports = Chunk;