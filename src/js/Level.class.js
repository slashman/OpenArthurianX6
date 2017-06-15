function Level(){
	this.mobs = [];	
}

Level.prototype = {
	canWalkTo: function(mob, dx, dy){
		//TODO: Check collision vs other mobs and vs solid mask
		return true;
	},
	addMob: function(mob){
		this.mobs.push(mob);
	}
}

module.exports = Level;