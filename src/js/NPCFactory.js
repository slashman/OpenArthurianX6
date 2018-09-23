const ItemFactory = require('./ItemFactory');
const MobFactory = require('./MobFactory');

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
	buildNPC: function(game, id, level, x, y, z){
		const definition = this.npcMap[id];
		const npc = MobFactory.buildMob(game, definition.type, level, x, y, z);
		npc.npcDefinition = definition;
		npc.dialog = this.parseDialog(definition.dialog);
		if (definition.weapon) {
			npc.weapon = ItemFactory.createItem(definition.weapon);
		}
		if (definition.items) {
			definition.items.forEach(item => {
				let id, quantity;
				if (typeof item === 'string') {
					id = item;
					quantity = 1;
				} else {
					id = item.id;
					quantity = item.quantity;
				}
				npc.addItem(ItemFactory.createItem(id, quantity));
			})
		}
		npc.name = definition.name;
		npc.alignment = definition.alignment || 'a';
		npc.firstTalk = definition.firstTalk;
		npc.intent = definition.intent;
		return npc;
	}
};

module.exports = NPCFactory;
