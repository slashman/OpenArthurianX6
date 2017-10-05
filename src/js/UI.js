const Phaser = require('phaser');

const Loader = require('./Loader');
const Timer = require('./Timer');

const PlayerStateMachine = require('./PlayerStateMachine');
const Geo = require('./Geo');

const TILE_WIDTH = 16;
const TILE_HEIGHT = 16;

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
		this.marker = this.game.add.sprite(0, 0, 'ui', 1, this.floatingUILayer);
		this.marker.animations.add('blink', [0,1], 8);
		this.marker.visible = false;
		this.floatingIcon = this.game.add.sprite(0, 0, 'ui', 1, this.floatingUILayer);
		this.floatingIcon.visible = false;
		this.start();
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
		this.floatingIcon.x = x * TILE_WIDTH;
		this.floatingIcon.y = y * TILE_HEIGHT;
		this.floatingIcon.loadTexture('ui', index);
		this.floatingIcon.visible = true;
	},
	hideIcon: function(){
		this.floatingIcon.visible = false;
	},
	tweenFixedProjectile: function(tileset, index, fromX, fromY, toX, toY){
		return Promise.resolve()
		.then(()=>{
			this.floatingIcon.loadTexture(tileset, index);
			fromX *= TILE_WIDTH;
			fromY *= TILE_HEIGHT;
			toX *= TILE_WIDTH;
			toY *= TILE_HEIGHT;
			this.floatingIcon.x = fromX;
			this.floatingIcon.y = fromY;
			const distance = Math.floor(Geo.flatDist(fromX, fromY, toX, toY)/16); //TODO: Use hDistance
			const projectileSpeed = distance * 50; //TODO: Receive param, based for example on weapon's speed
			this.floatingIcon.visible = true;
			this.tween(this.floatingIcon).to({x: toX, y: toY}, projectileSpeed, Phaser.Easing.Linear.None, true);
			return Timer.delay(projectileSpeed);
		}).then(()=>{
			this.floatingIcon.visible = false;
		});
	},
	addItemSprite: function(item, x, y){
		item.sprite.x = x * TILE_WIDTH;
		item.sprite.y = y * TILE_HEIGHT;
		this.floorLayer.add(item.sprite);
		item.sprite.visible = true;
		console.log("item",item.sprite.x);
		console.log("item",x);
	}
}

module.exports = UI;
