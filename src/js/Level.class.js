const circular = require('circular-functions');

const Geo = require('./Geo');
const log = require('./Debug').log;
const Timer = require('./Timer');
const PF = require('pathfinding');
const Line = require('./Line');
const PlayerStateMachine = require('./PlayerStateMachine');
const Constants = require('./Constants');

const COMBAT_DISTANCE = 10;

function Level(){
	this.mobs = [];	
	this.items = [];
	this.doors = [];
	this.solidMasks = null;
	this.opaqueMasks = null;
	this.pfGrids = [];
	this.currentTurnCounter = 0;
	this._c = circular.register('Level');
}

circular.registerClass('Level', Level, {
	transients: {
		solidMasks: true,
		opaqueMasks: true,
		pfGrids: true
	}
});


Level.prototype = {
	isSolid: function(x, y, z){
		if (this.solidMasks[z][x][y]) {
			return true;
		}
		return false;
	},
	isOpaque: function(x, y, z){
		return this.opaqueMasks[z][x][y];
	},
	setSolidAndOpaque: function(x, y, z, solid) {
		this.solidMasks[z][x][y] = solid;
		this.opaqueMasks[z][x][y] = solid;
	},
	getMobAt: function(x, y, z){
		// TODO: Replace for this.mobs.find
		for (var i=0,mob;mob=this.mobs[i];i++) {
			if (mob.x == x && mob.y == y && mob.z == z) {
				return this.mobs[i];
			}
		}
		return false;
	},
	_transpose: function(m) {
		return m[0].map((x,i) => m.map(x => x[i]));
	},
	setOpaqueMasks: function(opaqueMasks) {
		this.opaqueMasks = opaqueMasks;
	},
	setSolidMasks: function(solidMasks) {
		this.solidMasks = solidMasks;
		solidMasks.forEach((solidMask, i) => {
			const pfMask = this._transpose(solidMask).map(a=>a.map(c=>c===true?1:0));
			this.pfGrids[i] = new PF.Grid(pfMask);
		})
		
	},
	addMob: function(mob){
		this.mobs.push(mob);
	},
	removeMob: function(mob){
		this.mobs.splice(this.mobs.indexOf(mob), 1);
	},
	actNext: function(){
		if (this.destroyed) {
			// This level is no longer active, so stop processing the queue
			return;
		}
		if (PlayerStateMachine.isPartyDead()) { return; }
		if (PlayerStateMachine.state !== PlayerStateMachine.COMBAT) {
			// There was a state transition and the level is no longer
			// in charge of handling the mob actions
			return;
		}

		const nextActor = this.mobs[this.currentTurnCounter++];
		if (this.currentTurnCounter >= this.mobs.length) {
			this.currentTurnCounter = 0;
		}

		if (!nextActor || nextActor.dead || !this.isInCombat(nextActor)){
			return this.actNext();
		}
		if (nextActor.isPartyMember() || nextActor === OAX6.UI.player) {
			OAX6.UI.locateMarker(nextActor);
		}
		OAX6.UI.showMessage(nextActor.getBattleDescription()+":");
		if (nextActor !== OAX6.UI.player){
			Timer.delay(250)
			.then(()=>{
				if (nextActor.alignment !== OAX6.UI.player.alignment){
					OAX6.UI.hideMarker();
				}
			});
			nextActor.act()
			.then(()=>{
				if (OAX6.UI.activeMob !== nextActor){
					OAX6.UI.hideMarker();
					this.actNext();
				}
			});
		} else {
			nextActor.act();
			// Player will take its time, then call actNext himself
			// via the PlayerStateMachine
		}
	},
	isMobActive: function(){
		return this.mobs.find(m=>m.executingAction === true);
	},
	getMobsOfAlignment: function(alignment){
		return this.mobs.filter(m=>m.alignment === alignment);
	},
	getCloserMobTo: function(x, y, z, alignment){
		const mobs = this.mobs.filter(m => m.alignment === alignment && m.z == z);
		if (mobs.length > 0){
			const sorted = mobs.sort((a,b)=>Geo.flatDist(x,y,a.x,a.y)-Geo.flatDist(x,y,b.x,b.y));
			return sorted[0];
		}
		return false;
	},
	addItem: function(item, x, y, z) {
		OAX6.UI.addItemSprite(item, x, y, z);
		this.items.push(item);
	},
	addDoor: function(door, x, y, z) {
		OAX6.UI.addItemSprite(door, x, y, z);
		OAX6.UI.floorLayers[z].doorsLayer.add(door.sprite); // Override group
		this.doors.push(door);
	},
	findPathTo: function(to, from, z, includeMobsOfAlignment){
		//TODO: Single finder object?
		const finder = new PF.AStarFinder({
		    allowDiagonal: true,
    		dontCrossCorners: false
		});
		const gridClone = this.pfGrids[z].clone();
		
		const includeAlignments = [Constants.Alignments.NEUTRAL, includeMobsOfAlignment];
		includeAlignments.forEach((alignment) => {
			if (alignment){
				const mobs = this.getMobsOfAlignment(alignment);
				mobs.forEach(m=> {
					if (!(m.x === to.x && m.y === to.y)){
						gridClone.setWalkableAt(m.x, m.y, false);
					}
				});
			}
		});

		const path = finder.findPath(from.x, from.y, to.x, to.y, gridClone);
		if (path.length == 0){
			console.log(`Someone is trapped at ${from.x}, ${from.y})`)
			return {dx:0, dy:0};
		}
		return {
			dx: Math.sign(path[1][0]-from.x),
			dy: Math.sign(path[1][1]-from.y)
		};
	},
	sortForCombat: function(playerGoesFirst){
		this.currentTurnCounter = 0;
		this.mobs = this.mobs.sort((a,b)=>a.speed.current - b.speed.current);
		
		const player = OAX6.UI.player;
		if (!player.dead && playerGoesFirst){
			this.removeMob(player);
			this.mobs.unshift(player);
		}
	},
	removeItem: function(item) {
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
	getDoorAt: function(x, y) {
		for (var i=0,door; door=this.doors[i]; i++) {
			if (door.x == x && door.y == y) {
				return door;
			}
		}

		return null;
	},
	canMoveFrom: function(x, y, z, dx, dy) {
		if (dx === 0 || dy === 0){
			return !this.isSolid(x + dx, y + dy, z);
		}
		if (this.isSolid(x + dx, y, z) && this.isSolid(x, y + dy, z)){
			return false;
		}
		return !this.isSolid(x + dx, y + dy, z);
	},
	isSafeAround: function(x, y, alignment){
		const dangerousMob = this.mobs.find((m) => {
			return (m.hasBeenAttacked && m.alignment !== alignment) ||
				(
					m.alignment !== Constants.Alignments.NEUTRAL &&
					m.alignment !== alignment &&
					Geo.flatDist(x,y,m.x,m.y) < COMBAT_DISTANCE
				);
			});
		return !dangerousMob;
	},
	activateAll: function(){
		this.mobs.forEach(m=>m.activate());	
	},
	isLineClear: function (xa, ya, xb, yb, z) {
		return !Line.checkInLine(xa, ya, xb, yb, (x, y) => this.isSolid(x, y, z));
	},
	isInCombat: function(mob) {
		if (mob.hasBeenAttacked) {
			return true;
		}
		const bbox = PlayerStateMachine.getPartyBoundingBox();
		const width = bbox.x2 - bbox.x1;
		const height = bbox.y2 - bbox.y1;
		const x = bbox.x1 + width / 2;
		const y = bbox.y1 + height / 2;

		const dx = Math.abs(mob.x - x) - width / 2;
		const dy = Math.abs(mob.y - y) - height / 2;

		const dist = Geo.flatDist(0, 0, dx, dy);

		return (dist < COMBAT_DISTANCE);
	},
	// Changes the intent of all enemy mobs with 'waitCommand' intent to 'seekPlayer'
	activateHostile() {
		const mobs = this.getMobsOfAlignment(Constants.Alignments.ENEMY);
		mobs.forEach(m=> {
			if (m.intent === 'waitCommand') {
				m.intent = 'seekPlayer';
			}
		});
	},
	// Readies the level for the player to use it
	activate() {
		this.setSolidMasks(this.solidMasks); // Initializes the pfGrids
		this.items.forEach(item => OAX6.UI.addItemSprite(item, item.x, item.y, item.z));
	},
	destroy() {
		// Silently kill all mobs except player party.
		this.mobs.forEach(m => {
			if (!(m.isPartyMember() || this === OAX6.UI.player)) {
				m.dead = true;
			}
		});
		this.destroyed = true;
		this.mobs = null;	
		this.items = null;
		this.doors = null;
		this.solidMasks = null;
		this.opaqueMasks = null;
		this.pfGrids = null;
		this.currentTurnCounter = 0;
	}
};

module.exports = Level;