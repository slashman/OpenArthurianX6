const Bus = require('./Bus');

function Level(){
	this.mobs = [];	
	this.currentTurnCounter = 0;
	Bus.listen('nextActor', this.actNext, this);
}

Level.prototype = {
	canWalkTo: function(mob, dx, dy){
		//TODO: Check collision vs other mobs and vs solid mask
		return true;
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