const circular = require('circular-functions');
const AppearanceFactory = require('./AppearanceFactory');

function Door(){
  this.lock = null;
  this.quantity = 1;
  this._c = circular.register('Door');
}

circular.registerClass('Door', Door, {
  transients: {
    sprite: true
  }
});

Door.prototype = {
  openDoor(mob) {
    const level = this.level;
    const linkedDir = this.linked;
    const sisterDoor = level.getDoorAt(this.x + linkedDir.x, this.y + linkedDir.y);

    if (!this.inRange(mob) || !sisterDoor.inRange(mob)) { return; }
    if (this.isLocked()) { return; }

    this.switchSprite(); 
    level.setSolid(this.x, this.y, this.appearance.solid);

    if (sisterDoor != null) {
      sisterDoor.switchSprite();
      level.setSolid(sisterDoor.x, sisterDoor.y, sisterDoor.appearance.solid);
    }
  }, 

  unlock(key) {
    if (key != null && key.id == this.lock) {
      this.lock = null;
      
      const linkedDir = this.linked;
      const sisterDoor = this.level.getDoorAt(this.x + linkedDir.x, this.y + linkedDir.y);
      if (sisterDoor != null) {
        sisterDoor.unlock(key);
      }

      return true;
    }

    return false;
  },

  isLocked() {
    return this.lock;
  },

  inRange(mob) {
    const dx = Math.abs(this.x - mob.x);
    const dy = Math.abs(this.y - mob.y);

    if ((dx == 0 && dy == 0) || (dx > 1 || dy > 1)) { return false; }

    return true;
  },

  switchSprite() {
    const appearance = AppearanceFactory.getAppearance(this.appearance.switchId);
    this.sprite.frame = appearance.i;
    this.appearance = appearance;
  }
}

module.exports = Door;