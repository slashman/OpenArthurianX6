
function MusicManager (game, instrument) {
    this.instrument = instrument;
    // TODO: Use a different audio file and config based on instrument.
    this.notes = game.add.audio('notes');
    this.notes.allowMultiple = true;
    let secs = 0.0;
    let duration = 1.5;
    for (i=1; i<=88; i++, secs++) {
        this.notes.addMarker(i, secs++, duration);
    }

}

MusicManager.prototype = {
    playNote: function (note) {
        console.log("Playing note " + note);
        note += 2 + 3 * 12;
        if (note != -1 && 1 <= note && 88 >= note) {
            this.notes.play(note)
        }
    }
}

module.exports = MusicManager;