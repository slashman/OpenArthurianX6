const Bus = require('./Bus');
const Random = require('./Random');
const Timer = require('./Timer');
const PlayerStateMachine = require('./PlayerStateMachine');
const log = require('./Debug').log;

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
	this.isTalking = false;
	this.canStartDialog = false; // Only player "mob" can start dialog
}

Mob.prototype = {
	/**	
	 * Mobs are prompted to act depending on
	 * the current game mode, controlled by the 
	 * mob scheduler
	 */
	act: function(){
		if (this === OAX6.UI.player){
			// Enable action
			if (PlayerStateMachine.state === PlayerStateMachine.COMBAT){
				PlayerStateMachine.actionEnabled = true;
			}
			return 0;
		} else {
			if (Random.chance(50)){
				var dx = Random.num(-1,1);
				var dy = Random.num(-1,1);
				if (dx == 0 && dy == 0){
					dx = 1;
				}
				if (this.moveTo(dx, dy)) {
					return OAX6.UI.WALK_DELAY;
				}
				return 0;
			} else {
				// Do nothing
				this.reportAction("Stand by");
				return 0;
			}
		}
	},
	activate: function() {
		if (this.isTalking || PlayerStateMachine.state === PlayerStateMachine.COMBAT) {
			//TODO: May be check state === DIALOG instead of this.isTalking?
			return;
		}
		if (PlayerStateMachine.state === PlayerStateMachine.COMBAT_SYNC){
			PlayerStateMachine.checkCombatReady();
			return;
		}
		var actionTime = this.act();
		Timer.set(actionTime + Random.num(500, 3000), this.activate, this);
		this.executingAction = true;
		Timer.set(actionTime, ()=>{
			this.executingAction = false;
			if (PlayerStateMachine.state === PlayerStateMachine.COMBAT_SYNC){
				PlayerStateMachine.checkCombatReady();
			};
		});
	},
	moveTo: function(dx, dy){
		var mob = this.level.getMobAt(this.x + dx, this.y + dy);
		if (mob){
			if (this.canStartDialog && mob.dialog){
				Bus.emit('startDialog', {mob: mob, dialog: mob.dialog});
			}
		} else if (!this.level.isSolid(this.x + dx, this.y + dy)) {
			// Position changes before the tween to "reserve" the spot
			this.x += dx;
			this.y += dy;

			var dir = OAX6.UI.selectDir(dx, dy);
			this.sprite.animations.play('walk_'+dir, OAX6.UI.WALK_FRAME_RATE);
			this.reportAction("Move");

			OAX6.UI.tween(this.sprite).to({x: this.sprite.x + dx*16, y: this.sprite.y + dy*16}, OAX6.UI.WALK_DELAY, Phaser.Easing.Linear.None, true);

			return OAX6.UI.WALK_DELAY;
		}
		this.reportAction("Move - Blocked");
		return false;
	},
	climb: function(dz){

	},
	reportAction: function(action){
		if (PlayerStateMachine.state === PlayerStateMachine.COMBAT){
			OAX6.UI.showMessage(this.getBattleDescription()+": "+action);
		}
	},
	getBattleDescription: function(){
		let desc = this.definition.name;
		if (this.weapon){
			desc += " armed with "+this.weapon.name;
		}
		return desc;
	}
}

module.exports = Mob;