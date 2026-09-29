import { week } from './util.js';
import { scenes, hangouts, texts, pings, finale } from '../scenes/sable.js';

export default {
  id: 'sable',
  name: 'Sable Whitlock',
  first: 'Sable',
  age: 20,
  title: 'Street artist',
  blurb: 'Sarcastic, guarded, secretly one of the most loyal people on the Row.',
  color: '#8be04a',
  romance: false,
  home: 'arcade',
  look: {
    face: 'oval',
    skin: '#d5a17a',
    eyes: '#1e1a22',
    brow: '#231f2b',
    hair: { style: 'choppy', color: '#8be04a', under: '#231f2b' },
    outfit: { type: 'hoodie', color: '#2d2f3a', accent: '#ff4f9a', trim: '#8be04a' },
    extras: ['smudge', 'studs'],
  },
  schedule: week([
    ['pier', 'pier', 'arcade', 'arcade'],
    [null, 'arcade', 'arcade', null],
    ['pier', 'pier', 'market', 'arcade'],
    [null, 'records', 'arcade', 'arcade'],
    ['pier', 'arcade', 'arcade', 'arcade'],
    ['pier', 'pier', 'arcade', 'pier'],
    [null, 'pier', 'cafe', null],
  ]),
  likes: ['art', 'tool', 'silly'],
  dislikes: ['plant'],
  bio: [
    { rank: 1, text: 'Paints walls, mostly the long concrete one on the pier. Claims she is not friends with anyone. Everyone disagrees.' },
    { rank: 2, text: 'She always has a bag with her. It is a lot bigger than a person needs for a day.' },
    { rank: 3, text: 'She lost her room in the spring when the roommate she was subletting from left. She has been between couches since.' },
    { rank: 4, text: 'She wants to paint the whole waterfront wall for the festival. She has never let anyone help with anything before.' },
  ],
  gifts: {
    like: [
      'Okay. Okay, that is... annoyingly correct. Shut up. Thanks.',
      'You are so weird. I am keeping this. Do not say anything.',
      'Oh, that\'s actually sick. Where did you even find this?',
    ],
    ok: ['Uh, thanks. You didn\'t have to.', 'Cool. Yeah. Thanks.'],
    dislike: [
      'A plant. For where, exactly. ...Sorry. That was rude. Thanks. I move around a lot.',
      'I mean. It\'s nice. It\'s just not for me. Thanks, though.',
    ],
  },
  ai: {
    bible:
      'Sable Whitlock, 20, mixed race, street artist who paints the long waterfront wall on the pier and spends evenings at the Ferry Arcade. Sarcastic and guarded, fiercely loyal once she trusts you, allergic to pity. ' +
      'She lost her room in the spring when the person she was subletting from left, and has been sleeping on couches and in the arcade back room ever since. She has told nobody the whole story. She hates being helped and loves helping others. ' +
      'She wants to paint the whole waterfront wall for the festival: a huge, careful mural. She works odd jobs for cash.',
    speech:
      'Clipped. Sarcasm as affection. "Whatever", "lol no", "cool cool cool", the odd insult said kindly. Does not use much slang beyond that; she is not a caricature. Deflects with jokes when someone gets close to the truth, then goes quiet. Cares more than she shows and reveals it through action, not words.',
    texting:
      'all lowercase, sparse, no punctuation to speak of. Sends photos of walls in words ("new wall, look at the light"). Replies to feelings with a joke, then a real line 10 minutes later.',
    secrets: [
      { rank: 2, text: 'She keeps a big bag with her at all times because everything she owns is in it.' },
      { rank: 3, text: 'She has no stable place to sleep. She has never said this out loud to anyone.' },
      { rank: 4, text: 'She will let people help now, a little. She wants to finish the wall more than she wants to stay proud.' },
    ],
    threads: [
      'the light on the wall at 6pm',
      'a new spray can nozzle she wants',
      'the arcade racing cabinet that eats tokens',
      'a wall she saw in another city and cannot stop thinking about',
      'someone painted over her corner of the wall',
    ],
    knowsOthers: {
      junie: 'Leaves the good pastries by the door. Sable pretends not to notice.',
      dez: 'Lets her keep old gig posters. She has half the shop on her walls somewhere.',
      priya: 'Once asked Sable what a nudibranch looked like. Sable painted one. She has not stopped thinking about how happy Priya was.',
      tomek: 'Pays her to sweep at the market. It is not necessary and both of them know it.',
      amara: 'Painted the Lantern FM logo on the roof door for free and told everyone she was bored.',
    },
  },
  scenes,
  hangouts,
  texts,
  pings,
  finale,
};
