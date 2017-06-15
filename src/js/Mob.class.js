/**
 * Represents a being living inside a world
 * Can be the player, an enemy, a party member, or a NPC.
 */

function Mob(level, x, y, z){
	this.appearance = null;
	this.level = level;
	this.x = x;
	this.y = y;
	this.z = z;
}

Mob.prototype = {
	/**
	 * Mobs are prompted to act depending on
	 * the current game mode, controlled by the 
	 * mob scheduler
	 */
	act: function(){
		if (Util.chance(30)){
			var dx = Util.rand(-1,1);
			var dy = Util.rand(-1,1);
			if (this.level.canWalkTo(this, dx, dy)){
				this.moveTo(dx, dy);
			}
		} else {
			// Do nothing
		}
	},
	moveTo: function(dx, dy){
		// Position changes before the tween to "reserve" the spot
		this.x += dx;
		this.y += dy;

	},
	climb: function(dz){

	}
}

module.exports = Mob;