const Phaser = require('phaser');

const Loader = require('./Loader');

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
		this.cursors = this.game.input.keyboard.createCursorKeys();
		this.nextMove = 0;
	},
	create: function(){
		this.start();
	},
	update: function(){
		if (!this.actionEnabled){
			return;
		}
		var varx = 0;
		var vary = 0;
		if(this.cursors.up.isDown) {
			vary = -1;
		} else if(this.cursors.down.isDown) {
			vary = 1;
		}
		if(this.cursors.left.isDown) {
			varx = -1;
		} else if(this.cursors.right.isDown) {
			varx = 1;
		}
		if (varx != 0 || vary != 0){
			this.player.moveTo(varx, vary);
			this.actionEnabled = false;
			OAX6.Timer.set(this.WALK_DELAY+20, this.enableAction, this)
		}
	},
	enableAction: function(){
		this.actionEnabled = true;
	},
	start: function(){
		this.scrollingEnabled = true;
		const WALK_FRAMES = 4;
		const DESIRED_WALK_DELAY = 400;
		this.WALK_FRAME_RATE = Math.ceil(1000 / (DESIRED_WALK_DELAY / WALK_FRAMES));
		this.WALK_DELAY = Math.ceil((1000 / this.WALK_FRAME_RATE) * WALK_FRAMES);
		var map = this.game.add.tilemap('covetous3'); //TODO: Read from Scenario data
		map.addTilesetImage('terrain', 'terrain');
		map.addTilesetImage('items', 'items');
		map.addTilesetImage('monsters', 'monsters');
		var terrainLayer = map.createLayer('Terrain');
		map.createLayer('Vegetation');
		map.createLayer('Buildings');
		map.createLayer('Objects');
		terrainLayer.resizeWorld();
		this.game.camera.deadzone = new Phaser.Rectangle(192, 144, 0, 0);
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
	// This is for the TBS System. (Not implemented yet)
	playerAct: function(){
		this.actionEnabled = true;
		/*const queuedCommand = this.queuedCommand;
		if (!queuedCommand){
			this.waitMode = true;
			return -1;
		}
		this.waitMode = false;
		if (queuedCommand === 'walk'){
			
			return this.WALK_DELAY;
		}
		return 0;*/
	},
	tween: function(sprite){
		return this.game.add.tween(sprite);
	}
}

module.exports = UI;
