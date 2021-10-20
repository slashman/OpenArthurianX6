const SkyColor = require('./SkyColor');

const skyboxRadius = 50;
const skyboxPosition = {
  x: 350,
  y: 50
};
const skyboxMargin = 15;

const SkyBox = {
  init(game, layer) {
    this.game = game;
    this.skyboxLayer = this.game.add.group(layer);
    this.skyboxLayer.name = 'Skybox.skyboxLayer';
    this.skyBack = this.game.add.graphics(skyboxPosition.x, skyboxPosition.y, this.skyboxLayer);
    this.skyBack.anchor.x = 0.5;
    this.skyBack.anchor.y = 1;

    this.sunSprite = this.game.add.sprite(0, 0, 'celestialBodies', 0, this.skyboxLayer);
    this.sunSprite.anchor.x = 0.5;
    this.sunSprite.anchor.y = 0.5;
    this.sunSprite.visible = false;
    this.moonSprite = this.game.add.sprite(0, 0, 'celestialBodies', 1, this.skyboxLayer);
    this.moonSprite.anchor.x = 0.5;
    this.moonSprite.anchor.y = 0.5;
    this.moonSprite.visible = false;

    this.mask = this.game.add.graphics(this.skyBack.x, this.skyBack.y, this.skyboxLayer);
    this.mask.beginFill(0xffffff);
    this.mask.drawRect(-skyboxRadius, -skyboxRadius, 2 * skyboxRadius, skyboxRadius);
  
    this.sunSprite.mask = this.mask;
    this.moonSprite.mask = this.mask
    this.skyBack.mask = this.mask
  },
  
  render () {
    const currentMinuteOfDay = OAX6.UI.player.world.currentMinuteOfDay;
    const currentHourOfDay = currentMinuteOfDay / 60; 
    const currentMinuteOfHour = ((currentMinuteOfDay % 60) / 60) * 100;
    const currentHHMM = Math.floor(currentHourOfDay) * 100 + currentMinuteOfHour;
    this.skyBack.beginFill(SkyColor.getColor(currentHHMM));
    this.skyBack.drawCircle(0, 0, 2 * skyboxRadius);
    const hourIncrement = (2 * Math.PI) / 24;
    const sunRads = (currentHourOfDay + 6) * hourIncrement;
    const moonRads = (currentHourOfDay + 6 + 12) * hourIncrement;
    const xPos = Math.cos(sunRads) * (skyboxRadius - skyboxMargin);
    const yPos = Math.sin(sunRads) * (skyboxRadius - skyboxMargin);
    this.sunSprite.x = Math.round(xPos + skyboxPosition.x);
    this.sunSprite.y = Math.round(yPos + skyboxPosition.y);
    this.sunSprite.visible = true;
    this.moonSprite.x = Math.round(Math.cos(moonRads) * (skyboxRadius - skyboxMargin) + skyboxPosition.x);
    this.moonSprite.y = Math.round(Math.sin(moonRads) * (skyboxRadius - skyboxMargin) + skyboxPosition.y);
    this.moonSprite.visible = true;
  },


}

module.exports = SkyBox;