const Random = require('./Random');
const Timer = require('./Timer');

/**
 * Represents a being living inside a world
 * Can be the player, an enemy, a party member, or a NPC.
 */

function Mob(level, x, y, z){
	this.sprite = null;
	this.definitionId = null;
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
		if (Random.chance(50)){
			var dx = Random.num(-1,1);
			var dy = Random.num(-1,1);
			if (dx == 0 && dy == 0){
				dx = 1;
			}
			if (this.moveTo(dx, dy)) {
				return 400;
			}
			return 0;
		} else {
			// Do nothing
			return 0;
		}
	},
	activate: function() {
		var actionTime = this.act();
		if (actionTime != -1)
			Timer.set(actionTime + Random.num(500, 3000), this.activate, this);
	},
	moveTo: function(dx, dy){
		// Position changes before the tween to "reserve" the spot
		if (!this.level.isSolid(this.x + dx, this.y + dy)) {
			this.x += dx;
			this.y += dy;
			OAX6.UI.tween(this.sprite).to({x: this.sprite.x + dx*16, y: this.sprite.y + dy*16}, OAX6.UI.WALK_DELAY, Phaser.Easing.Linear.None, true);
			var dir = OAX6.UI.selectDir(dx, dy);
			this.sprite.animations.play('walk_'+dir, OAX6.UI.WALK_FRAME_RATE);
			return true;
		}

		return false;
	},
	climb: function(dz){

	}
}

module.exports = Mob;