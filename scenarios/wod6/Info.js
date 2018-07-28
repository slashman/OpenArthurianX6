module.exports = {
  startingState: {
    map: 'forest1',
    x: 24,
    y: 26,
    party: [
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
    ],
    scene: 'intro'
  },
	maps: [
    {
      name: 'forest1',
      filename: 'forest1.json'
    }
	],
  scenes: {
    intro: [
      'As the light from the moongate fades away, the Britannian night welcomes you into a forest clearing,',
      'You cannot forget the smell of these woods, this is unmistakably the forest of the druids, near Yew.'
    ]
  }
}