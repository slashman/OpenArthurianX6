const circular = require('circular-functions');
const constants = require('./Constants');

module.exports = {
  saveGame: function(player) {
    const serialized = circular.serialize(player);
    localStorage.setItem('saveGame', serialized);
    localStorage.setItem('saveGameVersion', constants.SAVEGAME_VERSION);
    return Promise.resolve();
  },
  saveGameExists: function() {
    if (localStorage.getItem('saveGameVersion') != constants.SAVEGAME_VERSION) {
      return false;
    }
    return localStorage.getItem('saveGame') !== null;
  },
  loadGame: function(phaserGame) {
    const serialized = localStorage.getItem('saveGame');
    return circular.parse(serialized, {
      phaserGame
    });
  }
}