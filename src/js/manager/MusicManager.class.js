
function MusicManager (game, instrument) {
    this.instrument = instrument;
    const instrumentEffect = instrument.def.effect;
    this.notes = game.add.audio(instrumentEffect.audioAssetKey);
    this.notes.allowMultiple = true;
    if (instrumentEffect.timingType == 'fixed') {
        let duration = instrumentEffect.fragmentLength;
        for (i = 1; i <= instrumentEffect.keys; i++) {
            this.notes.addMarker(i, ((i - 1) * duration) / 1000, duration / 1000);
        }
        this.totalKeys = instrumentEffect.keys;
    } else {
        instrumentEffect.fragments.forEach((fragment, i) => {
            if (i == instrumentEffect.fragments.length - 1) {
                return;
            }
            this.notes.addMarker(i + 1, fragment / 1000, (instrumentEffect.fragments[i+1] - fragment) / 1000);
        });
        this.totalKeys = instrumentEffect.fragments.length - 1;
    }

}

MusicManager.prototype = {
    playNote: function (note) {
        const instrumentEffect = this.instrument.def.effect;
        note += instrumentEffect.offset;
        if (note != -1 && 1 <= note && this.totalKeys >= note) {
            this.notes.play(note)
        }
    }
}

module.exports = MusicManager;