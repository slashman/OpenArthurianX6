//TODO: Make this a data file instead of a JS module

const NPCs = [
	{
		id: 'avatar',
		name: 'Avatar',
		type: 'avatar',
		alignment: 'player',
		armor: 'chainMail',
		weapon: 'magicAxe',
		backpack: 'barrel',
		items: [
			{ itemId: 'journalOfTheQuest', quantity: 1 }
		],
	},
	{
		id: 'iolo',
		name: 'Iolo',
		type: 'iolo',
		alignment: 'player',
		weapon: 'crossbow',
				dialog: [
			{
				key: "greeting",
				variants: [
					{
						condition: {
							flag: "firstIoloConversation",
							value: false
						},
						dialog: [
							{
								type: "event",
								text: "The door jerks open to reveal the familiar form of Iolo standing framed within the doorway. Reaching out to help Shamino, Iolo turns to you with a grimace."
							},
							"My friend, thou art a sight for sore eyes!",
							"I see that Shamino, as usual, has been unable to stay out of trouble.",
							{
								type: "event",
								text: "His casual remarks cannot mask his deep concern as he helps Shamino to a bed and carefully tends to his wound."
							},
							{
								type: "event",
								text: "After seeing to Shamino, Iolo fills two mugs with a foaming broth and beckons you to a coarse wooden table next to the warm hearth."
							},
							"'Tis good to see thee after these many long years, my friend.",
							"It seems thy [summoning] didst not go unnoticed. From the looks of Shamino's wound I'd say thou dost now know of the new regents of Virtue."
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
					"Yes, please join me! The Milestone II awaits us!"
				]
			},
			{
				key: "bye",
				variants: [
					{
						condition: {
							flag: "firstIoloConversation",
							value: false
						},
						dialog: [
							"Let's go!",
							{ type: "joinParty" },
							{ type: "setFlag", flagName: "firstIoloConversation" },
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
				dialog: "That I dost not know about."
			}
		]
	},
	{
		id: 'shamino',
		name: 'Shamino',
		description: 'A Wise Man denied his Homeland.',
		type: 'shamino',
		alignment: 'player',
		weapon: 'crossbow',
		items: [
			{ itemId: 'ironBolt', quantity: 50 },
			{ itemId: 'fish', quantity: 3 }
		],
		intent: 'seekPlayer',
		triggers: [
			{
				id: 'firstTalk',
				type: 'playerDistance',
				value: 5,
				actions: [
					{ 
						type: "talk"
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
							"We were afraid the [summoning] would fail! Tis' nigh impossible to use any magic without invoking intervention from [Blackthorn]."
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
		alignment: 'player',
		weapon: 'sword'
	},
	{
		id: 'asteroth',
		name: 'Asteroth',
		description: 'A Ghost without a Past.',
		type: 'asteroth',
		alignment: 'enemy',
		weapon: 'sword',
		intent: 'seekPlayer',
		triggers: [
			{
				id: 'firstTalk',
				type: 'playerDistance',
				value: 10,
				actions: [
					{
						type: "talk"
					}
				]
			},
			{
				id: 'gotoIolo',
				type: 'combatTurnsOver',
				value: 2,
				actions: [
					{
						type: "console",
						value: "triggered!"
					},
					{
						type: "cutscene",
						value: "gotoIolo"
					},
					{
						type: "openLevel",
						value: "iolos"
					},
					{
						type: "endCombat" // Careful to do this before openLevel!
					},
					{
						type: "showMessage",
						value: "You approach a small cabin in the forest."
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
							{ type: "setHostile" },
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
							{ type: "setHostile" },
							{ type: "endConversation" }
						]
					},
					{
						dialog: [
							"You were warned, now die!",
							{ type: "setHostile" },
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
		alignment: 'player',
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