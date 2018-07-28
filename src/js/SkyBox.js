const PlayerStateMachine = require('./PlayerStateMachine');
const Timer = require('./Timer');

// TODO: Update color of skybox background based on time

const SkyBox = {
  init(game, layer) {
    this.game = game;
    this.skyboxLayer = this.game.add.group(layer);
    this.skySprite = this.game.add.sprite(0, 0, 'skies', 0, this.skyboxLayer);
    this.skySprite.anchor.x = 0.5;
    this.skySprite.anchor.y = 1;
    this.sunSprite = this.game.add.sprite(0, 0, 'celestialBodies', 0, this.skyboxLayer);
    this.sunSprite.anchor.x = 0.5;
    this.sunSprite.anchor.y = 0.5;
    this.sunSprite.visible = false;
    this.moonSprite = this.game.add.sprite(0, 0, 'celestialBodies', 1, this.skyboxLayer);
    this.moonSprite.anchor.x = 0.5;
    this.moonSprite.anchor.y = 0.5;
    this.moonSprite.visible = false;
    this.currentMinuteOfDay = 8 * 60;
    this.updateTimeOfDay();
  },
  timeOfDayPass: function(){
    if (PlayerStateMachine.state !== PlayerStateMachine.WORLD){
      Timer.delay(1000).then(() => this.timeOfDayPass());
      return;
    }
    this.updateTimeOfDay();
  },
  updateTimeOfDay() {
    this.currentMinuteOfDay += 5;
    if (this.currentMinuteOfDay > 60 * 24) {
      this.currentMinuteOfDay = 0;
    }
    const currentHourOfDay = this.currentMinuteOfDay / 60; 
    const skyboxRadius = 30;
    const skyboxPosition = {
      x: 350,
      y: 50
    };
    this.skySprite.x = skyboxPosition.x;
    this.skySprite.y = skyboxPosition.y;

    const hourIncrement = (2 * Math.PI) / 24;
    const sunRads = (currentHourOfDay + 6) * hourIncrement;
    const moonRads = (currentHourOfDay + 6 + 12) * hourIncrement;
    // console.log(`Current hour is ${currentHourOfDay}, radians are ${sunRads}`);
    const xPos = Math.cos(sunRads) * skyboxRadius;
    const yPos = Math.sin(sunRads) * skyboxRadius;
    this.sunSprite.x = xPos + skyboxPosition.x;
    this.sunSprite.y = yPos + skyboxPosition.y;
    this.sunSprite.visible = true;
    this.moonSprite.x = Math.cos(moonRads) * skyboxRadius + skyboxPosition.x;
    this.moonSprite.y = Math.sin(moonRads) * skyboxRadius + skyboxPosition.y;
    this.moonSprite.visible = true;
    Timer.delay(1000).then(()=>this.timeOfDayPass());
  },

  setMinuteOfDay(minuteOfDay) {
    this.currentMinuteOfDay = minuteOfDay;
    this.updateTimeOfDay();
  }
}

module.exports = SkyBox;