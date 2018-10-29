//TODO: Make this a data file instead of a JS module

const NPCs = [
	{
		id: 'avatar',
		name: 'Avatar',
		type: 'avatar',
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
		description: 'A Wise Man denied his Homeland.',
		type: 'man2',
		alignment: 'b',
		weapon: 'crossbow',
		items: [
			{ id: 'ironBolt', quantity: 50 }
		],
		firstTalk: 5,
		intent: 'seekPlayer',
		dialog: [
			{
				key: "greeting",
				variants: [
					{
						condition: {
							flag: "firstShaminoConversation",
							value: false
						},
						dialog: [
							{
								type: "event",
								text: "You see your friend Shamino, someone you thought you might never see again."
							},
							"My friend!",
							{
								type: "event",
								text: "Strongly grasping your hand, he exclaims:"
							},
							"We were afraid the [summoning] would fail! Tis' nigh impossible to use any magic without invoking intervention from [Blackthorn].",
							"This is a very long message, I really jsut want to make it go overboard and see if the more prompt continues working as expected. Actually it seems like it needs to be really really long, I don't know what else to say, my mind is blank. This is a very long message, I really jsut want to make it go overboard and see if the more prompt continues working as expected. Actually it seems like it needs to be really really long, I don't know what else to say, my mind is blank."
						]
					},
					{
						condition: {
							flag: "firstBattleOver",
							value: false
						},
						dialog: [
							"There is no time to talk! Let's run to the west."
						]
					},
					{
						dialog: "Yes my friend?"
					}
				]
			},
			{
				key: "name",
				dialog: "Why are you asking me that? has the [summoning] caused you any memory issues?"
			},
			{
				key: "join",
				dialog: [
					"Yes, please join me! Britannia needs you in this dark hour. [Iolo] will fill you with all the information you need about the latest happenings...",
					"Lord [British] is missing, and the whole realm is being torn apart!"
				]
			},
			{
				key: "bye",
				variants: [
					{
						condition: {
							flag: "firstShaminoConversation",
							value: false
						},
						dialog: [
							"We will find aid at Iolo's. It is but a short walk to the west!",
							{ type: "joinParty" },
							{ type: "setFlag", flagName: "firstShaminoConversation" },
							{ type: "endConversation" }
						]
					},
					{
						condition: {
							flag: "firstBattleOver",
							value: false
						},
						dialog: [
							"Don't look back!",
							{ type: "endConversation" }
						]
					},
					{
						dialog: [
							"Goodbye!",
							{ type: "endConversation" }
						]
					}
				]
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
		id: 'asteroth',
		name: 'Asteroth',
		description: 'A Ghost without a Past.',
		type: 'xbowSoldier',
		alignment: 'a',
		weapon: 'sword',
		firstTalk: 5,
		intent: 'seekPlayer',
		triggers: [
			{
				type: 'combatTurnsOver',
				value: 1,
				actions: [
					{
						type: "console",
						value: "triggered!"
					}
				]
			}
		],
		dialog: [
			{
				key: "greeting",
				variants: [
					{
						condition: {
							flag: "firstAsterothConversation",
							value: false
						},
						dialog: [
							{
								type: "event",
								text: "A group of heavily armed soldiers aproaches hastily. From within their ranks, a middle aged nobleman clad in shining armor yells",
							},
							"Rebels! In the name of the eight virtues, I, Asteroth, Lord of Empath Abbey, demand your immediate [surrender]!",
							"Drop your weapons now and your life will be forfeit, otherwise you will meet your death by the virtues of [Justice] and [Honor]!"
						]
					}
				]
			},
			{
				key: "name",
				variants: [
					{
						condition: {
							flag: "asterothKnowsAvatar",
							value: true
						},
						dialog: "I am Asteroth, Lord of Empath Abbey and High Minister of [Welfare]."
					}
				]
			},
			{
				key: "welfare",
				variants: [
					{
						condition: {
							flag: "asterothKnowsAvatar",
							value: true
						},
						dialog: "My office seeks all riches of Britannia to be distributen fairly among the population."
					}
				]
			},
			{
				key: "surrender",
				variants: [
					{
						condition: {
							flag: "asterothKnowsAvatar",
							value: false
						},
						dialog: [
							{
								type: "dialogInterruption",
								name: "Shamino",
								text: "Are you out of your senses, Avatar! you are not aware of your words, we will end up dead or worse, as prisoners in a cage in Yew!"
							},
							{
								type: "event",
								text: "Asteroth looks puzzled for a moment.",
							},
							"Avatar? are you really the Avatar? If that is the case then our Lord [Blackthorn] will be most grateful of having your presence, please [join] us and we will escort you to his presence.",
							{ type: "setFlag", flagName: "asterothKnowsAvatar" }
						]
					},
					{
						dialog: "There is no need for that now, if you really are the Avatar, just drop your weapons and [join] us to Blackthorn's castle"
					}
				]
			},
			{
				key: "join",
				variants: [
					{
						condition: {
							flag: "asterothKnowsAvatar",
							value: true
						},
						dialog: [
							{
								type: "dialogInterruption",
								name: "Shamino",
								text: "I am sorry Avatar, I cannot allow this!"
							},
							{
								type: "event",
								text: "In a flash, Shamino draws his sword and runs towards the soldiers.",
							},
							{
								type: "endConversation"
							}
						]
					}
				]
			},
			{
				key: "perish",
				variants: [
					{
						condition: {
							flag: "asterothKnowsAvatar",
							value: true
						},
						dialog: [
							"I knew it... the Avatar, the paladin of virtue, would never side with vicious rebels...",
							"Your deceit will be punished with death!",
							{ type: "endConversation" }
						]
					},
					{
						dialog: [
							"You were warned, now die!",
							{ type: "endConversation" }
						]
					}
				]
			},
			{
				key: "unknown",
				variants: [
					{
						condition: {
							flag: "asterothKnowsAvatar",
							value: true
						},
						dialog: "There is no time to lose, [join] us and let's partake happily with our Lord, he will be delighted to see you"
					},
					{
						dialog: "Was I not clear enough? [Surrender] now or [perish]!"
					}
				]
			},
			{
				key: "bye",
				synonym: "perish"
			}
		],

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