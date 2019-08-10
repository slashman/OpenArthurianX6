const circular = require('circular-functions');

const scenarioInfo = require('../ScenarioInfo');

class Lever {
	constructor() {
		this._c = circular.register('Lever');
		this.open = false;
	}
	use(mob, dx, dy) {
		this.open = !this.open;
    	this.switchSprite(); 

		var door = mob.level.getDoorById(this.opensDoorId);
		if (door) {
			if (door.openDoor(mob, true)){
				OAX6.UI.showMessage("You pull the lever. A door opens.");
			}
		}
	}
	switchSprite() {
		const appearance = OAX6.AppearanceFactory.getAppearance(this.getAppearanceId());
		this.sprite.frame = appearance.i;
	}
	getAppearanceId() {
		return this.open ? this.def.openAppearance : this.def.closedAppearance;
	}
}

circular.registerClass('Lever', Lever, {
  transients: {
    sprite: true,
    def: true
  },
  reviver: function(lever, data) {
  	lever.def = OAX6.ObjectFactory.getDefinitionById(lever.defid);
    lever.sprite = OAX6.ObjectFactory.getSpriteForObject(data.phaserGame, lever);
  }
});


module.exports = Lever;