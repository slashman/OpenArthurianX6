const Phaser = require('phaser');
const WebFont = require('webfontloader');

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
const SignPanel = require('./ui/SignPanel');
const Dialogs = require('./Dialogs');
const MessageBox = require('./MessageBox');
const MobDescription = require('./MobDescription');

const scenarioInfo = require('./ScenarioInfo');

const STRETCH = true;

const GridContainer = require('./ui/GridContainer.class').GridContainer;
const containerSizes = require('./ui/GridContainer.class').SIZES;
const MobInventory = require('./ui/MobInventory.class');
const TitleScreen = require('./ui/TitleScreen');

const UI = {
	launch: function(then){
		new Phaser.Game(Constants.GAME_WIDTH, Constants.GAME_HEIGHT, Phaser.AUTO, '', this);
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

		this.game.scale.fullScreenScaleMode = Phaser.ScaleManager.SHOW_ALL;
		this.game.scale.onFullScreenChange.add(() => {
			OAX6.UI.showMessage(this.game.scale.isFullScreen ? "Full screen enabled" : "Full screen disabled");
		});

		WebFont.load({
			custom: {
				families: ['UltimaRunes']
			}
		});
		
		this.game.renderer.renderSession.roundPixels = true;  
		Phaser.Canvas.setImageRenderingCrisp(this.game.canvas);

		this.nextMove = 0;
		this.openContainers = [];
		this.draggingElement = null;
		this.currentMessageIndex = 0;
		Bus.listen('nextMessage', () => this.showNextSceneFragment());
		this.dragStatus = 'idle';
	},

	/*
		worldLayer
		 baseGroup* (floorLayers, one layer per "floor", 3 in total)
		  mapLayer*
		  floorLayer*
		  mobsLayer*
		  objectsLayer*
		 fovBlockLayer
		UILayer
		 layer (BookPanel.js)
		 layer (PartyStatus.js)
		 dialogUI (Dialogs.js)
		 dialogUI (MessageBox.js)
		 descriptionUI (MobDescription.js)
		 titleLayer
		floatingUILayer
	*/
	create: function(){
		this.worldLayer = this.game.add.group();
		this.worldLayer.name = 'worldLayer';
		this.floorLayers = [];
		for (let i = 0; i < 3; i++) {
			const baseGroup = this.game.add.group(this.worldLayer);
			baseGroup.name = 'baseGroup_' + i;
			this.floorLayers[i] = {
				baseGroup,
				mapLayer: this.game.add.group(baseGroup),
				floorLayer: this.game.add.group(baseGroup),
				mobsLayer: this.game.add.group(baseGroup),
				objectsLayer: this.game.add.group(baseGroup),
			}
			this.floorLayers[i].mapLayer.name = 'mapLayer_' + i;
			this.floorLayers[i].floorLayer.name = 'floorLayer_' + i;
			this.floorLayers[i].mobsLayer.name = 'mobsLayer_' + i;
			this.floorLayers[i].objectsLayer.name = 'objectsLayer_' + i;
		}
		this.fovBlockLayer = this.game.add.group(this.worldLayer);
		this.fovBlockLayer.name = 'fovBlockLayer';
		this.UILayer = this.game.add.group();
		this.UILayer.name = 'UILayer';
		this.UILayer.fixedToCamera = true;
		this.floatingUILayer = this.game.add.group();
		this.floatingUILayer.name = 'floatingUILayer';
		this.fogLayer = this.game.add.group(this.UILayer);
		this.fogLayer.name = 'fogLayer';
		this.modeLabel = this.game.add.bitmapText(this.game.width - 48, 60, 'pixeled', 'Exploration', 12, this.UILayer);
		this.tempCombatLabel = this.game.add.bitmapText(20, 280, 'pixeled', '', 12, this.UILayer);
		this.stateLabel = this.game.add.bitmapText(this.game.width - 48, this.game.height - 60, 'pixeled', 'State', 12, this.UILayer);

		this.fovMask = [];
		this.fovBlocks = [];

		this.fogMask = this.game.add.image(0, 0, 'white', 0, this.fogLayer);
		this.fogMask.width = this.game.width;
		this.fogMask.height = this.game.height;
		this.fogMask.alpha = 0;

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
		SignPanel.init(this.game, this.UILayer);
		Dialogs.init(this.game, this.UILayer);
		MessageBox.init(this.game, this.UILayer);
		MobDescription.init(this.game, this.UILayer);

		this.marker = this.game.add.sprite(0, 0, 'ui', 1, this.floatingUILayer);
		this.marker.animations.add('blink', [0,1], 8);
		this.marker.visible = false;
		this.floatingIcon = this.game.add.sprite(0, 0, 'ui', 1, this.floatingUILayer);
		this.floatingIcon.visible = false;
    	this.floatingIcon.anchor.setTo(0.5);
		this.start();

		this.draggingElement = null;
		
		const display = this.game.add.image(100,100,'ui', 0);
		display.anchor.set(0.5, 0.5);
		display.visible = false;
		this.UILayer.add(display);

		this.titleScreen = TitleScreen;
		TitleScreen.init(this.game, this.UILayer);

		this.draggingItem = { item: null, container: null, display: display };
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
		const sightRange = this.activeMob.getSightRange();
		var maxdist = sightRange < Constants.FOV_RADIUS ? sightRange : Constants.FOV_RADIUS;
		for (var a = 0; a < Math.PI * 2; a += step)
			this.shootRay(a, maxdist);


		this.fovBlockLayer.x = (this.activeMob.x - Constants.FOV_RADIUS - 1) * TILE_WIDTH;
		this.fovBlockLayer.y = (this.activeMob.y - Constants.FOV_RADIUS - 1) * TILE_HEIGHT;

		// Make sure we are displaying the correct storie
		for (let i = 0; i < 3; i++) {
			this.floorLayers[i].baseGroup.visible = this.activeMob.z >= i;
		}

		for (let x = 0; x < Constants.FOV_RADIUS * 2 + 1; x++) {
			for (let y = 0; y < Constants.FOV_RADIUS * 2 + 1; y++) {
				if (x == Constants.FOV_RADIUS + 1 && y == Constants.FOV_RADIUS + 1) {
					this.fovBlocks[x][y].visible = false;
				} else {
					this.fovBlocks[x][y].visible = !this.fovMask[x][y];
				}
			}
		}

		this.fovBlockLayer.updateTransform(); // We need to force this in order to prevent glitches. DONT MOVE THIS FROM HERE.
		
	},
	shootRay: function (a, maxdist) {
		var step = 0.3333;
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
		this.tempCombatLabel.text = message;
		this.tempCombatLabel.font = 'pixeled';
		this.currentMessageIndex++;
		if (this.currentMessageIndex == 10000) {
			this.currentMessageIndex = 0;
		}
		const messageIndex = this.currentMessageIndex;
		return Timer.delay(5000).then(()=>{
			if (messageIndex == this.currentMessageIndex) {
				this.tempCombatLabel.font = 'grayFont';
			}
		});

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
	
	hasOpenContainers() {
		return this.openContainers.length > 0;
	},

	closeAllContainers() {
		const openContainers = this.openContainers.slice();
		openContainers.forEach(c => c.close());
	},

	hideAllMarkersOnContainers() {
		this.openContainers.forEach(c => c.hideMarker());
	},

	addContainer: function(container) {
		if (this.openContainers.indexOf(container) != -1) {
			return;
		}
		this.openContainers.push(container);
		let i;
		for (i = 0; i < this.openContainers.length; i++) {
			const c = this.openContainers[i];
			if (c.group.x != 32 + i * 32 || c.group.y != 32 + i * 32) {
				break;
			}
		}
		container.group.x = 32 + i * 32;
		container.group.y = 32 + i * 32;
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
		const appearance = item.getAppearance();

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
		OAX6.UI.dragStatus = 'idle';
  },

  showScene(sceneId) {
    const scene = scenarioInfo.scenes[sceneId];
    this.currentScene = scene;
    this.currentSceneIndex = -1;
    return new Promise(outstandingPromise => {
	  this.outstandingPromise = outstandingPromise;
	  PlayerStateMachine.switchState(PlayerStateMachine.MESSAGE_BOX);
	  PlayerStateMachine.enableAction();
      this.showNextSceneFragment();
    });
  },

  showNextSceneFragment() {
    this.currentSceneIndex++;
    if (this.currentSceneIndex < this.currentScene.length) {
      Bus.emit('showMessage', this.currentScene[this.currentSceneIndex]);
    } else {
      Bus.emit('hideMessage');
      PlayerStateMachine.resetState(true);
      if (this.outstandingPromise) {
        this.outstandingPromise();
      }
    }
  },
  restoreComponentState() {
  	PartyStatus.addMob(this.player);
  	this.player.party.forEach(m => PartyStatus.addMob(m));
	this.player.world.timeOfDayPass();
	this.player.world.setFogColor();
  },
  showSign(sign) {
	SignPanel.show(sign);
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
  },
  getActiveMobIndex() {
  	if (this.activeMob == this.player) {
  		return 0;
  	} else {
  		return this.player.party.indexOf(this.activeMob) + 1;
  	}
  },
  selectQuadrant(point) {
  	let xvar = yvar = 0;
  	if (point.x > this.game.width / 2 + TILE_WIDTH / 2) {
  		xvar = 1;
  	} else if (point.x < this.game.width / 2 - TILE_WIDTH / 2) {
  		xvar = -1;
  	}
  	if (point.y > this.game.height / 2 + TILE_HEIGHT / 2) {
  		yvar = 1;
  	} else if (point.y < this.game.height / 2 - TILE_HEIGHT / 2) {
  		yvar = -1;
  	}
  	return {
  		x: xvar,
  		y: yvar
  	};
  },
	toggleFullScreen() {
		if (this.game.scale.isFullScreen) {
			this.game.scale.stopFullScreen();
		} else {
			this.game.scale.startFullScreen(false);
		}
	},
	showContainerForMob(mob) {
		let container = this.openContainers.find(container => container.id == mob.getContainerId());
		if (container){
			container.bringToTop();
		} else {
			container = new MobInventory(this.game, this.UILayer, mob.getContainerId(), mob);
			container.open();
		}
	},
	showContainerForItem(item) {
		let container = this.openContainers.find(container => container.id == item.getContainerId());
		if (container){
			container.bringToTop();
		} else {
			const containerType = item.def.containerType ? containerSizes[item.def.containerType] : containerSizes.medium;
			container = new GridContainer(this.game, this.UILayer, item.getContainerId(), item, containerType);
			container.open();
		}
	},
	getWorldPosition(mousePointer) {
		const mouseX = mousePointer.x;
		const mouseY = mousePointer.y;
		const playerScreenX = (this.game.width / 2) - 8;
		const playerScreenY = (this.game.height / 2) - 8;
		const xDiff = Math.floor((mouseX - playerScreenX) / 16);
		const yDiff = Math.floor((mouseY - playerScreenY) / 16);
		return { x: this.activeMob.x + xDiff, y: this.activeMob.y + yDiff, z: this.activeMob.z };
	},
	// Called when drag was put into delay but then was aborted
	cancelDrag() {
		this.dragStatus = 'idle';
	},
	setFogColor(alpha, color) {
		if (alpha == 0) {
			this.fogMask.visible = false;
		} else {
			this.fogMask.visible = true;
		}
		this.fogMask.alpha = alpha;
		this.fogMask.tint = color;
	}
}

module.exports = UI;