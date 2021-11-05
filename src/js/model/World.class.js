const circular = require('circular-functions');
const PF = require('pathfinding');

const ChunkLoader = require('../ChunkLoader');
const Constants = require('../Constants');
const Geo = require('../Geo');
const SkyBox = require('../SkyBox');
const Timer = require('../Timer');
const Line = require('../Line');

function World (config) {
    this._c = circular.register('World');
	this.currentMinuteOfDay = 0;
	this.mobs = [];
	this.chunkSize = config.chunkSize;
	this.width = config.chunkSize * config.chunksWidth;
	this.height =  config.chunkSize * config.chunksHeight;
}

circular.registerClass('World', World);

const COMBAT_DISTANCE = 10;

World.prototype = {
	timeOfDayPass: function(){
		if (OAX6.PlayerStateMachine.state !== OAX6.PlayerStateMachine.WORLD){
			Timer.delay(100).then(() => this.timeOfDayPass());
			return;
		}
		this.currentMinuteOfDay += 5; // This should add up to 60 or else hourly notifications are not sent
		if (this.currentMinuteOfDay >= 60 * 24) {
		  this.currentMinuteOfDay = 0;
		}
		const currentMinuteOfHour = ((this.currentMinuteOfDay % 60) / 60) * 100;
		if (currentMinuteOfHour === 100) {
		  currentMinuteOfHour = 0;
		}
		if (currentMinuteOfHour == 0) {
			this.hourlyNotification();
			this.setFogColor();
		}
		SkyBox.render();
		Timer.delay(1000).then(()=>this.timeOfDayPass());
	},

	initMinuteOfDay(minuteOfDay) {
		this.currentMinuteOfDay = minuteOfDay;
		this.timeOfDayPass();
		this.setFogColor();
	},

	hourlyNotification () {
		OAX6.UI.player.world.hourly();
	},

	getHourOfDay () {
		return Math.floor(this.currentMinuteOfDay / 60);
	},

	setFogColor () {
		const hourOfTheDay = this.getHourOfDay();
		if (hourOfTheDay < 5 || hourOfTheDay > 19) {
			OAX6.UI.setFogColor(0.4, 0x00008b);
		} else if (hourOfTheDay < 6 || hourOfTheDay > 18) {
			OAX6.UI.setFogColor(0.2, 0x0000b9);
		} else if (hourOfTheDay < 7) {
			// Dawn
			OAX6.UI.setFogColor(0.1, 0x0000b9);
		} else if (hourOfTheDay > 17) {
			// Sunset
			OAX6.UI.setFogColor(0.1, 0x0000b9);
		} else {
			OAX6.UI.setFogColor(0, 0);
		}
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
	addMob: function(mob){
		this.mobs.push(mob);
	},
	removeMob: function(mob){
		this.mobs.splice(this.mobs.indexOf(mob), 1);
	},
	/**
	 * When in combat mode, determines the next mob to act, and calls its `act` function
	 */
	 actNext: function(){
		if (this.destroyed) {
			// This world is no longer active, so stop processing the queue
			return;
		}
		if (OAX6.PlayerStateMachine.isPartyDead()) { return; }
		if (OAX6.PlayerStateMachine.state !== OAX6.PlayerStateMachine.COMBAT) {
			// There was a state transition and the world is no longer
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
		OAX6.UI.showMessage(nextActor.getBattleDescription()+":");
		if (nextActor.isPartyMember()){
			OAX6.UI.locateMarker(nextActor);
			nextActor.act();
			// Player will take its time, then call actNext himself
			// via the PlayerStateMachine
		} else {
			Timer.delay(250)
			.then(()=>{
				OAX6.UI.hideMarker();
			});
			nextActor.act()
			.then(()=>{
				if (OAX6.UI.activeMob !== nextActor){
					OAX6.UI.hideMarker();
					this.actNext();
				}
			});
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
	/**
	 * Finds a "long" path to a far location, this is used by NPC schedules AI to walk to their destinations,
	 * It ignores unlocked doors as blocking spaces, because the NPC can and will open them.
	 * 
	 * @param {*} to 
	 * @param {*} from 
	 * @param {*} z 
	 * @param {*} includeMobsOfAlignment 
	 */
	findLongPath: function(chunkTo, from, z, includeMobsOfAlignment){
		const chunkFrom = {
			x: from.x % this.chunkSize,
			y: from.y % this.chunkSize
		}

		const chunkX = Math.floor(from.x / this.chunkSize);
		const chunkY = Math.floor(from.y / this.chunkSize);

		const blockedPositions = this._getPositionsBlockedByMobs(chunkX, chunkY, includeMobsOfAlignment);
		blockedPositions.splice(blockedPositions.findIndex(p => p.x == chunkFrom.x && p.y == chunkFrom.y), 1);

		const currentChunk = this._getChunk(chunkX, chunkY);
		return currentChunk.findLongPath(chunkTo, chunkFrom, z, blockedPositions)
	},

	_getMobsInChunk(chunkX, chunkY) {
		return this.mobs.filter(m => m.x > chunkX * this.chunkSize && 
			m.x < ((chunkX+1) * this.chunkSize - 1) && 
			m.y > chunkY * this.chunkSize && 
			m.y < ((chunkY+1) * this.chunkSize - 1)
		);
	},

	_getPositionsBlockedByMobs(chunkX, chunkY, includeMobsOfAlignment) {
		const blockedPositions = [];
		const includeAlignments = [Constants.Alignments.NEUTRAL, includeMobsOfAlignment];
		const chunkMobs = this._getMobsInChunk(chunkX, chunkY);
		includeAlignments.forEach((alignment) => {
			if (alignment){
				const mobs = chunkMobs.filter(m => m.alignment === alignment);
				mobs.forEach(m=> {
					blockedPositions.push({
						x: m.x % this.chunkSize,
						y: m.y % this.chunkSize
					});
				});
			}
		});
		return blockedPositions;
	},

	/**
	 * Gets next step towards something, sampling an area of the world around the initial position.
	 */
	findNearPath: function (from, to, z, removeAlignment, openEnded) {
		const xRange = Math.abs(from.x - to.x);
		const yRange = Math.abs(from.y - to.y);
		// TODO: Create a non-square area with some margins based on from and to, more optimal.
		const range = yRange > xRange ? yRange + 2 : xRange + 2;
		if (range > 15) {
			// Too far, we cannot help sorry.
			return {dx:0, dy:0};
		}
		const spred = range * 2 + 1;
		const toX = to.x - from.x + range;
		const toY = to.y - from.y + range;
		const grid = new PF.Grid(spred, spred);
		for (let x = 0; x < spred; x++) {
			for (let y = 0; y < spred; y++) {
				const worldX = from.x - range + x;
				const worldY = from.y - range + y;
				const solid = this.isSolid(worldX, worldY, z);
				grid.setWalkableAt(x, y, !solid);
				if (!solid && removeAlignment) {
					const mob = this.getMobAt(worldX, worldY, z);
					if (mob && mob.alignment == removeAlignment)
						grid.setWalkableAt(x, y, false);
				}
			}
		}
		if (openEnded) {
			grid.setWalkableAt(range, range, true);
			grid.setWalkableAt(toX, toY, true);
		}
		//TODO: Single finder object?
		const finder = new PF.AStarFinder({
			allowDiagonal: true,
			dontCrossCorners: false,
			diagonalMovement: PF.DiagonalMovement.Always
		});
		const path = finder.findPath(range, range, toX, toY, grid);
		if (path.length == 0){
			return {dx:0, dy:0};
		}
		return {
			dx: Math.sign(path[1][0]-range),
			dy: Math.sign(path[1][1]-range)
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
	isSafeAround: function(x, y, alignment, panickedAreDangerous){
		const dangerousMob = this.mobs.find((m) => {
			const isDangerous = m.alignment !== Constants.Alignments.NEUTRAL &&
				m.alignment !== alignment &&
				Geo.flatDist(x,y,m.x,m.y) < COMBAT_DISTANCE;
			if (isDangerous && !panickedAreDangerous && m.isPanicked) {
				return false;
			}
			return isDangerous;
		});
		return !dangerousMob;
	},
	activateAll: function(){
		this.mobs.forEach(m=>m.activate());	
	},
	isInCombat: function(mob) {
		if (mob.hasBeenAttacked) {
			return true;
		}
		const bbox = OAX6.PlayerStateMachine.getPartyBoundingBox();
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
	destroy() {
		// Silently kill all mobs except player party.
		this.mobs.forEach(m => {
			if (!m.isPartyMember()) {
				m.dead = true;
			}
		});
		this.destroyed = true;
		this.mobs = null;	
	},

	hourly() {
		OAX6.UI.player.party.forEach(function(partyMember) {
			partyMember.hunger.increase(1);
		});
		// Check for NPCs that should wake up
		this.mobs.filter(m => m.isAsleep).forEach(m => m.hourlyWakeupCheck());
		OAX6.UI.updateFOV(); // Because the new hour may have less visibility
	},

	isLineClear: function (xa, ya, xb, yb, z) {
		return !Line.checkInLine(xa, ya, xb, yb, (x, y) => this.isSolid(x, y, z));
	},

	isSolid: function(x, y, z){
		return this._getFromChunk(x, y, z, 'isSolid');
	},
	isOpaque: function(x, y, z){
		return this._getFromChunk(x, y, z, 'isOpaque');
	},
	getDoorAt: function(x, y, z) {
		return this._getFromChunk(x, y, z, 'getDoorAt');
	},
	getObjectAt: function(x, y, z) {
		return this._getFromChunk(x, y, z, 'getObjectAt');
	},
	getItemAt: function(x, y, z) {
		return this._getFromChunk(x, y, z, 'getItemAt');
	},
	_getFromChunk(x, y, z, functionName) {
		const chunkX = Math.floor(x / this.chunkSize);
		const chunkY = Math.floor(y / this.chunkSize);
		const chunk = this._getChunk(chunkX, chunkY);
		const chunkInX = x % this.chunkSize;
		const chunkInY = y % this.chunkSize;
		return chunk[functionName](chunkInX, chunkInY, z);
	},
	removeItem: function(item) {
		const chunkX = Math.floor(item.x / this.chunkSize);
		const chunkY = Math.floor(item.y / this.chunkSize);
		const chunk = this._getChunk(chunkX, chunkY);
		return chunk.removeItem(item);
	},
	addItem: function(item, x, y, z) {
		const chunkX = Math.floor(x / this.chunkSize);
		const chunkY = Math.floor(y / this.chunkSize);
		const chunk = this._getChunk(chunkX, chunkY);
		const chunkInX = x % this.chunkSize;
		const chunkInY = y % this.chunkSize;
		item.x = x;
		item.y = y;
		item.z = z;
		OAX6.UI.addItemSprite(item, x, y, z);
		return chunk.addItem(item, chunkInX, chunkInY, z);
	},
	returnItem: function (item) {
		OAX6.UI.addItemSprite(item, item.x, item.y, item.z);
		this._getFromChunk(item.x, item.y, item.z, 'returnItem');
	},
	canMoveFrom: function(x, y, z, dx, dy) {
		if (!this.isValidCoordinate(x + dx, y + dy)) {
			return false;
		}
		if (dx === 0 || dy === 0){
			return !this.isSolid(x + dx, y + dy, z);
		}
		if (this.isSolid(x + dx, y, z) && this.isSolid(x, y + dy, z)){
			return false;
		}
		return !this.isSolid(x + dx, y + dy, z);
	},
	isValidCoordinate(x, y) {
		if (x < 0 || x > this.width || y < 0 || y > this.height) {
			return false;
		}
		return true;
	},
	/**
	 * WARNING: This function should be use sparsely because it breaks the
	 * chunk abstraction.
	 * 
	 * @param {*} x
	 * @param {*} y
	 */
	getCurrentChunk(x, y) {
		const chunkX = Math.floor(x / this.chunkSize);
		const chunkY = Math.floor(y / this.chunkSize);
		return this._getChunk(chunkX, chunkY);
	},

	_getChunk(x, y) {
		return ChunkLoader.getChunk(x, y, this);
	}

}

module.exports = World;