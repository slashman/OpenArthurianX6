const Level = require('./Level.class')
const NPCFactory = require('./NPCFactory')

const LevelLoader = {
	loadLevel: function(game){
		const level = new Level();
		const tiledMap = this.loadTiledMap();
		//TODO: Load the solid mask
		const mobsData = tiledMap.mobs;
		mobsData.forEach((mobData) => this.loadMob(game, mobData, level));
		return level;
	},
	loadTiledMap: function(){
		//TODO: Read the JSON file and map it
		return {
			mobs: [
				{
					type: 'npc',
					id: 'iolo',
					x: 10,
					y: 4
				},
				{
					type: 'npc',
					id: 'shamino',
					x: 13,
					y: 6
				},
				{
					type: 'npc',
					id: 'shamuru',
					x: 7,
					y: 10
				}
			]
		}
	},
	loadMob: function(game, mobData, level){
		const mob = NPCFactory.buildNPC(game, mobData.id, level, mobData.x, mobData.y, 0);
		level.addMob(mob);
	}
}

module.exports = LevelLoader;