const circular = require('circular-functions');

const Stat = require('./Stat.class');
const AppearanceFactory = require('./AppearanceFactory');
const Item = require('./Item.class');
const Door = require('./Door.class');
const Inventory = require('./model/Inventory.class');
const DoubleTapBehavior = require('./ui/DoubleTapBehavior');

const ItemFactory = {
	init: function(itemData){
		this.itemsMap = [];
		this.itemData = itemData;
		itemData.forEach(item=> {
			this.itemsMap[item.id] = item;
		});
	},
	setGame: function(game){
		this.game = game;
	},
	getAppearance: function(id){
		return this.appearancesMap[id];
	},
	createItem: function(itemData){
		const id = itemData.itemId;
		const quantity = itemData.quantity;
		const def = this.itemsMap[id];
		if (!def) {
			throw new Error("Invalid item id: [" + id + "]");
		}
		const item = new Item();
		if (quantity !== undefined) {
			item.quantity = quantity;
		} else {
			item.quantity = 1;
		}
		if (def.damage){
			item.damage = new Stat(def.damage);
		}
		if (def.defense){
			item.defense = new Stat(def.defense);
		}
		item.def = Object.assign({}, def);
		item.defid = def.id;
		if (def.type == 'lightSource') {
			item.isLit = itemData.isLit;
		}
		if (def.type == 'container') {
			item.inventory = new Inventory();

			if (itemData.initialContents && itemData.initialContents != '') {
				const initialContents = JSON.parse(itemData.initialContents);
				initialContents.forEach(initialItem => item.addItem(this.createItem(initialItem)));
			}
		}
		item.sprite = this.getSpriteForItem(this.game, item);
		return item;
	},
	getDefinition: function(defid) {
		return Object.assign({}, this.itemsMap[defid]);
	},
	getSpriteForItem: function(game, item) {
		const appearance = item.getAppearance();
		const sprite = game.add.sprite(0, 0, appearance.tileset, appearance.i);
		sprite.visible = false;
		sprite.doubleTapBehavior = new DoubleTapBehavior(sprite,
			(l, r) => item.clicked(l, r),
			(l, r) => item.doubleClicked(l, r),
			() => OAX6.PlayerStateMachine.canDragItems(),
			() => {
				const activeMob = OAX6.UI.activeMob || OAX6.UI.player;
				if (activeMob.canReach(item)) {
					OAX6.PlayerStateMachine.switchState(OAX6.PlayerStateMachine.ITEM_TRANSFERRING);
					activeMob.world.removeItem(item);
					OAX6.UI.dragItem(item, activeMob.world);
				} else {
					OAX6.UI.cancelDrag();
				}
			}
		);
		return sprite;
	},
	switchSpriteForItem: function(sprite, newItemId) {
		const def = this.itemsMap[newItemId];
		if (!def) {
			throw new Error("Invalid item id: [" + newItemId + "]");
		}
		const appearance = AppearanceFactory.getAppearance(def.appearance);
		if (!appearance) {
			throw new Error("Invalid appearance for item id: [" + newItemId + "]");
		}
		sprite.loadTexture(appearance.tileset, appearance.i);
	},
	// TODO: Move this to ObjectFactory, the Door class has nothing to do with Item. Move the definitions too?
	createDoor: function(id, chunk){
		const def = this.itemsMap[id];
		const door = new Door();
		door.defid = id;
		door.def = Object.assign({}, def);
		door.open = false; // Closed by default
		door.sprite = this.getDoorSprite(this.game, door);
		door.chunk = chunk;
		return door;
	},
	getDoorSprite: function (game, door) {
		const appearance = AppearanceFactory.getAppearance(door.open ? door.def.openAppearance : door.def.closedAppearance);
		const sprite = game.add.sprite(0, 0, appearance.tileset, appearance.i);
		// door.sprite.visible = false; ???
		sprite.doubleTapBehavior = new DoubleTapBehavior(sprite, (l, r) => {
			if (l) {
				OAX6.PlayerStateMachine.clickOnDoor(door);
			}
		}, () => {});
		return sprite;
	}
};
module.exports = ItemFactory;