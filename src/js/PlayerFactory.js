const NPCFactory = require('./NPCFactory');
const PlayerStateMachine = require('./PlayerStateMachine');
const PartyStatus = require('./ui/PartyStatus');

const PlayerFactory = {
	buildPlayer: function(UI, game, level, x, y, z){
		const mob = NPCFactory.buildNPC(game, "avatar", level, x, y, x);
		mob.canStartDialog = true;
		UI.player = mob;
		mob.inventory = PlayerStateMachine.inventory;
		mob.name = "Avatar";
		mob.alignment = 'b';
		
		UI.player = mob;
		PlayerStateMachine.player = mob;

		PartyStatus.addMob(mob);

		game.camera.follow(mob.sprite);

		return mob;
	}
}

module.exports = PlayerFactory;
