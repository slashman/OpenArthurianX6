const Phaser = require('phaser');

const SIGN_LOCATION_X = 40;
const SIGN_LOCATION_Y = 77;

const SignPanel = {
    init(game, layer) {
        this.game = game;
        this.layer = this.game.add.group(layer);
        this.layer.name = 'SignPanel.layer';
        this.layer.x = SIGN_LOCATION_X;
        this.layer.y = SIGN_LOCATION_Y;
        this.background = game.add.image(0, 0, "gravestone");
        this.textOverlay = game.add.text(0, 0, '', {
			boundsAlignH: 'center',
			boundsAlignV: 'middle',
			wordWrap: true,
			wordWrapWidth: 202,
			font: 'serif',
			fontSize: 32,
			fill: '#bbbbbb'
		});
		this.textOverlay.setTextBounds(57, 39, 202, 121);
		this.textOverlay.lineSpacing = -16;
        this.background.inputEnabled = true;
        this.background.events.onInputDown.add((element, pointer) => { 
            this.hide();
        });
        this.layer.add(this.background);
        this.layer.add(this.textOverlay);
        this.layer.visible = false;
    },

    show (sign) {
        this.sign = sign;
        this.layer.visible = true;
		// TODO: Change background texture based on sign.background
		this.sign = sign.signText;
		this.textOverlay.text = sign.signText;
        this.layer.parent.bringToTop(this.layer);
    },

    hide() {
        this.sign = null;
        this.layer.visible = false;
    }
};

module.exports = SignPanel;