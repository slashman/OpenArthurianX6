//TODO: Make this a data file instead of a JS module

const Appearances = [
	{
		tileset: 'player',
		mobs: [{
			id: 'player',
			u: [3,4,5,4],
			d: [0,1,2,1],
			l: [9,10,11,10],
			r: [6,7,8,7]
		}]
	},
	{
		tileset: 'mobs',
		items: [
			{
				id: 'manCorpse',
				i: 12
			},
			{
				id: 'demonCorpse',
				i: 12+16
			},
			{
				id: 'bones',
				i: 12+32
			},
			{
				id: 'ratCorpse',
				i: 12+48
			},
			{
				id: 'spear',
				i: 12
			}
		],
		mobs: [
			{
				id: 'human',
				u: [3,4,5,4],
				d: [0,1,2,1],
				l: [9,10,11,10],
				r: [6,7,8,7],
				dead: 12
			},
			{
				id: 'demon',
				u: [3+16,4+16,5+16,4+16],
				d: [0+16,1+16,2+16,1+16],
				l: [9+16,10+16,11+16,10+16],
				r: [6+16,7+16,8+16,7+16],
				dead: 12+16
			},
			{
				id: 'skeleton',
				u: [3+32,4+32,5+32,4+32],
				d: [0+32,1+32,2+32,1+32],
				l: [9+32,10+32,11+32,10+32],
				r: [6+32,7+32,8+32,7+32],
				dead: 12+32
			},
			{
				id: 'rat',
				u: [3+48,4+48,5+48,4+48],
				d: [0+48,1+48,2+48,1+48],
				l: [9+48,10+48,11+48,10+48],
				r: [6+48,7+48,8+48,7+48],
				dead: 12+48
			}
		]
	},
	{
		tileset: 'items',
		items: [
			{
				id: 'fish',
				i: 16+12
			},
			{
				id: 'lobster',
				i: 16+14
			}
		]
	}
]

module.exports = Appearances;