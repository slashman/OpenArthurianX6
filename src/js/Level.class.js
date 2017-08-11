const Bus = require('./Bus');

function Level(){
	this.mobs = [];	
	this.solidMask = null;
	this.currentTurnCounter = 0;
	Bus.listen('nextActor', this.actNext, this);
}

Level.prototype = {
	isSolid: function(x, y){
		// TODO: Check collision against other mobs
		return this.solidMask[x][y];
	},
	setSolidMask: function(solidMask) {
		this.solidMask = solidMask;
	},
	addMob: function(mob){
		this.mobs.push(mob);
		mob.activate();
	},
	// This is used when in TBS mode. This is WIP, not tested.
	actNext: function(){
		const nextActor = this.mobs[this.currentTurnCounter++];
		if (this.currentTurnCounter === this.mobs.length) {
			this.currentTurnCounter = 0;
		}
		const actionTime = nextActor.act();
		Bus.emit('nextActor', actionTime); // Signals the caller to call again
	}
}

module.exports = Level;