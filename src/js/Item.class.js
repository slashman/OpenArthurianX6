/**
 * Represents a interactable item in the world
 * can be inventory item, world switch or door
 */
function Item(level, x, y, z){
	this.sprite = null;
	this.definition = null;
	this.level = level;
	this.x = x;
	this.y = y;
	this.z = z;
}

Item.prototype = {

};