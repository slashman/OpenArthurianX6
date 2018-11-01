const Mob = require('./Mob.class');
const AppearanceFactory = require('./AppearanceFactory');
const ItemFactory = require('./ItemFactory');
const Stat = require('./Stat.class');

const MobFactory = {
	init: function(mobTypeData){
		this.mobTypeData = mobTypeData;
		this.mobTypeMap = [];
		for (var mobType of mobTypeData){
			this.mobTypeMap[mobType.id] = mobType;
		}
	},
	getMobTypeByTileId(tileIndex) {
		return this.mobTypeData.find(t => t.tileIndex === tileIndex);
	},
	buildMob: function(game, typeId, level, x, y, z){
		const mob = new Mob(level, x, y, z);
		const definition = this.mobTypeMap[typeId];
		if (!definition) {
			throw new Error('Invalid definition: [' + typeId + ']')
		}
		mob.definition = definition;
		const appearance = AppearanceFactory.getAppearance(definition.appearance);
		mob.sprite = game.add.sprite(x*16, y*16, appearance.tileset, appearance.d[1], OAX6.UI.mobsLayer);
		mob.sprite.animations.add('walk_s', appearance.d, 4);
		mob.sprite.animations.add('walk_n', appearance.u, 4);
		mob.sprite.animations.add('walk_e', appearance.r, 4);
		mob.sprite.animations.add('walk_w', appearance.l, 4);
		mob.hp = new Stat(definition.hp);
		mob.damage = new Stat(definition.damage);
		mob.defense = new Stat(definition.defense);
		mob.alignment = definition.alignment || 'c';
		this.addItems(mob, definition);
		
		mob.speed = new Stat(definition.speed)
		mob.intent = definition.intent;
		return mob;
	},
	addItems(mob, definition) {
		if (definition.weapon) {
			mob.weapon = ItemFactory.createItem(definition.weapon);
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
				mob.addItem(ItemFactory.createItem(id, quantity));
			})
		}
	}
};

module.exports = MobFactory;
