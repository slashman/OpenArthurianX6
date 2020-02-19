function Inventory () {
    this.items = [];
}

Inventory.prototype = {
    addItem: function(item) {
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
    },
    addItemToFreeSlot: function(item) {
		for (let i=0,len=this.items.length;i<len;i++) {
			if (!this.items[i]) {
				return this.items[i] = item;
			}
		}

		// TODO: Will cause issues when there are more items than the ones that can be displayed
		this.items.push(item);
    },
    removeItem: function(item) {
        var ind = this.items.indexOf(item); // DOes this even work?
		this.items.splice(ind, 1);
    },
    reduceItemQuantity(item, variation) {
		variation = variation || 1;
		if (item.quantity) {
			if (item.quantity > variation) {
				item.quantity -= variation;
			} else if (item.quantity < variation) {
				throw new Error('Not enough quantity of item ' + item.name + ' to reduce by ' + quantity);
			} else {
				this.items.splice(this.items.findIndex(i => i.defid === item.defid), 1);
			}
		} else {
			this.items.splice(this.items.findIndex(i => i.defid === item.defid), 1);
		}
    },
    getItemById(itemId) {
        return this.items.find(i => i.defid === itemId);
    }

}

module.exports = Inventory;