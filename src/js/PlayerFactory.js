const NPCFactory = require('./NPCFactory');
const PlayerStateMachine = require('./PlayerStateMachine');

const Container = require('./Container').Container;
const containerSizes = require('./Container').SIZES;

const PlayerFactory = {
	buildPlayer: function(UI, game, level, x, y, z){
		const mob = NPCFactory.buildNPC(game, "iolo", level, x, y, x);
		mob.canStartDialog = true;
		UI.player = mob;
		mob.backpack = new Container(game, containerSizes.medium);
		mob.inventory = mob.backpack.inventory;
		mob.name = "Iolo";
		mob.alignment = 'b';
		
		UI.player = mob;
		PlayerStateMachine.player = mob;
		
		game.camera.follow(mob.sprite);

		return mob;
	}
}

module.exports = PlayerFactory;
