const circular = require('circular-functions');
const AppearanceFactory = require('./AppearanceFactory');

function Door(){
  this.lock = null;
  this.quantity = 1;
  this._c = circular.register('Door');
}

circular.registerClass('Door', Door, {
  transients: {
    sprite: true,
    def: true
  },
  reviver: function(door, data) {
    door.def = OAX6.ItemFactory.getDefinition(door.defid);
    door.sprite = OAX6.ItemFactory.getDoorSprite(data.phaserGame, door);
  }
});

Door.prototype = {
  openDoor(mob) {
    const level = this.level;
    const linkedDir = this.def.linked;
    const sisterDoor = level.getDoorAt(this.x + linkedDir.x, this.y + linkedDir.y);

    if (!this.inRange(mob) || !sisterDoor.inRange(mob)) { return; }
    if (this.isLocked()) { return; }

    this.open = !this.open;
    this.switchSprite(); 
    
    level.setSolid(this.x, this.y, !this.open);

    if (sisterDoor != null) {
      sisterDoor.open = !sisterDoor.open;
      sisterDoor.switchSprite();
      level.setSolid(sisterDoor.x, sisterDoor.y, !this.open);
    }
  }, 

  unlock(key) {
    if (key != null && key.defid == this.lock) {
      this.lock = null;
      
      const linkedDir = this.def.linked;
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
    const appearance = OAX6.AppearanceFactory.getAppearance(this.open ? this.def.openAppearance : this.def.closedAppearance);
    this.sprite.frame = appearance.i;
  }
}

module.exports = Door;