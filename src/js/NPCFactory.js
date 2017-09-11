const Mob = require('./Mob.class');
const AppearanceFactory = require('./AppearanceFactory');

const NPCFactory = {
	init: function(npcData){
		this.npcMap = [];
		for (var npc of npcData){
			this.npcMap[npc.id] = npc;
		}
	},
	parseDialog: function(dialog) {
		if (!dialog) { return null; }

		var ret = {};
		for (var i=0,option;option=dialog[i];i++) {
			ret[option.key] = option;
		}

		return ret;
	},
	buildNPC: function(game, id, level, x, y, z){
		let npc = new Mob(level, x, y, z);
		npc.definitionId = id;
		let definition = this.npcMap[id];
		let appearance = AppearanceFactory.getAppearance(definition.appearance);
		npc.sprite = game.add.sprite(x*16, y*16, appearance.tileset, appearance.d[1]);
		npc.sprite.animations.add('walk_s', appearance.d, 4);
		npc.sprite.animations.add('walk_n', appearance.u, 4);
		npc.sprite.animations.add('walk_e', appearance.r, 4);
		npc.sprite.animations.add('walk_w', appearance.l, 4);
		npc.dialog = this.parseDialog(definition.dialog);
		return npc;
	}
}

module.exports = NPCFactory;
