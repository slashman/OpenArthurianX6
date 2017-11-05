const Timer = {
	init: function(phaserGame) {
		this.game = phaserGame;
	},
	set: function(millis, callback, context) {
		this.game.time.events.add(millis, callback, context);
	},
	delay: function(millis){
		return new Promise(resolve=>Timer.set(millis, resolve));
	},
	next: function(){
		return new Promise(resolve=>setTimeout(resolve, 0));	
	}
}

module.exports = Timer;