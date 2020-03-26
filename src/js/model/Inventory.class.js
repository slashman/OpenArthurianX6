const circular = require('circular-functions');

function Inventory () {
    this.items = [];
    this._c = circular.register('Inventory');
}

circular.registerClass('Inventory', Inventory);

Inventory.prototype = {
    addItem: function(item) {
        item.container = this;
        if (item.def.stackLimit) {
            const existingItem = this.items.find(i => i.defid === item.defid);
            if (existingItem) {
                if (existingItem.quantity + item.quantity <= existingItem.def.stackLimit) {
                    existingItem.quantity += item.quantity;
                } else {
                    item.quantity = (existingItem.quantity + item.quantity) % existingItem.def.stackLimit;
                    existingItem.quantity = existingItem.def.stackLimit;
                    this.items.push(item);
                }
            } else {
                this.addItemToFreeSlot(item);
            }
        } else {
            this.items.push(item);
        }
        // TODO: Check vs capacity, return false if cannot carry
        return true;
    },
    addItemToFreeSlot: function(item) {
		for (let i=0,len=this.items.length;i<len;i++) {
			if (!this.items[i]) {
                this.items[i] = item;
                return;
			}
		}

		// TODO: Will cause issues when there are more items than the ones that can be displayed
		this.items.push(item);
    },
    removeItem: function(item) {
        var ind = this.items.indexOf(item);
        this.items.splice(ind, 1);
        delete item.containerItem;
    },
    getItemById(itemId) {
        return this.items.find(i => i.defid === itemId);
    }

}

module.exports = Inventory;