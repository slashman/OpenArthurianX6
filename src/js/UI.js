const Phaser = require('phaser');

const Random = require('./Random');
const Loader = require('./Loader');
const Timer = require('./Timer');

const PlayerStateMachine = require('./PlayerStateMachine');
const Geo = require('./Geo');

const TILE_WIDTH = 16;
const TILE_HEIGHT = 16;

const Constants = require('./Constants');
const FlyType = Constants.FlyType;

const Bus = require('./Bus');
const SkyBox = require('./SkyBox');

const PartyStatus = require('./ui/PartyStatus');
const BookPanel = require('./ui/BookPanel');

const scenarioInfo = require('./ScenarioInfo');

const STRETCH = false;

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
		if (STRETCH) {
			this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
		} else {
			this.game.scale.scaleMode = Phaser.ScaleManager.USER_SCALE;
			this.game.scale.setUserScale(2, 2);
		}
		
		this.game.renderer.renderSession.roundPixels = true;  
		Phaser.Canvas.setImageRenderingCrisp(this.game.canvas);

		this.nextMove = 0;
		Bus.listen('nextMessage', () => this.showNextSceneFragment());
	},
	create: function(){
		this.worldLayer = this.game.add.group();
		this.floorLayers = [];
		for (let i = 0; i < 3; i++) {
			const baseGroup = this.game.add.group(this.worldLayer);
			this.floorLayers[i] = {
				baseGroup,
				mapLayer: this.game.add.group(baseGroup),
				floorLayer: this.game.add.group(baseGroup),
				mobsLayer: this.game.add.group(baseGroup),
				objectsLayer: this.game.add.group(baseGroup),
			}
		}

		this.fovBlockLayer = this.game.add.group();
		this.UILayer = this.game.add.group();
		this.UILayer.fixedToCamera = true;
		this.floatingUILayer = this.game.add.group();
		this.modeLabel = this.game.add.bitmapText(this.game.width - 48, 60, 'pixeled', 'Exploration', 12, this.UILayer);
		this.tempCombatLabel = this.game.add.bitmapText(20, 280, 'pixeled', '', 12, this.UILayer);

		this.fovMask = [];
		this.fovBlocks = [];
		
		for (let x = 0; x < Constants.FOV_RADIUS * 2 + 1; x++) {
			this.fovMask[x] = [];
			this.fovBlocks[x] = [];
			for (let y = 0; y < Constants.FOV_RADIUS * 2 + 1; y++) {
				this.fovMask[x][y] = false;
				this.fovBlocks[x][y] = this.game.add.sprite(x * TILE_WIDTH, y * TILE_HEIGHT, 'ui', 8, this.fovBlockLayer);
			}
		}

		this.modeLabel.anchor.set(0.5);

		SkyBox.init(this.game, this.UILayer);

		PartyStatus.init(this.game, this.UILayer);
		BookPanel.init(this.game, this.UILayer);

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
	isFOVBlocked(x, y) {
		return !this.fovMask[x - this.activeMob.x + Constants.FOV_RADIUS + 1][y - this.activeMob.y + Constants.FOV_RADIUS + 1];
	},
	updateFOV: function() {
		/*
		 * This function uses simple raycasting, 
		 * use something better for longer ranges
		 * or increased performance
		 */
		for (let x = 0; x < Constants.FOV_RADIUS * 2 + 1; x++)
			for (let y = 0; y < Constants.FOV_RADIUS * 2 + 1; y++) 
				this.fovMask[x][y] = false;

		var step = Math.PI * 2.0 / 1080;
		for (var a = 0; a < Math.PI * 2; a += step)
			this.shootRay(a);

		for (let x = 0; x < Constants.FOV_RADIUS * 2 + 1; x++) {
			for (let y = 0; y < Constants.FOV_RADIUS * 2 + 1; y++) {
				if (x == Constants.FOV_RADIUS + 1 && y == Constants.FOV_RADIUS + 1) {
					this.fovBlocks[x][y].visible = false;
				} else {
					this.fovBlocks[x][y].visible = !this.fovMask[x][y];
				}
			}
		}
		this.fovBlockLayer.x = (this.activeMob.x - Constants.FOV_RADIUS - 1) * TILE_WIDTH;
		this.fovBlockLayer.y = (this.activeMob.y - Constants.FOV_RADIUS - 1) * TILE_HEIGHT;

		// Make sure we are displaying the correct storie
		for (let i = 0; i < 3; i++) {
			this.floorLayers[i].baseGroup.visible = this.activeMob.z >= i;
		}
	},
	shootRay: function (a) {
		var step = 0.3333;
		var maxdist = this.activeMob.sightRange < Constants.FOV_RADIUS ? this.activeMob.sightRange : Constants.FOV_RADIUS;
		maxdist /= step;
		var dx = Math.cos(a) * step;
		var dy = -Math.sin(a) * step;
		var xx = this.activeMob.x, yy = this.activeMob.y;
		for (var i = 0; i < maxdist; ++i) {
			var testx = Math.round(xx);
			var testy = Math.round(yy);
			try { 
				this.fovMask[testx - this.activeMob.x + Constants.FOV_RADIUS + 1][testy - this.activeMob.y + Constants.FOV_RADIUS + 1] = true;
				if (this.activeMob.level.isOpaque(testx, testy, this.activeMob.z))
					return;
			} catch(err) {
				// Catch OOB
				return; 
			}
			xx += dx; yy += dy;
		}
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

	addItemSprite: function(item, x, y, z){
		item.x = x;
		item.y = y;
		item.z = z;
		item.sprite.x = x * TILE_WIDTH;
		item.sprite.y = y * TILE_HEIGHT;
		this.floorLayers[z].floorLayer.add(item.sprite);
		item.sprite.visible = true;
	},

	locateEntitySpriteInWord: function(entity, layerName){
		entity.sprite.x = entity.x * TILE_WIDTH;
		entity.sprite.y = entity.y * TILE_HEIGHT;
		this.floorLayers[entity.z][layerName].add(entity.sprite);
	},

	removeItemSprite: function(item) {
		this.floorLayers[item.z].floorLayer.remove(item.sprite);
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
      PlayerStateMachine.resetState(true);
      if (this.outstandingPromise) {
        this.outstandingPromise();
      }
    }
  },
  restoreComponentState() {
  	PartyStatus.addMob(this.player);
  	this.player.party.forEach(m => PartyStatus.addMob(m));
	SkyBox.setMinuteOfDay(60);
  },
  readBook(book) {
  	OAX6.UI.showMessage("Reading book \"" + book.def.title + "\", press Left and Right to browse.");
  	BookPanel.show(book);
  },
  hideBook() {
  	OAX6.UI.showMessage("Read book \"" + BookPanel.book.def.title + "\".");
  	BookPanel.hide();
  },
  flipBook(dx) {
  	if (dx > 0) {
  		BookPanel.nextPages();
  	} else {
  		BookPanel.previousPages();
  	}
  },
  setActiveMob(mob) {
  	this.game.camera.follow(mob.sprite);
	this.activeMob = mob;
  }
}

module.exports = UI;
