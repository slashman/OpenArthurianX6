module.exports = {
    init: function(game) {
        this.game = game;
        this.UI = OAX6.UI;

        this.inventoryGroup = this.game.add.group();

        this.inventoryBackground = this.game.add.image(180, 50, "inventory");

        this.inventoryGroup.add(this.inventoryBackground);
        this.UI.UILayer.add(this.inventoryGroup);

        this.close();
    },

    open: function() {
        this.inventoryGroup.visible = true;
    },

    close: function() {
        this.inventoryGroup.visible = false;
    }
};