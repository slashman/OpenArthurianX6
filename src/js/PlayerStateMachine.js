const Bus = require('./Bus');
const Timer = require('./Timer');
const Geo = require('./Geo');
const Random = require('./Random');
const Inventory = require('./Inventory');
const ItemFactory = require('./ItemFactory');
const Storage = require('./Storage');
const MobDescription = require('./MobDescription');

const MAX_PARTY_SIZE = 3;

const PlayerStateMachine = {
    NOTHING     : 0,
    WORLD       : 1,
    DIALOG      : 2,
    COMBAT      : 3,
    COMBAT_SYNC : 4,
    TARGETTING  : 5,
    INVENTORY   : 6,
    MESSAGE_BOX : 7,

    init: function(game) {
        this.game = game;
        this.cursors = this.game.input.keyboard.createCursorKeys();

        this.state = PlayerStateMachine.WORLD;
        this.previousState = this.state;
        this.actionEnabled = true;

        PlayerStateMachine.inventory = [];

        this.cursorSprite = this.game.add.sprite(0, 0, 'ui');
        this.cursorSprite.visible = false;
        OAX6.UI.UILayer.add(this.cursorSprite);

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
    },
    setCursor: function(tileset, frame) {
        this.cursorSprite.loadTexture(tileset, frame);
        this.cursorSprite.visible = true;
    },
    updateCursorPosition: function() {
        this.cursorSprite.position.set(this.game.input.activePointer.x, this.game.input.activePointer.y);
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
        if (this.directionCallback) {
            this.directionCallback(null, true);
        }
        if (this.actionCallback){
            this.actionCallback(true);
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

    resetState: function(holdAction) {
        this.switchState(this.previousState);
        if (!holdAction) {
            this.actionEnabled = true;
        }
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
        return this._selectDirection('Attack').then(dir => {
            if (dir !== null) {
                const activeMob = OAX6.UI.activeMob || this.player;
                return activeMob.attackOnDirection(dir.x, dir.y);
            } else {
                // ??? Is flow controlled?
            }
        }).then(()=>{
            this.resetState();
        });
    },

    getCommand: function() {
        return this._selectDirection('Get').then(dir => {
            if (dir != null) {
                const activeMob = OAX6.UI.activeMob || this.player;
                return activeMob.getOnDirection(dir.x, dir.y);
            }
        }).then(()=>{
            this.resetState();
        });
    },

    /**
     * Uses things in the world.
     */
    useCommand: function() {
        return this._selectDirection('Use').then(dir=>{
            if (dir != null) {
                const activeMob = OAX6.UI.activeMob || this.player;
                return activeMob.useOnDirection(dir.x, dir.y);
            }
        }).then(()=>{
            this.resetState();
        });
    },

    /**
     * Utility function to set the UI in "Select direction" mode,
     * resolves to a fiven direction, or null if the player cancelled.
     *
     * Other user actions make use of this to implement specific logic
     */
    _selectDirection(verb) {
        const activeMob = OAX6.UI.activeMob || this.player;
        return new Promise((resolve)=>{
            this.switchState(PlayerStateMachine.TARGETTING);
            this.actionEnabled = false;
            activeMob.reportAction(verb + " - Where?");
            OAX6.UI.hideMarker();
            OAX6.UI.showIcon(3, activeMob.x, activeMob.y);
            this.setDirectionCallback((dir, cancelled) => {
                OAX6.UI.hideIcon();
                this.clearDirectionCallback();
                if (cancelled) {
                    return resolve(null);
                }
                activeMob.reportAction(verb + " - " + Geo.getDirectionName(dir));
                Timer.delay(500).then(()=>resolve(dir));
            });
        });
    },

    _selectPosition(verb) {
        const activeMob = OAX6.UI.activeMob || this.player;
        return new Promise((resolve)=>{
            this.switchState(PlayerStateMachine.TARGETTING);
            this.actionEnabled = false;
            activeMob.reportAction(verb + " - Where?");
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
        });
    },

    /**
     * Saves the game
     */
    saveCommand() {
        const activeMob = OAX6.UI.activeMob || this.player;
        return Promise.resolve()
        .then(()=>{
            this.switchState(PlayerStateMachine.NOTHING);
            this.actionEnabled = false;
            OAX6.UI.showMessage("Saving Game...");
            return Storage.saveGame(this.player);
        }).then(()=>{
            OAX6.UI.showMessage("Game Saved.");
            this.resetState();
        });
    },

    rangedAttackCommand: function(){
        const activeMob = OAX6.UI.activeMob || this.player;
        return this._selectPosition('Attack').then(position => {
            if (position !== null) {
                return activeMob.attackToPosition(position.x, position.y).then(done => {
                    if (!done) {
                        this.resetState();
                        OAX6.UI.hideIcon();
                    }
                });
            } else {
                this.resetState();
                OAX6.UI.hideIcon();
                this.player.reportAction("Canceled");
            }
        });
    },

    lookCommand(){
        return this._selectPosition('Look').then(position => {
            if (position != null) {
                this.__lookCommand(position, false);
            } else {
                this.__resetAfterLook(false);
            }
        });
    },
    lookMouseCommand(position) {
        // Only works in WORLD state
        if (this.state !== PlayerStateMachine.WORLD) {
            return;
        }
        // Only one thing can be examined at a time
        if (this.examining) {
            return;
        }
        this.actionEnabled = false;
        this.__lookCommand(position, true);
    },

    __lookCommand(position, mouse) {
        const shown = this.__lookAtPosition(position.x, position.y);
        if (shown == 'basic') {
            this.setActionCallback(() => {
                this.clearActionCallback();
                MobDescription.hide();
                this.__resetAfterLook(mouse);
            });
        } else if (shown == 'book') {
            this.setActionCallback(() => {
                this.clearActionCallback();
                this.clearDirectionCallback();
                OAX6.UI.hideBook();
                this.__resetAfterLook(mouse);
            });
            this.setDirectionCallback((dir) => {
                if (dir && dir.x) {
                    OAX6.UI.flipBook(dir.x);
                }
            });
        } else {
            this.__resetAfterLook(mouse);
        }
    },

    __resetAfterLook(mouse) {
        this.examining = false;
        if (mouse) {
            this.actionEnabled = true;
        } else {
            this.resetState();
            OAX6.UI.hideIcon();
        }
    },

    __lookAtPosition(x, y) {
        if (OAX6.UI.isFOVBlocked(x,y)) {
            return null;
        }
        const mob = this.player.level.getMobAt(x, y);
        if (mob){
            MobDescription.showMob(mob);
            this.examining = true;
            return 'basic';
        }
        var item = this.player.level.getItemAt(x, y);
        if (item) {
            this.examining = true;
            if (item.def.isBook) {
                OAX6.UI.readBook(item);
                return 'book';
            } else {
                MobDescription.showItem(item);
                return 'basic';
            }
        }
        return null;
    },

    activateInventory: function(partyMemberIndex) {
        // TODO: Note that this will support being called with a different index
        return new Promise((resolve) => {
            const opened = Inventory.open(partyMemberIndex);
            if (opened) {
                PlayerStateMachine.switchState(PlayerStateMachine.INVENTORY);
                this.__activateInventoryCallbacks();
            }
            resolve(true);
        });
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
                } else if (keyCode === Phaser.KeyCode.S){
                    return this.saveCommand();
                } else if (keyCode === Phaser.KeyCode.U) {
                    return this.useCommand();
                } else if (keyCode === Phaser.KeyCode.L) {
                    return this.lookCommand();
                } else if (keyCode === Phaser.KeyCode.I) {
                    return this.activateInventory(0);
                } else if (keyCode >= Phaser.KeyCode.ONE && keyCode <= Phaser.KeyCode.ONE + MAX_PARTY_SIZE) {
                    const partyMemberIndex = keyCode - Phaser.KeyCode.ONE;
                    return this.activateInventory(partyMemberIndex);
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
                        this.endCombat();
                        OAX6.UI.showMessage("Combat is over!");
                    } else {
                        this.player.level.actNext(); // TODO: Change for this.currentLevel
                    }
                    break;
            }
        });
    },

    updateInventoryAction() {
        const keyCode = this._inkey();
        if (keyCode) {
            if (keyCode === Phaser.KeyCode.D){
                return this.dropItem();
            } else if (keyCode === Phaser.KeyCode.U){
                return this.useInventoryItem();
            }
        }
    },


    startCombat: function(ensurePlayerFirst){
        OAX6.UI.modeLabel.text = 'Combat';
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

    /*
     * Whenever combat ends, we need to make sure the actors are back
     * into the "real time" mode and the UI is given back to the player
     * to control.
     */
    endCombat: function () {
        if (this.state !== PlayerStateMachine.COMBAT){
            return;
        }
        OAX6.UI.modeLabel.text = 'Exploration';
        this.switchState(PlayerStateMachine.WORLD);
        this.player.level.activateAll();
        OAX6.UI.activeMob = this.player;
        this.enableAction();
    },

    updateInventoryDirection: function(dir, cancelled) {
        if (cancelled) {
            Inventory.close();
            PlayerStateMachine.switchState(PlayerStateMachine.WORLD);
            this.clearDirectionCallback();
        }
        if (dir !== null) {
            Inventory.moveCursor(dir.x, dir.y);
        }
    },

    dropItem: function() {
        var item = Inventory.currentMob.inventory[Inventory.cursorSlot];
        if (!item) {
            return;
        }
        this.clearActionCallback();
        return this._selectDirection('Drop').then(dir => {
            if (dir !== null) {
                Inventory.currentMob.dropOnDirection(dir.x, dir.y, item);
                Inventory.updateInventory();
            }
            this.resetState();
            this.__activateInventoryCallbacks();
        });
    },

    useInventoryItem: function() {
        var item = Inventory.currentMob.inventory[Inventory.cursorSlot];
        if (!item) {
            return;
        }
        this.clearActionCallback();
        return this._selectDirection('Use').then(dir => {
            if (dir !== null) {
                Inventory.currentMob.useItemOnDirection(dir.x, dir.y, item);
            }
            this.resetState();
            this.__activateInventoryCallbacks();
        });
    },

    __activateInventoryCallbacks() {
        this.setActionCallback((cancelled) => {
            this.clearActionCallback();
            this.clearDirectionCallback();
            Inventory.close();
            PlayerStateMachine.switchState(PlayerStateMachine.WORLD); // TODO: Reset state instead?
        });
        this.setDirectionCallback(this.updateInventoryDirection.bind(this));
    },

    update: function() {
        if (!this.actionEnabled) { return; }

        this.updateCursorPosition();

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

            case PlayerStateMachine.INVENTORY:
                this.updateInventoryAction();
                break;
        }
    },

    isPartyDead: function() {
        var partyDead = this.player.party.find(m=>m.hp.current>0) === undefined;

        return this.player.hp.current <= 0 && partyDead;
    },

    getPartyBoundingBox: function() {
        const player = this.player;
        const party = ([player]).concat(player.party);

        let bbox = { x1: Infinity, y1: Infinity, x2: -Infinity, y2: -Infinity };

        party.forEach((mob) => {
            bbox.x1 = Math.min(bbox.x1, mob.x);
            bbox.y1 = Math.min(bbox.y1, mob.y);
            bbox.x2 = Math.max(bbox.x2, mob.x);
            bbox.y2 = Math.max(bbox.y2, mob.y);
        });

        return bbox;
    },

    allowMobsActing() {
        switch (this.state) {
            case PlayerStateMachine.WORLD:
            case PlayerStateMachine.COMBAT:
            case PlayerStateMachine.COMBAT_SYNC: // Note: Must check if needed.
                return true;
        }
        return false;
    },

    allowConversation() {
        switch (this.state) {
            case PlayerStateMachine.WORLD:
                return true;
        }
        return false;
    },

    openDoor(door) {
        if (!door.inRange(this.player)) {
            OAX6.UI.showMessage("Too far");
            return;
        }

        if (door.isLocked()) {
            if (Inventory.useItemOn) {
                if (!door.unlock(Inventory.useItemOn)) {
                    OAX6.UI.showMessage("Wrong key!");
                    return;
                }
            } else {
                OAX6.UI.showMessage("The door is locked!");
                return;
            }
        }

        door.openDoor(this.player, this.player.level); 
        Inventory.useCursorItem();
    }
};

module.exports = PlayerStateMachine;