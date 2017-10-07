const Geo = require('./Geo');
const log = require('./Debug').log;
const Timer = require('./Timer');

function Level(){
	this.mobs = [];	
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
	setSolidMask: function(solidMask) {
		this.solidMask = solidMask;
	},
	addMob: function(mob){
		this.mobs.push(mob);
		mob.activate();
	},
	removeMob: function(mob){
		this.mobs.splice(this.mobs.indexOf(mob), 1);
	},
	actNext: function(){
		log("actNext",this.currentTurnCounter);
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
	getCloserMobTo: function(x, y, alignment){
		const mobs = this.mobs.filter(m=>m.alignment === alignment);
		if (mobs.length > 0){
			const sorted = mobs.sort((a,b)=>Geo.flatDist(x,y,a.x,a.y)-Geo.flatDist(x,y,b.x,b.y));
			return sorted[0];
		}
		return false;
	},
	addItem: function(item, x, y){
		OAX6.UI.addItemSprite(item, x, y);
	},
	findPathTo: function(to, from){
		return {
			dx: Math.sign(to.x - from.x),
			dy: Math.sign(to.y - from.y)
		};
	}
};

module.exports = Level;