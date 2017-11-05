const NPCFactory = require('./NPCFactory');
const PlayerStateMachine = require('./PlayerStateMachine');

const PlayerFactory = {
	buildPlayer: function(UI, game, level, x, y, z){
		const mob = NPCFactory.buildNPC(game, "iolo", level, x, y, x);
		mob.canStartDialog = true;
		UI.player = mob;
		mob.inventory = PlayerStateMachine.inventory;
		mob.name = "Iolo";
		mob.alignment = 'b';
		
		UI.player = mob;
		PlayerStateMachine.player = mob;
		
		game.camera.follow(mob.sprite);

		return mob;
	}
}

module.exports = PlayerFactory;
