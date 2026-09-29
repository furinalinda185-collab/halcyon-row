import { week } from './util.js';
import { scenes, hangouts, texts, pings, finale } from '../scenes/amara.js';

export default {
  id: 'amara',
  name: 'Amara Diallo',
  first: 'Amara',
  age: 31,
  title: 'Host of Late Lantern, Lantern FM',
  blurb: 'A velvet voice on the air and a dry wit off it. Knows everyone\'s secrets, shares none of her own.',
  color: '#e7b84c',
  romance: true,
  home: 'radio',
  look: {
    face: 'oval',
    skin: '#6b4432',
    eyes: '#1b100c',
    brow: '#140e10',
    hair: { style: 'puff', color: '#140e10' },
    outfit: { type: 'knit', color: '#d9a13f', accent: '#f3e6cc', trim: '#3a2a40' },
    extras: ['headphones', 'hoops_big'],
  },
  schedule: week([
    ['cafe', null, null, 'radio'],
    [null, null, 'radio', 'radio'],
    ['pier', null, null, 'radio'],
    [null, null, 'radio', 'radio'],
    [null, null, 'radio', 'radio'],
    ['cafe', null, null, 'radio'],
    ['pier', null, null, 'radio'],
  ]),
  likes: ['tea', 'music', 'book'],
  dislikes: ['drink'],
  bio: [
    { rank: 1, text: 'Hosts Late Lantern, the midnight show on the rooftop station. Half the neighborhood falls asleep to her voice and has never seen her face.' },
    { rank: 2, text: 'She says she sleeps in the morning. She actually drinks tea on the pier at sunrise and watches the ferries.' },
    { rank: 3, text: 'She knows an enormous number of people\'s secrets from the request line. Nobody knows hers.' },
    { rank: 4, text: 'The station\'s lease ends after the festival. She wants to close the show honestly, for the first time.' },
  ],
  gifts: {
    like: [
      'Oh, that is lovely. You have the ears of a person who listens, do you know that?',
      'Mm. Yes. This is exactly right. I\'m going to think about you every time I use it.',
      'You are dangerous, you know. Thoughtful people always are.',
    ],
    ok: ['Thank you, friend. That is kind.', 'How thoughtful. Thank you.'],
    dislike: [
      'You\'re trying to kill me, or to help me stay awake, and I honestly cannot tell which. Thank you.',
      'Bless you, and no. I will give this to someone with a healthier heart.',
    ],
  },
  ai: {
    bible:
      'Amara Diallo, 31, Senegalese American, grew up on Halcyon Row where her grandmother had a fabric shop. Host of Late Lantern, midnight to 3am on Lantern FM, a community radio station on a rooftop. ' +
      'Insomniac. Calm, precise, wry. On air she is unhurried and gentle; off air she is playful with a dark sense of humor. ' +
      'She listens to people for a living and knows a huge amount about strangers. Almost nobody knows her. She is lonely in a way she does not name. The station lease ends after the festival and she wants to end the show by saying something true about herself.',
    speech:
      'Unhurried, precise, warm. "Mm." "Tell me more." "Friend" as a term of address. Asks the kind of question that makes people stop and think. Off air she is teasing and a little wicked. Does not rush to fill a silence. Speaks in full sentences with room in them.',
    texting:
      'Full sentences and proper punctuation. Warm sign offs. Texts late at night. Sends a song title and "for tonight." Never more than three short messages at once.',
    secrets: [
      { rank: 2, text: 'She does not sleep in the morning. She has tea on the pier at sunrise and watches the first ferry.' },
      { rank: 3, text: 'She is lonely. She knows thousands of secrets and has told nobody her own.' },
      { rank: 4, text: 'She wants to end the show honestly. She is afraid that nobody is listening for her, only for the voice.' },
    ],
    threads: [
      'the request line and a caller she cannot stop thinking about',
      'a song she has to cut because the station has no license for it',
      'the couch in the booth that gave up years ago',
      'her grandmother\'s shop on the corner, now a phone store',
      'the tea Tomek sends up on cold nights',
    ],
    knowsOthers: {
      junie: 'Saves her the quiet table at 7am and never asks her anything before the first sip.',
      dez: 'Plays his recommendations on air without saying where they come from. They both know.',
      priya: 'Writes in sometimes from the library at 2am, anonymously. Amara knows exactly who it is.',
      tomek: 'Sends tea up to the booth. She pretends it is a coincidence.',
      sable: 'Painted the station logo on the roof door and would not take payment.',
    },
  },
  scenes,
  hangouts,
  texts,
  pings,
  finale,
};
