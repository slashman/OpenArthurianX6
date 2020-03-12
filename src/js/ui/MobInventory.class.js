const Timer = require('../Timer');
const DoubleTapBehavior = require('./DoubleTapBehavior');

const BODY_TYPES = {
    normal: {
        slots: [
            {
                id: 'head',
                x: 64 - 8,
                y: 24
            },
            {
                id: 'torso',
                x: 32 - 8,
                y: 32
            },
            {
                id: 'back',
                x: 96 - 8,
                y: 32
            },
            {
                id: 'leftHand',
                x: 32 - 8,
                y: 64
            },
            {
                id: 'rightHand',
                x: 96 - 8,
                y: 64
            }
        ],
        spriteId: 'mobContainer',
        size: { w: 136, h: 136 },
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
 * Represents a window with a mob and its body slots
 */
function MobInventory(game, containerId, mob) {
    this.game = game;
    this.UI = OAX6.UI;
    this.id = containerId;
    this.mob = mob;

    this.sizeDef = mob.bodyType ? BODY_TYPES[mob.bodyType] : BODY_TYPES.normal;
    this.slots = this.sizeDef.slots;
    this.sprite = this.game.add.image(0, 0, this.sizeDef.spriteId);

    this.group = this.game.add.group();
    this.group.add(this.sprite);

    this.sprite.inputEnabled = true;
	this.sprite.events.onInputDown.add(() => {});

    this.cursor = {
        x: 0,
        y: 0,
        status: CURSOR_STATUS.IDLE,
        dragAnchor: { x: 0, y: 0 }
    };

    this.lastItemSlot = undefined;

    this._initSlots();
    
    this.UI.UILayer.add(this.group);

    this.close();
}

MobInventory.prototype._initSlots = function() {
    this.displayItems = {};
    this.slots.forEach(slot => {
        x = slot.x;
        y = slot.y;
        const slotSprite = this.game.add.sprite(x, y, 'ui', 7);
        const itemSprite = this.game.add.image(x,y,'ui');
        itemSprite.visible = false;
        const quantityLabel = this.game.add.bitmapText(x + 8, y + 8, 'pixeled', '0', 12);
        quantityLabel.anchor.visible = false;
        this.displayItems[slot.id] = {
            itemSprite,
            quantityLabel
        };
        this.group.add(slotSprite);
        this.group.add(itemSprite);
        this.group.add(quantityLabel);
    });
};

MobInventory.prototype.refresh = function() {
    this._syncInventoryIcons();
}

MobInventory.prototype._syncInventoryIcons = function() {
    Object.keys(this.displayItems).forEach(key => {
        const displayItem = this.displayItems[key];
        const item = this.mob.getItemAtSlot(key);
        if (item) {
            item.currentMobInventoryWindow = this;
            const appearance = item.getAppearance();
            displayItem.itemSprite.loadTexture(appearance.tileset, appearance.i);
            displayItem.itemSprite.visible = true;

            if (displayItem.doubleTapBehavior) {
                displayItem.doubleTapBehavior.reset(displayItem.itemSprite, (l, r) => item.clicked(l, r), (l, r) => item.doubleClicked(l, r));
            } else {
                displayItem.doubleTapBehavior = new DoubleTapBehavior(displayItem.itemSprite, (l, r) => item.clicked(l, r), (l, r) => item.doubleClicked(l, r));
            }

            if (item.quantity !== undefined && item.quantity > 1){
                displayItem.quantityLabel.visible = true;
                displayItem.quantityLabel.text = item.quantity;
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
    });
};

MobInventory.prototype._pointInRect = function(point, rect) {
    return !(point.x < rect.x || point.x >= rect.x+rect.w || point.y < rect.y || point.y >= rect.y+rect.h);
};

MobInventory.prototype._getSlotIdAtPoint = function(point) {
    // TODO: Check vs popup boundaries
    const x = point.x;
    const y = point.y;
    const slot = this.slots.find(slot => {
        if (x >= slot.x && x <= slot.x + 16 && y >= slot.y && y <= slot.y + 16) {
            return true;
        }
    });
    if (slot) {
        return slot.id;
    } else {
        return null;
    }
};

MobInventory.prototype._updateDragging = function(mousePointer) {
    if (this.cursor.status == CURSOR_STATUS.DRAGGING) {
        const x = mousePointer.x - this.cursor.dragAnchor.x,
            y = mousePointer.y - this.cursor.dragAnchor.y;

        this.group.x = x;
        this.group.y = y;
    }
};

MobInventory.prototype.onMouseDown = function(mousePointer) {
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

MobInventory.prototype.__startDragging = function(mousePointer) {
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
        const slotId = this._getSlotIdAtPoint(this.cursor),
            item = this.mob.getItemAtSlot(slotId);

        if (item) {
            this.mob.removeItemAtSlot(slotId);
            this.lastItemSlot = slotId;
            this._syncInventoryIcons();

            this.UI.dragItem(item, this);
        }
    }
    
    this.cursor.status = CURSOR_STATUS.IDLE;
};

MobInventory.prototype.onMouseUp = function() {
    if (this.cursor.status === CURSOR_STATUS.RELEASED) { return; }

    this.cursor.status = CURSOR_STATUS.RELEASED;

    if (this.UI.draggingElement === this) {
        this.UI.releaseDrag();
    }

    if (this._pointInRect(this.cursor, this.sizeDef.closeButton)) {
        return this.close();
    }
};

MobInventory.prototype.isMouseOver = function(mousePointer) {
    const mx = mousePointer.x,
        my = mousePointer.y;

    return !(mx < this.group.x || my < this.group.y || mx >= this.group.x+this.sizeDef.size.w || my >= this.group.y+this.sizeDef.size.h);
};

MobInventory.prototype.returnItem = function(item) {
    this.mob.setItemAtSlot(this.lastItemSlot, item);
    this._syncInventoryIcons();
};

MobInventory.prototype.addItem = function(item, originalContainer, mousePointer) {
    this.cursor.x = mousePointer.x - this.group.x;
    this.cursor.y = mousePointer.y - this.group.y;

    const slotId = this._getSlotIdAtPoint(this.cursor);

    if (slotId == null) {
        return originalContainer.returnItem(item);
    }

    if (this.mob.getItemAtSlot(slotId)) {
        const replacementItem = this.mob.getItemAtSlot(slotId);
        originalContainer.returnItem(replacementItem);
    }
    this.mob.setItemAtSlot(slotId, item);
    this._syncInventoryIcons();
};

MobInventory.prototype.open = function() {
    if (this.isOpen()) {
        return;
    }
    this.group.visible = true;

    this._syncInventoryIcons();

    this.UI.addContainer(this);
};

MobInventory.prototype.close = function() {
    this.group.visible = false;
    this.UI.removeContainer(this);
    // TODO: Destroy the group
};

MobInventory.prototype.isOpen = function() {
    return this.group.visible;
};

MobInventory.prototype.bringToTop = function() {
    this.UI.UILayer.bringToTop(this.group);
}

module.exports = MobInventory;