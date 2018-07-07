/**
 * Properties definitions for the container sizes
 */
const SIZES = {
    medium: {
        columns: 6,
        rows: 5,
        spriteId: 'containerMedium',
        size: { w: 136, h: 136 },
        itemsGrid: { x: 10, y: 23, w: 116, h: 96, slotW: 16, slotH: 16, marginR: 4, marginB: 4 },
        topBar: { x: 0, y: 0, w: 136, h: 14 },
        closeButton: { x: 125, y: 3, w: 8, h: 7 }
    }
};

const CURSOR_STATUS = {
    IDDLE: 0,
    DRAGGING: 1,
    RELEASED: 2
};

const DRAGGING_ELEMENTS = {
    NONE: 0,
    CONTAINER: 1
};

/**
 * Represents a items container, it could be the player inventory,
 * the loot of a corpse or the content of a barrel
 */
function Container(game, sizeDef) {
    this.game = game;
    this.UI = OAX6.UI;

    this.sizeDef = sizeDef;

    this.columns = sizeDef.columns;
    this.rows = sizeDef.rows;
    this.length = this.columns * this.rows;

    this.sprite = this.game.add.image(0, 0, sizeDef.spriteId);

    this.group = this.game.add.group();
    this.group.add(this.sprite);

    this.inventory = [];

    this.cursor = {
        x: 0,
        y: 0,
        status: CURSOR_STATUS.IDDLE,
        dragging: DRAGGING_ELEMENTS.NONE,
        dragAnchor: { x: 0, y: 0 }
    };

    this._initItemsGrid();
    
    this.UI.UILayer.add(this.group);

    this.close();
}

Container.prototype._initItemsGrid = function() {
    const size = this.sizeDef;

    this.displayItems = [];

    for (let i=0;i<this.length;i++) {
        const cellX = size.itemsGrid.slotW + size.itemsGrid.marginR,
            cellY = size.itemsGrid.slotH + size.itemsGrid.marginB,

            x = size.itemsGrid.x + size.itemsGrid.slotW/2 + cellX * (i % this.columns),
            y = size.itemsGrid.y + size.itemsGrid.slotH/2 + cellY * Math.floor(i / this.columns);

        const item = this.game.add.image(x,y,'ui');
        item.anchor.set(0.5, 0.5);
        item.visible = false;

        const tx = size.itemsGrid.x + size.itemsGrid.slotW + cellX * (i % this.columns),
            ty = size.itemsGrid.y + size.itemsGrid.slotH + cellY * Math.floor(i / this.columns);

        const quantityLabel = this.game.add.bitmapText(tx, ty, 'pixeled', '0', 12);
        quantityLabel.anchor.set(1.0, 0.7);
        quantityLabel.anchor.visible = false;

        this.displayItems.push({
            item: item,
            quantityLabel: quantityLabel
        });
        this.group.add(item);
        this.group.add(quantityLabel);
    }
};

Container.prototype._syncInventoryIcons = function() {
    for (let i=0;i<this.length;i++) {
        if (this.inventory[i]) {
            const appearance = this.inventory[i].appearance,
                displayItem = this.displayItems[i];

            displayItem.item.loadTexture(appearance.tileset, appearance.i);
            displayItem.item.visible = true;

            if (this.inventory[i].quantity !== undefined && this.inventory[i].quantity > 1){
                displayItem.quantityLabel.visible = true;
                displayItem.quantityLabel.text = this.inventory[i].quantity;
            } else {
                displayItem.quantityLabel.visible = false;
            }
        } else {
            this.displayItems[i].item.visible = false;
            this.displayItems[i].quantityLabel.visible = false;
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
    if (this.cursor.dragging == DRAGGING_ELEMENTS.CONTAINER) {
        const width = this.game.width - this.sizeDef.size.w,
            height = this.game.height - this.sizeDef.size.h;
            
        const x = Math.min(Math.max(mousePointer.x - this.cursor.dragAnchor.x, 0), width),
            y = Math.min(Math.max(mousePointer.y - this.cursor.dragAnchor.y, 0), height);

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

    if (this._pointInRect(this.cursor, this.sizeDef.topBar)) {
        this.cursor.status = CURSOR_STATUS.DRAGGING;
        this.cursor.dragging = DRAGGING_ELEMENTS.CONTAINER;
        this.cursor.dragAnchor.x = this.cursor.x;
        this.cursor.dragAnchor.y = this.cursor.y;
        return;
    } else {
        const index = this._getItemIndexAtPoint(this.cursor),
            item = this.inventory[index];

        if (item) {
            this.inventory[index] = null;
            this._syncInventoryIcons();
        }
    }
    
    this.cursor.status = CURSOR_STATUS.IDDLE;
};

Container.prototype.onMouseUp = function() {
    if (this.cursor.status === CURSOR_STATUS.RELEASED) { return; }

    this.cursor.status = CURSOR_STATUS.RELEASED;
    this.cursor.dragging = DRAGGING_ELEMENTS.NONE;

    if (this._pointInRect(this.cursor, this.sizeDef.closeButton)) {
        return this.close();
    }
};

Container.prototype.isMouseOver = function(mousePointer) {
    const mx = mousePointer.x,
        my = mousePointer.y;

    return !(mx < this.group.x || my < this.group.y || mx >= this.group.x+this.sizeDef.size.w || my >= this.group.y+this.sizeDef.size.h);
};

Container.prototype.open = function() {
    this.group.visible = true;

    // TODO: Look for empty position to place the container
    this.group.x = 32;
    this.group.y = 32;

    this._syncInventoryIcons();

    this.UI.addContainer(this);
};

Container.prototype.close = function() {
    this.group.visible = false;
    this.UI.removeContainer(this);
};

Container.prototype.isOpen = function() {
    return this.group.visible;
};

Container.prototype.bringToTop = function() {
    this.UI.UILayer.bringToTop(this.group);
}

module.exports = {
    Container: Container,
    SIZES: SIZES
};