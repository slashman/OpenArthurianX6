const Container = require('./Container');

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

/**
 * Represents a window with a mob and its body slots
 */
function MobInventory(game, containerId, mob) {
    this.sizeDef = mob.bodyType ? BODY_TYPES[mob.bodyType] : BODY_TYPES.normal;
    this.slots = this.sizeDef.slots;
    Container.call(this, game, containerId, this.sizeDef.spriteId);
    this.mob = mob;
    this.lastItemSlot = undefined;
    this._initSlots();
}

MobInventory.prototype = Object.create(Container.prototype);

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

    if (this.mob.getItemAtSlot(slotId)) {
        const replacementItem = this.mob.getItemAtSlot(slotId);
        originalContainer.returnItem(replacementItem);
    }
    this.mob.setItemAtSlot(slotId, item);
    this._syncInventoryIcons();
};

module.exports = MobInventory;