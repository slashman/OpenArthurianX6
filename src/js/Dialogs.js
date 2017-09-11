const Bus = require('./Bus');

module.exports = {
	init: function(game){
		this.game = game;
		this.blinkOut = true;

		game.add.image(64, 224, "dialogBack");

		this.name = game.add.bitmapText(68, 228, 'pixeled', 'Spooky skeleton', 12);
		this.playerInput = game.add.bitmapText(68, 322, 'pixeled', 'YOU SAY: _', 12);
		this.dialog = this.addDialog({dialog: "Hello, Avatar! I was [expecting] you, what a [pleasant] coincidence that you're standing here next to me :) As you probably know by now I am the ruler of this game and you are at my disposal :D"}); 

		Bus.listen('startDialog', this.startDialog, this);

		this.blinkingCursor();
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
	tintWords: function(text, words, color) {
		var msg = text.text;

		for (var k=0,word;word=words[k];k++) {
			var reg = new RegExp("(?!" + word + ").", "g"),
				count = msg.replace(reg, "").length,
				lastIndex = 0,
				wordLength = word.length;

			for (var i=0;i<count;i++) {
				var index1 = msg.indexOf(word, lastIndex),
					index2 = index1 + wordLength;

				for (var j=0;j<wordLength;j++) {
					text.getChildAt(index1 + j).tint = color;
				}

				lastIndex = index1 + 1;
			}
		}
	},
	addDialog: function(dialog) {
		var msg = dialog.dialog,
			keywords = this.getKeywords(msg);
			
		// Remove [] out of keywords
		msg = msg.replace(/[\[\]]/g, "");

		var dialog = this.game.add.bitmapText(80, 214, 'pixeled', msg, 12);
		dialog.fixedToCamera = true;
		dialog.maxWidth = 240;

		this.tintWords(dialog, keywords, 0xffff00);

		return dialog;
	},
	blinkingCursor: function() {
		if (this.blinkOut) {
			this.playerInput.text = this.playerInput.text.substring(0, this.playerInput.text.length - 1);
		} else {
			this.playerInput.text += "_";
		}

		this.blinkOut = !this.blinkOut;

		this.game.time.events.add(Phaser.Timer.SECOND * 0.3, this.blinkingCursor, this);
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

		OAX6.UI.actionEnabled = false;
		mob.actionEnabled = false;

		this.dialog.text = dialog.greeting.dialog;
		
		console.log(dialog);

		//TODO: Show a window with the NPC name or appearance and portrait
		//TODO: Show the greeting dialog
		//TODO: Show the name, job, bye options
		//TODO: Add options based on shown keywords
		//TODO: End dialog after the "bye" keyword chosen
	}

}