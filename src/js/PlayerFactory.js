const Mob = require('./Mob.class');
const AppearanceFactory = require('./AppearanceFactory');

const PlayerFactory = {
	buildPlayer: function(UI, game, level, x, y, z){
		const player = new Mob(level, x, y, z);
		player.canStartDialog = true;
		UI.player = player;
		const appearance = AppearanceFactory.getAppearance('demon');
		player.sprite = game.add.sprite(x*16, y*16, appearance.tileset, appearance.d[1]);
		player.sprite.animations.add('walk_s', appearance.d, 4);
		player.sprite.animations.add('walk_n', appearance.u, 4);
		player.sprite.animations.add('walk_e', appearance.r, 4);
		player.sprite.animations.add('walk_w', appearance.l, 4);

		game.camera.follow(player.sprite);

		return player;
	}
}

module.exports = PlayerFactory;
