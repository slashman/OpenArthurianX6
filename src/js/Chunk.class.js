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
		item.container = this;
		item.isOnFloor = true;
		item.chunkX = x;
		item.chunkY = y;
		item.chunkZ = z;
		if (item.def.solid) {
			this.setSolidAndOpaque(x, y, z, true, false);
		}
		this.items.push(item);
	},
	returnItem (item) {
		this.items.push(item);
	},
	addDoor: function(door, x, y, z) {
		door.chunkX = x;
		door.chunkY = y;
		door.chunkZ = z;
		this.doors.push(door);
	},
	addObject: function(object, x, y, z) {
		object.chunkX = x;
		object.chunkY = y;
		object.chunkZ = z;
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
			this.setSolidAndOpaque(item.chunkX, item.chunkY, item.chunkZ, false, false);
		}
		this.items.splice(this.items.indexOf(item), 1);
		OAX6.UI.removeItemSprite(item);
	},
	getItemAt: function(x, y, z) {
		for (var i=0,item; item=this.items[i]; i++) {
			if (item.chunkX == x && item.chunkY == y && item.chunkZ == z) {
				return item;
			}
		}

		return null;
	},
	getDoorAt: function(x, y, z) {
		for (var i = 0, door; door = this.doors[i]; i++) {
			if (door.chunkX == x && door.chunkY== y && door.chunkZ == z) {
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
		this.items.forEach(item => OAX6.UI.addItemSprite(item, item.x, item.y, item.z)); // Using .x instead of .chunkX, since .addItemSprite works with world coord
		this.doors.forEach(door => {
			OAX6.UI.addItemSprite(door, door.x, door.y, door.z);
			OAX6.UI.floorLayers[z].objectsLayer.add(door.sprite); // Override group
		});
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
	},

	findLongPath: function(to, from, z, blockedPositions){
		const gridClone = this._getGridWithPositionsBlocked(z, blockedPositions);
		this.doors.forEach(door => {
			if (door.z != z) {
				return;
			}
			if (door.def.fixed) {
				return;
			}
			if (!door.isLocked()) {
				gridClone.setWalkableAt(door.chunkX, door.chunkY, true);
			}
		});
		// Prevent walking thru stairs
		this.objects.filter(o => o.z === z && o.type == 'Stairs').forEach(stairs => gridClone.setWalkableAt(stairs.chunkX, stairs.chunkY, false));
		return this.findPath(from, to, z, gridClone, true)
	},

	findPath(from, to, z, grid, openEnded) {
		if (from.x === to.x && from.y === to.y) {
			return {dx:0, dy:0};
		}
		if (!grid) {
			grid = this.pfGrids[z].clone();
		}
		if (openEnded) {
			grid.setWalkableAt(from.x, from.y, true);
			grid.setWalkableAt(to.x, to.y, true);
		}
		//TODO: Single finder object?
		const finder = new PF.AStarFinder({
		    allowDiagonal: true,
    		dontCrossCorners: false,
			diagonalMovement: PF.DiagonalMovement.Always
		});
		const path = finder.findPath(from.x, from.y, to.x, to.y, grid);
		if (path.length == 0){
			return {dx:0, dy:0};
		}
		return {
			dx: Math.sign(path[1][0]-from.x),
			dy: Math.sign(path[1][1]-from.y)
		};
	},

	_getGridWithPositionsBlocked(z, blockedPositions) {
		const gridClone = this.pfGrids[z].clone();
		blockedPositions.forEach(position => {
			gridClone.setWalkableAt(position.x, position.y, false);
		});
		return gridClone;
	},
};

module.exports = Chunk;