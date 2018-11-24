const Bus = require('./Bus');
const Random = require('./Random');
const Timer = require('./Timer');
const PlayerStateMachine = require('./PlayerStateMachine');
const ItemFactory = require('./ItemFactory');
const Geo = require('./Geo');
const Line = require('./Line');
const MessageBox = require('./MessageBox');
const PartyStatus = require('./ui/PartyStatus');
const Constants = require('./Constants');

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
	this.inventory = [];
	this.flags = {};
	this.triggers = [];
	this.combatTurns = 0;
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
		}
		if (!PlayerStateMachine.allowMobsActing()) {
			this.reportAction("Stand by");
			return Timer.delay(1000);
		}
		// Regardless of any further checks, check if wants to talk first
		if (this.dialog && this.firstTalk && Geo.flatDist(player.x, player.y, this.x, this.y) < this.firstTalk){
			Bus.emit('startDialog', {mob: this, dialog: this.dialog, player: OAX6.UI.player});
			this.firstTalk = 0;
			return Promise.resolve();
		}
		// If mob is too far from player and hasn't been attacked, it mustn't act
		if (!this.level.isInCombat(this)) {
			return Timer.delay(1000);	
		}
		let subIntent = this.intent; // While we have a general intent, it may change for this action
		if (this.isPartyMember()){
			if (PlayerStateMachine.state === PlayerStateMachine.COMBAT){
				OAX6.UI.activeMob = this;
				PlayerStateMachine.actionEnabled = true;
				return Promise.resolve();
			} else {
				//TODO: Fix issue with pathfinding empty routes to player
				if (this.x === player.x && this.y === player.y){
					//TODO: Move to an open space?
					subIntent = 'waitCommand';
				} else {
					subIntent = 'seekPlayer';
				}
			}
		} else {
			// Surviving is the most important, so always look for enemies first
			// Note that neutral enemies will by default have no target
			const nearbyTarget = this.getNearbyTarget();
			if (nearbyTarget) {
				subIntent = 'combat';
			} else if (subIntent === 'seekPlayer' && !this.canTrack(player)) {
				subIntent = 'waitCommand';
			}
		}
		if (subIntent === 'waitCommand') {
			this.reportAction("Stand by");
			if (PlayerStateMachine.state === PlayerStateMachine.COMBAT){
				return Promise.resolve();
			} else {
				return Timer.delay(1000);
			}
		} else if (subIntent === 'seekPlayer') {
			return this.bumpTowards(player);
		} else if (subIntent === 'wander') {
			// TODO: Follow schedule
			var dx = Random.num(-1,1);
			var dy = Random.num(-1,1);
			if (dx === 0 && dy === 0){
				dx = 1;
			}
			return this.moveTo(dx, dy);
		} else if (subIntent === 'combat') {
			return this.combatAction().then(() => this.onCombatTurn());
		} else {
			return Timer.delay(1000);
		}
	},
	combatAction: function () {
		const nearbyTarget = this.getNearbyTarget();
		if (!nearbyTarget){
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
		} else {
			if (this.weapon && 
				this.weapon.range && 
				Geo.flatDist(nearbyTarget.x, nearbyTarget.y, this.x, this.y) <= this.weapon.range &&
				this.level.isLineClear(this.x, this.y, nearbyTarget.x, nearbyTarget.y)
				) {
				return this.attackToPosition(nearbyTarget.x, nearbyTarget.y);
			} else {
				return this.bumpTowards(nearbyTarget);
			}
		} 
	},
	bumpTowards: function (targetMob) {
		const nextStep = this.level.findPathTo(targetMob, this, this.alignment);
		let dx = nextStep.dx;
		let dy = nextStep.dy;
		const mob = this.level.getMobAt(this.x + dx, this.y + dy);
		if (mob){
			if (mob.alignment !== this.alignment){
				return this.attackOnDirection(dx, dy);
			} else {
				return Timer.delay(1000);
			}
		} else {
			return this.moveTo(dx, dy);
		}
	},
	onCombatTurn: function() {
		if (PlayerStateMachine.state !== PlayerStateMachine.COMBAT){
			return;
		}
		if (this.triggers.length === 0) {
			return;
		}
		this.combatTurns++;
		const combatTurnsOverTriggers = this.triggers.filter(t => t.type === 'combatTurnsOver');
		combatTurnsOverTriggers.forEach(t => {
			if (this.combatTurns >= t.value) {
				this.executeTriggerActions(t);
				t.triggered = true;
			}
		});
		this.triggers = this.triggers.filter(t => !t.triggered);
	},
	executeTriggerActions: function(trigger) {
		let p = Promise.resolve();
		trigger.actions.forEach(a => {
			let promiseFunction;
			switch (a.type) {
				case 'console':
					promiseFunction = () => new Promise(r => {
						console.log(a.value);
						r();	
					});
					break;
				case 'cutscene':
					promiseFunction = () => OAX6.UI.showScene(a.value);
					break;
				case 'openLevel':
					promiseFunction = () => new Promise(r => {
						OAX6.LevelLoader.openLevel(a.value, OAX6.UI.player);
						r();
					});
					break;
			}
			p = p.then(promiseFunction);
		});
	},
	canTrack: function (mob) {
		if (mob === OAX6.UI.player && this.isPartyMember()) {
			return true;
		}
		// TODO: Use Memory (last known position)
		const dist = Geo.flatDist(mob.x, mob.y, this.x, this.y);
		if (dist > 20) {
			return false;
		}
		// Else trace a line and check no opaque tiles hit
		return this.level.isLineClear(mob.x, mob.y, this.x, this.y);
	},
	isHostileMob: function(){
		return this.alignment === Constants.Alignments.ENEMY;
	},
	isPartyMember: function(){
		return OAX6.UI.player.party.indexOf(this) !== -1;
	},
	getNearbyTarget: function(){
		if (this.alignment === Constants.Alignments.NEUTRAL) {
			// TODO: If was attacked, target the offender
			// TODO: Wild animals may attack randomly
			return false;
		}
		if (this.intent === 'waitCommand') {
			return false;
		}
		const targetAlignment = this.isHostileMob() ? Constants.Alignments.PLAYER : Constants.Alignments.ENEMY;
		const closerMob = this.level.getCloserMobTo(this.x, this.y, targetAlignment);
		if (closerMob && this.canTrack(closerMob)) {
			return closerMob;
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
			if (this.isHostileMob() || this.isPartyMember() || this.intent === 'seekPlayer'){
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
		if (!this.level.canMoveFrom(this.x, this.y, dx, dy)){
			this.reportAction("Move - Blocked");
			return Timer.delay(500);
		}

		var mob = this.level.getMobAt(this.x + dx, this.y + dy);
		if (mob){
			if (this.canStartDialog && mob.dialog){
				Bus.emit('startDialog', {mob: mob, dialog: mob.dialog, player: OAX6.UI.player});
				
				// Look at each other while talking
				this.lookAt(dx, dy);
				mob.lookAt(-dx, -dy);
				this.reportAction("Move - Talk");
				return Timer.delay(500);
			} else if (this === OAX6.UI.player || OAX6.UI.activeMob === this){
				if (mob.isPartyMember() && PlayerStateMachine.state === PlayerStateMachine.WORLD) {
					console.log("Pass thru");
				} else {
					this.reportAction("Move - Blocked");
					return Timer.delay(500);
				}
			} else {
				this.reportAction("Move - Blocked");
				return Timer.delay(500);
			}
		} 
		// Position changes before the tween to "reserve" the spot
		this.x += dx;
		this.y += dy;

		var dir = OAX6.UI.selectDir(dx, dy);
		this.sprite.animations.play('walk_'+dir, OAX6.UI.WALK_FRAME_RATE);
		this.reportAction("Move");
		return OAX6.UI.executeTween(this.sprite, {x: this.sprite.x + dx*16, y: this.sprite.y + dy*16}, OAX6.UI.WALK_DELAY);
	},
	/*
	 * Relocates the mob without a tween, for example when the level loads
	 */
	relocate (x, y) {
		this.x = x;
		this.y = y;
		this.sprite.x = this.x * 16;
		this.sprite.y = this.y * 16;
	},
	addItem: function(item) {
    if (item.def.stackLimit) {
      const existingItem = this.inventory.find(i => i.id === item.id);
      if (existingItem) {
        if (existingItem.quantity + item.quantity <= existingItem.def.stackLimit) {
          existingItem.quantity += item.quantity;
        } else {
          item.quantity = (existingItem.quantity + item.quantity) % existingItem.def.stackLimit;
          existingItem.quantity = existingItem.def.stackLimit;
          this.inventory.push(item);
        }
      } else {
        this.inventory.push(item);
      }
    } else {
      this.inventory.push(item);
    }
	},
	getOnDirection: function(dx, dy) {
		var item = this.level.getItemAt(this.x + dx, this.y + dy);
		if (item) {
			const pickedQuantity = item.quantity;
			this.addItem(item);
			this.level.removeItem(item);
      if (item.quantity === 1) {
        this.reportAction("Got a " + item.name);  
      } else {
        this.reportAction("Got " + pickedQuantity + " " + item.name);  
      }
			
		} else {
			this.reportAction("Get - Nothing there!");
		}
	},
	dropOnDirection: function(dx, dy, item) {
		var x = this.x + dx,
			y = this.y + dy;

		if (!this.level.isSolid(x, y) && !this.level.getItemAt(x, y)) {
			var ind = this.inventory.indexOf(item);
			this.inventory.splice(ind, 1);
			this.level.addItem(item, x, y);
		} else {
			this.reportAction("Can't drop it there!");
		}
	},
	attackToPosition: function(x, y){
		const weapon = this.weapon;
		const range = weapon ? (weapon.range || 1) : 1;
		const dist = Geo.flatDist(this.x, this.y, x, y);
		if (dist > range){
			this.reportAction("Attack - Out of range!");
      return Promise.resolve(false);
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
      const ammo = this.getAmmunitionFor(weapon);
      if (!ammo) {
        this.reportAction("Attack - No Ammo.");
        return Promise.resolve(false);
      }
      if (ammo.quantity && ammo.quantity > 1) {
        ammo.quantity--;
      } else {
        this.inventory.splice(this.inventory.findIndex(i => i.id === ammo.id), 1);
      }
      if (ammo === this.weapon) {
        this.weapon = undefined;
      }
      // Here we must check in advance if this attack will trigger the combat mode!
      // We cannot wait til the projectile animation is over!
      var mob = this.level.getMobAt(x, y);
      if (mob && PlayerStateMachine.state === PlayerStateMachine.WORLD) {
				PlayerStateMachine.startCombat(true);
			}
      return weapon.playProjectileAnimation(ammo, this.x, this.y, x, y).then(()=> {
        if (ammo.throwable) {
          this.level.addItem(ammo, x, y);
        }
        return this._attackPosition(x, y);
      });
		} else if (dist <= 1){
			// Simple melee attack? but use the weapon's melee mode instead of ranged
			// Or may be prevent attack from happening, depends on the weapon
			return this.attackOnDirection(Math.sign(x-this.x), Math.sign(y-this.y));
		} else {
			this.reportAction("Attack - Out of range!");
			return Promise.resolve();
		}
	},
  getAmmunitionFor: function(weapon) {
    const ammoType = weapon.usesProjectileType;
    if (ammoType) {
      const onInventory = this.inventory.find(i => i.id === ammoType);
      return onInventory;
    } else {
      // No ammo, throw the weapon!
      return weapon;
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
		mob.hasBeenAttacked = true;
		if (PlayerStateMachine.state === PlayerStateMachine.WORLD){
			PlayerStateMachine.startCombat(true);
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
			if (this === OAX6.UI.player || this.isPartyMember()){
				this.checkForGameOver();
			}
			if (this.isPartyMember()) {
				OAX6.UI.player.removeFromParty(this);
			}
		}
	},
	climb: function(dz){

	},
	reportAction: function(action){
		if (PlayerStateMachine.state === PlayerStateMachine.COMBAT){
			OAX6.UI.showMessage(this.getBattleDescription()+": "+action);
		} else if (OAX6.UI.player == this){ 
			if (PlayerStateMachine.state === PlayerStateMachine.TARGETTING){
				OAX6.UI.showMessage(action);
			}
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
		PartyStatus.addMob(mob);
	},
	removeFromParty: function(mob){
		this.party.splice(this.party.indexOf(mob), 1);
		PartyStatus.removeMob(mob);
	},
	checkForGameOver: function() {
		const player = OAX6.UI.player;
		if (player.dead && !player.party.find(p => !p.dead)) {
			MessageBox.showMessage("GAME OVER!");
		}
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