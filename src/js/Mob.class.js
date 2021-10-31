const circular = require('circular-functions');

const Bus = require('./Bus');
const Random = require('./Random');
const Timer = require('./Timer');
const PlayerStateMachine = require('./PlayerStateMachine');
const ItemFactory = require('./ItemFactory');
const Geo = require('./Geo');
const MessageBox = require('./MessageBox');
const PartyStatus = require('./ui/PartyStatus');
const Constants = require('./Constants');
const Inventory = require('./model/Inventory.class');
const { Time } = require('phaser-ce');

/**
 * Represents a being living inside a world
 * Can be the player, an enemy, a party member, or a NPC.
 */

function Mob(world, x, y, z){
	this.sprite = null;
	this.definition = null;
	this.world = world;
	this.x = x;
	this.y = y;
	this.z = z;
	this.isTalking = false;
	this.canStartDialog = false; // Only player "mob" can start dialog
	//TODO: FAR: Dialogs between NPCs
	this.speed = null;
	this.party = [];
	this.bodySlots = null;
	this.flags = {};
	this.flags._c = circular.setSafe();
	this.combatTurns = 0;
	this.scheduleCheckTurns = 0;
	this.baseSightRange = 13;
	this._c = circular.register('Mob');
}

circular.registerClass('Mob', Mob, {
	transients: {
		sprite: true,
		definition: true,
		npcDefinition: true
	},
	reviver(mob, data) {
		mob.definition = OAX6.MobFactory.getDefinition(mob.defid);
		if (mob.npcDefid) {
			mob.npcDefinition = OAX6.NPCFactory.getDefinition(mob.npcDefid);
		}
		mob.sprite = OAX6.MobFactory.getSpriteForMob(data.phaserGame, mob);
	}
});

Mob.prototype = {
	/**	
	 * Mobs are prompted to act depending on
	 * the current game mode, controlled by the 
	 * mob scheduler
	 */
	act: function(){
		if (this.isPartyMember() && PlayerStateMachine.state === PlayerStateMachine.COMBAT){
			PlayerStateMachine.actionEnabled = true;
			OAX6.UI.activeMob = this;
			return Promise.resolve();
		}
		if (!PlayerStateMachine.allowMobsActing()) {
			this.reportAction("Stand by");
			return Timer.delay(1000);
		}
		if (this.isAsleep) {
			return Timer.delay(1000);
		}
		return this.__executeAI().then(() => this.__checkTriggers());
	},
	__checkTriggers() {
		const player = OAX6.UI.player;
		const promises = [];
		if (this.npcDefinition && this.npcDefinition.triggers) {
			const playerDistanceTriggers = this.__getActiveTriggersByType('playerDistance');
			playerDistanceTriggers.forEach(t => {
				if (Geo.flatDist(player.x, player.y, this.x, this.y) < t.value) {
					promises.push(this.executeTriggerActions(t));
				}
			});
		}
		if (promises.length) {
			return Promise.all(promises);
		} else {
			return Promise.resolve();
		}
	},
	__getActiveTriggersByType(triggerType) {
		return this.npcDefinition.triggers.filter(t => t.type === triggerType && !this.flags['trigger_' + t.id]);
	},
	__executeAI() {
		const player = OAX6.UI.player;
		// If mob is too far from player and hasn't been attacked, it mustn't act (except if it's following a schedule)
		if (!this.world.isInCombat(this) && !this.intent == 'followSchedule') {
			return Timer.delay(1000);	
		}
		let subIntent = this.intent; // While we have a general intent, it may change for this action
		if (this.isPartyMember()){
			//TODO: Fix issue with pathfinding empty routes to player
			if (this.x === player.x && this.y === player.y){
				//TODO: Move to an open space?
				subIntent = 'waitCommand';
			} else if (this.z != player.z){
				subIntent = 'waitCommand';
			} else {
				subIntent = 'seekPlayer';
			}
		} else {
			// Surviving is the most important, so always look for enemies first
			// Note that neutral enemies will by default have no target
			const nearbyTarget = this.getNearbyTarget();
			if (this.isPanicked && nearbyTarget) {
				subIntent = 'flee';
			} else if (nearbyTarget) {
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
		} else if (subIntent === 'followSchedule') {
			return this.followSchedule();
		} else if (subIntent === 'wander') {
			// TODO: Follow schedule
			var dx = Random.num(-1,1);
			var dy = Random.num(-1,1);
			if (dx === 0 && dy === 0){
				dx = 1;
			}
			return this.moveTo(dx, dy);
		} else if (subIntent === 'combat') {
			return this.onCombatTurn().then(() => this.combatAction());
		} else if (subIntent === 'flee') {
			// Find the way out of danger
			return this.fleeAction();
		} else {
			return Timer.delay(1000);
		}
	},
	fleeAction: function () {
		if (this.dead){
			return Promise.resolve();
		}
		const nearbyEnemy = this.getNearbyTarget();
		if (!nearbyEnemy){
			if (Random.chance(50)){
				return this.moveRandomly();
			} else {
				// Do nothing
				this.reportAction("Stand by");
				return Timer.delay(1000);
			}
		} else {
			return this.bumpAwayFrom(nearbyEnemy);
		}
	},
	moveRandomly: function () {
		var dx = Random.num(-1,1);
		var dy = Random.num(-1,1);
		if (dx === 0 && dy === 0){
			dx = 1;
		}
		return this.moveTo(dx, dy);
	},
	combatAction: function () {
		if (this.dead){
			return Promise.resolve();
		}
		const nearbyTarget = this.getNearbyTarget();
		if (!nearbyTarget){
			if (Random.chance(50)){
				return this.moveRandomly();
			} else {
				// Do nothing
				this.reportAction("Stand by");
				return Timer.delay(1000);
			}
		} else {
			const weapon = this.getWeapon();
			if (weapon && 
				weapon.def.range && 
				Geo.flatDist(nearbyTarget.x, nearbyTarget.y, this.x, this.y) <= weapon.def.range &&
				this.world.isLineClear(this.x, this.y, nearbyTarget.x, nearbyTarget.y, this.z)
				) {
				return this.attackToPosition(nearbyTarget.x, nearbyTarget.y);
			} else {
				return this.bumpTowards(nearbyTarget);
			}
		} 
	},
	bumpAwayFrom: function (targetMob) {
		const nextStep = this.world.findPathThruMobs(targetMob, this, this.z, this.alignment);
		let dx = -nextStep.dx;
		let dy = -nextStep.dy;
		if (this.world.canMoveFrom(this.x, this.y, this.z, dx, dy)) {
			return this.bumpOnDirection(dx, dy);
		} else {
			return this.moveRandomly();
		}
	},
	followSchedule: function () {
		this.scheduleCheckTurns--;
		if (this.scheduleCheckTurns > 0) {
			if (!this.scheduleNextActivity) {
				return this.moveRandomly();
			} else {
				return this.gotoNextActivity();
			}
		}
		this.scheduleCheckTurns = 3;
		const nextActivity = this.getDesiredLocationBySchedule();
		// console.log(OAX6.UI.player.world.getHourOfDay() + ', time to '+ nextActivity.id);
		const dist = Geo.flatDist(nextActivity.location.x, nextActivity.location.y, this.x, this.y);
		if (nextActivity.id !== this.lastScheduledActivityId) {
			delete this.lastScheduledActivityId;
		}
		this.scheduleNextActivity = nextActivity;
		if (dist > (nextActivity.actionRadius || 3)) {
			return this.gotoNextActivity();
		} else {
			// We are close enough
			return this.__arrivedAtActivity();
		}
	},
	__arrivedAtActivity: function () {
		const activity = this.scheduleNextActivity;
		delete this.scheduleNextActivity;
		if (activity.action) {
			if (activity.action.once && activity.id === this.lastScheduledActivityId) {
				// If we already did it, then we move randomly
				return this.moveRandomly();		
			}
			this.lastScheduledActivityId = activity.id;
			if (activity.action.type === 'sleep') {
				this.gotoSleep(activity.action.hours)
				return Promise.resolve();
			}
		} else {
			return this.moveRandomly();
		}
	},
	gotoNextActivity: function () {
		if (!this.scheduleNextActivity) {
			return this.moveRandomly();
		}
		if (this.scheduleNextActivity.location.x == this.x &&
			this.scheduleNextActivity.location.y == this.y) {
			return this.__arrivedAtActivity();
		}
		return this.walkTowardsActivity(this.scheduleNextActivity);
	},
	getDesiredLocationBySchedule: function () {
		if (!this.npcDefinition || !this.npcDefinition.schedule) {
			return undefined;
		}
		this.npcDefinition.schedule.sort((a,b) => b.time - a.time); // TODO: Don't do this every time.
		const timeOfDay = OAX6.UI.player.world.getHourOfDay();
		// Get the prior scheduled unit based on timeOfDay, wrapping to the previous day if needed.
		let nextActivity;
		for (let i = 0; i < this.npcDefinition.schedule.length; i++) {
			const activity = this.npcDefinition.schedule[i];
			if (activity.time <= timeOfDay) {
				nextActivity = activity;
				break;
			}
		}
		if (!nextActivity) {
			nextActivity = this.npcDefinition.schedule[0];
		}
		const ret = Object.assign({}, nextActivity);
		ret._c = circular.setSafe();
		return ret;
	},
	walkTowardsActivity: function (activity) {
		const nextStep = this.world.findLongPath(activity.location, this, this.z, this.alignment);
		if (!nextStep) {
			return this.moveRandomly();
		}
		let dx = nextStep.dx;
		let dy = nextStep.dy;
		const door = this.world.getDoorAt(this.x + dx, this.y + dy, this.z);
		if (door && !door.open) {
			if (door.isLocked()) {
				return this.moveRandomly();
			}
			if (door.openDoor(this, false)) {
				return this.bumpOnDirection(dx, dy);
			} else {
				return this.moveRandomly();
			}
		} else {
			return this.bumpOnDirection(dx, dy);
		}
	},
	bumpTowards: function (targetMob) {
		const nextStep = this.world.findPathThruMobs(targetMob, this, this.z, this.alignment);
		let dx = nextStep.dx;
		let dy = nextStep.dy;
		return this.bumpOnDirection(dx, dy);
	},
	bumpOnDirection: function (dx, dy) {
		const mob = this.world.getMobAt(this.x + dx, this.y + dy, this.z);
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
		return Promise.resolve().then(() => {
			if (PlayerStateMachine.state !== PlayerStateMachine.COMBAT){
				return;
			}
			// combatTurnsOver triggers
			if (!this.npcDefinition) {
				return;
			}
			let promise = Promise.resolve();
			this.combatTurns++;
			const combatTurnsOverTriggers = this.__getActiveTriggersByType('combatTurnsOver');
			combatTurnsOverTriggers.forEach(t => {
				if (this.combatTurns >= t.value) {
					promise = promise.then(() => this.executeTriggerActions(t));
				}
			});
			return promise;
		});
	},
	executeTriggerActions: function(trigger) {
		return Promise.resolve().then(() => {
			let p = Promise.resolve();
			trigger.actions.forEach(a => {
				let promiseFunction;
				switch (a.type) {
					case 'console':
						// TODO: Chain this to the promise, must be a function returning a promise, not a promise.
						promiseFunction = new Promise(r => {
							console.log(a.value);
							r();	
						});
						break;
					case 'cutscene':
						promiseFunction = () => OAX6.UI.showScene(a.value);
						break;
					case 'teleportToWorld':
						promiseFunction = Promise.resolve();
						// TODO: Look at the repo history to implement this.
						break;
					case 'endCombat':
						promiseFunction = () => PlayerStateMachine.endCombat();
						break;
					case 'talk':
						// TODO: Chain this to the promise
						Bus.emit('startDialog', {mob: this, dialog: this.npcDefinition.dialog, player: OAX6.UI.player});
						break;
					case 'showMessage':
						promiseFunction = () => OAX6.UI.showMessage(a.value);
						break;
				}
				p = p.then(promiseFunction);
				
			});
			this.flags['trigger_' + trigger.id] = true;
			return p;
		});
	},
	canTrack: function (mob) {
		if (mob.z != this.z) {
			return false;
		}
		if (mob === OAX6.UI.player && this.isPartyMember()) {
			return true;
		}
		// TODO: Use Memory (last known position)
		const dist = Geo.flatDist(mob.x, mob.y, this.x, this.y);
		if (dist > 20) {
			return false;
		}
		// Else trace a line and check no opaque tiles hit
		return this.world.isLineClear(mob.x, mob.y, this.x, this.y, this.z);
	},
	isHostileMob: function(){
		return this.alignment === Constants.Alignments.ENEMY;
	},
	isPartyMember: function(){
		return this == OAX6.UI.player || OAX6.UI.player.party.indexOf(this) !== -1;
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
		const closerMob = this.world.getCloserMobTo(this.x, this.y, this.z, targetAlignment);
		if (closerMob && this.canTrack(closerMob)) {
			return closerMob;
		} else {
			return false;
		}
	},
	deactivate() {
		this.deactivateNext = true;
	},
	activate: function() {
		if (this.dead){
			return;
		}
		if (this.deactivateNext) {
			this.deactivateNext = false;
			return;
		}
		if (this.isTalking || PlayerStateMachine.state === PlayerStateMachine.COMBAT) {
			//TODO: May be check state === DIALOG instead of this.isTalking?
			this.deactivatedDuringDialog = true;
			return;
		}
		if (PlayerStateMachine.state === PlayerStateMachine.COMBAT_SYNC){
			PlayerStateMachine.checkCombatReady();
			return;
		}
		if (OAX6.UI.activeMob == this) {
			return;
		}
		this.executingAction = true;
		this.act().then(()=>{
			this.executingAction = false;
			if (PlayerStateMachine.state === PlayerStateMachine.COMBAT_SYNC){
				PlayerStateMachine.checkCombatReady();
			} 
			if (this.isHostileMob() || this.isPartyMember() || this.intent === 'seekPlayer' || this.scheduleNextActivity){
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
	},
	moveTo: function(dx, dy){
		if (!this.world.canMoveFrom(this.x, this.y, this.z, dx, dy)){
			this.reportAction("Move - Blocked");
			return Timer.delay(500);
		}
		var mob = this.world.getMobAt(this.x + dx, this.y + dy, this.z);
		let blockedByMob = false;
		const specialMovementRules = OAX6.UI.activeMob === this && PlayerStateMachine.state === PlayerStateMachine.WORLD;
		if (mob){
			blockedByMob = true;
			if (specialMovementRules) {
				if (mob.isPartyMember()) {
					// TODO: Autoswap positions
					blockedByMob = false; // Step on mob. Pray nothing bad happens.
				}
			}
		} 
		if (blockedByMob) {
			this.reportAction("Move - Blocked");
			return Timer.delay(specialMovementRules ? 50 : 500);
		}
		const object = this.world.getObjectAt(this.x + dx, this.y + dy, this.z);
		if (object && !object.hidden && object.type == 'Stairs') {
			// Autouse if possible

			return Promise.resolve().then(() => object.use(this, dx, dy))
		}
		// Position changes before the tween to "reserve" the spot
		this.x += dx;
		this.y += dy;
		if (this === OAX6.UI.activeMob){
			OAX6.UI.updateFOV();
		}
		var dir = OAX6.UI.selectDir(dx, dy);
		this.sprite.animations.play('walk_'+dir, OAX6.UI.WALK_FRAME_RATE);
		this.reportAction("Move");

		return OAX6.UI.executeTween(this.sprite, {x: this.sprite.x + dx*16, y: this.sprite.y + dy*16}, OAX6.UI.WALK_DELAY);
	},
	
	/*
	 * Relocates the mob without a tween, for example when the world loads
	 */
	relocate (x, y) {
		this.x = x;
		this.y = y;
		this.sprite.x = this.x * 16;
		this.sprite.y = this.y * 16;
	},
	addItem: function(item) {
		const backpack = this.getBackpack();
		if (!this.getItemAtSlot("rightHand")) {
			this.setItemAtSlot("rightHand", item);
		} else if (backpack && backpack.isContainer()) {
			backpack.addItem(item);
		} else if (!this.getItemAtSlot("leftHand")) {
			this.setItemAtSlot("leftHand", item);
		} else {
			return false;
		}
		item.refreshVisualContainer();
		if (this.currentMobInventoryWindow) {
			this.currentMobInventoryWindow.refresh();
		}
		return true;
	},
	getOnDirection: function(dx, dy) {
		var item = this.world.getItemAt(this.x + dx, this.y + dy, this.z);
		if (item) {
			const pickedQuantity = item.quantity;
			const added = this.addItem(item);
			if (added) {
				this.world.removeItem(item);
				if (item.quantity === 1) {
					this.reportAction("Got a " + item.def.name);  
				} else {
					this.reportAction("Got " + pickedQuantity + " " + item.def.name);  
				}
			} else {
				this.reportAction("Get - Cannot carry!");
			}
		} else {
			this.reportAction("Get - Nothing there!");
		}
	},
	useOnDirection(dx, dy) {
		return this.useInPosition(this.x + dx, this.y + dy, dx, dy);
	},
	useInPosition(x, y, dx, dy) {
		if (!dx) {
			dx = x - this.x;
			dy = y - this.y;
		}
		var door = this.world.getDoorAt(x, y, this.z);
		var object = this.world.getObjectAt(x, y, this.z);
		var item = this.world.getItemAt(x, y, this.z);
		var mob = this.world.getMobAt(x, y, this.z);
		if (mob) {
			return this.useMobInPosition(x, y, mob);
		} else if (door) {
			if (door.isLocked()) {
				OAX6.UI.showMessage("Locked!");
			} else {
				if (door.openDoor(this, false)) {
					if (door.open) {
						OAX6.UI.showMessage("Use - Opened door");
					} else {
						OAX6.UI.showMessage("Use - Closed door");
					}
				}
			}
		} else if (object && !object.hidden) {
			return object.use(this, dx, dy);
		} else if (item) {
			return this.useItemInPosition(x, y, item);
		} else {
			this.reportAction("Use - Nothing there!");
		}
	},
	useMobInPosition(x, y, mob) {
		const mobEffect = mob.definition.useEffect
		if (!mobEffect) {
			OAX6.UI.showMessage("Cannot be used");
			return;
		}
		switch (mobEffect.type) {
			case 'milk':
			this.tryMilk(mob);
			break;
		}
	},
	tryMilk (cow) {
		const bucket = this.findBucket();
		if (!bucket) {
			OAX6.UI.showMessage("You need an empty bucket to milk the cow.");
			return;
		}
		OAX6.UI.showMessage("You milk the cow.");
		bucket.switchItemDefinition('milkBucket');
	},
	findBucket () {
		const emptyBucketDefId = 'emptyBucket';
		let bucket = this.findItemAroundById(emptyBucketDefId);
		if (!bucket) {
			bucket = this.getItemAtSlot("rightHand");
			if (!bucket || bucket.defid != emptyBucketDefId) {
				bucket = undefined;
			}
		}
		if (!bucket) {
			bucket = this.getItemAtSlot("leftHand");
			if (!bucket || bucket.defid != emptyBucketDefId) {
				bucket = undefined;
			}
		}
		return bucket;
	},
	findItemAroundById (id) {
		for (let xx = -1; xx <= 1; xx++) {
			for (let yy = -1; yy <= 1; yy++) {
				const item = this.world.getItemAt(this.x + xx, this.y + yy, this.z);
				if (!item) {
					continue;
				}
				if (item.defid == id) {
					return item;
				}
			}
		}
		return undefined;
	},
	useItemOnDirection(dx, dy, item) {
		return this.useItemInPosition(this.x + dx, this.y + dy, item);
	},
	useItemInPosition(x, y, item) {
		const itemEffect = item.def.effect
		if (!itemEffect) {
			OAX6.UI.showMessage("Cannot be used");
			return;
		}
		const mob = this.world.getMobAt(x, y, this.z);
		// TODO: If there is no mob there, and I used the item in the ground, the active mob should be the target of the action.
		const door = this.world.getDoorAt(x, y, this.z);
		let used = false;
		switch (itemEffect.type) {
			case 'unlockDoor':
				if (door) {
					if (door.isLocked()) {
						if (door.unlock(item)) {
							OAX6.UI.showMessage("Door Unlocked");
							door.openDoor(this, false);
							used = true;
						} else {
							OAX6.UI.showMessage("Wrong key!");
						}
					} else {
						OAX6.UI.showMessage("Door is not locked");
					}
				} else {
					this.reportAction("Use - Nothing there!");
				}
				break;
			case 'recoverHP':
				if (mob) {
					item.recoverHP(mob);
					used = true;
				} else {
					this.reportAction("Use - Noone there!");
				}
				break;
			case 'recoverMP':
				if (mob) {
					item.recoverMP(mob);
					used = true;
				} else {
					this.reportAction("Use - Noone there!");
				}
				break;
			case 'reduceHunger': 
				if (mob) {
					item.recoverHunger(mob);
					used = true;
				} else {
					this.reportAction("Use - Noone there!");
				}
			break;
			case 'playMusic': 
				OAX6.UI.showMessage("Playing " + item.def.name + ', press 1 - 9 to play, ESC to finish.');
				PlayerStateMachine.switchToMusicState(item);
				break;
			case 'toggleLit':
				item.toggleLit();
				OAX6.UI.showMessage('Use - You turn ' + (item.isLit ? 'on' : 'off') + ' the ' + item.def.name + '.');
				used = true;
				break;
		}
		if (used) {
			if (item.def.spendable) {
				item.reduceItemQuantity();
			}
			if (itemEffect.transformTo) {
				item.switchItemDefinition(itemEffect.transformTo);
			}
			item.refreshVisualContainer();
		}
		
	},
	attackToPosition: function(x, y){
		const weapon = this.getWeapon();
		const range = weapon ? (weapon.def.range || 1) : 1;
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
			const ammoInfo = this.getAmmunitionFor(weapon);
			if (!ammoInfo) {
				this.reportAction("Attack - No Ammo.");
				return Promise.resolve(false);
			}
			const ammo = ammoInfo.ammo;
			this.consumeAmmunition(ammoInfo);
			// Here we must check in advance if this attack will trigger the combat mode!
			// We cannot wait til the projectile animation is over!
			var mob = this.world.getMobAt(x, y, this.z);
			if (mob && PlayerStateMachine.state === PlayerStateMachine.WORLD) {
				PlayerStateMachine.startCombat(true);
			}
			return weapon.playProjectileAnimation(ammo, this.x, this.y, x, y).then(()=> {
				if (ammo.def.throwable) {
					this.world.addItem(ammo, x, y, this.z);
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
		const ammoType = weapon.def.usesProjectileType;
		if (ammoType) {
			const backItem = this.getBackpack();
			if (backItem) {
				if (backItem.inventory) {
					const ammo = backItem.inventory.getItemById(ammoType);
					if (ammo) {
						return {
							ammo,
							container: backItem
						};
					}
				} else if (backItem.defid == ammoType) {
					return {
						ammo: backItem,
						slotId: 'back'
					}
				}
			} else {
				const leftItem = this.getItemAtSlot('leftHand');
				if (leftItem && leftItem.defid == ammoType) {
					return {
						ammo: leftItem,
						slotId: 'leftHand'
					}
				}
			}
			return false;
		} else {
			// No ammo, throw the weapon!
			return {
				ammo: weapon,
				slotId: 'rightHand'
			}
		}
	},

	consumeAmmunition: function (ammoInfo) {
		const { slotId, container, ammo } = ammoInfo;
		if (slotId) {
			this.reduceItemQuantityAtSlot(slotId);
		} else if (container) {
			ammo.reduceItemQuantity();
		} else {
			throw new Error("Invalid consumeAmmunition operation."); // Shouldn't happen, ammo can only be on the backpack, or weapon for now
		}
	},

	reduceItemQuantityAtSlot(slotId, variation) {
		variation = variation || 1;
		const item = this.getItemAtSlot(slotId);
		if (item.quantity) {
			if (item.quantity > variation) {
				item.quantity -= variation;
			} else if (item.quantity < variation) {
				throw new Error('Not enough quantity of item ' + item.name + ' to reduce by ' + quantity);
			} else {
				this.removeItemAtSlot(slotId);
			}
		} else {
			this.removeItemAtSlot(slotId);
		}
	},

	attackOnDirection: function(dx, dy){
		return this._attackPosition(this.x + dx, this.y + dy);
	},
	_attackPosition: function(x, y){
		var mob = this.world.getMobAt(x, y, this.z);
		if (mob){
			// Attack!
			OAX6.UI.showIcon(2, mob.x, mob.y);
			return Timer.delay(500)
			.then(()=>{
				OAX6.UI.hideIcon();
				return this.attack(mob);
			});
		} else if (this.world.isSolid(x, y, this.z)) {
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
			//TODO: Should only happen if party member was attacked.
			PlayerStateMachine.startCombat(true);
		}
		if (mob.alignment === Constants.Alignments.NEUTRAL) {
			mob.isPanicked = true;
		}
		if (mob.alignment === Constants.Alignments.NEUTRAL || mob.alignment === this.alignment) {
			if (this.alignment == Constants.Alignments.ENEMY) {
				mob.alignment = Constants.Alignments.PLAYER;
			} else {
				mob.alignment = Constants.Alignments.ENEMY;
			}
		}
		if (mob.isAsleep) {
			mob.wakeUp();
		}
		const weapon = this.getWeapon();
		const armor = mob.getArmor();
		const combinedDamage = this.damage.current + (weapon ? weapon.damage.current : 0);
		const combinedDefense = mob.defense.current + (armor ? armor.defense.current : 0);
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
				const corpse = ItemFactory.createItem({ itemId: this.definition.corpse });
				this.world.removeMob(this);
				this.world.addItem(corpse, this.x, this.y, this.z);
			}
			if (this.isPartyMember()){
				this.checkForGameOver();
				if (this != OAX6.UI.player) {
					OAX6.UI.player.removeFromParty(this);
				}
			}
		}
	},
	climb: function(dz){

	},
	reportAction: function(action){
		if (PlayerStateMachine.state === PlayerStateMachine.COMBAT){
			OAX6.UI.showMessage(this.getBattleDescription()+": "+action);
		} else if (OAX6.UI.activeMob == this){ 
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
		const weapon = this.getWeapon();
		if (weapon){
			desc += " armed with " + weapon.def.name;
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
	isMobOnParty: function(mob){
		return this.party.indexOf(mob) != -1;
	},
	addMobToParty: function(mob){
		if (this.isMobOnParty(mob))
			return;
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
	},
	activateParty() {
		this.party.forEach(m => m.activate());	
	},
	deactivateParty() {
		this.party.forEach(m => m.deactivate());	
	},
	talkWithMob(mob) {
		Bus.emit('startDialog', {mob: mob, dialog: mob.npcDefinition.dialog, player: OAX6.UI.player});
		const dx = Math.sign(mob.x - this.x);
		const dy = Math.sign(mob.y - this.y);
		this.lookAt(dx, dy);
		mob.lookAt(-dx, -dy);
	},
	getContainerId() {
		return "mob" + this._c.uid;
	},
	getItemAtSlot(slotId) {
		return this.bodySlots[slotId];
	},
	setItemAtSlot(slotId, item) {
		this.bodySlots[slotId] = item;
		if (item) {
			item.container = this;
			item.isOnFloor = false;
			item.currentSlotId = slotId;
			delete item.x;
			delete item.y;
			delete item.z;
		}
		// TODO: If there is an item already, put in backpack
	},
	removeItemAtSlot(slotId) {
		const currentItem = this.bodySlots[slotId];
		if (currentItem) {
			currentItem.currentSlotId = false;
		}
		delete this.bodySlots[slotId];
	},
	getWeapon() {
		return this.getItemAtSlot('rightHand');
	},
	setWeapon(item) {
		this.setItemAtSlot('rightHand', item);
	},
	removeWeapon() {
		this.removeItemAtSlot('rightHand');
	},
	getArmor() {
		return this.getItemAtSlot('torso');
	},
	setArmor(item) {
		this.setItemAtSlot('torso', item);
	},
	removeArmor(item) {
		this.removeItemAtSlot('torso');
	},
	getBackpack() {
		return this.getItemAtSlot('back');
	},
	setBackpack(item) {
		this.setItemAtSlot('back', item);
	},
	canReach(item) {
		if (this.x != item.x || this.y != item.y || this.z != item.z) {
			const path = this.world.findPath(this, item, this.z, undefined, true);
			if (path.dx == 0 && path.dy == 0) {
				OAX6.UI.showMessage("Unreachable.");
				return false;
			}
		}
		return true;
	},
	tryDrop(item, position) {
		const worldItem = this.world.getItemAt(position.x, position.y, position.z);
		if (this.x != position.x || this.y != position.y || this.z != position.z) {
			const containerAtTarget = worldItem && worldItem.isContainer();
			const path = this.world.findPath(this, position, this.z, undefined, containerAtTarget);
			if (path.dx == 0 && path.dy == 0) {
				OAX6.UI.showMessage("Unreachable - Cannot Drop");
				return false;
			}
		}
		const mob = this.world.getMobAt(position.x, position.y, position.z);
		if (mob) {
			return mob.addItem(item);
		}
		if (worldItem) {
			if (worldItem.isContainer()) {
				worldItem.addItem(item);
				item.refreshVisualContainer();
				return true;
			} else {
				OAX6.UI.showMessage("Blocked");
				return false;
			}
		}
		this.world.addItem(item, position.x, position.y, this.z);
		return true;
	},
	removeItem(item) {
		if (item.currentSlotId) {
			this.removeItemAtSlot(item.currentSlotId);
			if (this.currentMobInventoryWindow) {
				this.currentMobInventoryWindow.refresh();
			}
		}
	},
	gotoSleep(numberOfHours) {
		this.isAsleep = true;
		this.sprite.animations.play('sleep', 0);
		this.hoursToWakeUp = numberOfHours;
	},
	wakeUp() {
		this.isAsleep = false;
	},
	hourlyWakeupCheck () {
		this.hoursToWakeUp--;
		if (this.hoursToWakeUp < 0) {
			this.wakeUp();
		}
	},
	getSightRange () {
		const hourOfTheDay = OAX6.UI.player.world.getHourOfDay();
		let malus = 0;
		if (hourOfTheDay < 5 || hourOfTheDay > 19) {
			malus = 5;
		} else if (hourOfTheDay < 6 || hourOfTheDay > 18) {
			malus = 4;
		} else if (hourOfTheDay < 7 || hourOfTheDay > 17) {
			malus = 3;
		} 
		return this.baseSightRange - malus;
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