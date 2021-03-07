const circular = require('circular-functions');

class Sign {
	constructor() {
		this._c = circular.register('Sign');
	}
	getAppearanceId () {
		return this.def.appearance;
	}
	getDescription() {
		return 'sign reading: ' + this.signText;
	}
}

circular.registerClass('Sign', Sign, {
  transients: {
	sprite: true,
    def: true
  },
  reviver: function(sign, data) {
	sign.def = OAX6.ObjectFactory.getDefinitionById(sign.defid);
	sign.sprite = OAX6.ObjectFactory.getSpriteForObject(data.phaserGame, sign);
  }
});


module.exports = Sign;