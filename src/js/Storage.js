const circular = require('circular-functions');

module.exports = {
  saveGame: function(player) {
    const serialized = circular.serialize(player);
    //console.log('serialized', serialized);
    localStorage.setItem('saveGame', serialized);
    return Promise.resolve();
  },
  saveGameExists: function() {
    return localStorage.getItem('saveGame') !== null;
  },
  loadGame: function(phaserGame) {
    const serialized = localStorage.getItem('saveGame');
    return circular.parse(serialized, {
      phaserGame
    });
  }
}