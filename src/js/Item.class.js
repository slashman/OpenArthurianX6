const circular = require('circular-functions');

function Item(){
  this.quantity = 1;
  this._c = circular.register('Item');
}

circular.registerClass('Item', Item, {
  transients: {
    sprite: true
  }
});

Item.prototype = {
  playProjectileAnimation(projectile, fromX, fromY, toX, toY) {
    return OAX6.UI.playProjectileAnimation(this.flyType, projectile.flyAppearance, fromX, fromY, toX, toY);
  }
}

module.exports = Item;