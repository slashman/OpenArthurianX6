const Storage = require('../Storage');

module.exports = {
    init(game, parent) {
        this.game = game;
        this.container = game.add.group(parent);
        this.container.name = 'TitleScreen';
        this.container.addChild(this.game.add.image(0, 0, 'title'));
        this.pointer = this.container.addChild(this.game.add.image(36, 236, 'ui', 11));
        this.selectedOption = 0;
        this.modeLabel = this.game.add.bitmapText(this.game.width - 200, this.game.height - 20, 'pixeled', 'Powered by OpenArthurianX6 v0.10', 12, this.container);
    },
    input(key) {
        if (key == Phaser.KeyCode.UP) {
            this.selectedOption--;
            if (this.selectedOption == -1) {
                this.selectedOption = 0;
            }
            this.refreshCursorPosition();
        } else if (key == Phaser.KeyCode.DOWN) {
            this.selectedOption++;
            if (this.selectedOption == 2) {
                this.selectedOption = 1;
            }
            this.refreshCursorPosition();
        } else if (key == Phaser.KeyCode.ENTER) {
            this.dismiss();
        }
    },
    refreshCursorPosition() {
        this.pointer.y = 236 + this.selectedOption * 20;
    },
    dismiss() {
        this.container.visible = false;
        OAX6.PlayerStateMachine.switchState(OAX6.PlayerStateMachine.WORLD);
        if (this.selectedOption == 0) {
            OAX6.runner.newGame(this.game);
        } else if (Storage.saveGameExists()) {
            OAX6.runner.loadGame(this.game);
        }
        OAX6.UI.showMessage("Welcome to OAX6 - Press F for Fullscreen");
    }
}