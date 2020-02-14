const Mob = require('./Mob.class');
const AppearanceFactory = require('./AppearanceFactory');
const ItemFactory = require('./ItemFactory');
const Stat = require('./Stat.class');
const Constants = require('./Constants');
const MobDescription = require('./MobDescription');

const MobFactory = {
	init: function(mobTypeData){
		this.mobTypeData = mobTypeData;
		this.mobTypeMap = [];
		for (var mobType of mobTypeData){
			this.mobTypeMap[mobType.id] = mobType;
		}
	},
	getMobTypeByTileId(tileIndex) {
		// TODO: Remove this when we are using objects instead of tiles for mobs.
		return this.mobTypeData.find(t => t.tileIndex === tileIndex);
	},
	buildMob: function(game, typeId, level, x, y, z){
		const mob = new Mob(level, x, y, z);
		const definition = this.mobTypeMap[typeId];
		if (!definition) {
			throw new Error('Invalid definition: [' + typeId + ']')
		}
		mob.defid = typeId;
		mob.definition = definition;
		mob.sprite = this.getSpriteForMob(game, mob);
		mob.hp = new Stat(definition.hp);
		mob.damage = new Stat(definition.damage);
		mob.defense = new Stat(definition.defense);
		mob.alignment = definition.alignment || Constants.Alignments.NEUTRAL;
		this.addItems(mob, definition);
		
		mob.speed = new Stat(definition.speed)
		mob.intent = definition.intent || 'wander';
		return mob;
	},
	addItems(mob, definition) {
		if (definition.weapon) {
			mob.weapon = ItemFactory.createItem({ itemId: definition.weapon });
		}
		if (definition.armor) {
			mob.armor = ItemFactory.createItem({ itemId: definition.armor });
		}
		if (definition.items) {
			definition.items.forEach(item => {
				if (typeof item === 'string') {
					item = {
						itemId: item,
						quantity: 1
					}
				}
				mob.addItem(ItemFactory.createItem(item));
			})
		}
	},
	getDefinition (defid) {
		const definition = this.mobTypeMap[defid];
		if (!definition) {
			throw new Error('Invalid definition: [' + defid + ']')
		}
		return definition;
	},
	getSpriteForMob (game, mob) {
		const { definition, x, y, z } = mob;
		const appearance = AppearanceFactory.getAppearance(definition.appearance);
		const sprite = game.add.sprite(x * 16, y * 16, appearance.tileset, appearance.d[1], OAX6.UI.floorLayers[z].mobsLayer);
		sprite.animations.add('walk_s', appearance.d, 4);
		sprite.animations.add('walk_n', appearance.u, 4);
		sprite.animations.add('walk_e', appearance.r, 4);
		sprite.animations.add('walk_w', appearance.l, 4);
		sprite.inputEnabled = true;
		sprite.events.onInputDown.add(() => {
			OAX6.PlayerStateMachine.clickOnMob(mob, game.input.activePointer.leftButton.isDown, game.input.activePointer.rightButton.isDown);
		});
		return sprite;
	}
};

module.exports = MobFactory;
