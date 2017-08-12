const Bus = require('./Bus');

module.exports = {
	init: function(game){
		Bus.listen('startDialog', this.startDialog, this);
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
	startDialog: function(dialog){
		console.log(dialog);
		OAX6.UI.actionEnabled = false;
		//TODO: Show a window with the NPC name or appearance and portrait
		//TODO: Show the greeting dialog
		//TODO: Show the name, job, bye options
		//TODO: Add options based on shown keywords
		//TODO: End dialog after the "bye" keyword chosen
	}

}