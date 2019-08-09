class Stairs {
	use(mob) {
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
		mob.relocate(targetX, targetY);
		mob.z = targetZ;
		OAX6.UI.floorLayers[targetZ].mobsLayer.add(mob.sprite);
		if (OAX6.UI.player == mob || OAX6.UI.activeMob == mob) {
			OAX6.UI.updateFOV();
		}
	}
}

module.exports = Stairs;