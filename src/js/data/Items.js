//TODO: Make this a data file instead of a JS module

const Items = [
	{
		id: 'fish',
		appearance: 'fish',
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
		id: 'magicAxe',
		appearance: 'magicAxe',
		name: 'Magic Axe',
		range: 5,
		damage: 400
	},
	{
		id: 'crossbow',
		appearance: 'crossbow',
		name: 'Crossbow',
		range: 5,
    usesProjectileType: 'ironBolt', //TODO: Groups of ammo types
    flyType: 'straight',
		damage: 5
	},
  {
    id: 'ironBolt',
    appearance: 'ironBolt',
    flyAppearance: 'ironBolt_p',
    name: 'Iron Bolt',
    damage: 5
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
	}
]

module.exports = Items;