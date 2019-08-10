const circular = require('circular-functions');

const scenarioInfo = require('../ScenarioInfo');

class Stairs {
	constructor() {
		this._c = circular.register('Stairs');
	}
	use(mob, dx, dy) {
		const { tileWidth, tileHeight } = scenarioInfo.config;
		const variation = this.direction == 'up' ? 1 : -1;
		const targetZ = this.z + variation;
		const targetX = this.x - variation;
		const targetY = this.y - variation;
		if (targetZ < 0 || targetZ >= mob.level.depth) {
			mob.reportAction("Can't use stairs, invalid destination");
			return;
		}
		if (mob.level.isSolid(targetX, targetY, targetZ)) {
			OAX6.UI.showMessage("Can't use stairs, solid destination");
			return;
		}

		mob.x = targetX;
		mob.y = targetY;
		mob.z = targetZ;

		var dir = OAX6.UI.selectDir(dx, dy);
		mob.sprite.animations.play('walk_'+dir, OAX6.UI.WALK_FRAME_RATE);
		mob.reportAction("Climb");
		/**
		 * The animation goes like this:
		 * - Walk half a tile
		 * - Update sprite z
		 * - Update sprite x and y by the floor offset (-1, -1)
		 * - If the mob is the player, update FOV
		 * - Walk another half-a tile
		 */
		return OAX6.UI.executeTween(mob.sprite, {x: mob.sprite.x + dx * tileWidth / 2, y: mob.sprite.y + dy * tileHeight / 2}, OAX6.UI.WALK_DELAY / 2)
			.then(() => {
				OAX6.UI.floorLayers[targetZ].mobsLayer.add(mob.sprite);
				mob.sprite.x -= variation * tileWidth;
				mob.sprite.y -= variation * tileHeight;
				if (OAX6.UI.player == mob || OAX6.UI.activeMob == mob) {
					OAX6.UI.updateFOV();
				}
				return OAX6.UI.executeTween(mob.sprite, {x: mob.sprite.x + dx * tileWidth / 2, y: mob.sprite.y + dy * tileHeight / 2}, OAX6.UI.WALK_DELAY / 2)
			})
	}
	getAppearanceId() {
		return this.appearanceId;
	}
	getDescription() {
		return 'a stairway';
	}
}

circular.registerClass('Stairs', Stairs, {
  transients: {
    sprite: true
  },
  reviver: function(stairs, data) {
    stairs.sprite = OAX6.ObjectFactory.getSpriteForObject(data.phaserGame, stairs);
  }
});


module.exports = Stairs;