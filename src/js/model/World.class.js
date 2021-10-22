const circular = require('circular-functions');
const SkyBox = require('../SkyBox');
const Timer = require('../Timer');

function World () {
    this._c = circular.register('World');
	this.currentMinuteOfDay = 0;
}

circular.registerClass('World', World);


World.prototype = {
	timeOfDayPass: function(){
		if (OAX6.PlayerStateMachine.state !== OAX6.PlayerStateMachine.WORLD){
			Timer.delay(100).then(() => this.timeOfDayPass());
			return;
		}
		this.currentMinuteOfDay += 5; // This should add up to 60 or else hourly notifications are not sent
		if (this.currentMinuteOfDay >= 60 * 24) {
		  this.currentMinuteOfDay = 0;
		}
		const currentMinuteOfHour = ((this.currentMinuteOfDay % 60) / 60) * 100;
		if (currentMinuteOfHour === 100) {
		  currentMinuteOfHour = 0;
		}
		if (currentMinuteOfHour == 0) {
			this.hourlyNotification();
			this.setFogColor();
		}
		SkyBox.render();
		Timer.delay(1000).then(()=>this.timeOfDayPass());
	},

	initMinuteOfDay(minuteOfDay) {
		this.currentMinuteOfDay = minuteOfDay;
		this.timeOfDayPass();
		this.setFogColor();
	},

	hourlyNotification () {
		OAX6.UI.player.level.hourly();
	},

	getHourOfDay () {
		return Math.floor(this.currentMinuteOfDay / 60);
	},

	setFogColor () {
		const hourOfTheDay = this.getHourOfDay();
		if (hourOfTheDay < 5 || hourOfTheDay > 19) {
			OAX6.UI.setFogColor(0.4, 0x00008b);
		} else if (hourOfTheDay < 6 || hourOfTheDay > 18) {
			OAX6.UI.setFogColor(0.2, 0x0000b9);
		} else if (hourOfTheDay < 7) {
			// Dawn
			OAX6.UI.setFogColor(0.1, 0x0000b9);
		} else if (hourOfTheDay > 17) {
			// Sunset
			OAX6.UI.setFogColor(0.1, 0x0000b9);
		} else {
			OAX6.UI.setFogColor(0, 0);
		}
	}
}

module.exports = World;