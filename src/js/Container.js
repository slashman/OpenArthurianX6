/**
 * Properties definitions for the container sizes
 */
const SIZES = {
    medium: {
        columns: 6,
        rows: 5,
        spriteId: 'containerMedium',
        size: { w: 136, h: 136 },
        itemsGrid: { x: 10, y: 18, w: 20, h: 21, anchorX: 8, anchorY: 8 },
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

    this.items = [];

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
        const x = size.itemsGrid.x + size.itemsGrid.anchorX + size.itemsGrid.w * (i % this.columns),
            y = size.itemsGrid.y + size.itemsGrid.anchorY + size.itemsGrid.h * Math.floor(i / this.columns);

        const item = this.game.add.image(x,y,'ui');
        item.anchor.set(0.5, 0.5);
        item.visible = false;

        this.displayItems.push(item);
        this.group.add(item);
    }
};

Container.prototype._pointInRect = function(point, rect) {
    return !(point.x < rect.x || point.x >= rect.x+rect.w || point.y < rect.y || point.y >= rect.y+rect.h);
};

Container.prototype._updateDragging = function(x, y) {
    if (this.cursor.dragging == DRAGGING_ELEMENTS.CONTAINER) {
        this.group.x = x - this.cursor.dragAnchor.x;
        this.group.y = y - this.cursor.dragAnchor.y;
    }
};

Container.prototype.onMouseDown = function(x, y) {
    this.cursor.x = x - this.group.x;
    this.cursor.y = y - this.group.y;

    if (this.cursor.status == CURSOR_STATUS.DRAGGING) {
        return this._updateDragging(x, y);
    }

    if (this._pointInRect(this.cursor, this.sizeDef.topBar)) {
        this.cursor.status = CURSOR_STATUS.DRAGGING;
        this.cursor.dragging = DRAGGING_ELEMENTS.CONTAINER;
        this.cursor.dragAnchor.x = this.cursor.x;
        this.cursor.dragAnchor.y = this.cursor.y;
        return;
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

Container.prototype.open = function() {
    this.group.visible = true;

    // TODO: Look for empty position to place the container
    this.group.x = 32;
    this.group.y = 32;
};

Container.prototype.close = function() {
    this.group.visible = false;
};

Container.prototype.isOpen = function() {
    return this.group.visible;
};

module.exports = {
    Container: Container,
    SIZES: SIZES
};