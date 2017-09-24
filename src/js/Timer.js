const Timer = {
	init: function(phaserGame) {
		this.game = phaserGame;
	},
	set: function(millis, callback, context) {
		this.game.time.events.add(millis, callback, context);
	},
	delay: function(millis){
		return new Promise(resolve=>Timer.set(millis, resolve));
	}
}

module.exports = Timer;