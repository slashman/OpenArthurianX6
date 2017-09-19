const Bus = require('./Bus');

const PlayerStateMachine = {
    NOTHING     : 0,
    WORLD       : 1,
    DIALOG      : 2,

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
			if (OAX6.UI.player.moveTo(varx, vary)) {
				this.actionEnabled = false;
				OAX6.Timer.set(OAX6.UI.WALK_DELAY+20, this.enableAction, this)
			}
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
        this.checkMovement();
    },

    update: function() {
        if (!this.actionEnabled) { return; }

        switch (this.state) {
            case PlayerStateMachine.WORLD:
                this.updateWorldAction();
                break;

            case PlayerStateMachine.DIALOG:
                this.updateDialogAction();
                break;
        }
    }
};

module.exports = PlayerStateMachine;