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

            if (x == this.COLUMNS) {
                x = 0;
                y += 1;
            }
        }

        this.cursor = this.game.add.image(0, 0, 'ui');
        this.cursor.frame = 6;
        this.cursorSlot = 0;

        this.scroll = 0;

        this.inventoryGroup.add(this.cursor);

        this.UI.UILayer.add(this.inventoryGroup);

        this.close();
    },

    moveCursor: function(x, y) {
        var amount = x + y * this.COLUMNS,
            inventory = this.UI.player.inventory,
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

    updateInventory: function() {
        var player = OAX6.UI.player,
            inventory = player.inventory,
            start = this.scroll * this.COLUMNS,
            end = start+this.MAX_DISPLAY;

        for (var i=start;i<end;i++) {
            if (inventory[i]) {
                var appearance = inventory[i].appearance;
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

        this.moveCursor(0, 0);
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