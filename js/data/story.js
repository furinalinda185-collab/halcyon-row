// The placeholder story: "The Lantern Festival".
//
// This file is the only place the main plot lives. To replace the story, edit or
// swap STORY_BEATS. A beat plays automatically the first time the game reaches its
// day and time slot (or later, if you were busy). Each beat is:
//
//   id       unique string
//   day,slot when it becomes due (slot 0 Morning .. 3 Night)
//   loc      where you are afterwards
//   advance  how many time slots the scene takes up
//   nodes    (env) => script nodes; env.state is the live game state
//
// Friends' own rank scenes are in data/scenes/*.js and do not need to change.

import {
  voice, me, narr, choice, opt, iff, set, bg, show, hide, title, complete, remember, stat, clearStage,
} from '../core/dsl.js';
import { CHARACTERS, CHAR_BY_ID } from './characters/index.js';
import { sceneNodes } from '../core/scenes.js';
import { FESTIVAL_DAY } from '../core/clock.js';

const O = voice('okonkwo');
const H = voice('hana');
const J = voice('junie');
const D = voice('dez');
const P = voice('priya');
const T = voice('tomek');
const S = voice('sable');
const A = voice('amara');

const met = (id) => ({ rank: [id, 1] });

export const STORY_BEATS = [
  // ---------------------------------------------------------------------- 1
  {
    id: 'arrival',
    day: 1,
    slot: 0,
    loc: 'cafe',
    advance: 1,
    nodes: () => [
      title('Halcyon Row', 'Day 1 · Monday'),
      bg('home'),
      narr('Your new room is above the Suds & Duds laundromat. It has one good window, a radiator with opinions, and thirty nine boxes you have absolutely no plan to unpack today.'),
      narr('The kettle is in one of them. You do not know which one.'),
      narr('Below the window the street is waking up: shutters rattling, a bicycle bell, the smell of something baking. Salt on the air. The harbor is somewhere out there, past the rooftops.'),
      narr('You decide to find coffee the old fashioned way. By going outside.'),
      ...sceneNodes(CHAR_BY_ID.junie, CHAR_BY_ID.junie.scenes[0]),
      bg('cafe'),
      narr('You step back onto the street with a warm cup in your hand. Halcyon Row is small, crooked, and a little bit magical in the morning light.'),
      narr('A festival banner sags between two lamp posts: THE LANTERN FESTIVAL, DAY 28. Somebody has drawn a smiley face on the corner of it.'),
      narr('You have about a month. There are people here you have not met yet.'),
    ],
  },

  // ---------------------------------------------------------------------- 2
  {
    id: 'notice',
    day: 7,
    slot: 2,
    loc: 'home',
    advance: 0,
    nodes: () => [
      title('The Notice', 'Day 7 · Sunday'),
      bg('home'),
      narr('There is a paper flyer taped to every lamp post between the laundromat and the pier. You have walked past the same one four times before you actually stop to read it.'),
      narr('HARBORFRONT PROMENADE. Meridian Harbor Group proposes to redevelop the waterfront from the Ferry Arcade to the Pier. Public comment closes on the night of the Lantern Festival. The block association votes the following day.'),
      show('okonkwo', 'worried'),
      O('worried', 'You read it? Everyone reads it. No one says anything. It is like a funeral for an event that has not happened.'),
      narr('Mr. Okonkwo, the man who owns the laundromat, is standing on the pavement with a laundry basket in his arms and the expression of someone rehearsing a speech he has not decided to give.'),
      O('neutral', 'Thirty one years I have folded the shirts on this street. You know what the waterfront was, when I came? A fish market. A real one. Loud. Ugly. Ours.'),
      choice([
        opt('Can they really just do that?', [
          O('neutral', 'They can if nobody stops them. That is the trick with big companies. They count on you being tired.'),
        ], { stat: ['wit', 1] }),
        opt('That sounds like it matters a lot to you.', [
          O('sad', 'It matters to me more than my own knees. And my knees matter a great deal.'),
        ], { stat: ['empathy', 1] }),
        opt('What can we do?', [
          O('happy', 'Ah. The right question. The festival. It is on the twenty eighth. It is the one night every year that everybody shows up. If the Row is loud enough that night, they will hear.'),
        ], { stat: ['grit', 1] }),
      ]),
      O('happy', 'Also. Have you considered my fold service? Very competitive rates.'),
      choice([
        opt('No, thank you.', [O('smirk', 'Thursday, then.')]),
        opt('Ask me on Thursday.', [O('laugh', 'Thursday. Ha. A man who understands the dance.')]),
      ]),
      hide('okonkwo'),
      narr('You look at the flyer again, and then along the street. The café, the record shop, the noodle cart under its lanterns. You have a feeling you are going to care about this more than you planned.'),
      narr('The festival is in twenty one days.'),
      set('story_notice'),
    ],
  },

  // ---------------------------------------------------------------------- 3
  {
    id: 'gathering',
    day: 14,
    slot: 2,
    loc: 'cafe',
    advance: 1,
    nodes: () => [
      title('After Hours', 'Day 14 · Monday'),
      bg('cafe'),
      narr('Kettle & Crumb after closing. Someone has pushed the tables together into one long one, and every chair in the building is now around it.'),
      show('hana', 'serious', 'right'),
      H('serious', 'Sit. Everyone. I have made too much food, so you will not have to talk with your mouths empty.'),
      show('junie', 'happy', 'left'),
      J('happy', 'Auntie called a meeting. She has never called a meeting. I am a little bit terrified.'),
      H('neutral', 'Fourteen days. The festival has been held for thirty one years. I have run this café for thirty. I have seen three promenades fail.'),
      H('smirk', 'The fourth one, I would like to see fail on purpose.'),
      narr('There are murmurs of laughter around the table.'),
      iff(met('dez'), [D('neutral', 'I know a guy with a stage in a van. And a PA. I will bring both. And a lot of records.')]),
      iff(met('priya'), [P('worried', 'I have prepared a one page summary. Sorry. It is two pages. The second page is references.')]),
      iff(met('tomek'), [T('neutral', 'I will feed people. Bring a bowl. Or do not, I have bowls.')]),
      iff(met('sable'), [S('neutral', 'I want the wall. The whole thing. That is my whole contribution. I am not being humble about it.')]),
      iff(met('amara'), [A('smirk', 'A live broadcast. From the pier. The whole night. It is the last one we will do. Therefore I intend to make it loud.')]),
      narr('Hana turns to you. All the faces at the table turn with her.'),
      H('neutral', 'And you. The one with the boxes. What will you do?'),
      choice([
        opt('I can help organize. I\'m good with lists.', [
          H('happy', 'A list person. Good. This whole neighborhood runs on the wrong lists.'),
          set('festival_role', 'organizer'),
        ], { req: { stat: ['wit', 1] }, stat: ['wit', 1] }),
        opt('I\'ll greet people. Make them feel like they belong.', [
          J('laugh', 'You are going to be so good at that.'),
          set('festival_role', 'host'),
        ], { req: { stat: ['charm', 1] }, stat: ['charm', 1] }),
        opt('I\'ll carry things. Set up. Take down.', [
          T('neutral', 'Good. Somebody has to carry the soup.'),
          set('festival_role', 'hauler'),
        ], { stat: ['grit', 1] }),
        opt('I\'ll listen. Whoever needs somebody to talk to.', [
          A('smirk', 'The rarest volunteer. We will need you at three in the morning.'),
          set('festival_role', 'listener'),
        ], { stat: ['empathy', 1] }),
      ]),
      narr('The meeting runs late. By the end of it, the long table is covered in paper, plates, and half formed plans, and the room feels like the beginning of something.'),
      hide('hana'),
      hide('junie'),
      set('story_gathering'),
    ],
  },

  // ---------------------------------------------------------------------- 4
  {
    id: 'eve',
    day: FESTIVAL_DAY - 1,
    slot: 2,
    loc: 'pier',
    advance: 1,
    nodes: () => [
      title('The Night Before', `Day ${FESTIVAL_DAY - 1}`),
      bg('festival'),
      narr('Someone has hung a thousand paper lanterns along the pier. They are not lit yet. They sway in the harbor wind like a very quiet crowd, waiting.'),
      narr('Tomorrow, everything happens. Tonight, everything is ready.'),
      narr('You find yourself walking. There are people you could look for.'),
      choice([
        opt('Look for Junie.', [
          show('junie', 'happy'),
          J('happy', 'I have been up since four. I made two hundred melon pan. I made two hundred and one, because I ate one.'),
          J('neutral', 'Whatever happens tomorrow, thank you. For being someone who turned up.'),
        ], { req: met('junie'), hide: true, pts: ['junie', 2] }),
        opt('Look for Dez.', [
          show('dez', 'neutral'),
          D('neutral', 'I keep tuning it. It\'s in tune. I keep tuning it.'),
          D('smirk', 'Walk with me? I don\'t want to be alone with my hands.'),
        ], { req: met('dez'), hide: true, pts: ['dez', 2] }),
        opt('Look for Priya.', [
          show('priya', 'worried'),
          P('worried', 'I have gone over it eleven times. It is fine. It is fine. Would you listen to it once more? Sorry.'),
          P('happy', 'Thank you. Nobody else has ever listened all the way to the end.'),
        ], { req: met('priya'), hide: true, pts: ['priya', 2] }),
        opt('Look for Tomek.', [
          show('tomek', 'neutral'),
          T('neutral', 'She is asleep. Zosia. On a folding chair. I stood and watched her for ten minutes like an idiot.'),
          T('neutral', 'Eat. I made too much. On purpose.'),
        ], { req: met('tomek'), hide: true, pts: ['tomek', 2] }),
        opt('Look for Sable.', [
          show('sable', 'neutral'),
          S('neutral', 'It is done. The wall. I keep looking at it and thinking it is going to fall off.'),
          S('smirk', 'Come look with me. Don\'t say anything smart.'),
        ], { req: met('sable'), hide: true, pts: ['sable', 2] }),
        opt('Look for Amara.', [
          show('amara', 'thinking'),
          A('thinking', 'I am practicing saying my own name out loud. It sounds foreign. Amara Ndeye Diallo. See.'),
          A('happy', 'Tell me it sounds like a person.'),
          me('It sounds like a person.'),
        ], { req: met('amara'), hide: true, pts: ['amara', 2] }),
        opt('Walk alone.', [
          narr('You walk the whole length of the pier and back. You hear the harbor, a radio somewhere, a laugh from the arcade. It is the first time since you arrived that the Row feels like home.'),
        ], { stat: ['empathy', 1] }),
      ]),
      narr('The lanterns creak overhead. Tomorrow, they will glow.'),
      set('story_eve'),
    ],
  },

  // ---------------------------------------------------------------------- 5
  {
    id: 'festival',
    day: FESTIVAL_DAY,
    slot: 2,
    loc: 'pier',
    advance: 2,
    nodes: (env) => {
      const close = CHARACTERS.filter((c) => env.state.bonds[c.id].rank >= 3).length;
      const crowd = close >= 4
        ? 'The pier is packed. Every inch of it. People are on the railings, on shoulders, on the roofs of parked vans.'
        : close >= 2
          ? 'The pier is full, warm, and loud. Nobody can find a place to stand and nobody is complaining.'
          : 'The pier is quieter than it could be. But everyone who came is happy to be there, and the lanterns make up the difference.';
      const parts = CHARACTERS.flatMap((c) => [
        clearStage(),
        ...c.finale(env),
        iff({ rank: [c.id, 4] }, [
          complete(c.id, 5),
          remember(c.id, 'You were there for the Lantern Festival. It felt like the best night of the year.'),
        ]),
      ]);
      return [
        title('The Lantern Festival', `Day ${FESTIVAL_DAY} · Sunday`),
        bg('festival'),
        narr('Sunset. Someone lights the first lantern, and then the second, and then the sky above the pier catches like dry paper.'),
        narr(crowd),
        ...parts,
        bg('festival'),
        narr('Late in the night, the lanterns are released one by one over the harbor. They float up, small and orange, and drift out over the water.'),
        narr('You do not know what the vote will say tomorrow. But for one night, the whole Row was in the same place, at the same time, being exactly itself.'),
        set('story_festival'),
      ];
    },
  },

  // ---------------------------------------------------------------------- 6
  {
    id: 'epilogue',
    day: FESTIVAL_DAY + 1,
    slot: 0,
    loc: 'home',
    advance: 1,
    nodes: (env) => {
      const close = CHARACTERS.filter((c) => env.state.bonds[c.id].rank >= 3).length;
      const outcome = close >= 3
        ? 'The block association voted, narrowly, to send the Harborfront plan back for a full community review. The tide flats are safe for now. So is the wall. So, for now, is the radio station\'s roof.'
        : 'The block association voted to delay the Harborfront plan for six months pending an environmental study. It is not a victory. It is a door left open a crack.';
      return [
        title('The Morning After', `Day ${FESTIVAL_DAY + 1}`),
        bg('home'),
        narr('Your window is full of pale sun. There is a paper lantern on the sill. You do not remember putting it there.'),
        narr(outcome),
        narr('The radiator knocks twice. Somewhere below, a shutter goes up. The smell of coffee climbs the stairs.'),
        narr('This was the story you came for. But Halcyon Row does not end on the twenty ninth. The café still opens at seven. The record shop still plays. The noodle cart still has a second bowl for eight dollars.'),
        narr('Your friends are still here. So are you.'),
        title('To be continued', 'The story was a placeholder. The friendships are real enough to keep.'),
        set('story_done'),
      ];
    },
  },
];

export const BEAT_BY_ID = Object.fromEntries(STORY_BEATS.map((b) => [b.id, b]));
