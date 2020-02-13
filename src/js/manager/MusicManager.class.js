
function MusicManager (instrument) {
    this.instrument = instrument;
}

MusicManager.prototype = {
    playNote: function (note) {
        console.log("Playing note " + note);
    }
}

module.exports = MusicManager;