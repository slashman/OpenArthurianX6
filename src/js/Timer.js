const Timer = {
	init: function(phaserGame) {
		this.game = phaserGame;
	},
	set: function(millis, callback, context) {
		this.game.time.events.add(millis, callback, context);
	}
}

module.exports = Timer;