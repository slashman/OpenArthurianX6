const Timer = require('../Timer');
const DoubleTapBehavior = require('./DoubleTapBehavior');

/**
 * Properties definitions for the container sizes
 */
const SIZES = {
    medium: {
        columns: 6,
        rows: 5,
        containerCapacity: 40,
        spriteId: 'containerMedium',
        size: { w: 136, h: 136 },
        itemsGrid: { x: 10, y: 23, w: 116, h: 96, slotW: 16, slotH: 16, marginR: 4, marginB: 4 },
        topBar: { x: 0, y: 0, w: 136, h: 14 },
        closeButton: { x: 125, y: 3, w: 8, h: 7 }
    }
};

const CURSOR_STATUS = {
    IDLE: 0,
    DRAGGING: 1,
    RELEASED: 2,
    DELAY: 3 // Waiting to see if this is a click or a drag
};

/**
 * Represents an items container, it could be the player inventory,
 * the loot of a corpse or the content of a barrel
 */
function Container(game, containerId, inventory, sizeDef) {
    this.game = game;
    this.UI = OAX6.UI;
    this.id = containerId;

    this.sizeDef = sizeDef;

    this.columns = sizeDef.columns;
    this.rows = sizeDef.rows;
    this.containerCapacity = sizeDef.containerCapacity;
    this.length = this.columns * this.rows;

    this.sprite = this.game.add.image(0, 0, sizeDef.spriteId);

    this.group = this.game.add.group();
    this.group.add(this.sprite);

    this.sprite.inputEnabled = true;
	this.sprite.events.onInputDown.add(() => {});

    this.inventory = inventory;
    inventory.currentContainerWindow = this;

    const downArrow = this.game.add.sprite(104, 128, 'ui', 9, this.fovBlockLayer);
    const upArrow = this.game.add.sprite(104 + 16, 128, 'ui', 10, this.fovBlockLayer);
    downArrow.anchor.set(0.5);
    upArrow.anchor.set(0.5);

    downArrow.inputEnabled = true;
    upArrow.inputEnabled = true;

    downArrow.events.onInputDown.add(() => this.scrollDown());
    upArrow.events.onInputDown.add(() => this.scrollUp());

    this.group.add(downArrow);
    this.group.add(upArrow);

    this.cursor = {
        x: 0,
        y: 0,
        status: CURSOR_STATUS.IDLE,
        dragAnchor: { x: 0, y: 0 }
    };

    this._initItemsGrid();
    
    this.UI.UILayer.add(this.group);

    this.scroll = 0;
    this.maxScroll = Math.ceil(this.containerCapacity / this.columns);

    this.close();
}

Container.prototype._initItemsGrid = function() {
    const size = this.sizeDef;

    this.displayItems = [];

    for (let i = 0; i < this.length; i++) {
        const cellX = size.itemsGrid.slotW + size.itemsGrid.marginR,
            cellY = size.itemsGrid.slotH + size.itemsGrid.marginB,

            x = size.itemsGrid.x + size.itemsGrid.slotW/2 + cellX * (i % this.columns),
            y = size.itemsGrid.y + size.itemsGrid.slotH/2 + cellY * Math.floor(i / this.columns);

        const itemSprite = this.game.add.image(x,y,'ui');
        itemSprite.anchor.set(0.5, 0.5);
        itemSprite.visible = false;

        const tx = size.itemsGrid.x + size.itemsGrid.slotW + cellX * (i % this.columns),
            ty = size.itemsGrid.y + size.itemsGrid.slotH + cellY * Math.floor(i / this.columns);

        const quantityLabel = this.game.add.bitmapText(tx, ty, 'pixeled', '0', 12);
        quantityLabel.anchor.set(1.0, 0.7);
        quantityLabel.anchor.visible = false;

        this.displayItems.push({
            itemSprite,
            quantityLabel
        });
        this.group.add(itemSprite);
        this.group.add(quantityLabel);
    }
};

Container.prototype._syncInventoryIcons = function() {
    const start = this.scroll * this.columns;
    for (let i = start; i < start + this.length; i++) {
        const displayItem = this.displayItems[i - start];
        const inventoryItems = this.inventory.items;
        if (inventoryItems[i]) {
            const item = inventoryItems[i];
            const appearance = inventoryItems[i].getAppearance();
            displayItem.itemSprite.loadTexture(appearance.tileset, appearance.i);
            displayItem.itemSprite.visible = true;
            if (displayItem.doubleTapBehavior) {
                displayItem.doubleTapBehavior.reset(displayItem.itemSprite, (l, r) => item.clicked(l, r), (l, r) => item.doubleClicked(l, r));
            } else {
                displayItem.doubleTapBehavior = new DoubleTapBehavior(displayItem.itemSprite, (l, r) => item.clicked(l, r), (l, r) => item.doubleClicked(l, r));
            }
            if (inventoryItems[i].quantity !== undefined && inventoryItems[i].quantity > 1){
                displayItem.quantityLabel.visible = true;
                displayItem.quantityLabel.text = inventoryItems[i].quantity;
            } else {
                displayItem.quantityLabel.visible = false;
            }
        } else {
            displayItem.itemSprite.visible = false;
            displayItem.quantityLabel.visible = false;
            displayItem.itemSprite.inputEnabled = false;
            if (displayItem.doubleTapBehavior) {
                displayItem.doubleTapBehavior.destroy();
                delete displayItem.doubleTapBehavior;
            }
        }
    }
};

Container.prototype._pointInRect = function(point, rect) {
    return !(point.x < rect.x || point.x >= rect.x+rect.w || point.y < rect.y || point.y >= rect.y+rect.h);
};

Container.prototype._getItemIndexAtPoint = function(point) {
    if (!this._pointInRect(point, this.sizeDef.itemsGrid)) { return null; }

    const itemsGrid = this.sizeDef.itemsGrid,
        w = itemsGrid.slotW + itemsGrid.marginR,
        h = itemsGrid.slotH + itemsGrid.marginB,
        dx = (point.x - itemsGrid.x) % w,
        dy = (point.y - itemsGrid.y) % h;

    if (dx >= itemsGrid.slotW || dy >= itemsGrid.slotH) { return null; }

    const index = Math.floor((point.x - itemsGrid.x) / w) + Math.floor((point.y - itemsGrid.y) / h) * this.sizeDef.columns;

    return index;
};

Container.prototype._updateDragging = function(mousePointer) {
    if (this.cursor.status == CURSOR_STATUS.DRAGGING) {
        const x = mousePointer.x - this.cursor.dragAnchor.x,
            y = mousePointer.y - this.cursor.dragAnchor.y;

        this.group.x = x;
        this.group.y = y;
    }
};

Container.prototype.onMouseDown = function(mousePointer) {
    this.cursor.x = mousePointer.x - this.group.x;
    this.cursor.y = mousePointer.y - this.group.y;

    if (this.cursor.status == CURSOR_STATUS.DRAGGING) {
        return this._updateDragging(mousePointer);
    }

    if (this.cursor.status == CURSOR_STATUS.DELAY) {
        return;
    }

    this.cursor.status = CURSOR_STATUS.DELAY;

    if (this._pointInRect(this.cursor, this.sizeDef.topBar)) {
        // Click on top bar, no dragging delay since it cannot be clicked.
        this.__startDragging(mousePointer);
    } else {
        // Introduce dragging delay
        Timer.delay(100).then(() => {
            this.__startDragging(mousePointer);
        });
    }
};

Container.prototype.__startDragging = function(mousePointer) {
    if (!mousePointer.leftButton.isDown) {
        // No dragging, just clicking
        this.cursor.status = CURSOR_STATUS.IDLE;
        return;
    }
    if (this._pointInRect(this.cursor, this.sizeDef.topBar)) {
        this.cursor.status = CURSOR_STATUS.DRAGGING;
        this.cursor.dragAnchor.x = this.cursor.x;
        this.cursor.dragAnchor.y = this.cursor.y;

        this.UI.dragElement(this);
        
        return;
    } else {
        const index = this._getItemIndexAtPoint(this.cursor),
            item = this.inventory.items[index];

        if (item) {
            this.inventory.removeItem(item);
            this._syncInventoryIcons();

            this.UI.dragItem(item, this);
        }
    }
    
    this.cursor.status = CURSOR_STATUS.IDLE;
};

Container.prototype.onMouseUp = function() {
    if (this.cursor.status === CURSOR_STATUS.RELEASED) { return; }

    this.cursor.status = CURSOR_STATUS.RELEASED;

    if (this.UI.draggingElement === this) {
        this.UI.releaseDrag();
    }

    if (this._pointInRect(this.cursor, this.sizeDef.closeButton)) {
        return this.close();
    }
};

Container.prototype.isMouseOver = function(mousePointer) {
    const mx = mousePointer.x,
        my = mousePointer.y;

    return !(mx < this.group.x || my < this.group.y || mx >= this.group.x+this.sizeDef.size.w || my >= this.group.y+this.sizeDef.size.h);
};

Container.prototype.returnItem = function(item) {
    this.inventory.addItem(item);
    this._syncInventoryIcons();
};

Container.prototype.addItem = function(item) {
    this.inventory.addItem(item);
    this._syncInventoryIcons();
};

Container.prototype.open = function() {
    if (this.isOpen()) {
        return;
    }
    this.group.visible = true;

    this._syncInventoryIcons();

    this.UI.addContainer(this);
};

Container.prototype.close = function() {
    this.group.visible = false;
    this.UI.removeContainer(this);
    // TODO: Destroy the group
};

Container.prototype.isOpen = function() {
    return this.group.visible;
};

Container.prototype.bringToTop = function() {
    this.UI.UILayer.bringToTop(this.group);
}

Container.prototype.scrollDown = function() {
    this.scroll++;
    if (this.scroll > this.maxScroll) {
        this.scroll = this.maxScroll;
    }
    this._syncInventoryIcons();
}

Container.prototype.scrollUp = function() {
    this.scroll--;
    if (this.scroll < 0) {
        this.scroll = 0;
    }
    this._syncInventoryIcons();
}

module.exports = {
    Container: Container,
    SIZES: SIZES
};