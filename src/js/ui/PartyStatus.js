const Phaser = require('phaser');
const AppearanceFactory = require('../AppearanceFactory');

const HEALTH_BAR_WIDTH = 26;

const PartyStatus = {
    init(game, layer) {
        this.game = game;
        this.layer = this.game.add.group(layer);
        this.party = [];
    },

    update() {
        const length = this.party.length;

        for (let i=0;i<length;i++) {
            const uiMob = this.party[i],
                hp = uiMob.mob.hp.getProportion();

                uiMob.health.width = HEALTH_BAR_WIDTH * hp;
        }
    },

    addMob(mob) {
        const game = this.game;
        const appearance = AppearanceFactory.getAppearance(mob.definition.appearance);
        const x = 7 + this.party.length * 30;
        const y = 8;

        this.party.push({
            mob: mob,
            sprite: game.add.sprite(x, y, appearance.tileset, appearance.d[1], this.layer),
            healthBack: this.createHealthBar(x, y + 20, 0x330000),
            health: this.createHealthBar(x, y + 20, 0xff0000),
        });

        this.update();
    },

    reorderOnUI() {
        const length = this.party.length;

        for (let i=0;i<length;i++) {
            const uiMob = this.party[i];
            const x = 7 + i * 30;

            uiMob.sprite.x = x;
            uiMob.healthBack.x = x;
            uiMob.health.x = x;
        }
    },

    removeMob(mob) {
        const length = this.party.length;

        for (let i=0;i<length;i++) {
            const uiMob = this.party[i];

            if (uiMob.mob === mob) {
                uiMob.sprite.destroy();
                uiMob.healthBack.destroy();
                uiMob.health.destroy();

                this.party.splice(i, 1);

                i = length;
            }
        }

        this.reorderOnUI();
    },

    createHealthBar(x, y, color) {
        const bar = this.game.add.graphics(x, y);
        bar.lineStyle(3, color);
        bar.moveTo(0, 0);
        bar.lineTo(HEALTH_BAR_WIDTH, 0);

        bar.width = HEALTH_BAR_WIDTH;

        this.layer.add(bar);

        return bar;
    }
};

module.exports = PartyStatus;