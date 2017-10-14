const Bus = require('./Bus');
const Random = require('./Random');
const Timer = require('./Timer');
const PlayerStateMachine = require('./PlayerStateMachine');
const ItemFactory = require('./ItemFactory');
const Geo = require('./Geo');

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
	//TODO: FAR: Dialogs between NPCs
	this.speed = null;
	this.party = [];
}

Mob.prototype = {
	/**	
	 * Mobs are prompted to act depending on
	 * the current game mode, controlled by the 
	 * mob scheduler
	 */
	act: function(){
		const player = OAX6.UI.player;
		if (this === player){
			// Enable action
			if (PlayerStateMachine.state === PlayerStateMachine.COMBAT){
				PlayerStateMachine.actionEnabled = true;
			}
			OAX6.UI.activeMob = false;
			return Promise.resolve();
		} else if (player && this.alignment === player.alignment){
			// This is a party member
			if (PlayerStateMachine.state === PlayerStateMachine.COMBAT){
				OAX6.UI.activeMob = this;
				PlayerStateMachine.actionEnabled = true;
				return Promise.resolve();
			} else {
				//TODO: Fix issue with pathfinding empty routes to player
				const nextStep = this.level.findPathTo(player, this, this.alignment);
				return this.moveTo(nextStep.dx, nextStep.dy);
			}
		} else {
			const nearbyTarget = this.getNearbyTarget();
			if (!nearbyTarget || this.alignment == 'n'){
				if (Random.chance(50)){
					var dx = Random.num(-1,1);
					var dy = Random.num(-1,1);
					if (dx === 0 && dy === 0){
						dx = 1;
					}
					return this.moveTo(dx, dy);
				} else {
					// Do nothing
					this.reportAction("Stand by");
					return Timer.delay(1000);
				}
			} else if (nearbyTarget){
				const nextStep = this.level.findPathTo(nearbyTarget, this, this.alignment);
				let dx = nextStep.dx;
				let dy = nextStep.dy;
				const mob = this.level.getMobAt(this.x + dx, this.y + dy);
				if (mob){
					if (mob.alignment !== this.alignment){
						return this.attackOnDirection(dx, dy);
					} else {
						dx = Random.num(-1,1);
						dy = Random.num(-1,1);
						if (dx === 0 && dy === 0){
							dx = 1;
						}
						return this.moveTo(dx, dy);
					}
				} else {
					return this.moveTo(dx, dy);
				}
			} else {
				return Timer.delay(1000);
			}
		}
	},
	isHostileMob: function(){
		return this.alignment === 'a';
	},
	isPartyMember: function(){
		return this.alignment === 'b';
	},
	getNearbyTarget: function(){
		//TODO: Implement some LOS.
		if (this.isHostileMob()){
			return this.level.getCloserMobTo(this.x, this.y, 'b');
		} else if (this.isPartyMember()){
			return this.level.getCloserMobTo(this.x, this.y, 'a');
		} else {
			return false;
		}
	},
	activate: function() {
		if (this.dead){
			return;
		}
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
			} 
			if (this.isHostileMob() || this.isPartyMember()){
				// Reactivate immediately
				return Timer.next();
			} else {
				return Timer.delay(Random.num(500, 3000));
			}
			//return Timer.delay(Random.num(500, 3000));
		}).then(()=>{this.activate();});
	},
	lookAt: function(dx, dy) {
		var dir = OAX6.UI.selectDir(dx, dy);
		this.sprite.animations.play('walk_'+dir, 0);

		// TODO: Do something about this since the first frame is midwalk... 
		this.sprite.frame += 1;
	},
	moveTo: function(dx, dy){
		var mob = this.level.getMobAt(this.x + dx, this.y + dy);
		if (mob){
			if (this.canStartDialog && mob.dialog){
				Bus.emit('startDialog', {mob: mob, dialog: mob.dialog});
				
				// Look at each other while talking
				this.lookAt(dx, dy);
				mob.lookAt(-dx, -dy);
			}
			// What should we return here? :|
		} else if (!this.level.isSolid(this.x + dx, this.y + dy)) {
			// Position changes before the tween to "reserve" the spot
			this.x += dx;
			this.y += dy;

			var dir = OAX6.UI.selectDir(dx, dy);
			this.sprite.animations.play('walk_'+dir, OAX6.UI.WALK_FRAME_RATE);
			this.reportAction("Move");

			return OAX6.UI.executeTween(this.sprite, {x: this.sprite.x + dx*16, y: this.sprite.y + dy*16}, OAX6.UI.WALK_DELAY);
		}
		this.reportAction("Move - Blocked");
		return Timer.delay(500);
	},
	attackToPosition: function(x, y){
		const weapon = this.weapon;
		const range = weapon ? (weapon.range || 1) : 1;
		const dist = Geo.flatDist(this.x, this.y, x, y);
		if (dist > range){
			this.reportAction("Attack - Out of range!");
			return Promise.resolve();
		}
		const isRangedAttack = dist > 1; 
		//TODO: Handle case of diagonals (cannot use simple flatDist, diff geometry)
		/*
		 * TODO: Define this based on the weapon.
		 * Some weapons should allow ranged attacks at close range, some others should prevent it
		 * some others will allow a weaker attack that doesn't use ammo, etc
		 * For now, we'll do a melee attack if too close
		 */
		if (isRangedAttack){
			// Add a projectile sprite, tween it to destination
			// TODO: Depending on weapon, do one of: a: Fixed image b. Rotate on direction c. Rotate continuously
			// TODO: Doesn't look good having appearance details at this class
			return OAX6.UI.tweenFixedProjectile(weapon.appearance.tileset, weapon.appearance.i, this.x, this.y, x, y)
			.then(()=> this._attackPosition(x, y));
		} else if (dist <= 1){
			// Simple melee attack? but use the weapon's melee mode instead of ranged
			// Or may be prevent attack from happening, depends on the weapon
			return this.attackOnDirection(Math.sign(x-this.x), Math.sign(y-this.y));
		} else {
			this.reportAction("Attack - Out of range!");
			return Promise.resolve();
		}
	},
	attackOnDirection: function(dx, dy){
		return this._attackPosition(this.x + dx, this.y + dy);
	},
	_attackPosition: function(x, y){
		var mob = this.level.getMobAt(x, y);
		if (mob){
			// Attack!
			OAX6.UI.showIcon(2, mob.x, mob.y);
			return Timer.delay(500)
			.then(()=>{
				OAX6.UI.hideIcon();
				return this.attack(mob);
			});
		} else if (this.level.isSolid(x, y)) {
			// TODO: Attack the map
			this.reportAction("Attack - No one there!");
			return Timer.delay(500);
		} else {
			this.reportAction("Attack - No one there!");
			return Timer.delay(500);
		}
	},
	attack: function(mob){
		if (mob === OAX6.UI.player || mob.isPartyMember()){
			if (PlayerStateMachine.state === PlayerStateMachine.WORLD){
				PlayerStateMachine.startCombat();
			}
		}
		const combinedDamage = this.damage.current + (this.weapon ? this.weapon.damage.current : 0);
		const combinedDefense = mob.defense.current + (mob.armor ? mob.armor.defense.current : 0);
		let damage = combinedDamage - combinedDefense;
		if (damage < 0)
			damage = 0;
		if (damage === 0){
			this.reportOutcome(mob.getDescription()+" shrugs off the attack!");
			return Timer.delay(500);
		}
		let proportion = damage / mob.hp.max;
		if (proportion > 1){
			proportion = 1;
		}
		proportion = Math.floor(proportion * 100 / 25);
		this.reportOutcome(mob.getDescription()+" is "+ATTACK_DESCRIPTIONS[proportion]+"wounded.");
		mob._damage(damage);
		return Timer.delay(100);
	},
	_damage: function(damage){
		this.hp.reduce(damage);
		if (this.hp.empty()){
			this.reportOutcome(this.getDescription()+" dies.");
			this.dead = true;
			this.sprite.destroy();
			if (this.definition.corpse){
				const corpse = ItemFactory.createItem(this.definition.corpse);
				this.level.removeMob(this);
				this.level.addItem(corpse, this.x, this.y);
			}
		}
	},
	climb: function(dz){

	},
	reportAction: function(action){
		if (PlayerStateMachine.state === PlayerStateMachine.COMBAT || this === OAX6.UI.player){
			OAX6.UI.showMessage(this.getBattleDescription()+": "+action);
		}
	},
	reportOutcome: function(outcome){
		OAX6.UI.showMessage(outcome);
	},
	getBattleDescription: function(){
		let desc = null;
		if (this.name){
			desc = this.name;
		} else {
			desc = this.definition.name;
		}
		if (this.weapon){
			desc += " armed with "+this.weapon.name;
		}
		return desc;
	},
	getDescription: function(){
		if (this.name){
			return this.name;
		} else {
			return 'The '+ this.definition.name;
		}
	},
	addMobToParty: function(mob){
		this.party.push(mob);
	}
};

module.exports = Mob;

const ATTACK_DESCRIPTIONS = [
	"barely ",
	"lightly ",
	"",
	"critically ",
	"critically "
];