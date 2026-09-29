import {
  voice, me, narr, choice, opt, iff, set, romance, bg, show, hide, stat, sfx,
} from '../../core/dsl.js';

const A = voice('amara');

export const scenes = [
  // ------------------------------------------------------------------ 1
  {
    n: 1,
    at: ['radio'],
    slots: [2, 3],
    title: 'Voice From the Wall',
    recap: 'You climbed to the Lantern FM rooftop, insulted the host to her face without knowing it, and watched her go on air. She asked you what you do when you cannot sleep.',
    nodes: [
      bg('radio'),
      narr('The stairwell smells like paint and old carpet. At the top there is a metal door with a hand painted lantern on it, glowing orange, slightly crooked.'),
      narr('Beyond the door is a rooftop. A string of bulbs. A couch that has clearly given up years ago. And, in a folding chair at the edge, a woman in an enormous mustard sweater with headphones around her neck, holding a mug in both hands.'),
      show('amara', 'neutral'),
      A('neutral', 'You are either lost, or you have come for the request line. The request line is on Thursdays.'),
      choice([
        opt('I heard the show from my window. I wanted to see where it came from.', [
          A('surprised', 'From your window. Which window?'),
          me('Above the laundromat.'),
          A('smirk', 'Ah. You are the boxes person. Good acoustics up there. I have always thought so.'),
        ], { pts: ['amara', 2] }),
        opt('Sorry, I think I\'m lost.', [
          A('happy', 'You are not lost. You are somewhere. It is a much more useful thing to be.'),
        ], { pts: ['amara', 1] }),
        opt('Are you with the station?', [
          A('smirk', 'In some sense. Sit. There is tea. It is bad, but it is warm.'),
        ], { pts: ['amara', 1] }),
      ]),
      A('neutral', 'You said you listen. What do you think of the host?'),
      narr('You do not know it yet, but you are walking into a trap.'),
      choice([
        opt('Honestly? Kind of a show off.', [
          A('surprised', '...A show off.'),
          A('thinking', 'Hm. Go on.'),
          me('All that velvet. She sounds like she has never had a bad day.'),
          A('laugh', 'Oh, I have had many. She is just very good at pretending.'),
          A('smirk', 'I am the show off. In case that was unclear.'),
        ], { pts: ['amara', 3] }),
        opt('She has the best voice I\'ve ever heard.', [
          A('blush', 'Ah. Well. Thank you.'),
          A('smirk', 'I am obligated to tell you it is me. Otherwise this would be fraud.'),
          me('Wait, you\'re her?'),
          A('happy', 'I am her. She is me. It is a small station.'),
        ], { pts: ['amara', 2] }),
        opt('I don\'t know. I fall asleep every time she talks.', [
          A('laugh', 'That is the highest compliment I have ever received. That is my whole job.'),
          A('happy', 'You have made my week.'),
        ], { pts: ['amara', 3] }),
      ]),
      narr('She checks her watch. For the first time the dry, unhurried manner cracks, and she moves like someone about to walk on stage.'),
      A('neutral', 'It is a quarter to nine. Would you like to sit in the booth while I do the first hour? You may not touch anything red.'),
      choice([
        opt('I would love to.', [
          A('happy', 'Good. Sit on the couch. It is very comfortable if you do not think about it.'),
        ], { pts: ['amara', 2] }),
        opt('Are you sure? I don\'t want to be in the way.', [
          A('neutral', 'I have been on air for six years. Nobody has ever been in the way. I would like for it to happen.'),
        ], { pts: ['amara', 2] }),
      ]),
      narr('The booth is barely larger than a closet. Foam on the walls. A glowing red light over the door. She sits, adjusts the microphone by half an inch, and closes her eyes.'),
      sfx('tap'),
      narr('The red light comes on. She opens her eyes, and her whole face changes. Her voice drops half an octave.'),
      A('happy', 'Good evening, Halcyon Row. This is Late Lantern. I am glad you are here, and I am glad you are up. Let us keep each other company.'),
      narr('She plays a song. She reads a dedication from a caller named Ruth to her sister. She reads a weather report as though it were poetry. You feel your shoulders drop.'),
      narr('When the light goes off, the dry humor snaps back in like a seat belt.'),
      A('smirk', 'You were very quiet. I approve.'),
      A('neutral', 'What do you do when you cannot sleep?'),
      choice([
        opt('Scroll my phone and feel worse.', [
          A('sad', 'Yes. Most do.'),
          A('neutral', 'It is a terrible medicine. I recommend the radio. It has no algorithm. Only me.'),
        ], { pts: ['amara', 2] }),
        opt('I lie there and think about things I said ten years ago.', [
          A('laugh', 'Oh, friend. I have a whole shelf of those.'),
          A('neutral', 'Come back. We will have company at three in the morning.'),
        ], { pts: ['amara', 3] }),
        opt('I don\'t know. I\'ve never thought about it.', [
          A('thinking', 'You should. It is where a lot of the real thinking happens.'),
        ], { pts: ['amara', 1] }),
      ]),
      A('neutral', 'I am Amara.'),
      me('{name}.'),
      A('happy', '{name}. It is a good name. It has room in it.'),
      set('amara_met'),
    ],
  },

  // ------------------------------------------------------------------ 2
  {
    n: 2,
    at: ['radio'],
    slots: [2, 3],
    minDay: 4,
    title: 'Request Line',
    recap: 'You answered calls on the request line with Amara and had to say a few words on air. She noticed everything, and she told you she does not sleep in the mornings.',
    nodes: [
      bg('radio'),
      show('amara', 'happy'),
      A('happy', 'Ah. The volunteer. Take the phone. It is the black one. Do not answer the red one, the red one is Ted from the arcade and he is always angry.'),
      narr('The request line rings twenty seconds later.'),
      choice([
        opt('(Pick up.)', [
          narr('You say "Lantern FM, request line." A man on the other end says in a small, careful voice that he wants to hear a particular song by a band you have never heard of.'),
          narr('He does not say why. You write it on a slip. As you hang up, Amara looks at you.'),
          A('neutral', 'He calls every second Thursday. It is for his wife. She is in the next room. She is not well.'),
          A('neutral', 'I never say her name on air. I say "for the person he loves." It is the least I can do.'),
        ], { pts: ['amara', 3] }),
      ]),
      narr('For an hour, you log requests. A teenager asks for a song about leaving town. A woman asks for a lullaby. A man asks for the sound of rain and Amara puts it on for four minutes without any commentary.'),
      A('thinking', 'You listen well. You do not fill silences on the phone.'),
      A('neutral', 'Most volunteers panic and start giving advice. You just say "mm." It is a rare gift.'),
      A('smirk', 'Now. I need a guest voice for the next segment. Thirty seconds. Any thing at all.'),
      choice([
        opt('Me? On air?', [
          A('smirk', 'You. On air. The city needs a new voice. Yours will do.'),
        ], { pts: ['amara', 1] }),
        opt('Sure. What do I say?', [
          A('happy', 'That is exactly the wrong question, and the right attitude.'),
        ], { pts: ['amara', 2] }),
      ]),
      sfx('tap'),
      narr('The red light goes on. She points at you. You lean into the microphone. It is a very small microphone, and it feels enormous.'),
      choice([
        opt('Say something bold. "Hello, Halcyon Row. I have been here two weeks and I love it."', [
          narr('Your voice comes out stronger than you expected. Amara nods, eyes closed, as if hearing a good chord.'),
          A('happy', 'That was Halcyon\'s newest resident. Welcome.'),
        ], { req: { stat: ['charm', 1] }, pts: ['amara', 3], silent: true }),
        opt('Say something honest. "I did not know I needed this."', [
          narr('There is a very short pause on air. You can feel it rippling out across the rooftops.'),
          A('happy', 'Thank you. That will be somebody else\'s sentence tonight.'),
        ], { pts: ['amara', 3], silent: true }),
        opt('Say something small. "Um. Hi."', [
          narr('You say "um." You say it four times. Amara shrugs at the microphone and smiles.'),
          A('happy', 'That was the honest sound of a person who has never done this. We are all grateful.'),
        ], { pts: ['amara', 2], silent: true }),
      ]),
      narr('The light goes off. You are trembling slightly. Amara is looking at you with a very particular expression: professional respect, and something warmer underneath.'),
      A('neutral', 'You said "um" four times.'),
      me('I know. I counted.'),
      A('happy', 'It was charming. Do not stop.'),
      narr('Later, she pours you a paper cup of tea from a thermos. It is very good tea. You suspect it came from somewhere other than the station.'),
      A('neutral', 'I tell people I sleep in the mornings.'),
      A('neutral', 'I do not. I take my tea to the pier and I watch the first ferry come in. Every day. At a quarter past six.'),
      choice([
        opt('Why do you tell people you sleep?', [
          A('thinking', 'Because if I say I go and sit alone on a pier at dawn, people worry.'),
          A('smirk', 'And I am very fond of not being worried about.'),
        ], { pts: ['amara', 3] }),
        opt('Can I come sometime?', [
          A('surprised', '...You would want to.'),
          A('happy', 'Wednesday. Or Sunday. Bring something warm. The wind is a rude neighbor.'),
        ], { pts: ['amara', 4] }),
      ]),
      set('amara_pier'),
    ],
  },

  // ------------------------------------------------------------------ 3
  {
    n: 3,
    at: ['pier'],
    slots: [0],
    minDay: 6,
    title: 'First Ferry',
    recap: 'You met Amara on the pier at dawn. She told you she is lonely in a way she has no words for, and asked you for something true that was not a story.',
    nodes: [
      bg('pier'),
      narr('The pier at a quarter past six is silver and empty. The water is the color of an old spoon. Out past the breakwater a single white ferry is coming in, slow and steady, its windows lit.'),
      show('amara', 'sleepy'),
      narr('Amara is on the last bench with a thermos, wrapped in a shawl the color of a marigold. She does not turn as you sit.'),
      A('sleepy', 'You came. I was ninety percent sure you would not.'),
      choice([
        opt('I said I would.', [
          A('happy', 'People say that a lot. It is astonishing how few of them mean it.'),
        ], { pts: ['amara', 3] }),
        opt('I almost didn\'t. It was a very cold walk.', [
          A('laugh', 'Good. Honesty at dawn. That is the best kind.'),
        ], { pts: ['amara', 2] }),
      ]),
      narr('The ferry docks. A handful of people step off with lunch boxes and yawns. One of them, a man in a blue uniform, lifts a hand at Amara. She lifts hers back.'),
      A('neutral', 'That is Yusuf. He drives the ferry. He has never spoken to me in his life, and he requests a song every Friday.'),
      A('neutral', 'That is what it is like. People bring me the most tender things they have. And they do not know my middle name.'),
      choice([
        opt('What is your middle name?', [
          A('surprised', '...'),
          A('happy', 'Ndeye. It was my grandmother\'s. Nobody has asked in six years.'),
          A('blush', 'That was a good trick. I did not see it coming.'),
        ], { pts: ['amara', 4] }),
        opt('That sounds lonely.', [
          A('sad', '...It is.'),
          A('sad', 'It is not the kind of lonely that is loud. I have five thousand voices in my ears every night. It is the kind of lonely that is very full.'),
        ], { req: { stat: ['empathy', 2] }, pts: ['amara', 4] }),
        opt('Do you want to be known?', [
          A('thinking', 'That is a very good question. I would like to say no.'),
          A('sad', 'But then I would be lying, and I do not lie on air.'),
        ], { req: { stat: ['wit', 2] }, pts: ['amara', 4] }),
        opt('(Pass her the thermos lid and say nothing.)', [
          narr('She takes it. Her fingers are cold. She holds the tea for a long time before she drinks.'),
        ], { pts: ['amara', 3] }),
      ]),
      A('neutral', 'I know a great many secrets, {name}. I know which husband is unfaithful to which neighbor. I know who is planning to leave and who is planning to stay. I know who wants to be a poet.'),
      A('sad', 'And it does not add up to a life. It adds up to a very large listening. A person made entirely of ears.'),
      A('neutral', 'I would like to ask you something. And I want you to answer without performing.'),
      A('neutral', 'Tell me something true that is not a story.'),
      choice([
        opt('I get lonely too. Even when I\'m around people.', [
          narr('She does not say anything for a moment. Then she nods, slowly. The ferry horn sounds behind you, low and long.'),
          A('sad', 'Thank you.'),
          A('neutral', 'That is the first true thing anyone has told me in a while that was not for the radio.'),
        ], { pts: ['amara', 5] }),
        opt('I don\'t know if I\'m doing anything right. Any of this. Moving here.', [
          A('thinking', 'Mm. Yes.'),
          A('neutral', 'The people who know are not paying attention. Keep going.'),
        ], { pts: ['amara', 4] }),
        opt('I really like sitting here with you. That\'s true.', [
          A('blush', 'Ah.'),
          A('happy', 'That is very simple. I was expecting a paragraph.'),
        ], { pts: ['amara', 4] }),
      ]),
      narr('The sun clears the roofs. Warm light slides across the boards and lights the steam coming off the thermos.'),
      A('happy', 'Come again. It is a habit worth having. Wednesdays and Sundays.'),
      A('neutral', 'And {name}. If you ever tell anyone I was sad on a bench, I will play nothing but accordion music at three a.m. for a month.'),
      set('amara_lonely'),
      stat('empathy', 1),
    ],
  },

  // ------------------------------------------------------------------ 4
  {
    n: 4,
    at: ['radio'],
    slots: [2, 3],
    minDay: 15,
    title: 'Last Broadcast',
    recap: 'Amara told you the station is losing its lease. She asked you to be there when she ends the show honestly, saying her own name for the first time on air.',
    nodes: [
      bg('radio'),
      show('amara', 'serious'),
      narr('The booth is half packed. Milk crates of records. A box of cables labeled DO NOT EVER TOUCH. The couch is still there, because nobody knows how to get it down the stairs.'),
      A('serious', 'The letter came on Monday. The lease ends the day after the festival. The building is being sold to the people who want to put up the promenade.'),
      A('neutral', 'It is not sad. I keep saying that. It is a logistical fact.'),
      choice([
        opt('It is sad, though.', [
          A('sad', 'Yes. It is sad.'),
          A('neutral', 'Thank you for not letting me pretend.'),
        ], { pts: ['amara', 3] }),
        opt('Where will the station go?', [
          A('thinking', 'Nowhere. There is no where. There is a trailer in a lot, if we are lucky.'),
          A('neutral', 'I keep thinking about my grandmother\'s shop. Fabric. Right on the corner. Forty years.'),
          A('neutral', 'It is a phone store now. I checked. I go in sometimes. I just stand there.'),
        ], { pts: ['amara', 3] }),
      ]),
      A('neutral', 'The festival is going to broadcast live. Last show. From the pier stage. I get an hour.'),
      A('neutral', 'And I have been trying to plan the hour. And I have been trying to plan it as though I am talking to five thousand people.'),
      A('worried', 'And I realized I do not want to talk to five thousand people. I want to talk to one.'),
      choice([
        opt('Then talk to one.', [
          A('surprised', 'Simple advice. Good advice.'),
          A('neutral', 'Which one?'),
        ], { pts: ['amara', 3] }),
        opt('What would you say if you were just talking to me?', [
          A('thinking', '...I would say my own name.'),
          A('neutral', 'In six years, I have said "Lantern FM" and "Late Lantern" and "this is your host." Never "Amara Diallo."'),
          A('neutral', 'I always thought the voice was enough. That the person underneath could stay quiet.'),
        ], { pts: ['amara', 4] }),
      ]),
      A('sad', 'I am afraid that if I say it, nobody will care. Not the voice. Just the person.'),
      A('sad', 'I am afraid that they are listening for the voice, and not for me.'),
      choice([
        opt('I was listening for you. From the first night.', [
          A('blush', '...'),
          A('happy', 'That is an annoyingly effective sentence.'),
          A('neutral', 'Thank you. I think I needed a witness.'),
        ], { req: { stat: ['charm', 2] }, pts: ['amara', 5] }),
        opt('They can hear it when you say it. People always can.', [
          A('thinking', 'Do you believe that?'),
          me('I believe it about you.'),
          A('neutral', 'Mm.'),
        ], { req: { stat: ['empathy', 2] }, pts: ['amara', 5] }),
        opt('Then let\'s find out.', [
          A('smirk', 'Yes. That will do. That is a very sensible philosophy.'),
        ], { pts: ['amara', 3] }),
      ]),
      A('neutral', 'You will be in the booth. On the couch. If you do not mind.'),
      A('neutral', 'I do not need you to say anything. I need someone I can look at.'),
      me('I will be there.'),
      A('happy', 'Thank you. Now help me carry this crate. It is very heavy and I have a dramatic personality.'),
      narr('You carry the crate together. Halfway to the stairs she stops and puts a hand on the wall. For a moment she just breathes, and you wait.'),
      A('neutral', 'Do you know, I have never had a friend who would help me carry a crate.'),
      A('neutral', 'I mean it. I have had listeners. I have had guests. Never that.'),
      choice([
        opt('I\'ll carry a lot of crates.', [
          A('happy', 'Good. There are forty.'),
          romance('amara', 'friends'),
        ], { pts: ['amara', 3] }),
        opt('Amara. I\'ve been trying to figure out how to say this. I really like you. More than a friend.', [
          A('surprised', '...'),
          A('blush', 'I have a rule about not being surprised. You broke it.'),
          A('neutral', 'I would like to say something on air about it. But I don\'t want to. This one is only for you.'),
          A('happy', 'Yes. I would like to try. If you will take your time with me. I am out of practice being chosen.'),
          me('I will take all the time you like.'),
          A('smirk', 'Good. It is a long crate.'),
          romance('amara', 'open'),
        ], { req: { romanceOn: 'amara' }, hide: true, pts: ['amara', 5] }),
      ]),
      stat('empathy', 1),
    ],
  },
];

// ---------------------------------------------------------------- hangouts
export const hangouts = [
  {
    id: 'a_five_sounds',
    at: ['pier'],
    minRank: 1,
    nodes: [
      show('amara', 'neutral'),
      A('neutral', 'Close your eyes. Name five sounds.'),
      choice([
        opt('(Close your eyes and listen.)', [
          narr('Gulls. A rope creaking. A distant engine. Your own breath. And a fifth, underneath everything, that you cannot name.'),
          A('happy', 'The fifth one is the harbor. It is always there. You get to hear it when you stop.'),
        ], { pts: ['amara', 3] }),
        opt('Isn\'t this what radio people do at parties?', [
          A('laugh', 'We do it at funerals. It is very effective.'),
        ], { pts: ['amara', 2] }),
      ]),
    ],
  },
  {
    id: 'a_caller_stories',
    at: ['radio'],
    minRank: 1,
    nodes: [
      show('amara', 'thinking'),
      A('thinking', 'A caller asked me tonight if it is too late to learn cello at sixty two. I said no. Then I looked up whether that was true.'),
      A('smirk', 'It is true. Statistically. It is enormously true.'),
      choice([
        opt('What made you say no so fast?', [
          A('neutral', 'It is what I would want someone to say to me. That is usually the answer.'),
        ], { pts: ['amara', 3] }),
        opt('You should tell her that on air.', [
          A('happy', 'I will. Thank you. I will do it on Thursday. With the cello suite playing.'),
        ], { pts: ['amara', 2] }),
      ]),
    ],
  },
  {
    id: 'a_couch',
    at: ['radio'],
    minRank: 1,
    nodes: [
      show('amara', 'smirk'),
      A('smirk', 'The couch. Have you tried it?'),
      narr('You sit down. It sighs beneath you like a large animal. You sink about six inches.'),
      choice([
        opt('It\'s perfect.', [
          A('laugh', 'It is a trap. Nobody has ever gotten up on their own. I keep a rope.'),
        ], { pts: ['amara', 2] }),
        opt('This couch has seen things.', [
          A('happy', 'It has seen eleven years, forty two guests, and one very serious proposal of marriage over the phone.'),
        ], { pts: ['amara', 3] }),
      ]),
    ],
  },
  {
    id: 'a_sunglasses',
    at: ['cafe'],
    minRank: 1,
    nodes: [
      show('amara', 'sleepy'),
      narr('Amara is at the corner table in dark sunglasses with a cup of tea. It is seven in the morning. She has the look of someone who has stared into a microphone for three hours and is now slowly returning to Earth.'),
      A('sleepy', 'Do not speak to me for a moment. I am still a voice. I have not become a person yet.'),
      choice([
        opt('(Sit quietly beside her.)', [
          narr('Five minutes pass. Then, without turning her head, Amara slides half of her croissant across the table.'),
          A('neutral', 'Junie saves me the corner. She has never once asked me a question before the tea. It is why I am alive.'),
        ], { pts: ['amara', 3] }),
        opt('Rough night?', [
          A('sleepy', 'A lovely night. A very long night. Same thing.'),
        ], { pts: ['amara', 2] }),
      ]),
    ],
  },
  {
    id: 'a_song_tonight',
    at: ['radio'],
    minRank: 2,
    nodes: [
      show('amara', 'thinking'),
      A('thinking', 'Tell me one word for how you feel tonight. I will find a song.'),
      choice([
        opt('Restless.', [
          A('smirk', 'Ah. A good word. I have four songs for restless. One of them is fast, and one of them is a lie.'),
          narr('She puts on the second one. It is very good.'),
        ], { pts: ['amara', 3] }),
        opt('Quiet.', [
          A('neutral', 'Mm. Quiet is different from calm. Let me think.'),
          narr('She picks a slow, deep record and turns the volume down until it barely sounds like music at all.'),
        ], { pts: ['amara', 3] }),
        opt('Happy, actually.', [
          A('surprised', 'That is the least common answer I get. It is delightful.'),
          narr('She puts on something bright and slightly ridiculous and the two of you listen to it with your eyes closed, grinning.'),
        ], { pts: ['amara', 3] }),
      ]),
    ],
  },
  {
    id: 'a_grandmother',
    at: ['pier', 'cafe'],
    minRank: 2,
    nodes: [
      show('amara', 'neutral'),
      A('neutral', 'My grandmother sold fabric. On the corner of Alder and Third. Forty years. She could tell what a person needed by how they stood in the door.'),
      A('neutral', 'She would say: "You do not want the blue. You want the yellow." And she was always right.'),
      choice([
        opt('You do that with music.', [
          A('surprised', '...I do.'),
          A('happy', 'I had never thought about it. Thank you. I think she would like that.'),
        ], { pts: ['amara', 4] }),
        opt('What would she pick for me?', [
          A('thinking', 'Hm. She would look at you for one second. Then she would say: "Green. Something with room in it."'),
          A('smirk', 'I do not know what that means. But she would be right.'),
        ], { pts: ['amara', 3] }),
      ]),
    ],
  },
  {
    id: 'a_dead_air',
    at: ['radio'],
    minRank: 2,
    nodes: [
      show('amara', 'serious'),
      A('serious', 'I am going to show you the most honest sound in radio.'),
      narr('She cuts the music, opens the microphone, and says nothing. The seconds tick by. You can hear the room, and the building, and the two of you.'),
      A('neutral', 'Dead air. Ten seconds is a long time. Most of the world is terrified of it.'),
      choice([
        opt('It feels kind of peaceful.', [
          A('happy', 'Yes. That is what I keep trying to tell the station manager.'),
        ], { pts: ['amara', 3] }),
        opt('It feels like waiting for someone to say something true.', [
          A('surprised', '...Yes.'),
          A('neutral', 'That is precisely what it feels like.'),
        ], { req: { stat: ['empathy', 1] }, pts: ['amara', 4] }),
      ]),
    ],
  },
  {
    id: 'a_ask_me',
    at: 'any',
    minRank: 2,
    nodes: [
      show('amara', 'smirk'),
      A('smirk', 'Ask me something. Anything. I get to answer one question a week that I would not normally.'),
      choice([
        opt('What is your favorite thing about the city?', [
          A('neutral', 'That it sounds different at every hour. If you closed your eyes, you could tell what time it was.'),
        ], { pts: ['amara', 3] }),
        opt('What do you want?', [
          A('surprised', '...'),
          A('neutral', 'To be known by one person who is not paying attention to my voice.'),
          A('smirk', 'Do not answer that. It is a sentence for the air.'),
        ], { req: { stat: ['charm', 1] }, pts: ['amara', 4] }),
      ]),
    ],
  },
];

export const texts = [
  {
    id: 'a_t1',
    minRank: 1,
    minDay: 3,
    msgs: ['Good evening, friend. I thought of you during the weather report.', 'That is all. Sleep well, or don\'t, and come find me.'],
    replies: [
      { text: 'What about the weather made you think of me?', back: ['A low pressure system. Very quiet, and no interest in leaving.'], pts: 1 },
      { text: 'I was listening. It was a good report.', back: ['Thank you. It was my best work of the week.'], pts: 1 },
    ],
  },
  {
    id: 'a_t2',
    minRank: 2,
    minDay: 8,
    msgs: ['Tonight\'s song is for you. I did not say so on air.', 'Track eleven. Listen when you are alone.'],
    replies: [
      { text: 'Listening now.', back: ['Good. I hope it does what it is meant to.'], pts: 2 },
      { text: 'Thank you. I will.', back: ['You are welcome. Sleep, if you can.'], pts: 1 },
    ],
  },
  {
    id: 'a_t3',
    minRank: 3,
    minDay: 14,
    msgs: ['I wrote out what I am going to say. On the last night.', 'It is one page. It took me three weeks.'],
    replies: [
      { text: 'I would love to hear it, when you are ready.', back: ['You will. In the booth. On the couch. With the rope.'], pts: 2 },
      { text: 'Three weeks for one page means it is good.', back: ['That is a kind way to say it. Thank you.'], pts: 2 },
    ],
  },
];

export const pings = [
  {
    msgs: ['Good morning, friend. The ferry was on time today. It is the small things.'],
    replies: [
      { text: 'Small things are the whole thing.', back: ['Mm. You have been listening to me too long.'], pts: 1 },
      { text: 'Was Yusuf on it?', back: ['He was. He waved. It has been a good week.'], pts: 1 },
    ],
  },
  {
    when: { weather: ['rain'] },
    msgs: ['Rain on the roof of the booth sounds like applause. Come listen, if you are near.'],
    replies: [
      { text: 'I am on my way.', back: ['Splendid. I will put on a kettle and something soft.'], pts: 1 },
      { text: 'Play something rainy for me tonight.', back: ['I will. I have three in mind. It is a wonderful problem.'], pts: 1 },
    ],
  },
  {
    when: { slot: [3] },
    minRank: 1,
    msgs: ['It is the small hours. If you are awake, consider this a hand held out across the dark.'],
    replies: [
      { text: 'I am awake. Thank you.', back: ['Of course. That is what the small hours are for.'], pts: 2 },
      { text: 'I am going to sleep. Goodnight.', back: ['Goodnight. That is the correct answer.'], pts: 1 },
    ],
  },
  {
    when: { weekday: [2, 6] },
    msgs: ['I will be at the pier at a quarter past six. No pressure. There is tea.'],
    replies: [
      { text: 'I will try to make it.', back: ['Try is plenty.'], pts: 1 },
      { text: 'I will bring something warm.', back: ['A blanket. Yes. A blanket would be extraordinary.'], pts: 2 },
    ],
  },
  {
    msgs: ['A listener called to say the show helped them last night. I do not know what to do with that. I never do.'],
    replies: [
      { text: 'You just say thank you, and let it be true.', back: ['That is a much better plan than mine, which was to change the subject.'], pts: 2 },
      { text: 'It helps me, too.', back: ['Ah. Well. There it is. Thank you.'], pts: 2 },
    ],
  },
];

// ----------------------------------------------------------------- finale
export function finale(env) {
  const rank = env.state.bonds.amara.rank;
  if (rank < 1) return [];
  if (rank < 3) {
    return [
      narr('A portable radio on the festival stage crackles: Late Lantern, broadcasting live. Amara\'s voice drifts over the pier. You cannot see her from where you are, but you can hear her, warm and slow, and it is like being tucked in.'),
    ];
  }
  return [
    bg('festival'),
    show('amara', 'happy'),
    narr('The pier stage has been turned into a booth. A microphone, a lamp, a battered couch that four volunteers hauled down four flights of stairs. The red light comes on. A thousand faces turn toward it.'),
    A('happy', 'Good evening, Halcyon Row. This is Late Lantern. This is the last one. And for the first time in six years, I am going to tell you who is talking.'),
    A('serious', 'My name is Amara Ndeye Diallo. I grew up on the corner of Alder and Third. My grandmother sold fabric, and she was never wrong about color.'),
    iff({ rank: ['priya', 2] }, [
      A('happy', 'There is a listener who writes to me from the library at two in the morning. She sends me facts about sea slugs. I have never once thanked her, and I would like to. You know who you are.'),
    ]),
    iff({ rank: ['dez', 2] }, [
      A('smirk', 'And a certain record shop owner whose recommendations I have been playing without credit. Second Side Records. Go and buy something. He will act like he does not care.'),
    ]),
    iff({ rank: ['tomek', 2] }, [
      A('happy', 'And a man with a soup cart, who sends tea up four flights of stairs on cold nights and pretends it is a coincidence.'),
    ]),
    A('neutral', 'I have been very lucky. I have listened to you for six years. And I want to say, tonight, in my own voice, with my own name: you listened back. Thank you.'),
    narr('The pier is silent. Then the whole place erupts, and Amara covers her mouth with her hand, laughing, eyes wet.'),
    iff({ rank: ['amara', 4] }, [
      A('happy', 'Sit down beside me. Second half of the hour is yours. Say a word. Any word.'),
      me('Thank you for letting me listen.'),
      A('blush', 'Ah. Oh. Well. There it is.'),
      iff({ romance: 'amara' }, [
        narr('Later, when the mic is off and the crowd has thinned, she takes your hand under the lamp without looking at you.'),
        A('happy', 'That was the truest hour of my life. And you were on the couch. I thought you should know.'),
        romance('amara', 'together'),
      ], [
        A('happy', 'You are the first person who ever helped me carry a crate. I am going to be insufferable about it for years.'),
      ]),
    ]),
  ];
}
