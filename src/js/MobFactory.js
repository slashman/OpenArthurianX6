const Mob = require('./Mob.class');
const AppearanceFactory = require('./AppearanceFactory');
const Stat = require('./Stat.class');

const MobFactory = {
	init: function(mobTypeData){
		this.mobTypeMap = [];
		for (var mobType of mobTypeData){
			this.mobTypeMap[mobType.id] = mobType;
		}
	},
	buildMob: function(game, typeId, level, x, y, z){
		const mob = new Mob(level, x, y, z);
		const definition = this.mobTypeMap[typeId];
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
		return mob;
	}
};

module.exports = MobFactory;
