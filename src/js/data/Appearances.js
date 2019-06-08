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
		tileset: 'items',
		items: [
			{
				id: 'spear',
				i: 12
			},
			{
				id: 'magicAxe',
				i: 49
			},
			{
				id: 'crossbow',
				i: 49
			},
			{
				id: 'maingauche',
				i: 49
			},
			{
				id: 'sword',
				i: 49
			},
			{
				id: 'boomerang',
				i: 49
			},
      {
        id: 'ironBolt',
        i: 71
      }
		]
	},
  // Projectiles
    {
    tileset: 'items',
    items: [
      {
        id: 'ironBolt_p',
        i: 160
      }
    ]
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
				id: 'cowCorpse',
				i: 12+192
			}
		],
		mobs: [
			{
				id: 'man1',
				u: [3,4,5,4],
				d: [0,1,2,1],
				l: [9,10,11,10],
				r: [6,7,8,7],
				dead: 12
			},
			{
				id: 'man2',
				u: [3+224,4+224,5+224,4+224],
				d: [0+224,1+224,2+224,1+224],
				l: [9+224,10+224,11+224,10+224],
				r: [6+224,7+224,8+224,7+224],
				dead: 12
			},
			{
				id: 'soldier',
				u: [3+240,4+240,5+240,4+240],
				d: [0+240,1+240,2+240,1+240],
				l: [9+240,10+240,11+240,10+240],
				r: [6+240,7+240,8+240,7+240],
				dead: 12 + 240
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
			},
			{
				id: 'cow',
				u: [3+192,4+192,5+192,4+192],
				d: [0+192,1+192,2+192,1+192],
				l: [9+192,10+192,11+192,10+192],
				r: [6+192,7+192,8+192,7+192],
				dead: 12+192
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
	},
	{
		tileset: 'terrain',
		items: [
			{
				id: 'doorOpenHL1',
				switchId: 'doorHL1',
				solid: true,
				i: 18
			},
			{
				id: 'doorOpenHR1',
				switchId: 'doorHR1',
				solid: false,
				i: 19
			},
			{
				id: 'doorHL1',
				switchId: 'doorOpenHL1',
				solid: true,
				i: 33+18
			},
			{
				id: 'doorHR1',
				switchId: 'doorOpenHR1',
				solid: true,
				i: 33+19
			},
			{
				id: 'doorOpenVL1',
				switchId: 'doorVL1',
				solid: false,
				i: 33+20
			},
			{
				id: 'doorOpenVR1',
				switchId: 'doorVR1',
				solid: true,
				i: 20
			},
			{
				id: 'doorVL1',
				switchId: 'doorOpenVL1',
				solid: true,
				i: 33+21
			},
			{
				id: 'doorVR1',
				switchId: 'doorOpenVR1',
				solid: true,
				i: 21
			}
		]
	},
	{
		tileset: 'portraits',
		items: [
			{
				id: 'portraitAvatar',
				i: 0
			},
			{
				id: 'portraitIolo',
				i: 1
			},
			{
				id: 'portraitShamino',
				i: 2
			}
		]
	}
]

module.exports = Appearances;