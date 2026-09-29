// Things to do alone that cost a time slot and build you up. Each one shows a
// short scene chosen by the day, so it varies without needing a random source.

export const ACTIVITIES = [
  {
    id: 'shift',
    loc: 'cafe',
    slots: [0, 1],
    label: 'Work a shift',
    desc: 'Pull shots at Kettle & Crumb. Pays $14.',
    needFlag: 'job_cafe',
    gain: { money: 14, stat: ['charm', 1] },
    scenes: [
      'The morning rush comes in three waves. By the third you can tell who wants small talk and who wants to be left alone with their cup.',
      'You steam milk until the pitcher stops feeling hot. A regular tips you a folded dollar and a nod. That counts.',
      'Somebody orders something that does not exist. You invent it. They love it. It is now on the chalkboard as "Special."',
    ],
  },
  {
    id: 'study',
    loc: 'library',
    slots: [0, 1, 2],
    label: 'Study in the reading room',
    desc: 'A few quiet hours. Builds Wit.',
    gain: { stat: ['wit', 1] },
    scenes: [
      'You read about the harbor\'s tides until the radiator knocks twice, which the regulars say means it is time to stretch.',
      'You follow one interesting question through four books. It ends nowhere useful. It was still a great afternoon.',
      'The reading room is a lung breathing very slowly. You get through a whole chapter and remember it.',
    ],
  },
  {
    id: 'run',
    loc: 'pier',
    slots: [0, 2],
    label: 'Run the waterfront',
    desc: 'Out to the lighthouse and back. Builds Grit.',
    gain: { stat: ['grit', 1] },
    scenes: [
      'The boards drum under your feet. At the far end you think about stopping. You turn around and do the whole thing again.',
      'A gull follows you for two hundred meters, judging. You do not give it the satisfaction of slowing down.',
      'Salt on your lips, lungs on fire, city lights coming on one at a time. You feel about ten feet tall.',
    ],
  },
  {
    id: 'volunteer',
    loc: 'radio',
    slots: [2, 3],
    label: 'Help at the station',
    desc: 'Cue tracks, answer the request line. Builds Empathy.',
    gain: { stat: ['empathy', 1] },
    scenes: [
      'You answer the request line. A man wants a song for a wife who is in the next room. He does not say why he is calling.',
      'You log the calls in a notebook. Half the callers just want to hear a person pick up. You pick up.',
      'Someone requests a song that does not exist. You spend twenty minutes helping them find the one they were thinking of.',
    ],
  },
  {
    id: 'arcade',
    loc: 'arcade',
    slots: [1, 2, 3],
    label: 'Play a few rounds',
    desc: '$4 in tokens. A little Charm and a little Grit.',
    cost: 4,
    gain: { stat: ['charm', 1] },
    scenes: [
      'You lose four games and win one. A stranger high fives you for the one.',
      'A kid shows you a trick on the racing cabinet. You use it. You still lose. You have never had more fun losing.',
      'You get onto the high score board. Your initials are three letters long and completely unearned.',
    ],
  },
  {
    id: 'browse',
    loc: 'records',
    slots: [1, 2],
    label: 'Dig through the crates',
    desc: 'Flip through records. Builds Wit.',
    gain: { stat: ['wit', 1] },
    scenes: [
      'You flip through a hundred sleeves. One of them is exactly the wrong kind of beautiful. You put it back and think about it for hours.',
      'You learn the difference between a first pressing and a good one from the sound of a needle drop alone.',
    ],
  },
  {
    id: 'help_stall',
    loc: 'market',
    slots: [2, 3],
    label: 'Bus tables at the market',
    desc: 'Carry bowls, wipe tables. Pays $12 and builds Grit.',
    gain: { money: 12, stat: ['grit', 1] },
    scenes: [
      'Steam, shouting, forty bowls an hour. Your forearms ache and a stranger calls you "the new kid" like it is a promotion.',
      'A busy night. You learn to carry three bowls at once, and that fewer is a very reasonable number.',
    ],
  },
];

export const ACTIVITY_BY_ID = Object.fromEntries(ACTIVITIES.map((a) => [a.id, a]));
