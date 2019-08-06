function initDraggableGroup(draggable, group) {
    draggable.inputEnabled = true;
    draggable.input.enableDrag();
    draggable.origin = new Phaser.Point(draggable.x, draggable.y);
    draggable.events.onDragUpdate.add((obj, pointer, x, y, snapPoint, isFirstUpdate) => {
        if (isFirstUpdate){
            group.startDragPos = new Phaser.Point(group.x, group.y);
            draggable.startDragPos = new Phaser.Point(draggable.x, draggable.y);
        }
        group.x = group.startDragPos.x - draggable.origin.x + x;
        group.y = group.startDragPos.y - draggable.origin.y + y;
        draggable.x = draggable.startDragPos.x;
        draggable.y = draggable.startDragPos.y;
    });
}

module.exports = {
    init: function(game) {
        this.MAX_DISPLAY = 12;
        this.COLUMNS = 4;

        this.game = game;
        this.UI = OAX6.UI;

        this.inventoryGroup = this.game.add.group();
        this.inventoryGroup.x = 180;
        this.inventoryGroup.y = 50;

        this.inventoryBackground = this.game.add.image(0, 0, "inventory");

        initDraggableGroup(this.inventoryBackground, this.inventoryGroup);
        
        this.inventoryGroup.add(this.inventoryBackground);

        this.invSlots = [];
        this.quantityLabels = [];

        var x = 0, y = 0;
        for (var i=0;i<this.MAX_DISPLAY;i++) {
            var invSlot = this.game.add.image(74 + x * 18, 21 + y * 18, 'ui');
            const quantityLabel = this.game.add.bitmapText(84 + x * 18, 28 + y * 18, 'pixeled', '0', 12);
            quantityLabel.visible = false;
            x++;

            this.invSlots.push(invSlot);
            this.quantityLabels.push(quantityLabel);
            this.inventoryGroup.add(invSlot);
            this.inventoryGroup.add(quantityLabel);

            invSlot.inputEnabled = true;
            ((index) => {
                invSlot.events.onInputUp.add((object, pointer, isOver) => {
                    if (this.game.time.time - pointer.timeDown < 300) {
                        this.onItemSelected(index);
                    }
                });
            })(i);
            initDraggableGroup(invSlot, this.inventoryGroup);

            if (x == this.COLUMNS) {
                x = 0;
                y += 1;
            }
        }

        this.weaponSlot = this.game.add.image(21, 52, 'ui');
        this.inventoryGroup.add(this.weaponSlot);
        this.armorSlot = this.game.add.image(53, 20, 'ui');
        this.inventoryGroup.add(this.armorSlot);


        this.cursor = this.game.add.image(0, 0, 'ui');
        this.cursor.frame = 6;
        this.cursorSlot = 0;

        this.scroll = 0;

        this.inventoryGroup.add(this.cursor);

        this.UI.UILayer.add(this.inventoryGroup);

        this.useItemOn = null;

        this.close();
    },

    onItemSelected: function(index) {
        const inventory = this.currentMob.inventory;

        if (!inventory[index]) { return; }

        OAX6.UI.showMessage("Use " + inventory[index].def.name + " on ...");

        const PSM = OAX6.runner.playerStateMachine;
        const appearance = OAX6.AppearanceFactory.getAppearance(inventory[index].def.appearance);
        PSM.setCursor(appearance.tileset, appearance.i);

        this.useItemOn = inventory[index];

        PSM.switchState(OAX6.runner.playerStateMachine.FLOATING_ITEM);

        PSM.clearActionCallback();
        PSM.clearDirectionCallback();
    },

    resetFloatingItem: function() {
        const PSM = OAX6.runner.playerStateMachine;
        this.useItemOn = null;
        PSM.setCursor(null, null);
        PSM.activateInventory();
    },

    moveCursor: function(x, y) {
        var amount = x + y * this.COLUMNS,
            inventory = this.currentMob.inventory,
            scrolled = false;

        this.cursorSlot += amount;

        if (this.cursorSlot >= inventory.length) { this.cursorSlot = inventory.length - 1; }
        if (this.cursorSlot < 0) { this.cursorSlot = 0; }

        while (this.cursorSlot-this.scroll*this.COLUMNS >= this.MAX_DISPLAY) {
            this.scroll += 1;
            scrolled = true;
        }

        while (this.cursorSlot-this.scroll*this.COLUMNS < 0) {
            this.scroll -= 1;
            scrolled = true;
        }

        this.updateCursorPosition();

        if (scrolled) {
            this.updateInventory();
        }
    },

    updateCursorPosition: function() {
        var slot = this.cursorSlot-this.scroll*this.COLUMNS,
            y = 28 + ((slot / this.COLUMNS) << 0) * 18,
            x = 83 + (slot % this.COLUMNS) * 18;

        this.cursor.x = x;
        this.cursor.y = y;
    },

    updateInventory: function(partyMemberIndex) {
        if (partyMemberIndex != undefined) {
            this.currentPartyMemberIndex = partyMemberIndex;
        } else {
            partyMemberIndex = this.currentPartyMemberIndex;
        }
        const mob = partyMemberIndex == 0 ? OAX6.UI.player : OAX6.UI.player.party[partyMemberIndex - 1];
        if (!mob) {
            return false;
        }
        this.currentMob = mob;
        var inventory = mob.inventory,
            start = this.scroll * this.COLUMNS,
            end = start+this.MAX_DISPLAY;

        for (var i=start;i<end;i++) {
            if (inventory[i]) {
                var appearance = OAX6.AppearanceFactory.getAppearance(inventory[i].def.appearance);
                this.invSlots[i-start].loadTexture(appearance.tileset, appearance.i);
                if (inventory[i].quantity !== undefined && inventory[i].quantity > 1){
                  this.quantityLabels[i-start].visible = true;
                  this.quantityLabels[i-start].text = inventory[i].quantity;
                } else {
                  this.quantityLabels[i-start].visible = false;
                }
            } else {
                this.invSlots[i-start].loadTexture('ui', 5);
                this.quantityLabels[i-start].visible = false;
            }
        }
        if (mob.weapon) {
            const appearance = OAX6.AppearanceFactory.getAppearance(mob.weapon.def.appearance);
            this.weaponSlot.loadTexture(appearance.tileset, appearance.i);
            this.weaponSlot.visible = true;
        } else {
            this.weaponSlot.visible = false;
        }
        if (mob.armor) {
            const appearance = OAX6.AppearanceFactory.getAppearance(mob.armor.def.appearance);
            this.armorSlot.loadTexture(appearance.tileset, appearance.i);
            this.armorSlot.visible = true;
        } else {
            this.armorSlot.visible = false;
        }
        this.moveCursor(0, 0);
        return true;
    },

    open: function(partyMemberIndex) {
        const opened = this.updateInventory(partyMemberIndex);
        if (opened) {
            this.inventoryGroup.visible = true;
        }
        return opened;
    },

    close: function() {
        this.cursorSlot = 0;
        this.partyMemberIndex = -1;
        this.inventoryGroup.visible = false;
    },

    isOpen: function() {
        return this.inventoryGroup.visible;
    }
};