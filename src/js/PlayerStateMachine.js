const Bus = require('./Bus');
const Timer = require('./Timer');
const Geo = require('./Geo');
const Random = require('./Random');
const Storage = require('./Storage');
const MobDescription = require('./MobDescription');
const MusicManager = require('./manager/MusicManager.class');


const PlayerStateMachine = {
    NOTHING     : 0,
    WORLD       : 1,
    DIALOG      : 2,
    COMBAT      : 3,
    COMBAT_SYNC : 4,
    TARGETTING  : 5,
    ITEM_TRANSFERRING : 6,
    MESSAGE_BOX : 7,
    FLOATING_ITEM : 8,
    LOOK_BOX    : 9,
    MUSIC       : 10,
    TITLE       : 11,

    init: function(game) {
        this.game = game;
        this.cursors = this.game.input.keyboard.createCursorKeys();

        this.state = PlayerStateMachine.NOTHING;
        this.stateStack = [];
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
        this.game.input.mouse.enabled = true;
        this.game.input.mouse.capture = true;
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
        if (this.state == PlayerStateMachine.ITEM_TRANSFERRING) {
            OAX6.UI.closeAllContainers();
            PlayerStateMachine.resetState();
        } else {
            if (this.directionCallback) {
                this.directionCallback(null, true);
            }
            if (this.actionCallback){
                this.actionCallback(true);
            }
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

        if (this.game.input.activePointer.isDown ) {
            // Should only do this if we didn't click on an item,
            // and consider the dragging delay too.
            if (OAX6.UI.dragStatus == 'idle') {
                const pointer = this.game.input.activePointer;
                const varObj = OAX6.UI.selectQuadrant(pointer.position);
                varx = varObj.x;
                vary = varObj.y;
            }
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
        if (stateId == this.stateStack[this.stateStack.length - 1]) {
            return;
        }
        this.stateStack.push(this.state);
        this.state = stateId;
        OAX6.UI.stateLabel.text = 'State ' + this.state;
    },

    switchToMusicState: function(instrument) {
        this.switchState(PlayerStateMachine.MUSIC);
        this.clearActionCallback(); // TODO: Streamline action and direction callbacks, make them respond to state machine states?
        this.clearDirectionCallback();
        this.__musicManager = new MusicManager(this.game, instrument);
    },

    resetState: function(holdAction) {
        let previousState = this.stateStack.pop();
        if (!previousState) {
            previousState = PlayerStateMachine.NOTHING;
        }
        this.state = previousState;
        OAX6.UI.stateLabel.text = 'State ' + this.state;
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

    updateMessageBoxAction: function() {
        const keyCode = this._inkey();
        if (keyCode == Phaser.KeyCode.SPACEBAR || keyCode == Phaser.KeyCode.ENTER) {
            Bus.emit('nextMessage');
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
            this.resetState();
            if (dir != null) {
                const activeMob = OAX6.UI.activeMob || this.player;
                return activeMob.useOnDirection(dir.x, dir.y);
            }
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

    toggleFullScreen() {
        OAX6.UI.toggleFullScreen();
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
    talkCommand(){
        return this._selectPosition('Talk').then(position => {
            if (position != null) {
                const {x, y} = position;
                if (OAX6.UI.isFOVBlocked(x,y)) {
                    return false;
                }
                const {activeMob} = OAX6.UI;
                const mob = activeMob.level.getMobAt(x, y, activeMob.z);
                if (mob && activeMob.canStartDialog && mob.npcDefinition && mob.npcDefinition.dialog) {
                    // Conversations only work in WORLD state. We assume we come from that state.
                    this.resetState();
                    activeMob.talkWithMob(mob);
                    return true;
                }
                return false;
            } else {
                return false;
            }
        }).then(talked => {
            if (!talked) {
                this.resetState();
            }
        });
    },
    lookCommand(){
        return this._selectPosition('Look').then(position => {
            if (position != null) {
                this.resetState(true);
                PlayerStateMachine.switchState(PlayerStateMachine.LOOK_BOX);
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
        PlayerStateMachine.switchState(PlayerStateMachine.LOOK_BOX);
        this.__lookCommand(position, true);
    },

    __lookCommand(position) {
        const shown = this.__lookAtPosition(position.x, position.y);
        this.__lookCommandAftermath(shown);
    },

    __lookCommandAftermath(shown) {
        if (shown == 'basic') {
            this.setActionCallback(() => {
                this.clearActionCallback();
                MobDescription.hide();
                this.__resetAfterLook();
            });
        } else if (shown == 'book') {
            this.setActionCallback(() => {
                this.clearActionCallback();
                this.clearDirectionCallback();
                OAX6.UI.hideBook();
                this.__resetAfterLook();
            });
            this.setDirectionCallback((dir) => {
                if (dir && dir.x) {
                    OAX6.UI.flipBook(dir.x);
                }
            });
        } else {
            this.__resetAfterLook();
        }
    },

    __resetAfterLook() {
        this.examining = false;
        this.resetState();
        OAX6.UI.hideIcon();
    },

    __lookAtItem(item) {
        this.examining = true;
        if (item.def.isBook) {
            OAX6.UI.readBook(item);
            return 'book';
        } else {
            MobDescription.showItem(item);
            return 'basic';
        }
    },

    __lookAtPosition(x, y) {
        if (OAX6.UI.isFOVBlocked(x,y)) {
            return null;
        }
        const {activeMob} = OAX6.UI;
        const object = activeMob.level.getObjectAt(x, y, activeMob.z);
        if (object) {
            if (object.hidden) {
                object.hidden = false;
                object.reveal();
                OAX6.UI.showMessage("Look - You find a " + object.getDescription());
            } else {
                OAX6.UI.showMessage("Look - You see a " + object.getDescription());
            }
            return 'text';
        }
        const mob = activeMob.level.getMobAt(x, y, activeMob.z);
        if (mob){
            MobDescription.showMob(mob);
            this.examining = true;
            return 'basic';
        }
        var item = activeMob.level.getItemAt(x, y, activeMob.z);
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
        if (partyMemberIndex == undefined) {
            partyMemberIndex = OAX6.UI.getActiveMobIndex();
        }
        return new Promise((resolve) => {
            let mob;
            if (partyMemberIndex == 0) {
                mob = OAX6.UI.player;
            } else {
                mob = OAX6.UI.player.party[partyMemberIndex - 1]
            }
            OAX6.UI.showContainerForMob(mob);
            const opened = true; // TODO: Check cases where inventory cannot be opened?
            if (opened) {
                PlayerStateMachine.switchState(PlayerStateMachine.ITEM_TRANSFERRING);
            }
            resolve(true);
        });
    },
    
    updateTitleAction: function() {
        const keyCode = this._inkey();
        if (keyCode) {
            OAX6.UI.titleScreen.input(keyCode);
        }
    },

    updateWorldAction: function() {
        Promise.resolve()
        .then(()=>{
            const keyCode = this._inkey();
            if (keyCode) {
                if (keyCode === Phaser.KeyCode.C){
                    return this.startCombat(true);
                } else if (keyCode === Phaser.KeyCode.A){
                    return this.attackCommand(); //TODO: Instead of a direction, this should allow targetting based on range (Similar to R)
                } else if (keyCode === Phaser.KeyCode.R) { // Ranged Attack
                    return this.rangedAttackCommand();
                } else if (keyCode === Phaser.KeyCode.T) {
                    return this.talkCommand();
                } else if (keyCode === Phaser.KeyCode.G){
                    return this.getCommand();
                } else if (keyCode === Phaser.KeyCode.S){
                    return this.saveCommand();
                } else if (keyCode === Phaser.KeyCode.U) {
                    return this.useCommand();
                } else if (keyCode === Phaser.KeyCode.L) {
                    return this.lookCommand();
                } else if (keyCode === Phaser.KeyCode.I) {
                    return this.activateInventory();
                } else if (keyCode === Phaser.KeyCode.F) {
                    return this.toggleFullScreen();
                } else if (keyCode >= Phaser.KeyCode.F1 && keyCode <= Phaser.KeyCode.F1 + this.player.party.length) {
                    const partyMemberIndex = keyCode - Phaser.KeyCode.F1;
                    return this.activateInventory(partyMemberIndex);
                } else if (keyCode >= Phaser.KeyCode.ONE && keyCode <= Phaser.KeyCode.ONE + this.player.party.length) {
                    const partyMemberIndex = keyCode - Phaser.KeyCode.ONE;
                    return this.activateSoloMode(partyMemberIndex);
                } else if (keyCode == Phaser.KeyCode.ZERO) {
                    return this.activatePartyMode();
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
            } else if (keyCode === Phaser.KeyCode.L){
                return this.lookAtInventoryItem();
            }
        }

        const UI = OAX6.UI,
            mousePointer = this.game.input.mousePointer;

        if (UI.isDraggingItem()) {
            UI.updateDragItem(mousePointer);
            if (mousePointer.leftButton.isUp) {
                const item = UI.draggingItem.item,
                    originalContainer = UI.draggingItem.container;

                UI.releaseDrag();

                const container = UI.getContainerAtPoint(mousePointer);
                if (container) {
                    container.addItem(item, originalContainer, mousePointer);
                } else {
                    const activeMob = OAX6.UI.activeMob || this.player;
                    const dropped = activeMob.tryDrop(item, UI.getWorldPosition(mousePointer));
                    if (!dropped) {
                        originalContainer.returnItem(item);
                    }
                }
                if (!UI.hasOpenContainers()) {
                    PlayerStateMachine.resetState();
                }
            }
            return;
        }

        const inventory = UI.getContainerAtPoint(mousePointer);
        if (!inventory) { return; }

        if (mousePointer.leftButton.isDown) {
            inventory.bringToTop();
            inventory.onMouseDown(mousePointer);
        } else if (mousePointer.leftButton.isUp) {
            inventory.onMouseUp();
            
            if (!UI.hasOpenContainers()) {
                PlayerStateMachine.resetState();
            }
        }
    },

    updateMusicAction() {
        const keyCode = this._inkey();
        if (keyCode) {
            if (keyCode >= Phaser.KeyCode.ONE && keyCode <= Phaser.KeyCode.NINE){
                return this.__musicManager.playNote(keyCode - Phaser.KeyCode.ONE + 1);
            } else if (keyCode === Phaser.KeyCode.ESC){
                OAX6.UI.showMessage("You stop playing.");
                this.resetState();
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

    dropItem: function() {
        var item = this.selectedItem;
        if (!item) {
            return;
        }
        this.clearActionCallback();
        return this._selectDirection('Drop').then(dir => {
            if (dir !== null) {
                const activeMob = OAX6.UI.activeMob || this.player;
                const previousContainer = item.container;
                previousContainer.removeItem(item);
                const previousMobInventoryWindow = item.currentMobInventoryWindow;
                const dropped = activeMob.tryDrop(item, {x: activeMob.x + dir.x, y: activeMob.y + dir.y });
                if (dropped) {
                    if (previousContainer && previousContainer.currentContainerWindow) {
                        previousContainer.currentContainerWindow.refresh();
                    } else if (previousMobInventoryWindow){
                        previousMobInventoryWindow.refresh();
                    }
                }
                this.selectedItem = false;
            }
            this.resetState();
        });
    },

    lookAtInventoryItem: function() {
        var item = this.selectedItem;
        if (!item) {
            return;
        }
        this.clearActionCallback();
        this.clearDirectionCallback();
        PlayerStateMachine.switchState(PlayerStateMachine.LOOK_BOX);
        const shown = this.__lookAtItem(item);
        this.__lookCommandAftermath(shown);
    },

    useInventoryItem: function() {
        var item = this.selectedItem;
        if (!item) {
            return;
        }
        this.clearActionCallback();
        return this.useItem(OAX6.UI.activeMob, item);
    },

    useItem: function (mob, item) {
        return Promise.resolve()
        .then(() => {
            if (item.def.useOnSelf) {
                return { x: 0, y: 0 };
            } else {
                return this._selectDirection('Use');
            }
        }).then(dir => {
            if (dir !== null) {
                mob.useItemOnDirection(dir.x, dir.y, item);
            }
            if (this.state == PlayerStateMachine.TARGETTING) {
                this.resetState();
            }
        });
    },

    itemClicked: function (item, leftClick, rightClick) {
        if (!this.actionEnabled) { return; }
        const activeMob = OAX6.UI.activeMob || this.player;
        switch (this.state) {
            case PlayerStateMachine.WORLD:
                if (rightClick) {
                    OAX6.PlayerStateMachine.lookMouseCommand({x: item.x, y: item.y}); 
                } else {
                    if (item.isContainer() && activeMob.canReach(item)) {
                        OAX6.UI.showContainerForItem(item);
                        PlayerStateMachine.switchState(PlayerStateMachine.ITEM_TRANSFERRING);
                    }
                }
                break;
            case PlayerStateMachine.ITEM_TRANSFERRING:
                this.selectedItem = item;
                if (item.isContainer() && (item.container != activeMob.level || activeMob.canReach(item))) {
                    OAX6.UI.showContainerForItem(item);
                }
                break;
            default:
                break;

        }
    },

    itemDoubleClicked: function (item, leftClick, rightClick) {
        if (!this.actionEnabled) { return; }
        switch (this.state) {
            case PlayerStateMachine.WORLD: case PlayerStateMachine.ITEM_TRANSFERRING:
                if (leftClick) {
                    this.useItem(OAX6.UI.activeMob, item); // TODO: Who is using it?
                }
                break;
            default:
                break;
        }
    },

    update: function() {
        if (!this.actionEnabled) { return; }

        this.updateCursorPosition();

        switch (this.state) {
            case PlayerStateMachine.TITLE:
                this.updateTitleAction();
                break;
            case PlayerStateMachine.WORLD:
            case PlayerStateMachine.COMBAT:
                this.updateWorldAction();
                break;

            case PlayerStateMachine.DIALOG:
                this.updateDialogAction();
                break;

            case PlayerStateMachine.MESSAGE_BOX:
                this.updateMessageBoxAction();
                break;

            case PlayerStateMachine.ITEM_TRANSFERRING:
                this.updateInventoryAction();
                break;
            case PlayerStateMachine.MUSIC:
                this.updateMusicAction();
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

    clickOnDoor(door) {
        const {activeMob} = OAX6.UI;
        if (this.state == PlayerStateMachine.WORLD) {
            if (!door.inRange(activeMob)) {
                OAX6.UI.showMessage("Too far");
                return;
            }
            activeMob.useInPosition(door.x, door.y);
        } else if (this.state == PlayerStateMachine.FLOATING_ITEM) {
            if (!door.inRange(activeMob)) {
                OAX6.UI.showMessage("Too far");
                Inventory.resetFloatingItem();
                return;
            }
            activeMob.useItemInPosition(door.x, door.y, Inventory.useItemOn);
            Inventory.resetFloatingItem();
        }
    },

    clickOnMob(mob, leftClick, rightClick) {
        if (this.state !== PlayerStateMachine.WORLD && this.state !== PlayerStateMachine.ITEM_TRANSFERRING){
            return;
        }
        if (rightClick) {
            this.lookMouseCommand({x: mob.x, y: mob.y}); 
        } else if (leftClick) {
            if (mob == OAX6.UI.player) {
                this.activateInventory(0);
            } else if (mob.isPartyMember()){
                const partyMemberIndex = OAX6.UI.player.party.indexOf(mob);
                this.activateInventory(partyMemberIndex + 1);
            }
        }
    },

    activateFloatingItem() {
        this.switchState(PlayerStateMachine.FLOATING_ITEM);
        this.clearActionCallback();
        this.clearDirectionCallback();
        this.setActionCallback((cancelled) => {
            if (cancelled) {
                this.clearActionCallback();
                Inventory.resetFloatingItem();
            }
        });
    },

    activateSoloMode(partyMemberIndex) {
        this.soloMode = true;
        this.player.deactivateParty();
        if (partyMemberIndex == 0) {
            OAX6.UI.setActiveMob(OAX6.UI.player);
        } else {
            OAX6.UI.setActiveMob(OAX6.UI.player.party[partyMemberIndex - 1]);
        }
        OAX6.UI.showMessage("Solo Mode activated for " + OAX6.UI.activeMob.getDescription());
        OAX6.UI.updateFOV();
        return Promise.resolve();
    },
    activatePartyMode() {
        this.soloMode = false;
        OAX6.UI.showMessage("Party Mode activated");
        OAX6.UI.setActiveMob(OAX6.UI.player);
        this.player.activateParty();
        OAX6.UI.updateFOV();
    },
    canDragItems() {
        return this.state == PlayerStateMachine.WORLD || this.state == PlayerStateMachine.ITEM_TRANSFERRING;
    }
};

module.exports = PlayerStateMachine;