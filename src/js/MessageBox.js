const Bus = require('./Bus');
const Timer = require('./Timer');
const PlayerStateMachine = require('./PlayerStateMachine');

/*
 * TODO
 * - Allow setting up position
 * - Margins
 * - Autocenter? Vertically and horizontally
 */
module.exports = {
  init: function(game, parent){
    this.game = game;
    this.blinkOut = true;
    this.maxWidth = 225;
    this.maxLines = 6;
    this.fontSize = 12;

    const background = game.add.image(64, 176, "messageBack");
    this.measureTool = game.add.bitmapText(0, 0, 'pixeled', '', this.fontSize);
    this.dialogLines = [];
    
    this.dialogUI = game.add.group(parent);
    this.dialogUI.name = 'MessageBox.dialogUI';
    this.dialogUI.add(background);
    
    for (var i=0;i<this.maxLines;i++) {
      var line = game.add.bitmapText(88, 190 + this.fontSize * i, 'pixeled', '', this.fontSize);
      this.dialogUI.add(line);
      this.dialogLines.push(line);
    }

    this.dialogUI.visible = false;

    Bus.listen('showMessage', this.showMessage, this);
    Bus.listen('hideMessage', this.hideMessage, this);

    background.inputEnabled = true;
    background.events.onInputDown.add(() => Bus.emit('nextMessage'));
  },

  showMessage(msg) {
    var lines = this.splitInLines(msg);
    this.dialogLines.forEach(l => l.text = '');
    for (var i = 0; i < lines.length; i++) {
      var dialogLine = this.dialogLines[i];
      dialogLine.text = lines[i];
    }
    this.dialogUI.visible = true;
  },

  hideMessage() {
    this.dialogUI.visible = false;
  },

  splitInLines: function(text) {
    var lines = [],
      line = "",
      measureTool = this.measureTool,
      words = text.split(/\s/g);

    measureTool.text = "";
    for (var i=0,word;word=words[i];i++) {
      if (line.length != 0) { measureTool.text += " "; }

      measureTool.text += word;

      var lastLine = this.maxLines - 2,
        maxWidth = this.maxWidth - ((lines.length == lastLine)? 15 : 0);

      if (measureTool.textWidth >= maxWidth) {
        lines.push(line);
        line = "";
        measureTool.text = "";
        i--;
        continue;
      }

      line = measureTool.text;
    }

    if (line != "") {
      lines.push(line);
    }

    measureTool.text = "";

    return lines;
  }
}