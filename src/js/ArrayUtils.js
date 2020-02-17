module.exports = {
	clone (array) {
		return JSON.parse(JSON.stringify(array));
	}
}