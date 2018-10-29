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
    const definitions = mob.npcDefinition || mob.definition;

    this.sprite.key = mob.sprite.key;
    this.sprite.frame = mob.sprite.frame;

    this.name.text = definitions.name;

    this.description.text = definitions.description || '';

    this.descriptionUI.visible = true;
  }
}