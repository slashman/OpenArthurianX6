function Item(){
}

Item.prototype = {
  playProjectileAnimation(fromX, fromY, toX, toY) {
    const projectile = this.projectile;
    OAX6.UI.playProjectileAnimation(this.flyType, projectile.flyAppearance, fromX, fromY, toX, toY);
  }
}

module.exports = Item;