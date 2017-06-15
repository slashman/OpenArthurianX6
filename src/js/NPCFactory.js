const Mob = require('./Mob.class');
const AppearanceFactory = require('./AppearanceFactory');

const NPCFactory = {
	init: function(npcData){
		this.npcMap = [];
		for (var npc of npcData){
			this.npcMap[npc.id] = npc;
		}
	},
	buildNPC: function(game, id, level, x, y, z){
		let npc = new Mob(level, x, y, z);
		let definition = this.npcMap[id];
		let appearance = AppearanceFactory.getAppearance(definition.appearance);
		npc.sprite = game.add.sprite(x*16, y*16, appearance.tileset, appearance.d[1]);
		npc.sprite.animations.add('walk_s', appearance.d, 4);
		npc.sprite.animations.add('walk_n', appearance.u, 4);
		npc.sprite.animations.add('walk_e', appearance.l, 4);
		npc.sprite.animations.add('walk_w', appearance.r, 4);
		return npc;
	}
}

module.exports = NPCFactory;
