const Geo = require('./Geo');
const log = require('./Debug').log;
const Timer = require('./Timer');
const PF = require('pathfinding');

function Level(){
	this.mobs = [];	
	this.items = [];
	this.solidMask = null;
	this.currentTurnCounter = 0;
}

Level.prototype = {
	isSolid: function(x, y){
		if (this.solidMask[x][y]) {
			return true;
		}
		return false;
	},
	getMobAt: function(x, y){
		// TODO: Replace for this.mobs.find
		for (var i=0,mob;mob=this.mobs[i];i++) {
			if (mob.x == x && mob.y == y) {
				return this.mobs[i];
			}
		}
		return false;
	},
	_transpose: function(m) {
		return m[0].map((x,i) => m.map(x => x[i]));
	},
	setSolidMask: function(solidMask) {
		this.solidMask = solidMask;
		const pfMask = this._transpose(solidMask).map(a=>a.map(c=>c===true?1:0));
		this.pfGrid = new PF.Grid(pfMask);
	},
	addMob: function(mob){
		this.mobs.push(mob);
		mob.activate();
	},
	removeMob: function(mob){
		this.mobs.splice(this.mobs.indexOf(mob), 1);
	},
	actNext: function(){
		const nextActor = this.mobs[this.currentTurnCounter++];
		if (this.currentTurnCounter >= this.mobs.length) {
			this.currentTurnCounter = 0;
		}
		if (!nextActor || nextActor.dead){
			return this.actNext();
		}
		OAX6.UI.locateMarker(nextActor);
		OAX6.UI.showMessage(nextActor.getBattleDescription()+":");
		if (nextActor !== OAX6.UI.player){
			OAX6.UI.locateMarker(nextActor);
			Timer.delay(1000)
			.then(()=>{
				if (nextActor.alignment !== OAX6.UI.player.alignment){
					OAX6.UI.hideMarker();
				}
				return nextActor.act();
			})
			.then(()=>Timer.delay(500))
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
	getCloserMobTo: function(x, y, alignment){
		const mobs = this.mobs.filter(m=>m.alignment === alignment);
		if (mobs.length > 0){
			const sorted = mobs.sort((a,b)=>Geo.flatDist(x,y,a.x,a.y)-Geo.flatDist(x,y,b.x,b.y));
			return sorted[0];
		}
		return false;
	},
	addItem: function(item, x, y) {
		OAX6.UI.addItemSprite(item, x, y);
		this.items.push(item);
	},
	findPathTo: function(to, from, includeMobsOfAlignment){
		//TODO: Single finder object?
		const finder = new PF.AStarFinder({
		    allowDiagonal: true,
    		dontCrossCorners: false
		});
		const gridClone = this.pfGrid.clone();
		if (includeMobsOfAlignment){
			const mobs = this.getMobsOfAlignment(includeMobsOfAlignment);
			mobs.forEach(m=> {
				if (m.x !== to.x && m.y !== to.y){
					gridClone.setWalkableAt(m.x, m.y, false);
				}
			});
		}
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
		if (playerGoesFirst){
			this.removeMob(OAX6.UI.player);
			this.mobs.unshift(OAX6.UI.player);
		}
	},
	removeItem: function(item) {
		this.items.splice(this.items.indexOf(item), 1);
		OAX6.UI.removeItemSprite(item);
	},
	getItemAt: function(x, y) {
		for (var i=0,item;item=this.items[i];i++) {
			if (item.x == x && item.y == y) {
				return item;
			}
		}

		return null;
	},
	canMoveFrom: function(x, y, dx, dy) {
		if (dx === 0 || dy === 0){
			return !this.isSolid(x+dx, y+dy);
		}
		if (this.isSolid(x+dx, y) && this.isSolid(x, y+dy)){
			return false;
		}
		return !this.isSolid(x+dx, y+dy);
	},
	isSafeAround: function(x, y, alignment){
		return this.mobs.find(m=>m.alignment !== alignment && Geo.flatDist(x,y,m.x,m.y) < 10) === undefined;
	},
	activateAll: function(){
		this.mobs.forEach(m=>m.activate());	
	}
};

module.exports = Level;