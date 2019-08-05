const NPCFactory = require('./NPCFactory');
const PlayerStateMachine = require('./PlayerStateMachine');
const PartyStatus = require('./ui/PartyStatus');
const Constants = require('./Constants');

const PlayerFactory = {
	buildPlayer: function(game, level, x, y, z){
		const mob = NPCFactory.buildNPC(game, "avatar", level, x, y, x);
		mob.canStartDialog = true;
		PlayerStateMachine.inventory = mob.inventory;
		mob.name = "Avatar";
		mob.alignment = Constants.Alignments.PLAYER;
		PlayerStateMachine.player = mob;
		PartyStatus.addMob(mob);
		game.camera.follow(mob.sprite);
		return mob;
	}
}

module.exports = PlayerFactory;
