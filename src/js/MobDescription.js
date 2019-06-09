const AppearanceFactory = require('./AppearanceFactory');

module.exports = {
  init: function(game) {
    this.game = game;

    this.background = game.add.image(48, 48, "mobDescription");

    this.sprite = game.add.image(66, 66, "mobs");
    this.sprite.anchor.set(0.5);

    this.name = game.add.bitmapText(78, 56, 'pixeled', 'Mob Name', 12);
    
    this.description = game.add.bitmapText(53, 85, 'pixeled', '', 12);
    this.description.maxWidth = 90;

    this.closeArea = game.add.sprite(0,0);
    this.closeArea.width = game.width;
    this.closeArea.height = game.height;
    this.closeArea.inputEnabled = true;
    this.closeArea.events.onInputDown.add(() => { 
      if (this.descriptionUI.visible) {
        this.descriptionUI.visible = false;
      }
    });

    this.descriptionUI = game.add.group();
    this.descriptionUI.fixedToCamera = true;

    this.descriptionUI.add(this.background);
    this.descriptionUI.add(this.sprite);
    this.descriptionUI.add(this.name);
    this.descriptionUI.add(this.description);
    this.descriptionUI.add(this.closeArea);

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
    const appearance = (AppearanceFactory.getAppearance(item.def.appearance.id));

    let key = appearance.tileset;
    let frame = appearance.i;

    this.sprite.loadTexture(key, frame, true);

    this.name.text = item.def.name;
    this.description.text = item.def.description || '';

    this.descriptionUI.visible = true;
  }
}