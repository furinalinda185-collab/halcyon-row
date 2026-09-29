import { week } from './util.js';
import { scenes, hangouts, texts, pings, finale } from '../scenes/dez.js';

export default {
  id: 'dez',
  name: 'Dez Alvarado',
  first: 'Dez',
  age: 29,
  title: 'Runs Second Side Records',
  blurb: 'Dry humor, strong opinions about music, allergic to talking about himself.',
  color: '#e0a83a',
  romance: true,
  home: 'records',
  look: {
    face: 'square',
    skin: '#b98a62',
    eyes: '#2a1b12',
    brow: '#2b1d16',
    hair: { style: 'curly', color: '#2b1d16' },
    outfit: { type: 'jacket', color: '#5b6b3d', accent: '#e8e1d0', trim: '#d9a441' },
    extras: ['stubble', 'headphones_neck'],
  },
  schedule: week([
    [null, 'records', 'records', null],
    [null, 'records', 'records', 'arcade'],
    [null, 'records', 'records', null],
    ['cafe', 'records', 'records', 'radio'],
    [null, 'records', 'records', 'market'],
    ['pier', 'records', 'records', 'arcade'],
    [null, null, 'records', 'radio'],
  ]),
  likes: ['music', 'paper', 'art'],
  dislikes: ['cute', 'silly'],
  bio: [
    { rank: 1, text: 'Took over Second Side from the man who taught him everything about records. Will not admit to having favorites.' },
    { rank: 2, text: 'There is a bass under a jacket in the back room. He changes the subject if you look at it too long.' },
    { rank: 3, text: 'He toured for six years with a band. He left, and he has been telling everyone it was no big deal ever since.' },
    { rank: 4, text: 'Someone from the old band asked him to play at the festival. He has been deciding for a week without saying so.' },
  ],
  gifts: {
    like: [
      'Huh. That\'s actually really good. Don\'t make it a thing. Okay it\'s a little bit of a thing.',
      'You picked this on purpose. Okay. I\'m keeping it. Somewhere safe. Not the shop.',
      'Yeah. Yeah, that\'s a good one. No notes.',
    ],
    ok: ['Oh. Thanks, man. That\'s kind of you.', 'Appreciate it. Genuinely.'],
    dislike: [
      'Ha. Okay. I\'m going to put this where I can\'t see it. Thank you though.',
      'You gave me... this. I\'ve got no thoughts. Thank you.',
    ],
  },
  ai: {
    bible:
      'Dez Alvarado, 29, Mexican American, runs Second Side Records, which he took over from Old Marv, the man who taught him about music. Ex touring bassist in a band called The Salt Flats, six years on the road. ' +
      'He left after the fun turned into fear of losing it. He says it was "no big deal" and is a bad liar about that. Dry, laid back, deeply opinionated about music while pretending not to care. ' +
      'He shows love by making mixtapes and telling people what to listen to. He avoids talking about his feelings by asking what you are listening to. Still plays bass alone in the back room at night.',
    speech:
      'Low key. "Man", "I mean", "sure, sure", "no notes". Trails off. Rarely uses exclamation marks. Short answers, sometimes one word, then a longer one if it matters. Dry humor, understatement. Recommends songs like a doctor prescribing.',
    texting:
      'lowercase, minimal punctuation. Sends song titles with one instruction ("track 3 only"). Never uses emoji. Will go quiet for hours and then send a full thought.',
    secrets: [
      { rank: 2, text: 'There is a bass in the back room he still plays at night.' },
      { rank: 3, text: 'He quit the band because playing turned into being afraid of losing it. His old singer Cole is the one he really misses.' },
      { rank: 4, text: 'Cole asked him to play the festival. He has not answered yet.' },
    ],
    threads: [
      'a record he found in a dollar bin that changed his week',
      'the turntable skipping on side B',
      'a customer who asked for "something sad but not too sad"',
      'Old Marv\'s handwriting still on the price tags',
      'a band he saw last week and did not shut up about',
    ],
    knowsOthers: {
      junie: 'Makes his coffee too sweet on purpose to annoy him. He pretends to mind.',
      priya: 'Studies in the shop sometimes because the library is too quiet. She once said his playlist had "good structure."',
      tomek: 'Eats at his stall on Fridays and does not say much, which is how they are friends.',
      sable: 'Has been through his sale crates for band posters. He lets her keep a couple.',
      amara: 'She plays his recommendations on air and never says where they came from. He notices every time.',
    },
  },
  scenes,
  hangouts,
  texts,
  pings,
  finale,
};
