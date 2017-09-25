const Bus = require('./Bus');
const log = require('./Debug').log;

const PlayerStateMachine = {
    NOTHING     : 0,
    WORLD       : 1,
    DIALOG      : 2,
    COMBAT      : 3,
    COMBAT_SYNC : 4,

    init: function(game) {
        this.game = game;
        this.cursors = this.game.input.keyboard.createCursorKeys();

        this.state = PlayerStateMachine.WORLD;
        this.actionEnabled = true;

        this.inputDialog = "";
        this.inputTextDelay = Phaser.Timer.SECOND * 0.3;
        this.inputDialogCallback = null; // Call a function when pressing enter instead of allowing normal input
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
			return OAX6.UI.player.moveTo(varx, vary);
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

    updateWorldAction: function() {
    	Promise.resolve()
    	.then(()=>{
			const keyCode = this._inkey();
	    	if (keyCode) {
	    		if (keyCode === Phaser.KeyCode.C){
	            	return this.startCombat();
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
                	OAX6.UI.player.level.actNext();
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
        if (!OAX6.UI.player.level.isMobActive()){
            this._combatStarted();
        }
    },

    _combatStarted: function(){
        // Eventually, the player's "act" function will be called,
        // And action will be enabled.
        this.switchState(PlayerStateMachine.COMBAT);
        OAX6.UI.player.level.actNext();
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
        }
    }
};

module.exports = PlayerStateMachine;