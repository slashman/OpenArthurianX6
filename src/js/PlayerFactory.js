const Mob = require('./Mob.class');
const NPCFactory = require('./NPCFactory')

const PlayerFactory = {
	buildPlayer: function(UI, game, level, x, y, z){
		const mob = NPCFactory.buildNPC(game, "avatar", level, x, y, x);
		mob.canStartDialog = true;
		UI.player = mob;
		mob.definition.name = "Slash";
		game.camera.follow(mob.sprite);
		return mob;
	}
}

module.exports = PlayerFactory;
