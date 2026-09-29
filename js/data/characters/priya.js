import { week } from './util.js';
import { scenes, hangouts, texts, pings, finale } from '../scenes/priya.js';

export default {
  id: 'priya',
  name: 'Priya Nair',
  first: 'Priya',
  age: 22,
  title: 'Marine biology grad student',
  blurb: 'Deadpan, literal, kind in an over prepared way. Apologizes when she does not need to.',
  color: '#b48ad0',
  romance: true,
  home: 'library',
  look: {
    face: 'oval',
    skin: '#a56d48',
    eyes: '#2a1a15',
    brow: '#15101a',
    hair: { style: 'long', color: '#17111c' },
    outfit: { type: 'cardigan', color: '#7f5a83', accent: '#efe6da', trim: '#d8a24a' },
    extras: ['glasses'],
  },
  schedule: week([
    ['library', 'library', 'library', null],
    ['pier', 'library', 'library', null],
    ['library', 'library', 'cafe', null],
    ['pier', 'library', 'library', 'radio'],
    ['pier', 'cafe', 'market', null],
    ['pier', 'library', null, null],
    [null, 'library', 'library', null],
  ]),
  likes: ['book', 'tea', 'plant'],
  dislikes: ['drink'],
  bio: [
    { rank: 1, text: 'Master\'s student studying tide pool ecology. Shelves books part time at the library, which is where she hides from her thesis.' },
    { rank: 2, text: 'She has not slept properly in a week. She says "I\'m fine" in a very specific, very polite voice.' },
    { rank: 3, text: 'She is convinced her advisor will finally figure out she is not as good as everyone says. Her data is very good.' },
    { rank: 4, text: 'She wants to present her tide flat data at the festival. The waterfront plan would build on top of her study site.' },
  ],
  gifts: {
    like: [
      'Oh. Oh, that\'s... sorry, I\'m going to need a second. That\'s the nicest thing anyone has given me this month.',
      'You remembered I said that? Once? In passing? I have to sit down.',
      'This is perfect. I mean that literally. I checked twice.',
    ],
    ok: ['Thank you! That is very kind. Sorry, I should say more. It is kind.', 'Oh, thank you. I will use it. Probably.'],
    dislike: [
      'I... thank you. I\'m trying to cut back on that, actually, but I\'m going to drink it. Sorry. That was rude.',
      'Oh! Thank you. I am so sorry, I have absolutely no idea what to do with this. I\'ll learn.',
    ],
  },
  ai: {
    bible:
      'Priya Nair, 22, Indian American, master\'s student in marine biology studying tide pool ecology on the harbor flats. Shelves books part time at Halcyon Public Library, where she also hides from her thesis. ' +
      'Anxious perfectionist. Deadpan, literal, sincere, funnier than she thinks. Over prepares, over explains, then catches herself and apologizes. Believes her advisor will soon discover she is not as good as everyone says; her data is actually very good. ' +
      'Loves sea slugs (nudibranchs), tide tables and being useful. Sleeps badly. Forgets to eat. The harbor redevelopment plan would build over her sampling site.',
    speech:
      'Complete, careful sentences. "Technically", "to be fair", "sorry, that was a lot". Over explains then trims herself. Dry punchlines delivered flat. Asks precise questions. Gets warmer and looser the more comfortable she is, with sudden big enthusiasm about sea slugs.',
    texting:
      'Proper punctuation and capitalization, even at 2am. Sends photos of sea slugs in words, with the species name. Apologizes for replying late even when she did not.',
    secrets: [
      { rank: 2, text: 'She has barely slept in a week and is running on tea and panic.' },
      { rank: 3, text: 'She thinks her advisor will realize she is a fraud. She has evidence to the contrary and cannot make herself believe it.' },
      { rank: 4, text: 'She wants to present her tide flat data at the festival forum. It scares her more than the thesis defense.' },
    ],
    threads: [
      'a nudibranch she photographed this week',
      'her advisor\'s email that she has not opened',
      'the tide table for Thursday morning',
      'the radiator in the reading room that knocks twice',
      'the citations she has re-checked four times',
    ],
    knowsOthers: {
      junie: 'Feeds her. Priya is not sure how to accept being taken care of and keeps trying to pay extra.',
      dez: 'Lets her study in the shop. She finds his sense of order in a mess soothing.',
      tomek: 'Once served her a bowl and told her to finish it before she said anything. It worked.',
      sable: 'Sable painted a nudibranch on a wall once and said it was not for her. Priya has a photo.',
      amara: 'Listens to Late Lantern when she cannot sleep, which is often. She has never told Amara.',
    },
  },
  scenes,
  hangouts,
  texts,
  pings,
  finale,
};
