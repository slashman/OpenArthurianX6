const Bus = require('./Bus');
const Timer = require('./Timer');
const PlayerStateMachine = require('./PlayerStateMachine');

module.exports = {
	init: function(game){
		this.game = game;
		this.blinkOut = true;
		this.maxWidth = 236;
		this.maxLines = 4;
		this.fontSize = 12;
		this.inputPrefix = "YOU SAY: ";
		this.chatLog = [];
		this.chat = null;

		this.background = game.add.image(64, 176, "dialogBack");

		this.measureTool = game.add.bitmapText(0, 0, 'pixeled', '', this.fontSize);
		this.name = game.add.bitmapText(68, 180, 'pixeled', '', this.fontSize);
		this.playerInput = game.add.bitmapText(68, 274, 'pixeled', this.inputPrefix + '_', this.fontSize);
		this.dialogLines = [];
		
		//TODO: Create a scene scheme and order the ui and the game there
		this.dialogUI = game.add.group();
		this.dialogUI.add(this.background);
		this.dialogUI.add(this.name);
		this.dialogUI.add(this.playerInput);
		
		for (var i=0;i<this.maxLines;i++) {
			var line = game.add.bitmapText(84, 208 + this.fontSize * i, 'pixeled', '', this.fontSize);

			this.dialogUI.add(line);
			this.dialogLines.push(line);
		}

		this.dialogUI.fixedToCamera = true;
		this.dialogUI.visible = false;

		this.blinkingCursor();

		Bus.listen('startDialog', this.startDialog, this);
		Bus.listen('updateDialogInput', this.updateDialogInput, this);
		Bus.listen('sendInput', this.sendInput, this);
	},
	getKeywords: function(string) {
		var keywords = [],
			nextIndex = string.indexOf("[");

		while (nextIndex != -1) {
			var closeAtIndex = string.indexOf("]", nextIndex);

			keywords.push(string.substring(nextIndex + 1, closeAtIndex));
			
			nextIndex = string.indexOf("[", nextIndex + 1);
		}

		return keywords;
	},
	tintWords: function(bitmapText, words, color) {
		var msg = bitmapText.text;

		for (var k=0,word;word=words[k];k++) {
			var reg = new RegExp("(?!" + word + ").", "g"),
				count = msg.replace(reg, "").length,
				lastIndex = 0,
				wordLength = word.length;

			for (var i=0;i<count;i++) {
				var index1 = msg.indexOf(word, lastIndex),
					index2 = index1 + wordLength;

				for (var j=0;j<wordLength;j++) {
					bitmapText.getChildAt(index1 + j).tint = color;
				}

				lastIndex = index1 + 1;
			}
		}
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

			if (measureTool.textWidth >= this.maxWidth) {
				lines.push(line);
				line = "";
				measureTool.text = "";
				i--;
			}

			line = measureTool.text;
		}

		if (line != "") {
			lines.push(line);
		}

		measureTool.text = "";

		return lines;
	},
	addDialog: function(dialog) {
		var msg = dialog.dialog,
			keywords = this.getKeywords(msg);
			
		// Remove [] out of keywords and split in lines
		lines = this.splitInLines(msg.replace(/[\[\]]/g, ""));

		for (var i=0,line;line=lines[i];i++) {
			var dialogLine = this.dialogLines[this.chatLog.length];

			if (!dialogLine) {
				for (var j=1;j<this.maxLines;j++) {
					this.dialogLines[j].y -= this.fontSize;
				}

				dialogLine = this.dialogLines[0];
				dialogLine.y += (this.maxLines - 1) * this.fontSize;

				this.dialogLines.push(this.dialogLines.shift());
			}

			dialogLine.text = line;
			this.chatLog.push(line);

			this.tintWords(dialogLine, keywords, 0xffff00);
		}
	},
	blinkingCursor: function() {
		if (this.blinkOut) {
			this.playerInput.text = this.playerInput.text.substring(0, this.playerInput.text.length - 1);
		} else {
			this.playerInput.text += "_";
		}

		this.blinkOut = !this.blinkOut;

		Timer.set(Phaser.Timer.SECOND * 0.3, this.blinkingCursor, this);
	},
	/*
	 * Sample structure of dialog object
	 {
		mob: {
			name: "Kram",
			appearance: "A young man with a baseball cap",
			portrait: "kram" // Sprite key
		},
		dialog: [
			{
				key: "greeting",
				dialog: "Hello, Avatar! I was [expecting] you"
			},
			{
				key: "name",
				dialog: "My name is Kram, lord of [Kramlandia]"
			},
			{
				key: "expecting",
				dialog: "Yes, I knew you'd come."
			},
			{
				key: "job",
				dialog: "I create worlds"
			},
			{
				key: "kramlandia",
				dialog: "A fair nation, full of bandits and thieves"	
			},
			{
				key: "bye",
				dialog: "Hasta la vista, baby"
			},
		]
	 }
	 */
	startDialog: function(chat){
		var mob = chat.mob,
			dialog = chat.dialog;

		this.chat = chat;

		PlayerStateMachine.switchState(PlayerStateMachine.DIALOG);
		mob.actionEnabled = false;

		this.name.text = mob.definitionId;
		this.addDialog(dialog.greeting);

		this.dialogUI.visible = true;

		console.log(mob);

		//TODO: Show a window with the NPC name or appearance and portrait
		//TODO: Show the greeting dialog
		//TODO: Show the name, job, bye options
		//TODO: Add options based on shown keywords
		//TODO: End dialog after the "bye" keyword chosen
	},
	updateDialogInput: function(line) {
		this.playerInput.text = this.inputPrefix + line + "_";
		this.blinkOut = true;
	},
	sendInput: function(line) {
		var dialog = this.chat.dialog[line.toLowerCase()];

		if (!dialog) {
			dialog = this.chat.dialog.unknown;
		}

		this.addDialog({dialog: "> " + line});
		this.addDialog(dialog);
	}
}