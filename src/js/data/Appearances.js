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
		tileset: 'blank',
		items: [
			{
				id: 'blank',
				i: 0
			}
		]
	},
	{
		tileset: 'items',
		items: [
			{
				id: 'spear',
				i: 55
			},
			{
				id: 'magicAxe',
				i: 49
			},
			{
				id: 'crossbow',
				i: 54
			},
			{
				id: 'maingauche',
				i: 50
			},
			{
				id: 'sword',
				i: 48
			},
			{
				id: 'mysticSword',
				i: 63
			},
			{
				id: 'boomerang',
				i: 49
			},
			{
				id: 'blueBook',
				i: 16 * 8 + 13
			},
			{
				id: 'ironBolt',
				i: 71
			},
			{
				id: 'chainMail',
				i: 16 * 6 + 0
			},
			{
				id: 'bluePotion',
				i: 2
			},
			{
				id: 'yellowPotion',
				i: 3
			},
			{
				id: 'lute',
				i: 72
			},
			{
				id: 'litTorch',
				i: 225
				// TODO: Add animation with 226
			},
			{
				id: 'offTorch',
				i: 224
			},
			{
				id: 'barrel',
				i: 161
			},
			{
				id: 'backpack',
				i: 162
			},
			{
				id: 'bag',
				i: 163
			},
			{
				id: 'carrot',
				i: 16 * 2 + 7
			},
			{
				id: 'milkBucket',
				i: 10
			},
			{
				id: 'emptyBucket',
				i: 11
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
				id: 'iolo',
				u: [3+272,4+272,5+272,4+272],
				d: [0+272,1+272,2+272,1+272],
				l: [9+272,10+272,11+272,10+272],
				r: [6+272,7+272,8+272,7+272],
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
				id: 'asteroth',
				u: [3+256,4+256,5+256,4+256],
				d: [0+256,1+256,2+256,1+256],
				l: [9+256,10+256,11+256,10+256],
				r: [6+256,7+256,8+256,7+256],
				dead: 12 + 256
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
		tileset: 'items',
		items: [
			{
				id: 'goldKey',
				i: 16*9+10
			}
		]
	},
	{
		tileset: 'terrain',
		items: [
			{
				id: 'doorOpenHL1',
				solid: true, // TODO: This doesn't belong to the appearance.
				i: 18
			},
			{
				id: 'doorOpenHR1',
				solid: false,
				i: 19
			},
			{
				id: 'doorHL1',
				solid: true,
				i: 33+18
			},
			{
				id: 'doorHR1',
				solid: true,
				i: 33+19
			},
			{
				id: 'doorOpenVL1',
				solid: false,
				i: 33+20
			},
			{
				id: 'doorOpenVR1',
				solid: true,
				i: 20
			},
			{
				id: 'doorVL1',
				solid: true,
				i: 33+21
			},
			{
				id: 'doorVR1',
				solid: true,
				i: 21
			},
			{
				id: 'stairsUp',
				i: 6 * 33 + 15 
			},
			{
				id: 'stairsDown',
				i: 2 * 33 + 5
			},
			{
				id: 'vLever',
				i: 3 * 33 + 18 
			},
			{
				id: 'wLever',
				i: 4 * 33 + 18
			},
			{
				id: 'vLeverOff',
				i: 3 * 33 + 19 
			},
			{
				id: 'wLeverOff',
				i: 4 * 33 + 19
			},
			{
				id: 'harpsichord',
				i: 13 * 33 + 13
			},
			{
				id: 'rock',
				i: 11 * 33 + 9
			},
			{
				id: 'oakTree',
				i: 8 * 33 + 3
			},

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