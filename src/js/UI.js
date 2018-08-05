const Phaser = require('phaser');

const Random = require('./Random');
const Loader = require('./Loader');
const Timer = require('./Timer');

const PlayerStateMachine = require('./PlayerStateMachine');
const Geo = require('./Geo');

const TILE_WIDTH = 16;
const TILE_HEIGHT = 16;

const FlyType = require('./Constants').FlyType;

const Container = require('./Container').Container;
const containerSizes = require('./Container').SIZES;

const UI = {
	launch: function(then){
		new Phaser.Game(400, 300, Phaser.AUTO, '', this);
		this.afterInit = then;
	},
	preload: function(){
		Loader.load(this.game);
	},
	init: function(){
		//this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
		this.game.renderer.renderSession.roundPixels = true;  
		Phaser.Canvas.setImageRenderingCrisp(this.game.canvas);
		this.game.scale.scaleMode = Phaser.ScaleManager.USER_SCALE;  
		this.game.scale.setUserScale(2, 2);
		this.nextMove = 0;
		this.openContainers = [];
		this.draggingElement = null;
	},
	create: function(){
		this.mapLayer = this.game.add.group();
		this.floorLayer = this.game.add.group();
		this.mobsLayer = this.game.add.group();
		this.UILayer = this.game.add.group();
		this.UILayer.fixedToCamera = true;
		this.floatingUILayer = this.game.add.group();
		this.modeLabel = this.game.add.bitmapText(20, 20, 'pixeled', 'Exploration', 12, this.UILayer);
		this.tempCombatLabel = this.game.add.bitmapText(20, 280, 'pixeled', '', 12, this.UILayer);
		this.skyboxLayer = this.game.add.group(this.UILayer);
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

		this.marker = this.game.add.sprite(0, 0, 'ui', 1, this.floatingUILayer);
		this.marker.animations.add('blink', [0,1], 8);
		this.marker.visible = false;
		this.floatingIcon = this.game.add.sprite(0, 0, 'ui', 1, this.floatingUILayer);
		this.floatingIcon.visible = false;
    	this.floatingIcon.anchor.setTo(0.5);
		this.currentMinuteOfDay = 8 * 60;
		this.start();
		this.timeOfDayPass();

		this.draggingElement = null;
		
		const display = this.game.add.image(100,100,'ui', 0);
		display.anchor.set(0.5, 0.5);
		display.visible = false;
		this.UILayer.add(display);

		this.draggingItem = { item: null, container: null, display: display };
	},
	update: function(){
		PlayerStateMachine.update();
	},
	start: function(){
		this.scrollingEnabled = true;
		const WALK_FRAMES = 4;
		const DESIRED_WALK_DELAY = 400;
		this.WALK_FRAME_RATE = Math.ceil(1000 / (DESIRED_WALK_DELAY / WALK_FRAMES));
		this.WALK_DELAY = Math.ceil((1000 / this.WALK_FRAME_RATE) * WALK_FRAMES);
		this.afterInit(this.game);
	},
	selectDir: function(varx, vary){
		if (varx === 1){
			return 'e';
		} else if (varx === -1){
			return 'w';
		} else if (vary === 1){
			return 's';
		} else {
			return 'n';
		}
	},
	tween: function(sprite){
		return this.game.add.tween(sprite);
	},
	executeTween: function(sprite, to, time){
		return new Promise(resolve => {
			const tween = this.tween(sprite);
			tween.to(to, time);
			tween.onComplete.add(resolve, this);
			tween.start();
		});
	},
	showMessage: function(message){
		console.log(message);
		this.tempCombatLabel.text = message;
	},
	clearMessage: function() {
		this.tempCombatLabel.text = "";
	},
	locateMarker: function(mob){
		this.marker.x = mob.sprite.x;
		this.marker.y = mob.sprite.y;
		this.marker.animations.play('blink', 8, true);
		this.marker.visible = true;
	},
	hideMarker: function(){
		this.marker.visible = false;	
	},
	showIcon: function(index, x, y){
		this.floatingIcon.x = x * TILE_WIDTH + TILE_WIDTH / 2;
		this.floatingIcon.y = y * TILE_HEIGHT + TILE_HEIGHT / 2;
		this.floatingIcon.loadTexture('ui', index);
    this.floatingIcon.rotation = 0;
		this.floatingIcon.visible = true;
	},
	hideIcon: function(){
		this.floatingIcon.visible = false;
	},
	tweenFixedProjectile: function(appearance, fromX, fromY, toX, toY, angleRadians){
    if (angleRadians === undefined) {
      angleRadians = Random.fnum(0, 2 * Math.PI);
    }
    const tileset = appearance.tileset;
    const index = appearance.i;
		this.floatingIcon.loadTexture(tileset, index);
    this.floatingIcon.rotation = angleRadians;
		fromX *= TILE_WIDTH;
		fromY *= TILE_HEIGHT;
		toX *= TILE_WIDTH;
		toY *= TILE_HEIGHT;
    fromX += TILE_WIDTH / 2;
    fromY += TILE_HEIGHT / 2
    toX += TILE_WIDTH / 2;
    toY += TILE_HEIGHT / 2
		this.floatingIcon.x = fromX;
		this.floatingIcon.y = fromY;
		const distance = Math.floor(Geo.flatDist(fromX, fromY, toX, toY)/16); //TODO: Use hDistance
		const projectileSpeed = distance * 50; //TODO: Receive param, based for example on weapon's speed
		this.floatingIcon.visible = true;
		this.tween(this.floatingIcon).to({x: toX, y: toY}, projectileSpeed, Phaser.Easing.Linear.None, true);
		return Timer.delay(projectileSpeed).then(()=>{
			this.floatingIcon.visible = false;
		});
	},

  tweenRotatedProjectile: function(appearance, fromX, fromY, toX, toY){
    const tileset = appearance.tileset;
    const index = appearance.i;
    this.floatingIcon.loadTexture(tileset, index);
    this.floatingIcon.rotation = 0;
    fromX *= TILE_WIDTH;
    fromY *= TILE_HEIGHT;
    toX *= TILE_WIDTH;
    toY *= TILE_HEIGHT;
    fromX += TILE_WIDTH / 2;
    fromY += TILE_HEIGHT / 2
    toX += TILE_WIDTH / 2;
    toY += TILE_HEIGHT / 2
    this.floatingIcon.x = fromX;
    this.floatingIcon.y = fromY;
    const distance = Math.floor(Geo.flatDist(fromX, fromY, toX, toY)/16); //TODO: Use hDistance
    const projectileSpeed = distance * 300; //TODO: Receive param, based for example on weapon's speed
    this.floatingIcon.visible = true;
    this.tween(this.floatingIcon).to({x: toX, y: toY}, projectileSpeed, Phaser.Easing.Linear.None, true);
    const spinTween = this.tween(this.floatingIcon).to({rotation: Math.PI * 2}, 300, Phaser.Easing.Linear.None, true, 0, -1);
    return Timer.delay(projectileSpeed).then(()=>{
      spinTween.stop();
      this.floatingIcon.rotation = 0;
      this.floatingIcon.visible = false;
    });
  },

	timeOfDayPass: function(){
		if (PlayerStateMachine.state !== PlayerStateMachine.WORLD){
			Timer.delay(1000).then(()=>this.timeOfDayPass());
			return;
		}
		this.currentMinuteOfDay += 5;
		if (this.currentMinuteOfDay > 60*24){
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
	addItemSprite: function(item, x, y){
		item.x = x;
		item.y = y;
		item.sprite.x = x * TILE_WIDTH;
		item.sprite.y = y * TILE_HEIGHT;
		this.floorLayer.add(item.sprite);
		item.sprite.visible = true;
		console.log("item",item.sprite.x);
		console.log("item",x);
	},
	removeItemSprite: function(item) {
		this.floorLayer.remove(item.sprite);
		item.sprite.visible = false;
	},

  playProjectileAnimation: function (flyType, appearance, fromX, fromY, toX, toY) {
    // TODO: Depending on weapon, do one of: a: Fixed image b. Rotate on direction c. Rotate continuously
    switch (flyType){
      case FlyType.STRAIGHT:
        const angle = Math.atan2(fromY - toY, fromX - toX) - (Math.PI / 2);
        return this.tweenFixedProjectile(appearance, fromX, fromY, toX, toY, angle);
      case FlyType.ROTATE:
        return this.tweenRotatedProjectile(appearance, fromX, fromY, toX, toY);
      break;
      case FlyType.STATIC:
        return this.tweenFixedProjectile(appearance, fromX, fromY, toX, toY);
    }
	},
	
	addContainer: function(container) {
		if (this.openContainers.indexOf(container) != -1) { return; }

		this.openContainers.push(container);
	},

	removeContainer: function(container) {
		const ind = this.openContainers.indexOf(container);

		if (ind != -1) {
			this.openContainers.splice(ind, 1);
		}
	},

	getContainerAtPoint: function(mousePointer) {
		if (this.draggingElement) { return this.draggingElement; }

		let ret = null;

		for (let i=0,container;container=this.openContainers[i];i++) {
			if (container.isMouseOver(mousePointer)) {
				if (ret == null || ret.group.z < container.group.z) {
					ret = container;
				}
			}
		}

		return ret;
	},

	dragElement: function(element) {
		this.draggingElement = element;
	},

	dragItem: function(item, container) {
		const appearance = item.appearance;

		this.draggingItem.display.loadTexture(appearance.tileset, appearance.i);
		this.draggingItem.display.bringToTop();
		this.draggingItem.display.visible = true;

		this.draggingItem.item = item;

		this.draggingItem.container = container;

		this.updateDragItem(this.game.input.mousePointer);
	},

	isDraggingItem: function() {
		return this.draggingItem.display.visible;
	},

	updateDragItem: function(mousePointer) {
		this.draggingItem.display.x = mousePointer.x;
		this.draggingItem.display.y = mousePointer.y;
	},

	releaseDrag: function() {
		this.draggingElement = null;

		this.draggingItem.display.visible = false;
		this.draggingItem.item = null;
		this.draggingItem.container = null;
	}
}

module.exports = UI;
