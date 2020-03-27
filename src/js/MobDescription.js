const AppearanceFactory = require('./AppearanceFactory');

module.exports = {
  init: function(game, parent) {
    this.game = game;
    this.parent = parent;

    this.background = game.add.image(48, 48, "mobDescription");

    this.sprite = game.add.image(66, 66, "mobs");
    this.sprite.anchor.set(0.5);

    this.name = game.add.bitmapText(78, 56, 'pixeled', 'Mob Name', 12);
    
    this.description = game.add.bitmapText(53, 85, 'pixeled', '', 12);
    this.description.maxWidth = 90;

    this.descriptionUI = game.add.group(parent);
    this.descriptionUI.name = 'MobDescription.descriptionUI';

    this.descriptionUI.add(this.background);
    this.descriptionUI.add(this.sprite);
    this.descriptionUI.add(this.name);
    this.descriptionUI.add(this.description);

    this.descriptionUI.visible = false;
  },

  showMob: function(mob) {
    const appearance = (AppearanceFactory.getAppearance(mob.definition.appearance));

    let key = appearance.tileset;
    let frame = appearance.d[0];

    if (mob.definition && mob.definition.portrait) {
      const portrait = AppearanceFactory.getAppearance(mob.definition.portrait);
      key = portrait.tileset;
      frame = portrait.i;
    }

    this.sprite.loadTexture(key, frame, true);

    const definition = mob.npcDefinition || mob.definition;

    this.name.text = definition.name;

    this.description.text = definition.description || '';

    this.descriptionUI.visible = true;
  },

  showItem(item) {
    const appearance = item.getAppearance();

    let key = appearance.tileset;
    let frame = appearance.i;

    this.sprite.loadTexture(key, frame, true);

    this.name.text = item.def.name;
    this.description.text = item.def.description || '';

    this.descriptionUI.visible = true;
    this.parent.bringToTop(this.descriptionUI);
  },

  hide() {
    if (this.descriptionUI.visible) {
      this.descriptionUI.visible = false;
    }
  }
}