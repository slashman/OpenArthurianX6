function Item(){
}

Item.prototype = {
  playProjectileAnimation(projectile, fromX, fromY, toX, toY) {
    return OAX6.UI.playProjectileAnimation(this.flyType, projectile.flyAppearance, fromX, fromY, toX, toY);
  }
}

module.exports = Item;