const NPCFactory = require('./NPCFactory');
const PlayerStateMachine = require('./PlayerStateMachine');
const PartyStatus = require('./ui/PartyStatus');
const Constants = require('./Constants');

const PlayerFactory = {
	buildPlayer: function(game, world, x, y, z){
		const mob = NPCFactory.buildNPC(game, "avatar", world, x, y, z);
		mob.canStartDialog = true;
		PlayerStateMachine.inventory = mob.inventory;
		mob.name = "Avatar";
		mob.alignment = Constants.Alignments.PLAYER;
		PlayerStateMachine.player = mob;
		PartyStatus.addMob(mob);
		return mob;
	}
}

module.exports = PlayerFactory;
