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
	}
]

module.exports = MobTypes;