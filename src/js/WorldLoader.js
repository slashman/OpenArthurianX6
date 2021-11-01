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

		// Load the initial chunks
		/*const chunkX = Math.floor(player.x / world.chunkSize);
		const chunkY = Math.floor(player.y / world.chunkSize);
		ChunkLoader.openChunk(chunkX, chunkY, world);*/
	},
	restoreWorld (world) {
		const chunkX = Math.floor(player.x / player.world.chunkSize);
		const chunkY = Math.floor(player.y / player.world.chunkSize);
		ChunkLoader.restoreChunk(chunkX, chunkY);
		world.activateAll();
	}
}

module.exports = WorldLoader;

