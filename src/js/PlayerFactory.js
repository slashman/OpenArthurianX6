const NPCFactory = require('./NPCFactory');

const PlayerFactory = {
	buildPlayer: function(UI, game, level, x, y, z){
		const mob = NPCFactory.buildNPC(game, "iolo", level, x, y, x);
		mob.canStartDialog = true;
		UI.player = mob;
		mob.name = "Iolo";
		mob.alignment = 'b';
		game.camera.follow(mob.sprite);
		return mob;
	}
}

module.exports = PlayerFactory;
