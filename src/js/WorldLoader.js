const ChunkLoader = require("./ChunkLoader");

const WorldLoader = {
	openWorld (startingPosition, player, world) {
		// Add the player and its party to the world
		player.relocate(startingPosition.x, startingPosition.y); // Might need to store last player location on world, or gateway based on current world
		world.addMob(player);
		player.party.forEach(function(partyMember) {
			partyMember.world = world;
			partyMember.relocate(startingPosition.x, startingPosition.y);
			world.addMob(partyMember);
		});
	},
	restoreWorld (world) {
		world.chunks.forEach(chunk => ChunkLoader.restoreChunk(chunk, world));
		world.activateAll();
	}
}

module.exports = WorldLoader;

