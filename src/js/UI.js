const Phaser = require('phaser');

const Random = require('./Random');
const Loader = require('./Loader');
const Timer = require('./Timer');

const PlayerStateMachine = require('./PlayerStateMachine');
const Geo = require('./Geo');

const TILE_WIDTH = 16;
const TILE_HEIGHT = 16;

const FlyType = require('./Constants').FlyType;

const Bus = require('./Bus');
const SkyBox = require('./SkyBox');

const PartyStatus = require('./ui/PartyStatus');

const scenarioInfo = require('./ScenarioInfo');

const UI = {
	launch: function(then){
		new Phaser.Game(400, 300, Phaser.AUTO, '', this);
		this.afterInit = then;
	},
	preload: function(){
		Loader.load(this.game);
	},
	init: function(){
    Timer.init(this.game);
		//this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
		this.game.renderer.renderSession.roundPixels = true;  
		Phaser.Canvas.setImageRenderingCrisp(this.game.canvas);
		this.game.scale.scaleMode = Phaser.ScaleManager.USER_SCALE;  
		this.game.scale.setUserScale(2, 2);
		this.nextMove = 0;
    Bus.listen('nextMessage', () => this.showNextSceneFragment());
	},
	create: function(){
		this.mapLayer = this.game.add.group();
		this.floorLayer = this.game.add.group();
		this.mobsLayer = this.game.add.group();
		this.UILayer = this.game.add.group();
		this.UILayer.fixedToCamera = true;
		this.floatingUILayer = this.game.add.group();
		this.modeLabel = this.game.add.bitmapText(this.game.width - 48, 60, 'pixeled', 'Exploration', 12, this.UILayer);
		this.tempCombatLabel = this.game.add.bitmapText(20, 280, 'pixeled', '', 12, this.UILayer);

		this.modeLabel.anchor.set(0.5);

		SkyBox.init(this.game, this.UILayer);

		PartyStatus.init(this.game, this.UILayer);

		this.marker = this.game.add.sprite(0, 0, 'ui', 1, this.floatingUILayer);
		this.marker.animations.add('blink', [0,1], 8);
		this.marker.visible = false;
		this.floatingIcon = this.game.add.sprite(0, 0, 'ui', 1, this.floatingUILayer);
		this.floatingIcon.visible = false;
    this.floatingIcon.anchor.setTo(0.5);
		
		this.start();
	},
	update: function(){
		PlayerStateMachine.update();
		PartyStatus.update();
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

  showScene(sceneId) {
    const scene = scenarioInfo.scenes[sceneId];
    this.currentScene = scene;
    this.currentSceneIndex = -1;
    return new Promise(outstandingPromise => {
      this.outstandingPromise = outstandingPromise;
      PlayerStateMachine.setActionCallback(() => {
        this.showNextSceneFragment();
      });
      PlayerStateMachine.endCombat();
      PlayerStateMachine.switchState(PlayerStateMachine.MESSAGE_BOX);
      this.showNextSceneFragment();
    });
  },

  showNextSceneFragment() {
    this.currentSceneIndex++;
    if (this.currentSceneIndex < this.currentScene.length) {
      Bus.emit('showMessage', this.currentScene[this.currentSceneIndex]);
    } else {
      Bus.emit('hideMessage');
      PlayerStateMachine.clearActionCallback();
      PlayerStateMachine.resetState();
      if (this.outstandingPromise) {
        this.outstandingPromise();
      }
    }
  }
}

module.exports = UI;
