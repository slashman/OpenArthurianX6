//TODO: Make this a data file instead of a JS module

const MobTypes = [
	{
		id: 'demon',
		appearance: 'demon',
		name: 'Demon',
		hp: 20,
		damage: 3,
		defense: 0,
		corpse: 'demonCorpse'
	},
	{
		id: 'human',
		appearance: 'human',
		name: 'Man',
		hp: 20,
		damage: 3,
		defense: 0,
		corpse: 'manCorpse'
	},
	{
		id: 'rat',
		appearance: 'rat',
		name: 'Rat',
		hp: 20,
		damage: 3,
		defense: 0,
		corpse: 'ratCorpse'
	},
	{
		id: 'skeleton',
		appearance: 'skeleton',
		name: 'Skeleton',
		hp: 20,
		damage: 3,
		defense: 0,
		corpse: 'bones'
	}
]

module.exports = MobTypes;