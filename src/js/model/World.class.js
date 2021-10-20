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
		this.currentMinuteOfDay += 5;
		if (this.currentMinuteOfDay >= 60 * 24) {
		  this.currentMinuteOfDay = 0;
		}
		const currentMinuteOfHour = ((this.currentMinuteOfDay % 60) / 60) * 100;
		if (currentMinuteOfHour === 100) {
		  currentMinuteOfHour = 0;
		}
		if (currentMinuteOfHour == 0) {
			this.hourlyNotification();
		}
		SkyBox.render();
		Timer.delay(1000).then(()=>this.timeOfDayPass());
	},

	setMinuteOfDay(minuteOfDay) {
		this.currentMinuteOfDay = minuteOfDay;
		this.timeOfDayPass();
	},

	hourlyNotification () {
		OAX6.UI.player.level.hourly();
	}
}

module.exports = World;