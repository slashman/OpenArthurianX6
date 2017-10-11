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
        
        this.inventoryGroup.add(this.inventoryBackground);

        this.invSlots = [];
        var x = 0, y = 0;
        for (var i=0;i<this.MAX_DISPLAY;i++) {
            var invSlot = this.game.add.image(74 + (x++ * 18), 21 + (y * 18), 'ui');

            this.invSlots.push(invSlot);
            this.inventoryGroup.add(invSlot);

            if (x == this.COLUMNS) {
                x = 0;
                y += 1;
            }
        }

        this.cursor = this.game.add.image(0, 0, 'ui');
        this.cursor.frame = 6;
        this.cursorSlot = 0;

        this.inventoryGroup.add(this.cursor);

        this.UI.UILayer.add(this.inventoryGroup);

        this.close();
    },

    moveCursor: function(x, y) {
        var amount = x + y * 5,
            inventory = this.UI.player.inventory;

        this.cursorSlot += amount;

        if (this.cursorSlot >= inventory.length) { this.cursorSlot = inventory.length - 1; }
        if (this.cursorSlot < 0) { this.cursorSlot = 0; }

        this.updateCursorPosition();
    },

    updateCursorPosition: function() {
        var y = 28 + ((this.cursorSlot / this.COLUMNS) << 0) * 18,
            x = 83 + (this.cursorSlot % this.COLUMNS) * 18;

        this.cursor.x = x;
        this.cursor.y = y;
    },

    updateInventory: function() {
        var player = OAX6.UI.player,
            inventory = player.inventory;

        for (var i=0;i<this.MAX_DISPLAY;i++) {
            if (inventory[i]) {
                var appearance = inventory[i].appearance;
                this.invSlots[i].loadTexture(appearance.tileset, appearance.i);
            } else {
                this.invSlots[i].loadTexture('ui', 5);
            }
        }

        this.updateCursorPosition();
    },

    open: function() {
        this.inventoryGroup.visible = true;

        this.updateInventory();
    },

    close: function() {
        this.cursorSlot = 0;
        this.inventoryGroup.visible = false;
    },

    isOpen: function() {
        return this.inventoryGroup.visible;
    }
};