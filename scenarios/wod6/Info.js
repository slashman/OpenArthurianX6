module.exports = {
  config: {
    tileWidth: 16,
    tileHeight: 16,
    chunkSize: 64,
    chunksWidth: 4,
    chunksHeight: 1,
  },
  startingState: {
    minuteOfDay: 10 * 60,
    party: [],
    scene: 'intro',
    position: {
      x: 3 * 64 + 43,
      y: 43
    }
  },
	maps: [
    {
      name: 'yewRoad',
      filename: 'yewRoad.json',
      x: 0,
      y: 0,
    },
    {
      name: 'iolos',
      filename: 'iolos-hut.json',
      x: 1,
      y: 0,
    },
    {
      name: 'westForest',
      filename: 'westForest.json',
      x: 2,
      y: 0,
    },
    {
      name: 'eastForest',
      filename: 'eastForest.json',
      x: 3,
      y: 0,
    },
	],
  scenes: {
    intro: [
      'You are standing on a clearing surrounded by a dark and forbidding forest. Overhead, rolling, black clouds fill the sky while thunder and lightning continue to crash around you.',
      'Britannia! It must be Britannia!',
      'But something is wrong. Instead of the sense of elation expected upon returning here after all these years, you are overcome with a foreboding sense of wrongness.'
    ],
    gotoIolo: [
      'Using his forefinger, Lord Asteroth traces a pattern in the air. An ebony black arrow solidifies before him and hangs suspended for a moment.',
      'Then, with a flick of his hand, he casts the glowing bolt at Shamino.',
      'The arrow strikes him full in the chest!',
      'Dropping his sword, he sinks into the ground, lines of pain, and something worse, etched into his face.',
      'Without warning, the amulet, tighly gripped into your hand, emits a bright blue glow that quickly envolves and swallows Asteroth and his party.',
      'Within a second, they are gone.',
      '"We will find aid at Iolo\'s, it is but a short walk to the east" Shamino mutters.',
      'With a grim determination, you help Shamino to his feet and half-carry him out of the clearing and eastward into the forest.'
    ]
  }
}