const Bus = require('./Bus');
const Random = require('./Random');
const Timer = require('./Timer');
const PlayerStateMachine = require('./PlayerStateMachine');
const log = require('./Debug').log;
const Stat = require('./Stat.class');

/**
 * Represents a being living inside a world
 * Can be the player, an enemy, a party member, or a NPC.
 */

function Mob(level, x, y, z){
	this.sprite = null;
	this.definition = null;
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
			return Promise.resolve();
		} else {
			if (Random.chance(50)){
				var dx = Random.num(-1,1);
				var dy = Random.num(-1,1);
				if (dx == 0 && dy == 0){
					dx = 1;
				}
				return this.moveTo(dx, dy);
			} else {
				// Do nothing
				this.reportAction("Stand by");
				return Promise.resolve();
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
		this.executingAction = true;
		this.act().then(()=>{
			this.executingAction = false;
			if (PlayerStateMachine.state === PlayerStateMachine.COMBAT_SYNC){
				PlayerStateMachine.checkCombatReady();
			};
			return Timer.delay(Random.num(500, 3000));
		}).then(()=>{this.activate();});
	},
	moveTo: function(dx, dy){
		var mob = this.level.getMobAt(this.x + dx, this.y + dy);
		if (mob){
			if (this.canStartDialog && mob.dialog){
				Bus.emit('startDialog', {mob: mob, dialog: mob.dialog});
			}
			// What should we return here? :|
		} else if (!this.level.isSolid(this.x + dx, this.y + dy)) {
			// Position changes before the tween to "reserve" the spot
			this.x += dx;
			this.y += dy;

			var dir = OAX6.UI.selectDir(dx, dy);
			this.sprite.animations.play('walk_'+dir, OAX6.UI.WALK_FRAME_RATE);
			this.reportAction("Move");

			OAX6.UI.tween(this.sprite).to({x: this.sprite.x + dx*16, y: this.sprite.y + dy*16}, OAX6.UI.WALK_DELAY, Phaser.Easing.Linear.None, true);
			return Timer.delay(OAX6.UI.WALK_DELAY);
		}
		this.reportAction("Move - Blocked");
		return Promise.resolve();
	},
	attackOnDirection: function(dx, dy){
		var mob = this.level.getMobAt(this.x + dx, this.y + dy);
		if (mob){
			// Attack!
			OAX6.UI.showIcon(2, mob.sprite.x, mob.sprite.y);
			return Timer.delay(500)
			.then(()=>{
				OAX6.UI.hideIcon();
				return this.attack(mob);
			});
		} else if (this.level.isSolid(this.x + dx, this.y + dy)) {
			// TODO: Attack the map
			this.reportAction("Attack - No one there!");
			return Timer.delay(500);
		} else {
			this.reportAction("Attack - No one there!");
			return Timer.delay(500);
		}
	},
	attack: function(mob){
		const combinedDamage = mob.damage.current + (mob.weapon ? mob.weapon.damage.current : 0);
		const combinedDefense = mob.defense.current + (mob.armor ? mob.armor.defense.current : 0);
		let damage = combinedDamage - combinedDefense;
		if (damage < 0)
			damage = 0;
		if (damage === 0){
			this.reportOutcome(mob.getDescription()+" shrugs off the attack!");
			return Timer.delay(500)
		}
		let proportion = damage / mob.hp.max;
		if (proportion > 1){
			proportion = 1;
		}
		proportion = Math.floor(proportion * 100 / 25);
		this.reportOutcome(mob.getDescription()+" is "+ATTACK_DESCRIPTIONS[proportion]+"wounded.");
		mob._damage(damage);
		return Timer.delay(1500)
	},
	_damage: function(damage){
		this.hp.reduce(damage);
	},
	climb: function(dz){

	},
	reportAction: function(action){
		if (PlayerStateMachine.state === PlayerStateMachine.COMBAT){
			OAX6.UI.showMessage(this.getBattleDescription()+": "+action);
		}
	},
	reportOutcome: function(outcome){
		OAX6.UI.showMessage(outcome);
	},
	getBattleDescription: function(){
		let desc = this.name;
		if (this.weapon){
			desc += " armed with "+this.weapon.name;
		}
		return desc;
	},
	getDescription: function(){
		if (this.name){
			return this.name;
		} else {
			return 'The'+ this.definition.name
		}
	}
}

module.exports = Mob;

const ATTACK_DESCRIPTIONS = [
	"barely ",
	"lightly ",
	"",
	"critically ",
	"critically "
];