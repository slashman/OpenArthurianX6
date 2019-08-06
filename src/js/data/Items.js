//TODO: Make this a data file instead of a JS module

const Items = [
	{
		id: 'fish',
		appearance: 'fish',
		description: 'Common and small, but tastes great friend, raw, or in a stew. A chef\'s best friend.',
		name: 'Fish'
	},
	{
		id: 'lobster',
		appearance: 'lobster',
		name: 'Lobster'
	},
	{
		id: 'sword',
		appearance: 'sword',
		name: 'Sword',
		damage: 6
	},
	{
		id: 'spear',
		appearance: 'spear',
		name: 'Spear of Shamap',
		damage: 400
	},
	{
		id: 'chainMail',
		appearance: 'chainMail',
		name: 'Chain Mail',
		defense: 400
	},
	{
		id: 'magicAxe',
		appearance: 'magicAxe',
		flyAppearance: 'magicAxe',
		name: 'Magic Axe',
		throwable: true,
		range: 5,
		flyType: 'rotate',
		damage: 400
	},
	{
		id: 'crossbow',
		appearance: 'crossbow',
		name: 'Crossbow',
		range: 8,
		usesProjectileType: 'ironBolt', //TODO: Groups of ammo types
		flyType: 'straight',
		damage: 5
	},
	{
		id: 'ironBolt',
		appearance: 'ironBolt',
		flyAppearance: 'ironBolt_p',
		name: 'Iron Bolt',
		damage: 5,
		stackLimit: 10
	},
	{
		id: 'boomerang',
		appearance: 'boomerang',
		name: 'Boomerang',
		range: 5,
		damage: 3
	},
	{
		id: 'maingauche',
		appearance: 'maingauche',
		name: 'Main Gauche',
		damage: 5
	},
	{
		id: 'demonCorpse',
		appearance: 'demonCorpse',
		name: 'Demon Body',
		capacity: 10
	},
	{
		id: 'manCorpse',
		appearance: 'manCorpse',
		name: 'Man Body',
		capacity: 10
	},
	{
		id: 'ratCorpse',
		appearance: 'ratCorpse',
		name: 'Rat Body',
		capacity: 5
	},
	{
		id: 'bones',
		appearance: 'bones',
		name: 'Bones'
	},
	{
		id: 'doorHL1',
		closedAppearance: 'doorHL1',
		openAppearance: 'doorOpenHL1',
		fixed: true,
		name: 'Door',
		linked: { x: 1, y: 0 }
	},
	{
		id: 'doorHR1',
		closedAppearance: 'doorHR1',
		openAppearance: 'doorOpenHR1',
		name: 'Door',
		linked: { x: -1, y: 0 }
	},
	{
		id: 'doorVL1',
		closedAppearance: 'doorVL1',
		openAppearance: 'doorOpenVL1',
		name: 'Door',
		linked: { x: 0, y: -1 }
	},
	{
		id: 'doorVR1',
		closedAppearance: 'doorVR1',
		openAppearance: 'doorOpenVR1',
		fixed: true,
		name: 'Door',
		linked: { x: 0, y: 1 }
	},
	{
		id: 'goldKey',
		appearance: 'goldKey',
		description: 'Golden key to open a specific door',
		name: 'Gold key'
	},
	{
		id: 'journalOfTheQuest',
		appearance: 'blueBook',
		isBook: true,
		description: 'A thick book with a blue leather cover',
		title: 'Journal of the Quest',
		contents: '- Journal of the Quest - {br} By Iolo {br} This is a summary of the events that happened during what came to be known as the "Quest of the Avatar". {br} One day, while on a trip to Britain to resupply my fletchery, a stranger approached me asking for the Rune of Compassion. I cannot describe what compelled me to join him on his quest, I could just feel his determination to complete the Quest of the Avatar, and become a champion of virtue.',
		name: 'Journal of The Quest'
	},
]

module.exports = Items;