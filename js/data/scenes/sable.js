import {
  voice, me, narr, choice, opt, iff, set, bg, show, hide, stat,
} from '../../core/dsl.js';

const S = voice('sable');

export const scenes = [
  // ------------------------------------------------------------------ 1
  {
    n: 1,
    at: ['arcade'],
    slots: [1, 2, 3],
    title: 'High Score',
    recap: 'You watched Sable destroy the racing cabinet, then challenged her and lost. She told you she was not friends with anyone, in a way that made you think otherwise.',
    nodes: [
      bg('arcade'),
      narr('The arcade hums with blue and pink light. Somewhere a cabinet plays a jingle on repeat and nobody takes any notice.'),
      narr('At the racing game in the corner, a girl with lime green hair and a paint-stained hoodie is crushing the leaderboard. A tiny crowd of kids watches her like she is a sports event.'),
      show('sable', 'smirk'),
      narr('She finishes, sets a new high score, and spins around on her stool. She sees you staring.'),
      S('smirk', 'Take a picture. It lasts longer.'),
      choice([
        opt('That was incredible.', [
          S('surprised', '...Yeah. I know. But thanks, I guess.'),
          S('smirk', 'Don\'t say it like that. Say it like you\'re annoyed. It\'s more believable.'),
        ], { pts: ['sable', 2] }),
        opt('I\'m not staring. I\'m studying your technique.', [
          S('laugh', 'My technique is "don\'t brake." You\'re welcome.'),
        ], { req: { stat: ['charm', 1] }, pts: ['sable', 3] }),
        opt('Is this how you spend your evenings?', [
          S('annoyed', 'Is this how YOU spend yours? You look like you got lost on the way somewhere better.'),
          S('smirk', 'Fine. Point to me.'),
        ], { pts: ['sable', 1] }),
      ]),
      S('neutral', 'Don\'t you have somewhere to be?'),
      choice([
        opt('Not really.', [
          S('neutral', 'Cool. Same.'),
          S('neutral', 'That was not an invitation.'),
          narr('It was a little bit an invitation.'),
        ], { pts: ['sable', 2] }),
        opt('I do. But this looks more fun.', [
          S('smirk', 'Bad choice. But respect.'),
        ], { pts: ['sable', 2] }),
        opt('Race you.', [
          S('surprised', '...Oh, you\'re serious.'),
          S('smirk', 'Oh, this is going to be so embarrassing for you.'),
        ], { pts: ['sable', 3] }),
      ]),
      narr('She feeds two tokens into the machine beside hers and gestures at the seat like a bartender offering a drink.'),
      S('smirk', 'One lap. Loser buys a corn dog.'),
      narr('The lights go green. You take the first corner far too wide. She takes it like she has been driving this track in her sleep, which, you suspect, she has.'),
      narr('You lose by nine seconds. The kids clap for her. One of them claps for you, out of pity.'),
      S('laugh', 'A NINE second gap. That\'s not a loss, that\'s a crime scene.'),
      choice([
        opt('Fine. Corn dog. What do you want on it?', [
          S('happy', 'Mustard. Not ketchup. You\'re not that kind of person, right?'),
          narr('You buy the corn dog. She eats half of it before you turn around. She holds out the other half without saying anything.'),
        ], { pts: ['sable', 3] }),
        opt('Rematch.', [
          S('smirk', 'Yes. Good. Tomorrow. I\'m here. Bring more tokens and less hope.'),
        ], { pts: ['sable', 3] }),
      ]),
      S('neutral', 'Sable.'),
      me('{name}.'),
      S('neutral', 'Okay. Cool. I\'m not friends with anyone, by the way. It\'s a whole thing. I don\'t do that.'),
      narr('She says this with her mouth full of corn dog and one eyebrow raised, clearly waiting to be disagreed with.'),
      choice([
        opt('Noted. I\'ll just be a person who loses to you a lot.', [
          S('laugh', 'That\'s fine. I can work with that.'),
        ], { pts: ['sable', 3] }),
        opt('That sounds lonely.', [
          S('annoyed', 'It sounds like a choice.'),
          S('neutral', 'I\'ll see you tomorrow.'),
        ], { req: { stat: ['empathy', 1] }, pts: ['sable', 2] }),
      ]),
    ],
  },

  // ------------------------------------------------------------------ 2
  {
    n: 2,
    at: ['pier'],
    slots: [0, 1],
    minDay: 4,
    title: 'The Wall',
    recap: 'You held paint cans while Sable sketched on the pier wall. She explained why a mural is different from a tag, and you noticed the size of the bag she carries everywhere.',
    nodes: [
      bg('pier'),
      narr('The long concrete wall along the waterfront is a mess of color: old tags, bad jokes, a heartfelt memorial, a very large fish. In the middle of it all, a small figure in a hoodie is standing on an overturned crate.'),
      show('sable', 'neutral'),
      S('neutral', 'You\'re standing in my light.'),
      choice([
        opt('Sorry. What are you working on?', [
          S('neutral', 'Nothing. A test patch.'),
          narr('It is not nothing. It is a spiral of tiny lanterns, each one a slightly different orange.'),
        ], { pts: ['sable', 2] }),
        opt('Can I hold something?', [
          S('surprised', 'You want to hold something.'),
          S('neutral', '...Fine. Hold that. Don\'t drop it, it\'s the good black.'),
        ], { pts: ['sable', 3] }),
      ]),
      narr('She sketches in silence for a few minutes. You hold a paint can and try to look like you have done this before. She corrects your grip without looking.'),
      S('neutral', 'People think a mural and a tag are the same thing. They\'re not.'),
      S('neutral', 'A tag says "I was here." A mural says "you live here." Different job.'),
      choice([
        opt('And which one do you do?', [
          S('smirk', 'Depends who asks. The city says I do the first one.'),
          S('neutral', 'But the second one is the one I want.'),
        ], { pts: ['sable', 3] }),
        opt('So this is a mural.', [
          S('happy', 'It\'s going to be. Someday. I have a plan. I have a lot of plan.'),
        ], { pts: ['sable', 2] }),
      ]),
      S('neutral', 'The festival wants people to paint sections of this wall. Little squares. Everyone gets a square. It\'s cute.'),
      S('annoyed', 'I want the whole wall.'),
      S('neutral', 'It\'s a stupid ask. It\'s three hundred feet. I\'d need a permit and a week and about fifty cans.'),
      choice([
        opt('That doesn\'t sound stupid. It sounds big.', [
          S('surprised', '...'),
          S('neutral', 'Nobody ever says that.'),
        ], { pts: ['sable', 3] }),
        opt('Who do you ask for a permit?', [
          S('thinking', 'The festival committee. They have a form.'),
          S('annoyed', 'I\'m not filling out a form. I\'m not asking Junie for anything. I\'ll get told no by someone I like.'),
        ], { req: { stat: ['wit', 1] }, pts: ['sable', 3] }),
        opt('You should do it.', [
          S('neutral', 'Thanks. Really, super helpful.'),
          S('smirk', 'But yeah. I will.'),
        ], { pts: ['sable', 1] }),
      ]),
      narr('You shift to hand her a brush. As you do, you notice her bag, which she has been keeping within arm\'s reach the whole time. It is much larger than a person needs for a day. A rolled up sleeping bag is strapped to the bottom.'),
      S('neutral', 'What.'),
      choice([
        opt('Nothing. Nice bag.', [
          S('annoyed', 'It\'s a bag.'),
          S('neutral', 'It\'s where I keep my stuff. Because I\'m a person who has stuff.'),
        ], { pts: ['sable', 2] }),
        opt('That\'s a lot to carry around.', [
          S('serious', 'Do not.'),
          S('annoyed', 'I mean it. Don\'t do the voice. The voice people do.'),
          S('neutral', 'I like carrying things. It\'s good for the shoulders.'),
        ], { req: { stat: ['empathy', 1] }, pts: ['sable', 2] }),
        opt('(Look away and hand her a different brush.)', [
          narr('She watches you not ask. Something in her posture loosens by about one degree.'),
          S('neutral', 'Thanks.'),
        ], { pts: ['sable', 3] }),
      ]),
      S('neutral', 'You\'re not as annoying as I thought.'),
      S('smirk', 'Don\'t let it go to your head.'),
      set('sable_wall'),
    ],
  },

  // ------------------------------------------------------------------ 3
  {
    n: 3,
    at: ['arcade', 'pier'],
    slots: [3],
    minDay: 9,
    title: 'One in the Morning',
    recap: 'You found Sable on a pier bench at night with her bag. She told you she has not had a place since April. She turned down almost everything you offered, and accepted one thing.',
    nodes: [
      iff({ loc: 'arcade' }, [
        bg('arcade'),
        narr('The arcade owner flicks the lights twice, which means midnight. The cabinets go dark one by one. Sable shoulders her big bag, says "later" without looking at you, and leaves.'),
        narr('She does not say where she is going. You give it five minutes, then follow.'),
      ]),
      bg('pier'),
      narr('The pier at one in the morning is a different place. The boards are damp, the harbor is black and enormous, and the streetlights make small yellow islands in the dark.'),
      narr('At the far end, on the last bench, someone is sitting with a large bag on their knees. Lime green hair. A hood pulled halfway up.'),
      show('sable', 'neutral'),
      S('neutral', 'It\'s a public pier. You can stand wherever.'),
      choice([
        opt('Can I sit?', [
          S('neutral', '...Sure.'),
        ], { pts: ['sable', 2] }),
        opt('It\'s cold out here. You okay?', [
          S('annoyed', 'Yes.'),
          S('neutral', 'I mean. It\'s fine. I like the pier at night.'),
        ], { pts: ['sable', 1] }),
        opt('(Sit down with a paper bag of Tomek\'s dumplings.)', [
          S('surprised', 'Are those dumplings.'),
          me('There\'s extra.'),
          S('neutral', '...Okay. Fine.'),
          narr('She takes three in a row. She is trying to look like she is not that hungry.'),
        ], { pts: ['sable', 3], silent: true }),
      ]),
      narr('You sit. For a while neither of you says anything. The water knocks against the piles.'),
      S('neutral', 'The arcade closes at midnight.'),
      S('neutral', 'Ted usually lets me sleep in the back room. In exchange for sweeping. His nephew is in town this week. So.'),
      narr('She stops. She realizes she has said more than she meant to.'),
      choice([
        opt('Sable. Do you have somewhere to sleep?', [
          S('serious', '...'),
          S('neutral', 'Since April.'),
          S('neutral', 'The person I was subletting from left the country. Gave me two weeks. It wasn\'t a big deal.'),
          S('sad', 'It was a little bit of a big deal.'),
        ], { pts: ['sable', 3] }),
        opt('You can tell me. Or not. I\'m not going anywhere.', [
          S('neutral', 'You\'re very calm about this.'),
          me('I would rather be calm than be a person who makes you feel like a case.'),
          S('surprised', 'Yeah. That\'s the thing. That is the exact thing.'),
          S('neutral', 'Since April. I don\'t have a place. It\'s fine. I\'ve got a system.'),
        ], { req: { stat: ['empathy', 2] }, pts: ['sable', 4] }),
      ]),
      S('neutral', 'You\'re going to offer me your couch.'),
      choice([
        opt('Would that help?', [
          S('annoyed', 'I\'m not a charity case.'),
          S('neutral', 'Also I don\'t know you like that. Also it\'s a lot. I don\'t want to owe anyone that much.'),
          S('neutral', 'Thanks. No.'),
        ], { pts: ['sable', 1] }),
        opt('No. I\'m going to ask what you actually need.', [
          S('surprised', '...'),
          S('thinking', 'Okay. That\'s different.'),
          S('neutral', 'Nobody asks that. They tell me what I need.'),
        ], { pts: ['sable', 4] }),
        opt('I have a couch, and no expectations. That\'s all I\'ll say. Ever again.', [
          S('neutral', 'Noted.'),
          S('neutral', 'Thanks. Not tonight.'),
        ], { pts: ['sable', 3] }),
      ]),
      S('neutral', 'What I need is boring. I need somewhere to keep my paint that isn\'t a bus stop. It gets stolen, or rained on.'),
      S('neutral', 'And a shower, once a week. The community center on Marlow has one. That\'s handled. Mostly.'),
      S('neutral', 'And a fifty dollar a week job that isn\'t insulting.'),
      choice([
        opt('I could keep your paint. In my room.', [
          S('thinking', '...Just the cans?'),
          me('Just the cans.'),
          S('neutral', 'That\'s not a big ask.'),
          S('neutral', 'Okay. Yeah. Okay. Just the cans. Nothing else. I\'ll bring them Thursday.'),
          set('sable_cans'),
        ], { pts: ['sable', 5] }),
        opt('Tomek pays people to sweep. Have you asked him?', [
          S('annoyed', 'He already pays me to sweep. He doesn\'t have to. We both know that. We both pretend.'),
          S('neutral', '...It\'s the nicest thing anyone has done. It\'s also fine to not talk about it.'),
        ], { pts: ['sable', 3] }),
        opt('Would you like a hand finding a room? Just looking, no pressure.', [
          S('neutral', 'Not yet.'),
          S('neutral', 'Let me finish the wall. Then maybe.'),
        ], { req: { stat: ['wit', 1] }, pts: ['sable', 3] }),
      ]),
      S('neutral', 'You\'re not going to tell anyone.'),
      me('It\'s yours to tell.'),
      S('neutral', 'Yeah.'),
      S('neutral', 'Yeah. Okay.'),
      narr('The sun is a long way from coming up. You sit until the dumplings are gone. She does not say thank you. She bumps her shoulder against yours once, lightly, as if by accident.'),
      set('sable_told'),
      stat('empathy', 1),
    ],
  },

  // ------------------------------------------------------------------ 4
  {
    n: 4,
    at: ['arcade', 'pier'],
    slots: [2, 3],
    minDay: 15,
    title: 'The Whole Wall',
    recap: 'The festival committee said yes to the whole wall. You spent a night painting it with Sable, and she let you sign it with her.',
    nodes: [
      iff({ loc: 'arcade' }, [
        narr('Sable bursts through the crowd at the racing cabinet, grabs your sleeve, and says "come on, come on, come on." You end up half running to the waterfront.'),
      ]),
      bg('pier'),
      narr('The wall in the streetlight looks endless. Three hundred feet of pale concrete, primed white, waiting.'),
      show('sable', 'happy'),
      S('happy', 'They said yes.'),
      S('happy', 'I filled in the form. I FILLED IN THE FORM. And they said yes.'),
      choice([
        opt('That\'s amazing. Congratulations.', [
          S('blush', 'Shut up. Yeah. Thanks.'),
        ], { pts: ['sable', 2] }),
        opt('Did you ask Junie?', [
          S('smirk', 'She emailed me. She just wrote "yes" and a smiley face. I hate it. I love it.'),
        ], { pts: ['sable', 3] }),
      ]),
      narr('There are a hundred and forty cans of paint in a wheelbarrow. She hands you a roller and a rag.'),
      S('neutral', 'I have never let anyone help.'),
      S('neutral', 'I mean paint with me. I have always done it alone. At night. Fast.'),
      S('worried', 'I don\'t know what to do with you. Where you stand.'),
      choice([
        opt('Tell me where to stand.', [
          S('happy', 'Okay. Good. That\'s good. There. Stay there. Fill everything I outline. Don\'t go over the lines.'),
        ], { pts: ['sable', 3] }),
        opt('I\'ll do whatever is boring. You do the good parts.', [
          S('smirk', 'That is the smartest thing anybody has ever said to me.'),
        ], { pts: ['sable', 3] }),
      ]),
      narr('You work for hours. The lantern spiral unfolds outward, and in the pattern begin to appear things you recognize: a cup with steam rising, a spinning record, an open book, a bowl held in two big hands, a tiny blue creature on a pink rock, a radio tower beaming a single yellow line into the sky.'),
      choice([
        opt('That\'s everyone.', [
          S('blush', 'Shut up. It\'s a wall. It\'s a wall about the block.'),
          S('neutral', 'It\'s everyone. Yeah.'),
        ], { pts: ['sable', 4] }),
        opt('Where\'s your part?', [
          S('surprised', '...'),
          S('neutral', 'I didn\'t put one in.'),
          S('thinking', 'I wasn\'t sure there was space.'),
        ], { req: { stat: ['empathy', 2] }, pts: ['sable', 5] }),
      ]),
      narr('It is nearly dawn when you finish. The sky over the water is the color of the wall: pink, gold, and very slightly tired.'),
      S('neutral', 'Hey. Junie called.'),
      S('neutral', 'Her aunt has a spare room. Above the café. It\'s cold and it smells like flour and she says there is a radiator that "has a personality."'),
      S('thinking', 'She said I could think about it. As long as I want.'),
      choice([
        opt('What do you think?', [
          S('neutral', 'I\'m going to say yes.'),
          S('annoyed', 'Don\'t make it weird.'),
          S('happy', 'It is a little bit weird. Fine.'),
        ], { pts: ['sable', 3] }),
        opt('You deserve a door that locks.', [
          S('surprised', '...'),
          S('neutral', 'Yeah. Okay. I do.'),
        ], { req: { stat: ['empathy', 2] }, pts: ['sable', 4] }),
      ]),
      narr('She picks up a small brush, dips it in the good black, and steps to the very corner of the mural. At the bottom right, low down, there is a bare patch about the size of a hand.'),
      S('neutral', 'You sign it with me.'),
      me('I can\'t paint.'),
      S('smirk', 'You held a ladder for four hours. That counts as painting.'),
      narr('You hold the brush together, her fingers over yours, and write four small letters in the corner: the first half of her name, and the first half of yours. The paint is still wet when the sun comes up.'),
      S('happy', 'Best wall I ever made.'),
      S('neutral', 'Best night, too. Don\'t say anything.'),
      set('sable_wall_done'),
      stat('grit', 1),
    ],
  },
];

// ---------------------------------------------------------------- hangouts
export const hangouts = [
  {
    id: 's_racing',
    at: ['arcade'],
    minRank: 1,
    nodes: [
      show('sable', 'smirk'),
      S('smirk', 'Rematch. Get in.'),
      narr('You take the seat. She sets the track to the hardest one, "for morale."'),
      choice([
        opt('Give me a handicap.', [
          S('laugh', 'A handicap. You want a handicap. Okay, I\'ll drive with my left hand.'),
          narr('You lose by only four seconds. It is the proudest you have ever been of a loss.'),
        ], { pts: ['sable', 2] }),
        opt('No handicap. Let me lose properly.', [
          S('happy', 'Respect. That is the right attitude.'),
          narr('You lose by eleven seconds. She buys you a drink.'),
        ], { pts: ['sable', 3] }),
      ]),
    ],
  },
  {
    id: 's_sketch',
    at: ['pier'],
    minRank: 1,
    nodes: [
      show('sable', 'neutral'),
      narr('Sable is sitting cross legged on the concrete with a sketchbook the size of a pizza box. She does not look up.'),
      S('neutral', 'If you\'re going to look, look. Don\'t hover.'),
      choice([
        opt('(Sit next to her and look.)', [
          narr('She turns a page. It is a drawing of a hand holding a paper lantern, done in a hundred tiny lines. She lets you look for a long time.'),
          S('neutral', 'It\'s not done.'),
          me('It looks done.'),
          S('smirk', 'That\'s because you don\'t know what it\'s supposed to look like.'),
        ], { pts: ['sable', 3] }),
        opt('That hand is really good.', [
          S('annoyed', 'Hands are the worst. Thank you. They\'re the worst.'),
        ], { pts: ['sable', 2] }),
      ]),
    ],
  },
  {
    id: 's_posters',
    at: ['records'],
    minRank: 1,
    nodes: [
      show('sable', 'thinking'),
      S('thinking', 'Dez lets me go through the poster crate. Don\'t tell him I like it.'),
      narr('She flips through old gig posters with a look of reverent boredom.'),
      choice([
        opt('What are you looking for?', [
          S('neutral', 'Type. The lettering. Nobody does hand lettering any more. It\'s all one font.'),
          narr('She holds up a poster from 1987. The letters have a wobble in them that looks alive.'),
        ], { pts: ['sable', 2] }),
        opt('You should ask if you can have one.', [
          S('neutral', 'I did. He said "take whatever." That\'s how I know he likes me.'),
        ], { pts: ['sable', 3] }),
      ]),
    ],
  },
  {
    id: 's_leftover',
    at: ['cafe'],
    minRank: 1,
    nodes: [
      show('sable', 'annoyed'),
      S('annoyed', 'I don\'t like sweet stuff. I\'m just here to sit.'),
      narr('There is a small paper bag next to her elbow. It says LEFTOVERS on the side in a very familiar handwriting.'),
      choice([
        opt('I didn\'t say anything.', [
          S('smirk', 'Good. Keep it like that.'),
          narr('She eats a croissant with the serious concentration of a person conducting an experiment.'),
        ], { pts: ['sable', 2] }),
        opt('Junie leaves those out on purpose, you know.', [
          S('annoyed', 'I know.'),
          S('neutral', 'She thinks I don\'t know. That\'s fine. It\'s a game we play.'),
        ], { pts: ['sable', 3] }),
      ]),
    ],
  },
  {
    id: 's_market_sweep',
    at: ['market'],
    minRank: 1,
    nodes: [
      show('sable', 'neutral'),
      narr('Sable is sweeping the tarmac around the noodle stall with a broom that is a foot too short for her. The ground is already spotless.'),
      S('neutral', 'It\'s a job.'),
      choice([
        opt('Looks like a very clean job.', [
          S('smirk', 'Tomek won\'t let me do anything else. He says the floor "has standards."'),
          narr('At the counter, Tomek gives you a look that says he heard every word.'),
        ], { pts: ['sable', 3] }),
        opt('Want a hand?', [
          S('neutral', 'It\'s a one person job.'),
          narr('You pick up a rag. She lets you. The two of you wipe the same table twice.'),
        ], { pts: ['sable', 2] }),
      ]),
    ],
  },
  {
    id: 's_wall_light',
    at: ['pier'],
    minRank: 1,
    nodes: [
      show('sable', 'thinking'),
      S('thinking', 'Look at the wall. Right now. Quick. Before the light changes.'),
      narr('The setting sun rakes across the concrete, and every dent and flake turns gold. For about ninety seconds, the whole wall looks like a painting of itself.'),
      choice([
        opt('It\'s beautiful.', [
          S('neutral', 'It\'s ninety seconds a day. That\'s the whole reason I paint here.'),
        ], { pts: ['sable', 3] }),
        opt('Can you paint that?', [
          S('smirk', 'No. And that\'s the point. Some things are just for looking.'),
        ], { pts: ['sable', 2] }),
      ]),
    ],
  },
  {
    id: 's_stickers',
    at: ['arcade'],
    minRank: 1,
    nodes: [
      show('sable', 'smirk'),
      S('smirk', 'Hold this.'),
      narr('She hands you a sheet of stickers she designed herself. Each one is a small angry cloud with a smiling face.'),
      choice([
        opt('These are great. Where do they go?', [
          S('smirk', 'Everywhere. Ted\'s going to find one on his ceiling tomorrow.'),
        ], { pts: ['sable', 2] }),
        opt('Can I have one?', [
          S('surprised', '...You want one?'),
          S('neutral', 'Fine. Take the good one. The one with the eyebrows.'),
        ], { pts: ['sable', 3] }),
      ]),
    ],
  },
  {
    id: 's_paint_dream',
    at: 'any',
    minRank: 2,
    nodes: [
      show('sable', 'thinking'),
      S('thinking', 'If nobody could stop you, and you could paint anything, anywhere. What would you paint?'),
      choice([
        opt('Something on the biggest wall in the city. Something kind.', [
          S('neutral', 'Kind is harder than it sounds. It\'s easy to make something loud.'),
          S('neutral', 'That\'s a good answer.'),
        ], { pts: ['sable', 3] }),
        opt('A door. On the side of a building. That opens on something.', [
          S('surprised', '...I\'m taking that.'),
          S('smirk', 'I\'m going to say I thought of it.'),
        ], { pts: ['sable', 3] }),
      ]),
    ],
  },
];

export const texts = [
  {
    id: 's_t1',
    minRank: 1,
    minDay: 3,
    msgs: ['u still owe me a corn dog'],
    replies: [
      { text: 'I paid. You ate half.', back: ['thats the tax'], pts: 1 },
      { text: 'Rematch pays double.', back: ['bring it'], pts: 1 },
    ],
  },
  {
    id: 's_t2',
    minRank: 2,
    minDay: 8,
    msgs: ['light on the wall is insane right now', 'anyway'],
    replies: [
      { text: 'Send a picture.', back: ['no. come look', 'its ninety seconds'], pts: 2 },
      { text: 'On my way.', back: ['run'], pts: 2 },
    ],
  },
  {
    id: 's_t3',
    minRank: 3,
    minDay: 14,
    msgs: ['got the permit', 'the whole wall', 'i dont know what to do with my hands'],
    replies: [
      { text: 'That is huge. I am so happy for you.', back: ['stop', '...thanks'], pts: 2 },
      { text: 'Use them to paint.', back: ['ok wow. yes. annoying but yes'], pts: 2 },
    ],
  },
];

export const pings = [
  {
    msgs: ['new high score. dont look it up. actually look it up'],
    replies: [
      { text: 'Looked it up. Unfair.', back: ['thats what i said'], pts: 1 },
      { text: 'I am coming for it.', back: ['dont hurt yourself'], pts: 1 },
    ],
  },
  {
    when: { weather: ['rain'] },
    msgs: ['raining. arcade is warm and empty', 'not that i am inviting anyone'],
    replies: [
      { text: 'Definitely not an invitation. I am coming anyway.', back: ['fine. bring a snack'], pts: 1 },
      { text: 'Save me a cabinet.', back: ['the frog one is yours'], pts: 1 },
    ],
  },
  {
    msgs: ['do u think pink and orange is too much'],
    replies: [
      { text: 'Never too much.', back: ['finally someone with taste'], pts: 1 },
      { text: 'Depends on the wall.', back: ['ok that is a real answer'], pts: 1 },
    ],
  },
  {
    when: { slot: [3] },
    minRank: 2,
    msgs: ['hey', 'nothing. just hey'],
    replies: [
      { text: 'Hey. I am here.', back: ['ok. good.'], pts: 2 },
      { text: 'Want to talk about it?', back: ['not really. but thanks for asking'], pts: 2 },
    ],
  },
  {
    msgs: ['ted put up a sign that says NO SLEEPING in the arcade. it is aimed at me. it is very sweet'],
    replies: [
      { text: 'Is that a good sign or a bad sign?', back: ['it means he noticed. i think that is good'], pts: 1 },
      { text: 'A sign is a form of love.', back: ['dont make it weird'], pts: 1 },
    ],
  },
];

// ----------------------------------------------------------------- finale
export function finale(env) {
  const rank = env.state.bonds.sable.rank;
  if (rank < 1) return [];
  if (rank < 3) {
    return [
      narr('Sable is on a ladder at the far end of the waterfront wall, adding a last detail to a tiny lantern. She sees you, rolls her eyes in a friendly way, and waves without looking down.'),
    ];
  }
  return [
    bg('festival'),
    show('sable', 'happy'),
    narr('The wall is finished. Three hundred feet of it, lit from below by paper lanterns. People are walking slowly along it, pointing, whispering, stopping in front of things they recognize.'),
    S('happy', 'They keep asking who painted it.'),
    S('neutral', 'I keep saying "a lot of people."'),
    iff({ flag: 'sable_wall_done' }, [
      narr('At the bottom right corner, low down, two names in wet black paint have dried into permanence.'),
    ]),
    iff({ rank: ['sable', 4] }, [
      S('neutral', 'Hey. Come here. Look.'),
      narr('She opens her bag. It is much smaller than it used to be. From the side pocket she pulls a single brass key on a loop of string.'),
      S('happy', 'Above the café. It locks. From the inside.'),
      S('neutral', 'I didn\'t know how to tell you. You were one of the reasons I said yes.'),
      me('Sable.'),
      S('annoyed', 'Don\'t. Just. I\'m saying it once.'),
      S('happy', 'You\'re my friend. I\'m saying it. It\'s a whole thing. I do it now.'),
    ]),
  ];
}
