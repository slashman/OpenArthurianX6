//TODO: Make this a data file instead of a JS module

const MobTypes = [
	{
		id: 'demon',
		appearance: 'demon',
		name: 'Gargoyle',
		hp: 20,
		damage: 3,
		defense: 0,
		corpse: 'demonCorpse',
		weapon: 'boomerang',
		speed: 6
	},
	{
		id: 'avatar',
		appearance: 'man1',
		name: 'Avatar',
		hp: 200,
		damage: 15,
		defense: 2,
		speed: 5,
		corpse: 'manCorpse',
		portrait: 'portraitAvatar'
	},
	{
		id: 'man1',
		appearance: 'man1',
		name: 'Man',
		hp: 20,
		damage: 3,
		defense: 0,
		speed: 5,
		corpse: 'manCorpse'
	},
	{
		id: 'iolo',
		appearance: 'iolo',
		name: 'Iolo',
		hp: 20,
		damage: 3,
		defense: 0,
		speed: 5,
		corpse: 'manCorpse',
		portrait: 'portraitIolo'
	},
	{
		id: 'shamino',
		appearance: 'man2',
		name: 'Shamino',
		hp: 200,
		damage: 3,
		defense: 0,
		speed: 5,
		corpse: 'manCorpse',
		portrait: 'portraitShamino'
	},
	{
		id: 'rat',
		appearance: 'rat',
		name: 'Rat',
		hp: 20,
		damage: 3,
		defense: 0,
		speed: 3,
		corpse: 'ratCorpse'
	},
	{
		id: 'cow',
		appearance: 'cow',
		name: 'Cow',
		hp: 50,
		damage: 4,
		defense: 0,
		speed: 2,
		corpse: 'cowCorpse',
		useEffect: {
			type: 'milk'
		}
	},
	{
		id: 'skeleton',
		appearance: 'skeleton',
		name: 'Skeleton',
		hp: 20,
		damage: 3,
		defense: 0,
		speed: 3,
		corpse: 'bones'
	},
	{
		id: 'swordSoldier',
		appearance: 'soldier',
		name: 'Soldier',
		description: 'Just a guy named Joe.',
		hp: 10,
		damage: 5,
		defense: 3,
		speed: 2,
		corpse: 'manCorpse',
		intent: 'waitCommand',
		alignment: 'enemy',
		weapon: 'sword'
	},
	{
		id: 'xbowSoldier',
		appearance: 'soldier',
		name: 'Soldier',
		description: 'Watch out! he\'s got a crossbow!.',
		hp: 5,
		damage: 3,
		defense: 3,
		speed: 2,
		corpse: 'manCorpse',
		intent: 'waitCommand',
		alignment: 'enemy',
		weapon: 'crossbow',
		items: [
			{ itemId: 'ironBolt', quantity: 10 }
		]
	},
	{
		id: 'asteroth',
		appearance: 'asteroth',
		name: 'Asteroth',
		description: 'Lord of Empath Abbey.',
		hp: 500,
		damage: 5,
		defense: 20,
		speed: 2,
		corpse: 'manCorpse',
		intent: 'waitCommand',
		alignment: 'enemy',
		weapon: 'crossbow',
		items: [
			{ itemId: 'ironBolt', quantity: 10 }
		]
	}
]

module.exports = MobTypes;