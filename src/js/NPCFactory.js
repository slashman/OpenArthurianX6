const ItemFactory = require('./ItemFactory');
const MobFactory = require('./MobFactory');
const Constants = require('./Constants');

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
		//TODO: Fix jshint
		for (var i=0,option;option=dialog[i];i++) {
			ret[option.key] = option;
		}
		return ret;
	},
	/**
	 * Builds a Mob with extended NPC data
	 */
	buildNPC: function(game, id, world, x, y, z){
		const definition = this.npcMap[id];
		if (!definition) {
			throw new Error("Missing NPC definition [" + id + "]");
		}
		const npc = MobFactory.buildMob(game, definition.type, world, x, y, z);
		npc.npcDefid = id;
		npc.npcDefinition = this.getDefinition(id);
		// Note that we only assign things to the npc that can change, everything else remains in the NPC definition
		MobFactory.addItems(npc, definition);
		npc.name = definition.name; // Added to the Mob, since the name might change maybe
		npc.alignment = definition.alignment || Constants.Alignments.ENEMY;
		npc.intent = definition.intent;
		return npc;
	},
	getDefinition(npcDefid) {
		const definition = this.npcMap[npcDefid];
		const npcDefinition = Object.assign({}, definition);
		npcDefinition.dialog = this.parseDialog(definition.dialog);
		return npcDefinition;
	}
};

module.exports = NPCFactory;
