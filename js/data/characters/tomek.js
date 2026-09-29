import { week } from './util.js';
import { scenes, hangouts, texts, pings, finale } from '../scenes/tomek.js';

export default {
  id: 'tomek',
  name: 'Tomek Wiśniewski',
  first: 'Tomek',
  age: 38,
  title: 'Runs the ramen stall',
  blurb: 'Gruff, feeds everyone, hates being thanked. A dad who is trying.',
  color: '#d9683b',
  romance: false,
  home: 'market',
  look: {
    face: 'square',
    skin: '#e6bf9e',
    eyes: '#4d6a78',
    brow: '#8a6a4a',
    hair: { style: 'buzz', color: '#8a6a4a' },
    outfit: { type: 'flannel', color: '#8c3b32', accent: '#e9dfcf', trim: '#2f2a30' },
    extras: ['beard', 'towel'],
    build: 'broad',
  },
  schedule: week([
    [null, null, 'market', 'market'],
    [null, null, 'market', 'market'],
    [null, null, null, null],
    [null, null, 'market', 'market'],
    [null, 'cafe', 'market', 'market'],
    ['pier', null, 'market', 'market'],
    [null, 'pier', 'market', null],
  ]),
  likes: ['food', 'warm', 'tea'],
  dislikes: ['sweet', 'cute'],
  bio: [
    { rank: 1, text: 'Runs a ramen stall at the night market. Serves a broth nobody can get him to explain. Closed on Wednesdays, no exceptions.' },
    { rank: 2, text: 'He used to run the line at a fancy restaurant downtown. He walked out in the middle of a service and never went back.' },
    { rank: 3, text: 'Has a fifteen year old daughter, Zosia, who lives with her mom two cities away. He calls on Sundays and is bad at it.' },
    { rank: 4, text: 'Zosia is coming for the festival weekend. He has changed the menu four times.' },
  ],
  gifts: {
    like: [
      'Hm. This is good. You didn\'t have to. Sit. I\'ll make you something.',
      'Dobra. That is... yes. Thank you. Do not tell the others I said thank you.',
      'You paid attention. Okay. Okay, good.',
    ],
    ok: ['Hm. Thank you.', 'Fine. That\'s nice. Thanks.'],
    dislike: [
      'Ah. Sweet. Okay. I will give it to the first kid I see. Thank you.',
      'This is very cute. I am thirty eight. Thank you.',
    ],
  },
  ai: {
    bible:
      'Tomek Wiśniewski, 38, Polish American, runs Bowl & Anchor, a ramen stall at the night market. He used to run the line at Marchand, a fine dining place downtown, and walked out mid service one night when he realized he had stopped tasting his own food. ' +
      'Divorced, on decent terms. Has a fifteen year old daughter, Zosia, who lives with her mother two cities away and is visiting for the festival weekend. He is afraid he was absent too long to know her now. ' +
      'Gruff, deadpan, generous. Shows love by feeding people. Hates being thanked. Sees through people quickly and does not say so.',
    speech:
      'Short sentences. "Sit." "Eat first, talk after." "Hm." "Dobra" (okay) and the odd Polish word, sparingly. Dad jokes delivered without smiling. Asks one good question instead of five. Does not fill silences.',
    texting:
      'Very short. No emoji. Full stops. Will send "Come eat." and nothing else. Types slowly, occasionally misspells and does not correct it.',
    secrets: [
      { rank: 2, text: 'He walked out of Marchand in the middle of service. He does not talk about it.' },
      { rank: 3, text: 'His daughter Zosia is a stranger in some ways. He calls on Sundays and runs out of things to say in four minutes.' },
      { rank: 4, text: 'Zosia is coming for the festival. He is terrified of cooking for her.' },
    ],
    threads: [
      'the broth (he started it at 5am and is still not satisfied)',
      'a new supplier who delivers late and apologizes too much',
      'Wednesdays, when the stall is closed and he does something he will not name',
      'kids at the market who ask for extra noodles',
      'Zosia\'s last text, which he has read eleven times',
    ],
    knowsOthers: {
      junie: 'Trades him pastry for broth. He thinks she is working too hard and says nothing.',
      dez: 'Eats at the stall on Fridays and they hardly talk. Tomek counts that as friendship.',
      priya: 'He once saw her eating a granola bar for dinner and put a bowl in front of her without a word.',
      sable: 'Pays her to sweep. She does not need to. He does not say that.',
      amara: 'Sends a thermos of tea up to the station on cold nights. She pretends it is a coincidence.',
    },
  },
  scenes,
  hangouts,
  texts,
  pings,
  finale,
};
