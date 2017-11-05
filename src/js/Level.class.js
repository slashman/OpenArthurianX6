const Bus = require('./Bus');
const log = require('./Debug').log;
const Timer = require('./Timer');
const PlayerStateMachine = require('./PlayerStateMachine');

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
		if (this.currentTurnCounter === this.mobs.length) {
			this.currentTurnCounter = 0;
		}
		OAX6.UI.locateMarker(nextActor);
		OAX6.UI.showMessage(nextActor.getBattleDescription()+":");
		if (nextActor !== OAX6.UI.player){
			OAX6.UI.locateMarker(nextActor);
			Timer.delay(1000)
			.then(()=>{
				OAX6.UI.hideMarker();
				return nextActor.act();
			})
			.then(()=>Timer.delay(500))
			.then(()=>this.actNext());
		} else {
			nextActor.act();
			// Player will take its time, then call actNext himself
			// via the PlayerStateMachine
		}
	},
	isMobActive: function(){
		return this.mobs.find(m=>m.executingAction==true);
	},
	addItem: function(item, x, y) {
		OAX6.UI.addItemSprite(item, x, y);
		this.items.push(item);
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
	}
}

module.exports = Level;