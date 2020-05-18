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
		id: 'mysticSword',
		appearance: 'mysticSword',
		name: 'Mystic Sword',
		description: 'The greatest works of Zircon of Minoc, we found them in Serpent\'s Hold, during the Quest of the Avatar. They were vital to finish off the foes in the Abyss.',
		damage: 20
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
		id: 'cowCorpse',
		appearance: 'cowCorpse',
		name: 'Cow Body',
		capacity: 10
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
		name: 'Gold key',
		effect: {
			type: 'unlockDoor'
		}
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
	{
		id: 'yellowPotion',
		appearance: 'yellowPotion',
		description: 'This potion is bright yellow in color and viscous.',
		name: 'Ginseng Potion',
		effect: {
			type: 'recoverHP'
		},
		spendable: true
	},
	{
		id: 'bluePotion',
		appearance: 'bluePotion',
		description: 'This potion is blue.',
		name: 'Blood Moss Potion',
		effect: {
			type: 'recoverMP'
		},
		spendable: true
	},
	{
		id: 'lute',
		appearance: 'lute',
		description: 'You can play music with it.',
		name: 'Lute',
		effect: {
			type: 'playMusic',
			audioAssetKey: 'notes-lute',
			offset: 0,
			timingType: 'manual', // This could be fixed with 2400 segment length, but leaving like this to test manual support
			fragments: [
				0,
				2400,
				4807,
				7210,
				9613,
				12009,
				14414,
				16812,
				18872
			]
		},
		useOnSelf: true
	},
	{
		id: 'harpsichord',
		appearance: 'harpsichord',
		description: 'You can play music with it.',
		name: 'Harpsichord',
		effect: {
			type: 'playMusic',
			audioAssetKey: 'notes-harpsichord',
			offset: 0,
			timingType: 'fixed',
			fragmentLength: 2400,
			keys: 8,
		},
		useOnSelf: true
	},
	{
		id: 'piano',
		appearance: 'lute',
		description: 'You can play music with it.',
		name: 'Piano',
		effect: {
			type: 'playMusic',
			audioAssetKey: 'notes',
			timingType: 'fixed',
			fragmentLength: 1500,
			keys: 88, 
			offset: 2 + 3 * 12
		},
		useOnSelf: true
	},
	{
		id: 'torch',
		type: 'lightSource',
		description: 'Creates light.',
		name: 'Torch',
		appearances: {
			lit: 'litTorch',
			off: 'offTorch',
		},
		lightRadius: 5,
		effect: {
			type: 'toggleLit'
			
		},
		useOnSelf: true
	},
	{
		id: 'barrel',
		type: 'container',
		description: 'It\'s just a barrel.',
		name: 'Barrel',
		appearance: 'barrel',
		solid: true
	},
	{
		id: 'backpack',
		type: 'container',
		description: 'A pack that is carried in the back.',
		name: 'Backpack',
		appearance: 'backpack',
		containerType: 'backpack'
	},
	{
		id: 'bag',
		type: 'container',
		description: 'A bag.',
		name: 'Bag',
		appearance: 'bag',
		containerType: 'backpack'
	},
	{
		id: 'rock',
		appearance: 'rock',
		description: 'It\'s a rock.',
		name: 'Rock'
	},
	{
		id: 'oakTree',
		description: 'It\'s an Oak tree.',
		name: 'Oak Tree',
		appearance: 'oakTree',
		solid: true
	},
	{
		id: 'carrot',
		appearance: 'carrot',
		description: 'It\'s a carrot, it\'s orange.',
		name: 'Carrot',
		effect: {
			type: 'reduceHunger',
			hungerRecovery: 10
		},
		spendable: true
	},
]

module.exports = Items;