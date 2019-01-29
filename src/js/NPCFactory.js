const circular = require('circular-functions');

const ItemFactory = require('./ItemFactory');
const MobFactory = require('./MobFactory');
const Constants = require('./Constants');

const NPCFactory = {
	init: function(npcData){
		this.npcMap = [];
		for (var npc of npcData){
			this.npcMap[npc.id] = npc;
			npc._c = circular.setSafe();
		}
	},
	parseDialog: function(dialog) {
		if (!dialog) { return null; }

		var ret = {};
		//TODO: Fix jshint
		for (var i=0,option;option=dialog[i];i++) {
			ret[option.key] = option;
		}
		ret._c = circular.setSafe();
		return ret;
	},
	buildNPC: function(game, id, level, x, y, z){
		const definition = this.npcMap[id];
		const npc = MobFactory.buildMob(game, definition.type, level, x, y, z);
		npc.npcDefinition = definition;
		npc.dialog = this.parseDialog(definition.dialog);
		MobFactory.addItems(npc, definition);
		npc.name = definition.name;
		npc.alignment = definition.alignment || Constants.Alignments.ENEMY;
		npc.firstTalk = definition.firstTalk;
		npc.intent = definition.intent;
		if (definition.triggers) {
			npc.triggers = definition.triggers.slice();
			npc.triggers.forEach(t => t._c = circular.setSafe());
		}
		return npc;
	}
};

module.exports = NPCFactory;
