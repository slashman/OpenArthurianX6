const Bus = require('./Bus');
const log = require('./Debug').log;
const Timer = require('./Timer');
const Geo = require('./Geo');
const Inventory = require('./Inventory');

const PlayerStateMachine = {
    NOTHING     : 0,
    WORLD       : 1,
    DIALOG      : 2,
    COMBAT      : 3,
    COMBAT_SYNC : 4,
    GET         : 5,
    INVENTORY   : 6,

    init: function(game) {
        this.game = game;
        this.cursors = this.game.input.keyboard.createCursorKeys();

        this.state = PlayerStateMachine.WORLD;
        this.actionEnabled = true;

        this.inventory = [];

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
    	}
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
		if (varx != 0 || vary != 0){
			OAX6.UI.hideMarker(); 
			this.actionEnabled = false;
			return this.player.moveTo(varx, vary);
		} else {
			return false;
		}

    },

    enableAction: function() {
        this.actionEnabled = true;
    },

    switchState: function(stateId) {
        //TODO: Maybe restrict switches, like don't switch to dialog from combat
        this.state = stateId;
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

    clearDirectionCallback: function(cb){
    	this.directionCallback = null;
    },

    setActionCallback: function(cb){
    	this.actionCallback = cb;
    },

    clearActionCallback: function(cb){
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
        if (key.isDown && key.repeats == 1) {
            var keyCode = key.keyCode;

            if (this.inputDialogCallback != null) {
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
    	return new Promise((resolve)=>{
    		this.actionEnabled = false;
    		this.player.reportAction("Attack - Where?");
    		OAX6.UI.hideMarker();
    		OAX6.UI.showIcon(3, OAX6.UI.player.x, OAX6.UI.player.y);
			this.setDirectionCallback((dir) => {
				OAX6.UI.hideIcon();
				this.player.reportAction("Attack - "+Geo.getDirectionName(dir));
				this.clearDirectionCallback();
				Timer.delay(500).then(()=>resolve(dir));
			});
		}).then(dir=>{
			return this.player.attackOnDirection(dir.x, dir.y);
		});
    },
    getCommand: function() {
        // Select a direction
    	return new Promise((resolve)=>{
            this.switchState(PlayerStateMachine.GET);
    		this.actionEnabled = false;
    		this.player.reportAction("Get - Where?");
    		OAX6.UI.hideMarker();
    		OAX6.UI.showIcon(3, this.player.sprite.x, this.player.sprite.y);
			this.setDirectionCallback((dir) => {
				OAX6.UI.hideIcon();
				this.player.reportAction("Get - "+Geo.getDirectionName(dir));
				this.clearDirectionCallback();
				Timer.delay(500).then(()=>resolve(dir));
			});
		}).then(dir=>{
            return this.player.getOnDirection(dir.x, dir.y);
		}).then(()=>{
            this.switchState(PlayerStateMachine.WORLD);
            this.actionEnabled = true;
            OAX6.UI.clearMessage();
        });
    },
    rangedAttackCommand: function(){
    	return new Promise((resolve)=>{
    		this.actionEnabled = false;
    		OAX6.UI.player.reportAction("Attack - Where?");
    		OAX6.UI.hideMarker();
    		let cursor = {
    			x: OAX6.UI.player.x,
    			y: OAX6.UI.player.y
    		};
    		OAX6.UI.showIcon(4, cursor.x, cursor.y);
			this.setDirectionCallback((dir) => {
				cursor.x += dir.x;
				cursor.y += dir.y;
				//TODO: Limit based on player's range
				OAX6.UI.showIcon(4, cursor.x, cursor.y);
			});
			this.setActionCallback(() => {
				this.clearDirectionCallback();
				this.clearActionCallback();
				OAX6.UI.hideIcon();
				resolve(cursor);
			});
		}).then(position=>{
			return OAX6.UI.player.attackToPosition(position.x, position.y);
		});
    },
    activateInventory: function() {
        return new Promise((resolve) => {
            if (Inventory.isOpen()) {
                Inventory.close();
                PlayerStateMachine.switchState(PlayerStateMachine.WORLD);
            } else {
                Inventory.open();
                PlayerStateMachine.switchState(PlayerStateMachine.INVENTORY);
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
	            	return this.startCombat();
				} else if (keyCode === Phaser.KeyCode.A){
	            	return this.attackCommand();
				} else if (keyCode === Phaser.KeyCode.T){
	            	return this.rangedAttackCommand();
				} else if (keyCode === Phaser.KeyCode.G){
	            	return this.getCommand();
				} else if (keyCode === Phaser.KeyCode.I){
	            	return this.activateInventory();
				} 
			}
			return this.checkMovement();
		}).then((acted)=>{ 
			if (acted === false){
				return;
			}
			switch (this.state) {
				case PlayerStateMachine.WORLD:
    				this.enableAction()
                    break;
                case PlayerStateMachine.COMBAT:
                	this.player.level.actNext();
                    break;
            }
		});
    },

    startCombat: function(){
    	OAX6.UI.modeLabel.text = "Combat";
        this.actionEnabled = false;
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
        if (!this.player.level.isMobActive()){
            this._combatStarted();
        }
    },

    _combatStarted: function(){
        // Eventually, the player's "act" function will be called,
        // And action will be enabled.
        this.switchState(PlayerStateMachine.COMBAT);
        this.player.level.actNext();
    },

    updateInventory: function() {
        var keyCode = this._inkey();
        if (keyCode) {
            if (keyCode === Phaser.KeyCode.I){
                this.activateInventory();
            } 
        }
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

            case PlayerStateMachine.INVENTORY:
                this.updateInventory();
                break;
        }
    }
};

module.exports = PlayerStateMachine;