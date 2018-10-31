const Bus = require('./Bus');
const Timer = require('./Timer');
const Geo = require('./Geo');
const Random = require('./Random');
const Inventory = require('./Inventory');
const ItemFactory = require('./ItemFactory');

const PlayerStateMachine = {
    NOTHING     : 0,
    WORLD       : 1,
    DIALOG      : 2,
    COMBAT      : 3,
    COMBAT_SYNC : 4,
    GET         : 5,
    INVENTORY   : 6,
    MESSAGE_BOX : 7,

    init: function(game) {
        this.game = game;
        this.cursors = this.game.input.keyboard.createCursorKeys();

        this.state = PlayerStateMachine.WORLD;
        this.previousState = this.state;
        this.actionEnabled = true;

        PlayerStateMachine.inventory = [];

        this.inputDialog = "";
        this.inputTextDelay = Phaser.Timer.SECOND * 0.3;
        this.inputDialogCallback = null; // Call a function when pressing enter instead of allowing normal input
        this.directionCallback = null;
        this.actionCallback = null;
        this.cursors.up.onDown.add(this.listenDirections, this);
        this.cursors.down.onDown.add(this.listenDirections, this);
        this.cursors.left.onDown.add(this.listenDirections, this);
        this.cursors.right.onDown.add(this.listenDirections, this);
        this.game.input.keyboard.addKey(Phaser.Keyboard.ENTER).onDown.add(this.listenAction, this);
        this.game.input.keyboard.addKey(Phaser.Keyboard.ESC).onDown.add(this.cancelAction, this);
        this.game.input.keyboard.addKey(Phaser.KeyCode.I).onDown.add(this.activateInventory, this);
        this.game.input.keyboard.addKey(Phaser.KeyCode.D).onDown.add(this.dropItem, this);
    },
    listenDirections: function(){
    	if (this.directionCallback){
    		var varx = 0;
			var vary = 0;
			if(this.cursors.up.isDown) {
				vary = -1;
			} else if(this.cursors.down.isDown) {
				vary = 1;
			}
			if(this.cursors.left.isDown) {
				varx = -1;
			} else if(this.cursors.right.isDown) {
				varx = 1;
			}
    		this.directionCallback({x: varx, y: vary});
    	}
    },
	listenAction: function(){
    if (this.actionCallback){
      this.actionCallback();
    } else if (this.directionCallback) {
      // For actions such as pick item in place
      return this.directionCallback({x: 0, y: 0});
    }
  },
  cancelAction: function() {
    this.player.reportAction("Canceled");
    if (this.directionCallback) {
      this.directionCallback(null, true);
    }
    if (this.actionCallback){
      this.actionCallback(true);
    }
        /*if (!this.directionCallback && !this.actionCallback) { return; }

        //this.switchState(this.previousState);
        this.actionEnabled = true;

        this.clearActionCallback();
        this.clearDirectionCallback();

        OAX6.UI.hideIcon();

        this.player.reportAction("Canceled");*/
    },
    checkMovement: function() {
        var varx = 0;
		var vary = 0;
		if(this.cursors.up.isDown) {
			vary = -1;
		} else if(this.cursors.down.isDown) {
			vary = 1;
		}
		if(this.cursors.left.isDown) {
			varx = -1;
		} else if(this.cursors.right.isDown) {
			varx = 1;
		}
		if (varx !== 0 || vary !== 0){
			OAX6.UI.hideMarker(); 
			this.actionEnabled = false;
			const activeMob = OAX6.UI.activeMob || this.player;
			return activeMob.moveTo(varx, vary);
		} else {
			return false;
		}

    },

    enableAction: function() {
        this.actionEnabled = true;
    },

    switchState: function(stateId) {
        //TODO: Maybe restrict switches, like don't switch to dialog from combat
        this.previousState = this.state;
        this.state = stateId;
    },

    resetState: function() {
        this.switchState(this.previousState);
    },

    setInputDialogCallback: function(callback, context) {
        this.inputDialogCallback = callback.bind(context);
    },

    clearInputDialogCallback: function() {
        this.inputDialogCallback = null;
    },

    setDirectionCallback: function(cb){
    	this.directionCallback = cb;
    },

    clearDirectionCallback: function(){
    	this.directionCallback = null;
    },

    setActionCallback: function(cb){
    	this.actionCallback = cb;
    },

    clearActionCallback: function(){
    	this.actionCallback = null;
    },

    _inkey: function(){
		var key = this.game.input.keyboard.lastKey;
        if (key && key.isDown && key.repeats == 1) {
            return key.keyCode;
        } else {
        	return false;
        }
    },

    

    updateDialogAction: function() {
        var key = this.game.input.keyboard.lastKey;
        if (key && key.isDown && key.repeats == 1) {
            var keyCode = key.keyCode;

            if (this.inputDialogCallback !== null) {
            	// TODO: Maybe refactor to not do this on the update cycle, instead have a key listener
                if (keyCode == Phaser.KeyCode.ENTER) {
                    this.inputDialogCallback();
                }

                return;
            }

            if ((keyCode >= Phaser.KeyCode.A && keyCode <= Phaser.KeyCode.Z) || (keyCode >= Phaser.KeyCode.ZERO && keyCode <= Phaser.KeyCode.NINE) || keyCode == Phaser.KeyCode.SPACEBAR) {
                if (this.inputDialog.length < 20) { // Not measured anywhere but why would you put more than 20 characters
                    var keyChar = String.fromCharCode(keyCode);
                    this.inputDialog += (key.shiftKey)? keyChar : keyChar.toLowerCase();
                    Bus.emit('updateDialogInput', this.inputDialog);
                }
            } else if (keyCode == Phaser.KeyCode.BACKSPACE) {
                this.inputDialog = this.inputDialog.substring(0, this.inputDialog.length - 1);
                Bus.emit('updateDialogInput', this.inputDialog);
            } else if (keyCode == Phaser.KeyCode.ENTER) {
                Bus.emit('sendInput', this.inputDialog);
                
                this.inputDialog = '';
                Bus.emit('updateDialogInput', this.inputDialog);
            }
        }
    },
    attackCommand: function(){
    	// Select a direction
    	const activeMob = OAX6.UI.activeMob || this.player;
    	return new Promise((resolve)=>{
    		this.actionEnabled = false;
    		activeMob.reportAction("Attack - Where?");
    		OAX6.UI.hideMarker();
    		OAX6.UI.showIcon(3, activeMob.x, activeMob.y);
			this.setDirectionCallback((dir) => {
				OAX6.UI.hideIcon();
				activeMob.reportAction("Attack - "+Geo.getDirectionName(dir));
				this.clearDirectionCallback();
				Timer.delay(500).then(()=>resolve(dir));
			});
		}).then(dir=>{
			if (dir !== null) {
				return activeMob.attackOnDirection(dir.x, dir.y);
			} else {
				// ??? Is flow controlled?
			}
		});
    },
    getCommand: function() {
        // Select a direction
        const activeMob = OAX6.UI.activeMob || this.player;
    	return new Promise((resolve)=>{
            this.switchState(PlayerStateMachine.GET);
    		this.actionEnabled = false;
    		activeMob.reportAction("Get - Where?");
    		OAX6.UI.hideMarker();
    		OAX6.UI.showIcon(3, activeMob.x, activeMob.y);
			this.setDirectionCallback((dir, canceled) => {
                OAX6.UI.hideIcon();
                this.clearDirectionCallback();

                if (canceled) {
                    return resolve(null);
                }
				
				activeMob.reportAction("Get - "+Geo.getDirectionName(dir));
				Timer.delay(500).then(()=>resolve(dir));
			});
		}).then(dir=>{
            if (dir != null) {
                return activeMob.getOnDirection(dir.x, dir.y);
            }
		}).then(()=>{
            this.switchState(PlayerStateMachine.WORLD);
            this.actionEnabled = true;
        });
    },
    rangedAttackCommand: function(){
    	const activeMob = OAX6.UI.activeMob || this.player;
    	return new Promise((resolve)=>{
    		this.actionEnabled = false;
    		activeMob.reportAction("Attack - Where?");
    		OAX6.UI.hideMarker();
    		let cursor = {
    			x: activeMob.x,
    			y: activeMob.y
    		};
    		OAX6.UI.showIcon(4, cursor.x, cursor.y);
			this.setDirectionCallback((dir, cancelled) => {
        if (cancelled) {
          return;
        }
				cursor.x += dir.x;
				cursor.y += dir.y;
				//TODO: Limit based on mob's range
				OAX6.UI.showIcon(4, cursor.x, cursor.y);
			});
			this.setActionCallback((cancelled) => {
				this.clearDirectionCallback();
				this.clearActionCallback();
				OAX6.UI.hideIcon();
        if (cancelled) {
          resolve(null);
        }
				resolve(cursor);
			});
		}).then(position => {
      if (position !== null) {
        return activeMob.attackToPosition(position.x, position.y).then(done => {
          if (!done) {
            this.actionEnabled = true;
            OAX6.UI.hideIcon();
          };
        });
      } else {
        this.actionEnabled = true;
        OAX6.UI.hideIcon();
        this.player.reportAction("Canceled");
      }
		});
    },
    activateInventory: function() {
        // TODO: Needs to define from where can open the inventory and probably a better way to access it
        if (PlayerStateMachine.state != PlayerStateMachine.WORLD && PlayerStateMachine.state != PlayerStateMachine.INVENTORY) { return; }

        return new Promise((resolve) => {
            if (Inventory.isOpen()) {
                Inventory.close();
                PlayerStateMachine.switchState(PlayerStateMachine.WORLD);
                this.clearDirectionCallback();
            } else {
                Inventory.open();
                PlayerStateMachine.switchState(PlayerStateMachine.INVENTORY);
                this.setDirectionCallback(this.updateInventoryDirection.bind(this));
            }

            resolve(true);
        })
    },
    updateWorldAction: function() {
    	Promise.resolve()
    	.then(()=>{
			const keyCode = this._inkey();
	    	if (keyCode) {
	    		if (keyCode === Phaser.KeyCode.C){
	            	return this.startCombat(true);
				} else if (keyCode === Phaser.KeyCode.A){
	            	return this.attackCommand(); //TODO: Instead of a direction, this should allow targetting based on range (Similar to T)
				} else if (keyCode === Phaser.KeyCode.T){ // Throw
	            	return this.rangedAttackCommand();
				} else if (keyCode === Phaser.KeyCode.G){
	            	return this.getCommand();
				}
            }

			return this.checkMovement();
		}).then((acted)=>{ 
			if (acted === false){
				return;
			}
			switch (this.state) {
				case PlayerStateMachine.WORLD:
				case PlayerStateMachine.DIALOG:
    				this.enableAction();
                    break;
                case PlayerStateMachine.COMBAT:
                	// End combat if no enemies nearby
                	if (this.player.level.isSafeAround(this.player.x, this.player.y, this.player.alignment)){
                		this.switchState(PlayerStateMachine.WORLD);
                		this.player.level.activateAll();
                		OAX6.UI.activeMob = this.player;
                		this.enableAction();
                		OAX6.UI.showMessage("Combat is over!");
                	} else {
                		this.player.level.actNext(); // TODO: Change for this.currentLevel
                	}
                    break;
            }
		});
    },

    startCombat: function(ensurePlayerFirst){
    	OAX6.UI.modeLabel.text = "Combat";
        this.actionEnabled = false;
        this.playerGoesFirst = ensurePlayerFirst || Random.chance(50);
        this.switchState(PlayerStateMachine.COMBAT_SYNC);
        // When the state is switched, all mobs will try to make their last move,
        // Calling "checkCombatReady" after acting
        return 0;
    },

    checkCombatReady: function(){
        // Sync all enemies, make sure they are ready for TBS.
        if (this.state === PlayerStateMachine.COMBAT){
        	return;
        }
        if (!this.player.level.isMobActive()){ // TODO: Change for this.currentLevel
            this._combatStarted();
        }
    },

    _combatStarted: function(){
        // Eventually, the player's "act" function will be called,
        // And action will be enabled.
        this.switchState(PlayerStateMachine.COMBAT);
        this.player.level.sortForCombat(this.playerGoesFirst);
        this.player.level.actNext();
    },

    updateInventoryDirection: function(dir) {
      if (dir !== null) {
        Inventory.moveCursor(dir.x, dir.y);
      }
    },

    dropItem: function() {
        if (PlayerStateMachine.state != PlayerStateMachine.INVENTORY) { return; }

        var item = PlayerStateMachine.inventory[Inventory.cursorSlot];
        if (!item) { return; }

		const activeMob = OAX6.UI.activeMob || this.player;
        // TODO: Show the inventory of the activeMob

        return new Promise((resolve) => {
            activeMob.reportAction("Drop - Where?");
            OAX6.UI.hideMarker();
            OAX6.UI.showIcon(3, activeMob.x, activeMob.y);
            this.clearDirectionCallback();
            this.setDirectionCallback((dir) => {
                OAX6.UI.hideIcon();
                activeMob.reportAction("Drop - "+Geo.getDirectionName(dir));
                this.clearDirectionCallback();
                Timer.delay(500).then(()=>resolve(dir));
            });
        }).then((dir) => {
            activeMob.dropOnDirection(dir.x, dir.y, item);
            Inventory.updateInventory();
            this.setDirectionCallback(this.updateInventoryDirection.bind(this));
        });
    },

    update: function() {
        if (!this.actionEnabled) { return; }

        switch (this.state) {
            case PlayerStateMachine.WORLD:
            case PlayerStateMachine.COMBAT:
                this.updateWorldAction();
                break;

            case PlayerStateMachine.DIALOG:
                this.updateDialogAction();
                break;

            case PlayerStateMachine.MESSAGE_BOX:
                break;
        }
    },

    isPartyDead: function() {
        var partyDead = this.player.party.find(m=>m.hp.current>0) === undefined;

        return this.player.hp.current <= 0 && partyDead;
    },

    allowMobsActing() {
        switch (this.state) {
            case PlayerStateMachine.WORLD:
            case PlayerStateMachine.COMBAT:
            case PlayerStateMachine.COMBAT_SYNC: // Note: Must check if needed.
                return true;
        }
        return false;
    }
};

module.exports = PlayerStateMachine;