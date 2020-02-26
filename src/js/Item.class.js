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
    return this.inventory.addItem(item);
  },
  clicked() {
    // TODO: Only call this if the item is not obscured by the FoV mask
    OAX6.PlayerStateMachine.itemClicked(this, this.sprite.game.input.activePointer.leftButton.isDown, this.sprite.game.input.activePointer.rightButton.isDown);
  },
	getContainerId() {
		return "item" + this._c.uid;
	}
}

module.exports = Item;