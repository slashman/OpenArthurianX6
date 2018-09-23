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
		corpse: 'manCorpse'
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
		id: 'man2',
		appearance: 'man2',
		name: 'Man',
		hp: 20,
		damage: 3,
		defense: 0,
		speed: 5,
		corpse: 'manCorpse'
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
		hp: 10,
		damage: 5,
		defense: 3,
		speed: 2,
		corpse: 'manCorpse',
		intent: 'seekPlayer',
		weapon: 'sword'
	},
	{
		id: 'xbowSoldier',
		appearance: 'soldier',
		name: 'Soldier',
		hp: 5,
		damage: 3,
		defense: 3,
		speed: 2,
		corpse: 'manCorpse',
		intent: 'seekPlayer',
		weapon: 'crossbow',
		items: [
			{ id: 'ironBolt', quantity: 10 }
		]
	}
]

module.exports = MobTypes;