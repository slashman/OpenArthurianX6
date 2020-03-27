const Container = require('./Container');

const BODY_TYPES = {
    normal: {
        slots: [
            {
                id: 'head',
                x: 35,
                y: 23
            },
            {
                id: 'torso',
                x: 15,
                y: 27
            },
            {
                id: 'back',
                x: 57,
                y: 27
            },
            {
                id: 'leftHand',
                x: 59,
                y: 50
            },
            {
                id: 'rightHand',
                x: 13,
                y: 50
            }
        ],
        spriteId: 'mobContainer',
        size: { w: 70, h: 84 },
        closeButton: { x: 57, y: 0, w: 13, h: 13 }
    }
};

/**
 * Represents a window with a mob and its body slots
 */
function MobInventory(game, parent, containerId, mob) {
    this.sizeDef = mob.bodyType ? BODY_TYPES[mob.bodyType] : BODY_TYPES.normal;
    this.slots = this.sizeDef.slots;
    Container.call(this, game, parent, containerId, this.sizeDef.spriteId);
    mob.currentMobInventoryWindow = this;
    this.mob = mob;
    this.lastItemSlot = undefined;
    this._initSlots();
    this.marker.bringToTop();
}

MobInventory.prototype = Object.create(Container.prototype);

MobInventory.prototype._initSlots = function() {
    this.displayItems = {};
    this.slots.forEach(slot => {
        x = slot.x;
        y = slot.y;
        const slotSprite = this.game.add.sprite(x, y, 'ui', 7);
        slotSprite.anchor.set(0.5);
        const itemSprite = this.game.add.image(x,y,'ui');
        itemSprite.anchor.set(0.5);
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

MobInventory.prototype._syncInventoryIcons = function() {
    this.marker.visible = false;
    Object.keys(this.displayItems).forEach(key => {
        const displayItem = this.displayItems[key];
        const item = this.mob.getItemAtSlot(key);
        if (item) {
            item.currentMobInventoryWindow = this;
            this.__setupDisplayItem(displayItem, item);
        } else {
            this.__resetDisplayItem(displayItem);
        }
    });
};

MobInventory.prototype._getSlotIdAtPoint = function(point) {
    // TODO: Check vs popup boundaries
    const x = point.x;
    const y = point.y;
    const slot = this.slots.find(slot => {
        if (x >= slot.x - 8 && x <= slot.x + 8 && y >= slot.y - 8 && y <= slot.y + 8) {
            return true;
        }
    });
    if (slot) {
        return slot.id;
    } else {
        return null;
    }
};

MobInventory.prototype.isCursorOnItem = function () {
    const slotId = this._getSlotIdAtPoint(this.cursor);
    const item = this.mob.getItemAtSlot(slotId);
    if (item) {
        return true;
    } else {
        return false;
    }
};

MobInventory.prototype.__startDraggingItem = function() {
    const slotId = this._getSlotIdAtPoint(this.cursor),
        item = this.mob.getItemAtSlot(slotId);

    if (item) {
        this.mob.removeItemAtSlot(slotId);
        this.lastItemSlot = slotId;
        this._syncInventoryIcons();
        this.UI.dragItem(item, this);
    }
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

    const replacementItem = this.mob.getItemAtSlot(slotId);
    if (replacementItem) {
        if (originalContainer.isLevelContainer || replacementItem.isContainer()) {
            return originalContainer.returnItem(item);
        } else {
            // Swap
            originalContainer.returnItem(replacementItem); // We are not really returning an item here, we are adding it!
        }
    }
    this.mob.setItemAtSlot(slotId, item);
    this._syncInventoryIcons();
};

MobInventory.prototype.close = function() {
    delete this.mob.currentMobInventoryWindow;
    Object.keys(this.displayItems).forEach(key => {
        const item = this.mob.getItemAtSlot(key);
        if (item) {
            delete item.currentMobInventoryWindow;
        }
    });
    Container.prototype.close.call(this);
}

module.exports = MobInventory;