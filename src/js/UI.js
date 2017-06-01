const Phaser = require('phaser');

const Loader = require('./Loader');

const TILE_WIDTH = 16;
const TILE_HEIGHT = 16;

const UI = {
	init: function(then){
		this.game = new Phaser.Game(400, 300, Phaser.AUTO, '', this.initializer);
		this.afterInit = then;
	},
	initializer: {
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
			UI.start.bind(UI)();
		},
		update: function(){
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
				UI.move.bind(UI,varx,vary)();
			}
		}
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

		this.playerSprite = this.game.add.sprite(192, 192, 'player', 1);
		this.playerSprite.animations.add('walk_s', [0,1,2,1], 4);
		this.playerSprite.animations.add('walk_n', [3,4,5,4], 4);
		this.playerSprite.animations.add('walk_e', [6,7,8,7], 4);
		this.playerSprite.animations.add('walk_w', [9,10,11,10], 4);
		this.game.camera.follow(this.playerSprite);
		this.game.camera.deadzone = new Phaser.Rectangle(192, 144, 0, 0);
		this.afterInit();
	},
	move: function(varx, vary){
		var now = new Date().getTime();
		if (now < this.nextMove)
			return;
		
		if (this.scrollingEnabled){
			this.nextMove = now + this.WALK_DELAY + 20;
			this.game.add.tween(this.playerSprite).to({x: this.playerSprite.x + varx*16, y: this.playerSprite.y + vary*16}, this.WALK_DELAY, Phaser.Easing.Linear.None, true);
			var dir = this._selectDir(varx, vary);
			this.playerSprite.animations.play('walk_'+dir, this.WALK_FRAME_RATE);
		} else {
			this.nextMove = now + 200;
			this.playerSprite.x += varx*16;
			this.playerSprite.y += vary*16;
		}
		
	},
	_selectDir: function(varx, vary){
		if (varx === 1){
			return 'e';
		} else if (varx === -1){
			return 'w';
		} else if (vary === 1){
			return 's';
		} else {
			return 'n';
		}
	}
}

module.exports = UI;
