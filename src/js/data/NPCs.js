//TODO: Make this a data file instead of a JS module

const NPCs = [
	{
		id: 'avatar',
		name: 'Avatar',
		type: 'man1',
		alignment: 'b',
		weapon: 'magicAxe'
	},
	{
		id: 'iolo',
		name: 'Iolo',
		type: 'man2',
		alignment: 'b',
		weapon: 'crossbow'
	},
	{
		id: 'shamino',
		name: 'Shamino',
		type: 'man2',
		alignment: 'b',
		weapon: 'maingauche',
		dialog: [
			{
				key: "greeting",
				dialog: [
					"*You see your friend Shamino, someone you thought you might never see again.",
					"My friend!",
					"*Strongly grasping your hand, he exclaims:",
					"We were afraid the [summoning] would fail! Tis' nigh impossible to use any magic without invoking intervention from [Blackthorn].",
					"This is a very long message, I really jsut want to make it go overboard and see if the more prompt continues working as expected. Actually it seems like it needs to be really really long, I don't know what else to say, my mind is blank. This is a very long message, I really jsut want to make it go overboard and see if the more prompt continues working as expected. Actually it seems like it needs to be really really long, I don't know what else to say, my mind is blank."
				]
			},
			{
				key: "name",
				dialog: "Why are you asking me that? has the [summoning] caused you any memory issues?"
			},
			{
				key: "join",
				dialog: "Of course I'll join you!"
			},
			{
				key: "bye",
				dialog: "We will find aid at Iolo's. It is but a short walk to the west!",
				// TODO: Launch scene 2?
				// TODO: join party
			},
			{
				key: "unknown",
				dialog: "Let us not tarry, for the summoning has surely not gone unnoticed!"
			}
		]
	},
	{
		id: 'dupre',
		name: 'Dupre',
		type: 'man2',
		alignment: 'b',
		weapon: 'sword'
	},
	{
		id: 'kram',
		name: 'Skeleton',
		type: 'skeleton',
		alignment: 'b',
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
				key: "lorem",
				dialog: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborumet dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellendus. Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae. Itaque earum rerum hic tenetur a sapiente delectus, ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis doloribus asperiores repellat."
			},
			{
				key: "unknown",
				dialog: "I can't help you with that"
			}
		]
	}
]

module.exports = NPCs;