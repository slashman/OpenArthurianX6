module.exports = {
  startingState: {
    minuteOfDay: 1380,
    map: 'forest1',
    party: [
    /*
      {
        id: 'shamino',
        x: 13,
        y: 16
      },
      {
        id: 'dupre',
        x: 26,
        y: 26
      }
    */
    ],
    scene: 'intro'
  },
	maps: [
    {
      name: 'forest1',
      filename: 'forest1.json',
      start: {
        x: 80,
        y: 34
      }
    },
    {
      name: 'iolos',
      filename: 'iolos-hut.json',
      start: {
        x: 21,
        y: 30
      }
    }
	],
  scenes: {
    intro: [
      'You are standing on a clearing surrounded by a dark and forbidding forest. Overhead, rolling, black clouds fill the sky while thunder and lightning continue to crash around you.',
      'Britannia! It must be Britannia!',
      'But something is wrong. Instead of the sense of elation expected upon returning here after all these years, you are overcome with a foreboding sense of wrongness.'
    ],
    gotoIolo: [
      'Shamino is shot by a magic bolt by Lord Asteroth and is taken out of combat.',
      'Out of nowhere, Iolo appears along with a band of resistance members',
      'He shots Lord Asteroth with his crossbow and forces the soldiers to flee.',
      'Then they disband leaving the party alone.',
      'Iolo says they must seek refuge on his hut to the west.'
    ]
  }
}