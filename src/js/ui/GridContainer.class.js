const Container = require('./Container');

const SIZES = {
    medium: {
        columns: 6,
        rows: 5,
        containerCapacity: 40,
        spriteId: 'containerMedium',
        size: { w: 136, h: 136 },
        itemsGrid: { x: 10, y: 23, w: 116, h: 96, slotW: 16, slotH: 16, marginR: 4, marginB: 4 },
        topBar: { x: 0, y: 0, w: 136, h: 14 },
        closeButton: { x: 125, y: 3, w: 8, h: 7 },
        scrollUpButton: {x: 120, y: 128},
        scrollDownButton: {x: 104, y: 128}
    },
    backpack: {
        columns: 4,
        rows: 2,
        containerCapacity: 40, // ??
        spriteId: 'backpackContainer',
        size: { w: 111, h: 101 },
        itemsGrid: { x: 22, y: 36, w: 72, h: 40, slotW: 16, slotH: 16, marginR: 3, marginB: 3 },
        closeButton: { x: 0, y: 27, w: 16, h: 16 },
        scrollUpButton: {x: 75, y: 89 },
        scrollDownButton: {x: 86, y: 89}
    }
};

function GridContainer(game, parent, containerId, containerItem, sizeDef) {
    Container.call(this, game, parent, containerId, sizeDef.spriteId);
    this.containerItem = containerItem;
    this.inventory = containerItem.inventory;
    this.inventory.currentContainerWindow = this;
    this.sizeDef = sizeDef;
    this.columns = sizeDef.columns;
    this.rows = sizeDef.rows;
    this.containerCapacity = sizeDef.containerCapacity;
    this.length = this.columns * this.rows;

    const downArrow = this.game.add.sprite(sizeDef.scrollDownButton.x, sizeDef.scrollDownButton.y, 'ui', 9, this.fovBlockLayer);
    const upArrow = this.game.add.sprite(sizeDef.scrollUpButton.x, sizeDef.scrollUpButton.y, 'ui', 10, this.fovBlockLayer);
    downArrow.anchor.set(0.5);
    upArrow.anchor.set(0.5);
    downArrow.inputEnabled = true;
    upArrow.inputEnabled = true;
    downArrow.events.onInputDown.add(() => this.scrollDown());
    upArrow.events.onInputDown.add(() => this.scrollUp());
    this.group.add(downArrow);
    this.group.add(upArrow);
    this.scroll = 0;
    this.maxScroll = Math.ceil(this.containerCapacity / this.columns);

    this._initItemsGrid();

}

GridContainer.prototype = Object.create(Container.prototype);

GridContainer.prototype._initItemsGrid = function() {
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

GridContainer.prototype.isCursorOnItem = function () {
    const index = this._getItemIndexAtPoint(this.cursor);
    const item = this.inventory.items[index];
    if (item) {
        return true;
    } else {
        return false;
    }
};

GridContainer.prototype.__startDraggingItem = function () {
    const index = this._getItemIndexAtPoint(this.cursor),
        item = this.inventory.items[index];

    if (item) {
        this.inventory.removeItem(item);
        this._syncInventoryIcons();
        this.UI.dragItem(item, this);
    }
}

GridContainer.prototype._getItemIndexAtPoint = function(point) {
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

GridContainer.prototype.returnItem = function(item) {
    this.inventory.addItem(item);
    this._syncInventoryIcons();
};

GridContainer.prototype.scrollDown = function() {
    this.scroll++;
    if (this.scroll > this.maxScroll) {
        this.scroll = this.maxScroll;
    }
    this._syncInventoryIcons();
}

GridContainer.prototype.scrollUp = function() {
    this.scroll--;
    if (this.scroll < 0) {
        this.scroll = 0;
    }
    this._syncInventoryIcons();
}

GridContainer.prototype.addItem = function(item, originalContainer) {
    if (this.containerItem.addItem(item)) {
        this._syncInventoryIcons();
    } else {
        originalContainer.returnItem(item);
    }
};

GridContainer.prototype._syncInventoryIcons = function() {
    this.marker.visible = false;
    const start = this.scroll * this.columns;
    for (let i = start; i < start + this.length; i++) {
        const displayItem = this.displayItems[i - start];
        const inventoryItems = this.inventory.items;
        if (inventoryItems[i]) {
            const item = inventoryItems[i];
            this.__setupDisplayItem(displayItem, item);
        } else {
            this.__resetDisplayItem(displayItem);
        }
    }
};

GridContainer.prototype.close = function() {
    delete this.inventory.currentContainerWindow;
    Container.prototype.close.call(this);
}

module.exports = {
    GridContainer: GridContainer,
    SIZES: SIZES
};