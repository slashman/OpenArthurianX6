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
  openDoor(mob, remote) {
    const chunk = this.chunk;
    const linkedDir = this.def.linked;
    const sisterDoor = chunk.getDoorAt(this.x + linkedDir.x, this.y + linkedDir.y, this.z);

    if (!remote && (!this.inRange(mob) || !sisterDoor.inRange(mob))) {
      return false;
    }
    if (this.remoteOnly && !remote) {
      OAX6.UI.showMessage("Won't move!");
      return false;
    }
    if (this.isLocked()) {
      return false;
    }
    if (mob.world.getMobAt(this.x, this.y, this.z)) {
      OAX6.UI.showMessage("Blocked");
      return false;
    }

    this.open = !this.open;
    this.switchSprite(); 
    
    this.updateSolidAndOpaque();

    if (sisterDoor != null) {
      sisterDoor.open = !sisterDoor.open;
      sisterDoor.switchSprite();
      sisterDoor.updateSolidAndOpaque();
    }
    OAX6.UI.updateFOV();
    return true;
  }, 

  updateSolidAndOpaque(){
    if (!this.def.fixed) {
      this.chunk.setSolidAndOpaque(this.x, this.y, this.z, !this.open, !this.open);
    }
  },

  unlock(key) {
    if (key != null && key.defid == this.lock) {
      this.lock = null;
      
      const linkedDir = this.def.linked;
      const sisterDoor = this.chunk.getDoorAt(this.x + linkedDir.x, this.y + linkedDir.y, this.z);
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