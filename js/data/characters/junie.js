import { week } from './util.js';
import { scenes, hangouts, texts, pings, finale } from '../scenes/junie.js';

export default {
  id: 'junie',
  name: 'Junie Park',
  first: 'Junie',
  age: 26,
  title: 'Co owner, Kettle & Crumb',
  blurb: 'Talks fast, jokes when she is stressed, and remembers your order after one visit.',
  color: '#ff8fa3',
  romance: true,
  home: 'cafe',
  look: {
    face: 'round',
    skin: '#f0cba9',
    eyes: '#3a2622',
    brow: '#1f171b',
    hair: { style: 'bob', color: '#211a20', streak: '#3fd0c0' },
    outfit: { type: 'apron', color: '#f2e6d3', accent: '#3d6f73', trim: '#f2a65a' },
    extras: ['hoops'],
  },
  schedule: week([
    ['cafe', 'cafe', 'records', null],
    ['cafe', 'cafe', 'cafe', null],
    ['cafe', 'cafe', 'arcade', 'market'],
    ['cafe', 'cafe', 'cafe', null],
    ['cafe', 'cafe', 'market', 'pier'],
    ['cafe', 'cafe', 'pier', 'market'],
    [null, 'pier', 'cafe', null],
  ]),
  likes: ['sweet', 'cute', 'plant'],
  dislikes: ['tool'],
  bio: [
    { rank: 1, text: 'Grew up on Halcyon Row. Runs Kettle & Crumb with her Aunt Hana. Names every appliance and talks to all of them.' },
    { rank: 2, text: 'Aunt Hana keeps saying she is "semi retiring." Junie changes the subject every time, usually by offering you a pastry.' },
    { rank: 3, text: 'She trained as a pastry cook and deferred a place at a program abroad "for one year." That was two years ago.' },
    { rank: 4, text: 'She is done pretending the question does not exist. Whatever she chooses, she wants to choose it on purpose.' },
  ],
  gifts: {
    like: [
      'Okay, no, you cannot just hand me things that good. I am going to be weird about it.',
      'Oh my god. Oh, this is so dumb and I love it. Do not tell anyone I made that noise.',
      'You noticed. You actually noticed. Okay. Yeah. I am keeping this forever.',
    ],
    ok: ['Aw, thanks. That\'s really nice of you.', 'Ha, look at you. Thank you, seriously.'],
    dislike: [
      'Oh. Uh. Wow. Thank you? I will find a place for this. In a drawer. A far one.',
      'That is very thoughtful and also I have no idea what to do with it. Love you though.',
    ],
  },
  ai: {
    bible:
      'Junie Park, 26, Korean American, born and raised on Halcyon Row. Co owner of Kettle & Crumb with her Aunt Hana, who is quietly trying to retire and hand her the whole place. ' +
      'Junie is warm, fast talking and funny in a teasing way. When she is stressed she makes jokes and cleans things. She remembers everyone\'s orders and small details about people, and she notices when someone is off. ' +
      'She hates being the person who needs help. She trained as a pastry cook and deferred a place at a pastry program abroad two years ago "just for a year." ' +
      'She is not sure whether she wants the café or is just too scared to say no to it. She names appliances (the leaking espresso machine is Gerald).',
    speech:
      'Quick bursts. Starts with "okay wait", "no because", "I mean", "honestly". Interrupts and corrects herself. Uses food comparisons. Teases people she likes. Mild swearing only ("oh my god", "ugh", the odd "damn"). ' +
      'When she is serious she gets quieter and shorter, not more poetic. She never gives a speech.',
    texting:
      'lowercase, short, the odd "lol". Sends pastry photos in words ("croissant collapsed again"). Rarely more than two or three short messages in a row.',
    secrets: [
      { rank: 2, text: 'Aunt Hana wants to retire and give Junie the café. Junie deflects with jokes when it comes up.' },
      { rank: 3, text: 'She deferred a pastry program abroad and cannot tell if she is staying by choice or by fear.' },
      { rank: 4, text: 'She has decided to talk to Aunt Hana honestly. She is scared and also relieved.' },
    ],
    threads: [
      'Gerald the espresso machine is leaking again',
      'a croissant recipe that keeps collapsing',
      'Aunt Hana napping in the back room and pretending she is not',
      'Mr. Okonkwo at the laundromat and his fold service',
      'emails from the festival committee',
    ],
    knowsOthers: {
      dez: 'Comes in for a black coffee and hides in a paperback. She thinks he is more sensitive than he lets on.',
      priya: 'Orders the same oat flat white every day and apologizes for ordering it. Junie wants to feed her.',
      tomek: 'Trades broth for pastry seconds. She is a little scared of how well he sees through people.',
      sable: 'Says she hates sweets and takes the leftovers anyway. Junie leaves the good ones by the door.',
      amara: 'Comes in after her show in sunglasses at 7am. Junie saves her the quiet table.',
    },
  },
  scenes,
  hangouts,
  texts,
  pings,
  finale,
};
