//TODO: Make this a data file instead of a JS module

const NPCs = [
	{
		id: 'iolo',
		appearance: 'rat'
	},
	{
		id: 'shamino',
		appearance: 'demon'
	},
	{
		id: 'shamuru',
		appearance: 'skeleton',
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
			{
				key: "unknown",
				dialog: "I can't help you with that"
			}
		]
	}
]

module.exports = NPCs;