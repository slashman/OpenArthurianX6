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
    item.sprite = OAX6.ItemFactory.getSprite(data.phaserGame, item.def);
    // TODO: Sprite x and y, must store them somewhere for recovery? also the group it's currently on? floor vs inventory.
  }
});

Item.prototype = {
  playProjectileAnimation(projectile, fromX, fromY, toX, toY) {
  	const flyAppearance = OAX6.AppearanceFactory.getAppearance(projectile.def.flyAppearance);
    return OAX6.UI.playProjectileAnimation(this.def.flyType, flyAppearance, fromX, fromY, toX, toY);
  }
}

module.exports = Item;