const circular = require('circular-functions');

function Item(){
  this.quantity = 1;
  this._c = circular.register('Item');
}

circular.registerClass('Item', Item, {
  transients: {
    sprite: true,
    def: true
  },
  reviver: function(item, data) {
  	item.def = OAX6.ItemFactory.getDefinition(item.defid);
    item.sprite = OAX6.ItemFactory.getSpriteForItem(data.phaserGame, item);
    // TODO: Sprite x and y, must store them somewhere for recovery? also the group it's currently on? floor vs inventory.
  }
});

Item.prototype = {
  playProjectileAnimation(projectile, fromX, fromY, toX, toY) {
  	const flyAppearance = OAX6.AppearanceFactory.getAppearance(projectile.def.flyAppearance);
    return OAX6.UI.playProjectileAnimation(this.def.flyType, flyAppearance, fromX, fromY, toX, toY);
  },
  recoverHP(mob) {
    mob.hp.increase(5);
    OAX6.UI.showMessage(mob.name + " recovers 5 HP");
  },
  recoverMP(mob) {
    //TODO: Recover MP when there is MP
    OAX6.UI.showMessage(mob.name + " recovers 5 MP");
  },
  toggleLit() {
    if (this.isLit == undefined) {
      this.isLit = false;
    }
    this.isLit = !this.isLit;
    this.updateSprite();
  },
  updateSprite() {
    const appearance = this.getAppearance();
    this.sprite.frame = appearance.i;
  },
  getAppearance() {
    const { def } = this;
		let appearanceId = def.appearance;
		if (def.type == 'lightSource') {
			appearanceId = this.isLit ? def.appearances.lit : def.appearances.off;
		} 
    return OAX6.AppearanceFactory.getAppearance(appearanceId)
  },
  isContainer() {
    if (this.inventory != undefined) {
      return true;
    } else {
      return false;
    }
  },
  addItem(item) {
    if (this.isContainedBy(item)) {
      return false;
    }
    item.containerItem = this;
    return this.inventory.addItem(item);
  },
  isContainedBy(item) {
    if (item == this)
      return true;
    else if (this.containerItem) {
      return this.containerItem.isContainedBy(item);
    }
  },
  clicked(leftButton, rightButton) {
    // TODO: Only call this if the item is not obscured by the FoV mask and not in a visible container
    OAX6.PlayerStateMachine.itemClicked(this, leftButton, rightButton);
  },
  doubleClicked(leftButton, rightButton) {
    // TODO: Only call this if the item is not obscured by the FoV mask and not in a visible container
    OAX6.PlayerStateMachine.itemDoubleClicked(this, leftButton, rightButton);
  },
	getContainerId() {
		return "item" + this._c.uid;
	},
  reduceItemQuantity(variation) {
    variation = variation || 1;
    if (this.quantity) {
      if (this.quantity > variation) {
        this.quantity -= variation;
      } else if (this.quantity < variation) {
        throw new Error('Not enough quantity of item ' + this.name + ' to reduce by ' + quantity);
      } else {
        this.container.removeItem(this);
      }
    } else {
      this.container.removeItem(this);
    }
  },
  refreshVisualContainer() {
    if (!this.container) {
      return;
    }
    if (this.container.currentContainerWindow) {
      this.container.currentContainerWindow.refresh();
    }
    if (this.currentMobInventoryWindow) {
      this.currentMobInventoryWindow.refresh();
		}
  }
}

module.exports = Item;