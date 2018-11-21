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
        this.party.forEach(p => p.health.width = HEALTH_BAR_WIDTH * p.mob.hp.getProportion());
    },

    addMob(mob) {
        const game = this.game;
        const appearance = AppearanceFactory.getAppearance(mob.definition.portrait);
        const x = 7 + this.party.length * 30;
        const y = 8;

        this.party.push({
            mob: mob,
            sprite: game.add.sprite(x, y, appearance.tileset, appearance.i, this.layer),
            healthBack: this.createHealthBar(x, y + 20, 0x330000),
            health: this.createHealthBar(x, y + 20, 0xff0000),
        });

        this.update();
    },

    reorderOnUI() {
        this.party.forEach((partyMember, index) => {
            const x = 7 + index * 30;

            partyMember.sprite.x = x;
            partyMember.healthBack.x = x;
            partyMember.health.x = x;
        });
    },

    removeMob(mob) {
        const index = this.party.findIndex(p => p.mob === mob);

        if (index != -1) {
            const partyMember = this.party[index];

            partyMember.sprite.destroy();
            partyMember.healthBack.destroy();
            partyMember.health.destroy();

            this.party.splice(index, 1);

            this.reorderOnUI();
        }
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