const INVENTORY_SLOTS = {x: 74, y: 21, w: 18, h: 18};

module.exports = {
    init: function(game) {
        this.COLUMNS = 4;
        this.ROWS = 3;
        this.MAX_DISPLAY = this.COLUMNS * this.ROWS;

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
            var invSlot = this.game.add.image(INVENTORY_SLOTS.x + x * INVENTORY_SLOTS.w, INVENTORY_SLOTS.y + y * INVENTORY_SLOTS.h, 'ui');
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

        this.mouseDown = false;
        this.drag = {
            item: null,
            sprite: this.game.add.image(-100, -100, 'ui'),
            anchor: {x: 0, y: 0},
            slot: -1,
            dropSlot: 0
        };

        this.inventoryGroup.add(this.cursor);

        this.UI.UILayer.add(this.inventoryGroup);
        this.UI.UILayer.add(this.drag.sprite);

        this.close();
    },

    moveCursor: function(x, y) {
        var amount = x + y * this.COLUMNS,
            inventory = this.UI.player.inventory,
            scrolled = false,
            dir = Math.sign(amount),
            prevSlot = this.cursorSlot,
            item = null;

        this.cursorSlot += amount;
        item = inventory[this.cursorSlot];

        while (item == null) {
            this.cursorSlot += dir;
            item = inventory[this.cursorSlot];

            if (this.cursorSlot >= inventory.length || this.cursorSlot < 0) { 
                this.cursorSlot = prevSlot; 
                break;
            }
        }

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

    updateDragItem: function(x, y) {
        if (this.drag.item == null) { return; }

        this.drag.sprite.x = x - this.drag.anchor.x;
        this.drag.sprite.y = y - this.drag.anchor.y;
    },

    hideDragCursor: function() {
        this.drag.sprite.x = -100;
        this.drag.sprite.y = -100;
        this.drag.item = null;
    },

    replaceDragItems: function() {
        if (this.drag.slot == -1) { return; }

        if (this.drag.slot != this.drag.dropSlot) { 
            var player = OAX6.UI.player,
                helper = null;

            if (player.inventory[this.drag.dropSlot]) {
                helper = player.inventory[this.drag.dropSlot];
            }
                
            player.inventory[this.drag.dropSlot] = this.drag.item;
            player.inventory[this.drag.slot] = helper;
        }

        this.drag.item = null;
        this.drag.slot = -1;

        this.updateInventory(); 
        this.hideDragCursor();
    },

    onMouseDown: function(x, y) {
        var invX = (x - this.inventoryGroup.x - INVENTORY_SLOTS.x),
            invY = (y - this.inventoryGroup.y - INVENTORY_SLOTS.y),
            clientX = Math.floor(invX / INVENTORY_SLOTS.w),
            clientY = Math.floor(invY / INVENTORY_SLOTS.h);
        
        if (clientX < 0 || clientX >= this.COLUMNS || clientY < 0 || clientY >= this.ROWS) { 
            return; 
        }
            
        this.cursorSlot = clientX + (clientY + this.scroll) * this.COLUMNS;

        this.drag.anchor.x = invX - clientX * INVENTORY_SLOTS.w;
        this.drag.anchor.y = invY - clientY * INVENTORY_SLOTS.h;
        this.drag.dropSlot = this.cursorSlot;

        this.updateDragItem(x, y);
        this.updateCursorPosition();

        if (this.mouseDown) { return; }

        var player = OAX6.UI.player,
            item = player.inventory[this.cursorSlot];

        if (item) {
            var appearance = item.appearance;

            this.drag.item = item;
            this.drag.sprite.loadTexture(appearance.tileset, appearance.i);
            this.drag.slot = this.cursorSlot;

            this.invSlots[this.cursorSlot].loadTexture('ui', 5);
            this.quantityLabels[this.cursorSlot].visible = false;
        } else {
            this.hideDragCursor();
        }
        
        this.mouseDown = true;
    },

    onMouseUp: function() {
        if (this.mouseDown) {
            this.mouseDown = false;
            this.replaceDragItems();
        }
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