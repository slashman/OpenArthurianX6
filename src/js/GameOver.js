const GameOver = {
    init(game, layer) {
        this.game = game;
        this.layer = this.game.add.group(layer);

        this.gameover = this.game.add.bitmapText(game.width / 2, game.height / 2, 'pixeled', 'GAME OVER', 36, this.layer);
        this.gameover.anchor.set(0.5);
        
        // TODO: Do something more... sophisticated
        this.active = false;
        this.layer.visible = false;
    },

    activate() {
        this.layer.visible = true;
        this.active = true;
    }
}

module.exports = GameOver;