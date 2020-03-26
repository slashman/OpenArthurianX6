const Timer = require('../Timer');
const DoubleTapBehavior = require('./DoubleTapBehavior');

const CURSOR_STATUS = {
    IDLE: 0,
    DRAGGING: 1,
    RELEASED: 2,
    DELAY: 3 // Waiting to see if this is a click or a drag
};

/**
 * Represents an abstract items container, it could be the player inventory,
 * the loot of a corpse or the content of a barrel.
 */
function Container(game, containerId, backgroundSpriteId) {
    this.game = game;
    this.UI = OAX6.UI;
    this.id = containerId;
    this.sprite = this.game.add.image(0, 0, backgroundSpriteId);

    this.group = this.game.add.group();
    this.group.add(this.sprite);
    this.group.visible = false;

    this.sprite.inputEnabled = true;
	this.sprite.events.onInputDown.add(() => {});

    this.cursor = {
        x: 0,
        y: 0,
        status: CURSOR_STATUS.IDLE,
        dragAnchor: { x: 0, y: 0 }
    };

    this.marker = this.game.add.sprite(0, 0, 'ui', 0, this.group);
    this.marker.visible = false;
    this.marker.anchor.set(0.5);

    this.UI.UILayer.add(this.group);
}

Container.prototype.hideMarker = function () {
    this.marker.visible = false;
};

Container.prototype.__setupDisplayItem = function(displayItem, item) {
    const appearance = item.getAppearance();
    displayItem.itemSprite.loadTexture(appearance.tileset, appearance.i);
    displayItem.itemSprite.visible = true;
    const clickCallback = (l, r) => {
        OAX6.UI.hideAllMarkersOnContainers();
        this.marker.x = displayItem.itemSprite.x;
        this.marker.y = displayItem.itemSprite.y;
        this.marker.visible = true;
        item.clicked(l, r);
    }
    const doubleClickCallback = (l, r) => item.doubleClicked(l, r);
    if (displayItem.doubleTapBehavior) {
        displayItem.doubleTapBehavior.reset(displayItem.itemSprite, clickCallback, doubleClickCallback);
    } else {
        displayItem.doubleTapBehavior = new DoubleTapBehavior(displayItem.itemSprite, clickCallback, doubleClickCallback);
    }
    if (item.quantity !== undefined && item.quantity > 1){
        displayItem.quantityLabel.visible = true;
        displayItem.quantityLabel.text = item.quantity;
    } else {
        displayItem.quantityLabel.visible = false;
    }
};

Container.prototype.__resetDisplayItem = function(displayItem) {
    displayItem.itemSprite.visible = false;
    displayItem.quantityLabel.visible = false;
    displayItem.itemSprite.inputEnabled = false;
    if (displayItem.doubleTapBehavior) {
        displayItem.doubleTapBehavior.destroy();
        delete displayItem.doubleTapBehavior;
    }
}

Container.prototype._pointInRect = function(point, rect) {
    return !(point.x < rect.x || point.x >= rect.x+rect.w || point.y < rect.y || point.y >= rect.y+rect.h);
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

    if (this.sizeDef.topBar && this._pointInRect(this.cursor, this.sizeDef.topBar)) {
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
    if (!this.isCursorOnItem() && (!this.sizeDef.topBar || this._pointInRect(this.cursor, this.sizeDef.topBar))) {
        this.cursor.status = CURSOR_STATUS.DRAGGING;
        this.cursor.dragAnchor.x = this.cursor.x;
        this.cursor.dragAnchor.y = this.cursor.y;
        this.UI.dragElement(this);
        return;
    } else {
        this.__startDraggingItem()
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

/**
 * Used when the item list was modified externally
 */
Container.prototype.refresh = function() {
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
    if (this.marker.visible) {
        OAX6.PlayerStateMachine.selectedItem = false;
    }
    // TODO: Destroy the group
};

Container.prototype.isOpen = function() {
    return this.group.visible;
};

Container.prototype.bringToTop = function() {
    this.UI.UILayer.bringToTop(this.group);
}

module.exports = Container;