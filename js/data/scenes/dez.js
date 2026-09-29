import {
  voice, me, narr, choice, opt, iff, pts, set, romance, item, bg, show, hide, stat, sfx,
} from '../../core/dsl.js';

const D = voice('dez');
const C = voice('cole');

export const scenes = [
  // ------------------------------------------------------------------ 1
  {
    n: 1,
    at: ['records'],
    slots: [1, 2],
    title: 'No Notes',
    recap: 'You wandered into Second Side Records. Dez judged your taste without saying a word, then handed you a cassette and told you to listen to track three only.',
    nodes: [
      bg('records'),
      narr('A record is playing somewhere in the shop. It is quiet, a little scratchy, and it sounds like a room with the curtains drawn.'),
      narr('Behind the counter, a man is reading a paperback with the concentration of someone who wants very much not to be spoken to.'),
      show('dez', 'neutral'),
      D('Take your time.'),
      narr('He does not look up. You flip through a few crates. The shop is small, cluttered, and oddly calming. Every price tag is in the same slanting handwriting.'),
      D('thinking', "You're looking at the jazz section like you're apologizing to it."),
      choice([
        opt("I don't know much about jazz.", [
          D('smirk', "Good. That's the correct amount of knowing. Most people who know a lot ruin it."),
        ], { pts: ['dez', 2] }),
        opt('I just like how the covers look.', [
          D('happy', "That's a real reason. That's the reason half of these got bought."),
        ], { pts: ['dez', 2] }),
        opt("Is there something you'd put on if I asked?", [
          D('surprised', "Huh. Nobody asks that. They ask what's popular."),
          D('neutral', "Give me a second."),
        ], { pts: ['dez', 1] }),
      ]),
      D('neutral', 'So what are you listening to lately?'),
      choice([
        opt('Honestly, nothing. I used to.', [
          D('thinking', "Yeah. That happens. You stop hearing it, and then one day you notice you stopped."),
          D('neutral', "Don't sweat it. It comes back. Usually when you're doing dishes."),
        ], { pts: ['dez', 2] }),
        opt('The same ten songs on repeat.', [
          D('smirk', "That's about the right number. Some people have two. That's a problem."),
        ], { pts: ['dez', 1] }),
        opt('A lot of stuff. Can I name one? It\'s embarrassing.', [
          D('happy', "The embarrassing one's the one that counts. Go."),
          narr('You name it. He nods slowly, for a long time.'),
          D('neutral', "I have that record. I've played it every day for a week. Don't tell anyone."),
        ], { pts: ['dez', 3] }),
      ]),
      narr('He gets up, finally, and disappears behind a rack. He comes back with a tape in a plain plastic case, the label written in that same slanting hand.'),
      D('neutral', "Put this in something. Listen to track three. Only three."),
      me('Why only three?'),
      D('thinking', "The first one's the hit. Everyone likes the hit. Three is the song."),
      D('neutral', 'You can tell me what you think, or not. But if you come back and say "it was fine," we have a problem.'),
      item('cassette', 1),
      choice([
        opt("What's the catch?", [
          D('smirk', "No catch. I'm running a shop. You'll buy something eventually. It's a long game."),
        ], { pts: ['dez', 1] }),
        opt('Thank you. I\'ll tell you what I think.', [
          D('happy', "Yeah. Okay."),
          narr('It is a very small smile, and it is gone in half a second. But you saw it.'),
        ], { pts: ['dez', 2] }),
      ]),
      D('neutral', "I'm Dez. Dez Alvarado."),
      me('{name}.'),
      D('neutral', 'Second Side. Open most afternoons. No notes.'),
    ],
  },

  // ------------------------------------------------------------------ 2
  {
    n: 2,
    at: ['records'],
    slots: [1, 2],
    minDay: 4,
    title: 'The Back Room',
    recap: 'Dez took you into the back room to find a crate. You saw a bass under a jacket and a wall of posters, and watched him steer you away from both.',
    nodes: [
      bg('records'),
      show('dez', 'neutral'),
      D("Hey. You're back. That's a good sign, I guess. Or a bad one for your wallet."),
      me('You said to come back and tell you what I thought.'),
      D('surprised', 'Right. Track three. So?'),
      choice([
        opt("It made me sit down. I didn't know I needed to.", [
          D('happy', "Yeah. That's what it does."),
          D('neutral', 'The guy who made that died two years after. It was his last record.'),
          D('thinking', 'I don\'t say that to make it sad. I say it so you know somebody meant it.'),
        ], { pts: ['dez', 3] }),
        opt('The bass line at the start is doing something clever.', [
          D('surprised', '...Yeah. Yeah, it is. Most people don\'t hear that.'),
          D('smirk', 'What did you hear?'),
          me('It sounded like it was hesitating on purpose.'),
          D('happy', 'That\'s exactly it. Man, that\'s exactly it.'),
        ], { req: { stat: ['wit', 1] }, pts: ['dez', 4] }),
        opt('It was good! I liked it a lot.', [
          D('neutral', "Cool. Good. Glad you liked it."),
          narr('It is a fine answer. Dez seems to file it away as fine.'),
        ], { pts: ['dez', 1] }),
      ]),
      D('neutral', "Hey, can you give me a hand? I've got a crate of Marv's stuff in the back I can't lift by myself."),
      narr('He holds the curtain aside. Behind it is a small room that smells of dust and warm electronics.'),
      bg('records'),
      narr('The walls are papered with gig posters, layered so thickly they have edges, like the pages of a book. There is a stool, a lamp, and a tiny amp in the corner.'),
      narr('Next to the amp, something tall leans against the wall under a green jacket. The shape is unmistakable.'),
      D('neutral', 'The crate is by the door. Careful, the box on the bottom is falling apart.'),
      choice([
        opt('Is that a bass under the jacket?', [
          D('serious', "It's... a bass. Yeah. Marv's. It was in here when I took over."),
          D('neutral', "It's not a thing. I just never moved it."),
          narr('The jacket, you notice, has been arranged. Neatly. Recently.'),
        ], { pts: ['dez', 2] }),
        opt('These posters are amazing. Who\'s this?', [
          D('happy', 'That one? The Salt Flats. Local band. Real good. Broke up.'),
          D('neutral', "I keep it up because it's a good poster."),
          narr('He says this in the voice of a person carrying something very heavy very casually.'),
        ], { pts: ['dez', 2] }),
        opt('(Pick up the crate and say nothing.)', [
          D('thinking', "...Thanks."),
          narr('He glances at the jacket, then at you. Something in his shoulders lets go by a quarter inch.'),
        ], { req: { stat: ['empathy', 1] }, pts: ['dez', 3] }),
      ]),
      D('neutral', 'Marv wrote every one of those price tags. I haven\'t redone any. I can\'t. Handwriting\'s too good.'),
      choice([
        opt("Do you ever play? Music, I mean.", [
          D('surprised', '...Why do you ask?'),
          D('smirk', 'No, I sell records. That\'s a whole job. Playing is different.'),
          narr('He changes the subject to shipping costs so quickly you almost get whiplash.'),
        ], { pts: ['dez', 1] }),
        opt('I like it here. It feels lived in.', [
          D('happy', "Yeah. It is. That's the nicest thing you could say about it."),
        ], { pts: ['dez', 3] }),
      ]),
      D('neutral', 'Come by after close some time. I do this thing where I put on a record, and I don\'t say anything for one whole side.'),
      D('smirk', 'It\'s more fun than it sounds.'),
      set('dez_backroom'),
    ],
  },

  // ------------------------------------------------------------------ 3
  {
    n: 3,
    at: ['records'],
    slots: [2],
    minDay: 8,
    title: 'One Track Each',
    recap: 'After close, Dez played the game where you each pick one track. He told you why he quit the band: it stopped being the thing he loved and became the thing he was afraid to lose.',
    nodes: [
      bg('records'),
      narr('The sign is flipped to CLOSED. The lights are low. Dez has pulled two stools up to the record player and lined up crates like an audience.'),
      show('dez', 'neutral'),
      D('neutral', 'Rules. One track each. No explaining first. You play it, then we sit there for a second. Then you can say something. Or not.'),
      D('smirk', 'You go.'),
      choice([
        opt('Something old I used to love.', [
          narr('You pick a record you once had memorized. It crackles, then swells.'),
          D('thinking', "Oh. That one."),
          D('neutral', "Yeah. That's... yeah."),
        ], { pts: ['dez', 2] }),
        opt('Something I\'ve never heard before. Surprise me.', [
          narr('You close your eyes and pull a record at random. It turns out to be a very bad choice, and a very beautiful one.'),
          D('laugh', "That's a terrible record. Play it again."),
        ], { pts: ['dez', 3] }),
      ]),
      narr('It ends. For a moment neither of you moves. The needle rides the run out groove like a small, slow engine.'),
      D('neutral', 'My turn.'),
      narr('He pulls a record with a plain white sleeve and no label. When it drops, a bass line slides in under a voice that sounds like it is walking home.'),
      D('serious', 'That\'s the Salt Flats. The last thing we cut. I was the bass.'),
      choice([
        opt('Dez, you\'re really good.', [
          D('neutral', "I was good. That's not the same thing."),
          D('thinking', 'Thanks though.'),
        ], { pts: ['dez', 1] }),
        opt('(Listen until it ends.)', [
          narr('You hold still. Dez does too. When the last note fades, he lets out a breath he has clearly been keeping in for some time.'),
        ], { pts: ['dez', 3] }),
        opt('Why did you stop?', [
          D('serious', 'Yeah. That\'s the question.'),
        ], { pts: ['dez', 2] }),
      ]),
      D('neutral', 'Six years in a van. Every show, every night, someone was there to see us. It was great. It was actually great. It was the best thing.'),
      D('sad', "And then somewhere in year five it stopped being the thing I loved and turned into the thing I was scared to lose."),
      D('neutral', 'You know what that does to a song? You play it and all you can think is, "don\'t mess up." You can\'t hear it any more. You\'re just protecting it.'),
      D('sad', 'Last show was in Tulsa. I froze. Middle of the second song. Just stopped. Cole covered for me and finished it.'),
      D('neutral', 'Nobody said anything. Which was worse. So I left.'),
      choice([
        opt('That sounds really lonely.', [
          D('sad', '...Yeah.'),
          D('neutral', 'It was. It still is, sometimes. I don\'t say that a lot.'),
        ], { req: { stat: ['empathy', 2] }, pts: ['dez', 4] }),
        opt('Being scared of losing something means you loved it.', [
          D('thinking', 'Huh.'),
          D('neutral', "That's a decent way to put it. Annoying, but decent."),
        ], { req: { stat: ['wit', 2] }, pts: ['dez', 4] }),
        opt('Tulsa sounds like it needs a proper apology.', [
          D('laugh', "Ha. Yeah. I'll write Tulsa a letter."),
          D('smirk', 'Thanks. I needed something dumb.'),
        ], { req: { stat: ['charm', 1] }, pts: ['dez', 3] }),
        opt('(Stay quiet and let the record spin.)', [
          narr('The needle lifts. He puts on the next side without a word. It is the kindest thing anyone has done all week.'),
        ], { pts: ['dez', 2] }),
      ]),
      D('neutral', 'I don\'t tell people this. So. Don\'t make me regret it.'),
      me('I won\'t.'),
      D('smirk', 'Yeah. I know.'),
      set('dez_tulsa'),
    ],
  },

  // ------------------------------------------------------------------ 4
  {
    n: 4,
    at: ['records'],
    slots: [2],
    minDay: 14,
    title: "Cole's Voicemail",
    recap: 'Cole asked Dez to play the festival. Dez had left the voicemail sitting for a week. You listened to it with him, then heard him play bass for the first time.',
    nodes: [
      bg('records'),
      show('dez', 'worried'),
      narr('Dez is sitting on the floor of the shop with his back against the crates and his phone face down on his knee.'),
      D('worried', "So Cole left me a voicemail. A week ago. I haven't answered it."),
      D('neutral', 'I haven\'t even played it all the way through. I keep getting to the second sentence.'),
      choice([
        opt('Do you want me to be here when you listen?', [
          D('thinking', '...Yeah. Yeah, actually. That would help.'),
        ], { pts: ['dez', 3] }),
        opt('Who\'s Cole to you?', [
          D('neutral', 'The singer. My best friend since I was fifteen. The guy who finished my song in Tulsa.'),
          D('neutral', 'Okay. Okay, let\'s listen to it.'),
        ], { pts: ['dez', 2] }),
      ]),
      sfx('tap'),
      narr('He turns the phone over and presses play. The speaker crackles.'),
      show('cole', 'happy', 'right'),
      C('happy', "Hey, man. It's me. It's Cole. It's, uh, been a while. I know. I'm the worst."),
      C('neutral', "So the festival people got in touch. The Halcyon thing. They want us. Well, they want me. But I said I'd only do it if I could do it with you."),
      C('worried', "And I know we haven't... I know Tulsa. And I'm not asking you to be fine. I'm asking if you'd want to try. One song. A small stage. No pressure. Just, if you want."),
      C('sad', 'I miss you. Call me back. Or don\'t. But call me back.'),
      hide('cole'),
      narr('The message ends. For a while there is only the hum of the neon sign in the window.'),
      D('sad', 'He said he misses me.'),
      choice([
        opt('Do you want to play?', [
          D('thinking', "I want to want to. There's a difference."),
        ], { pts: ['dez', 2] }),
        opt("You don't owe anyone a performance.", [
          D('neutral', 'No. I don\'t. That\'s the annoying thing. I could say no and nobody would blame me.'),
          D('thinking', 'That\'s what makes it worse.'),
        ], { pts: ['dez', 2] }),
        opt('What are you actually afraid of?', [
          D('serious', 'That I\'ll get up there and it won\'t be mine any more. That it\'ll be a thing I have to get right.'),
          D('neutral', "Or the other thing. That I'll get up there and it will be mine, and I'll have missed it for two years."),
        ], { req: { stat: ['empathy', 2] }, pts: ['dez', 4] }),
      ]),
      D('neutral', 'Come here.'),
      narr('He gets up, leads you into the back room, and lifts the green jacket off the bass. He picks it up the way you would hold a sleeping animal.'),
      D('neutral', 'I play this at night. Some nights. Don\'t say anything about it.'),
      narr('He plugs in the little amp. The hum settles. He plays a slow run, then another. Then he plays something you recognize as the first song from the tape.'),
      narr('It is not perfect. There is a rough patch in the middle where his left hand slips. He does not stop.'),
      D('happy', "I haven't done that in front of someone since Tulsa."),
      choice([
        opt('You should play it at the festival.', [
          D('thinking', "Maybe."),
          D('smirk', "You're pushing me. Good. Keep pushing. Not too hard."),
          set('dez_path', 'play'),
        ], { pts: ['dez', 3] }),
        opt('Whatever you pick, it\'s a good choice. Even no.', [
          D('happy', 'Thanks. I needed to hear somebody say that.'),
          set('dez_path', 'dj'),
        ], { pts: ['dez', 3] }),
        opt('That sounded like someone who never left.', [
          D('surprised', '...'),
          D('neutral', 'Shut up. I\'m going to think about that for a week.'),
          set('dez_path', 'play'),
        ], { req: { stat: ['charm', 2] }, pts: ['dez', 4] }),
      ]),
      D('neutral', 'Okay. I\'ll call him tomorrow. Actually tomorrow.'),
      choice([
        opt('Good. I\'m glad we did this.', [
          D('happy', "Yeah. Me too."),
          romance('dez', 'friends'),
        ], { pts: ['dez', 3] }),
        opt('Dez, honestly? I\'ve been thinking about more than friends.', [
          D('surprised', '...Oh.'),
          D('blush', "Huh. Okay. That's, uh. That's a lot of information."),
          D('neutral', "I like you. I'm just, out of practice at saying things. Can I go slow? Like, one side at a time?"),
          me('One side at a time.'),
          D('smirk', 'Good. Because I have a lot of records.'),
          romance('dez', 'open'),
        ], { req: { romanceOn: 'dez' }, hide: true, pts: ['dez', 4] }),
      ]),
      stat('empathy', 1),
    ],
  },
  // ------------------------------------------------------------------ 5
  {
    n: 5,
    at: ['records'],
    minDay: 30,
    title: 'Working Title',
    recap: 'Weeks after the festival, Dez played you something he had written, the first new thing since Tulsa.',
    nodes: [
      bg('records'),
      show('dez', 'neutral'),
      D('neutral', 'Hey. Come here. I want you to hear something. Not a record.'),
      narr('He plugs the bass into the little amp in the back room. He plays a line that keeps climbing and never quite lands. Then, on the fourth pass, it lands.'),
      D('happy', 'First thing I have written since Tulsa. It is not finished. I think it is not supposed to be.'),
      me('Does it have a name?'),
      D('smirk', 'Working title. "Track Three."'),
      iff({ romance: 'dez' }, [
        D('blush', 'I wrote most of it walking home from your place. I am saying that out loud so I cannot take it back.'),
      ], [
        D('neutral', 'You get a lot of the credit for it. Do not make it weird.'),
      ]),
      choice([
        opt('Play it again.', [D('happy', 'Yeah. Okay. Yeah.'), narr('He plays it again. This time he closes his eyes.')], { pts: ['dez', 4] }),
        opt('It sounds like someone who never left.', [D('surprised', '...You said that to me before. I have been thinking about it for a month.')], { pts: ['dez', 4] }),
      ]),
    ],
  },
];

// ---------------------------------------------------------------- hangouts
export const hangouts = [
  {
    id: 'd_side_b',
    at: ['records'],
    minRank: 1,
    nodes: [
      show('dez', 'thinking'),
      D('thinking', 'You look like someone who needs side B of something.'),
      narr('He pulls a record without looking, as if his hands know the shop by feel, and drops the needle halfway through.'),
      choice([
        opt('This is really good.', [D('smirk', 'Yeah. It is. That one gets me every time.')], { pts: ['dez', 2] }),
        opt('What is it?', [
          D('neutral', "Doesn't matter. Tell me what it does to you first. Then I'll tell you."),
          narr('You describe it. It takes a while. He listens to every word.'),
        ], { pts: ['dez', 2] }),
      ]),
    ],
  },
  {
    id: 'd_dollar_bin',
    at: ['records'],
    minRank: 1,
    nodes: [
      show('dez', 'happy'),
      D('happy', 'Okay, look at this. Dollar bin. A dollar.'),
      narr('He holds up a record with a water damaged cover as if it were a diamond.'),
      D('happy', 'Somebody just gave this away. Somebody just walked in with a box and said "a dollar each, I guess."'),
      choice([
        opt('How do you know it\'s good?', [
          D('thinking', "I don't. That's the whole game. You flip, you take a chance. Sometimes it's a miracle."),
        ], { pts: ['dez', 2] }),
        opt('You look happier than I\'ve ever seen you.', [
          D('surprised', 'Do I? Weird. Don\'t tell anyone.'),
          D('smirk', 'It\'s the record. It\'s not you.'),
        ], { pts: ['dez', 2] }),
      ]),
    ],
  },
  {
    id: 'd_sad_not_too_sad',
    at: ['records'],
    minRank: 1,
    nodes: [
      show('dez', 'smirk'),
      D('smirk', 'A woman just asked me for something sad but not too sad.'),
      D('thinking', 'I gave her a record. I don\'t know if it was the right amount of sad. That\'s the hardest request I get.'),
      choice([
        opt('What would you have picked for me?', [
          D('thinking', "Hm. Something with a warm bass line. Something that's sad, but sad like a Sunday, not sad like a funeral."),
          D('smirk', 'I\'ll write it down.'),
        ], { pts: ['dez', 2] }),
        opt('Is there a right amount?', [
          D('neutral', 'Yeah. It\'s the amount where you cry a little and feel better. Anything past that is a problem.'),
        ], { pts: ['dez', 1] }),
      ]),
    ],
  },
  {
    id: 'd_cafe_hide',
    at: ['cafe'],
    minRank: 1,
    nodes: [
      show('dez', 'neutral'),
      D('neutral', 'Junie made my coffee too sweet again. She does it on purpose. I can tell.'),
      narr('He drinks it anyway, all of it, without any visible complaint.'),
      choice([
        opt('You could ask her to stop.', [
          D('smirk', "Then I'd have to admit I don't hate it."),
        ], { pts: ['dez', 2] }),
        opt('What are you reading?', [
          D('neutral', 'A paperback. It\'s about a guy who repairs clocks. Nothing happens. It\'s wonderful.'),
        ], { pts: ['dez', 2] }),
      ]),
    ],
  },
  {
    id: 'd_pier_earbud',
    at: ['pier'],
    minRank: 1,
    nodes: [
      show('dez', 'neutral'),
      D('neutral', 'Here. One side.'),
      narr('He holds out a single earbud, the other still in his ear. The pier is quiet except for gulls and something faintly slow and orchestral.'),
      choice([
        opt('Take it and listen.', [
          narr('You stand there with the sea in front of you and a stranger\'s cello in your head. He does not say anything. It is more than enough.'),
        ], { pts: ['dez', 3] }),
        opt('What is this?', [
          D('smirk', "A guy who couldn't decide if he was a composer or a plumber. He picked both."),
        ], { pts: ['dez', 2] }),
      ]),
    ],
  },
  {
    id: 'd_arcade_rhythm',
    at: ['arcade'],
    minRank: 1,
    nodes: [
      show('dez', 'smirk'),
      D('smirk', 'I\'m ridiculously good at this game and I need you to never mention it.'),
      narr('He is hitting the buttons on the rhythm cabinet like a man who has trained for exactly this.'),
      choice([
        opt('That was perfect. Do it again.', [
          D('happy', 'Twice a week. That\'s my limit. It messes with my head.'),
        ], { pts: ['dez', 2] }),
        opt('Teach me.', [
          D('neutral', "Feel the beat before it hits the screen. Don't watch the arrows. Listen."),
          narr('You miss almost every note, but for one second you hit three in a row. He nods, once, like a master.'),
        ], { pts: ['dez', 3] }),
      ]),
    ],
  },
  {
    id: 'd_radio_listening',
    at: ['radio'],
    minRank: 2,
    nodes: [
      show('dez', 'thinking'),
      D('thinking', 'Amara\'s about to play a song. It\'s one of mine. Well. A recommendation. Whatever.'),
      narr('The speaker on the wall crackles and Amara\'s voice, low and warm, announces the next track. It is an obscure one. You can feel Dez trying not to react.'),
      choice([
        opt('She never says where the songs come from.', [
          D('neutral', 'Yeah. That\'s okay. I like that she just plays them.'),
          D('smirk', "I like it better when nobody knows it's me."),
        ], { pts: ['dez', 3] }),
        opt('That\'s a good choice.', [
          D('happy', 'Isn\'t it? I picked it in June.'),
        ], { pts: ['dez', 2] }),
      ]),
    ],
  },
  {
    id: 'd_market_quiet',
    at: ['market'],
    minRank: 1,
    nodes: [
      show('dez', 'neutral'),
      narr('Dez eats his noodles like it is a serious appointment. He nods at you when you sit.'),
      D('neutral', 'Tomek doesn\'t talk much. It\'s great.'),
      choice([
        opt('(Eat in silence with him.)', [
          narr('You finish your bowls at the same time. Neither of you has said a word. It has been one of the better conversations of the week.'),
        ], { pts: ['dez', 3] }),
        opt('You two are friends?', [
          D('thinking', 'Depends what you mean. We\'ve eaten at the same table on Fridays for two years. That\'s a friendship.'),
        ], { pts: ['dez', 2] }),
      ]),
    ],
  },
  {
    id: 'd_desert_island',
    at: 'any',
    minRank: 2,
    nodes: [
      show('dez', 'thinking'),
      D('thinking', 'Okay. Desert island. One album.'),
      D('smirk', 'And it can\'t be the one you say at parties.'),
      choice([
        opt('The one I listened to on the worst day of my life.', [
          D('neutral', 'That\'s the real answer. That\'s the one that counts. Tell me about it sometime.'),
        ], { pts: ['dez', 3] }),
        opt('Something with a lot of variety, so I don\'t get bored.', [
          D('laugh', 'Practical. I respect it. That\'s a terrible desert island answer and I love it.'),
        ], { pts: ['dez', 2] }),
      ]),
    ],
  },
];

export const texts = [
  {
    id: 'd_t1',
    minRank: 1,
    minDay: 3,
    msgs: ['did you listen to track three', 'not asking to be pushy. just asking'],
    replies: [
      { text: 'Twice. I wasn\'t ready.', back: ['nobody is', 'that\'s the point'], pts: 2 },
      { text: 'Not yet. Tonight.', back: ['ok. lights off. headphones. no phone'], pts: 1 },
    ],
  },
  {
    id: 'd_t2',
    minRank: 2,
    minDay: 8,
    msgs: ['side b of the tape. track 2', 'that\'s it. that\'s the text'],
    replies: [
      { text: 'Listening now.', back: ['good'], pts: 1 },
      { text: 'This is a very Dez text.', back: ['it\'s what i\'ve got'], pts: 1 },
    ],
  },
  {
    id: 'd_t3',
    minRank: 3,
    minDay: 13,
    msgs: ['weird question', 'if someone asked you to do something you used to be good at and you were afraid of it. would you', 'not about me. hypothetical'],
    replies: [
      { text: 'I think I would, even if it went badly.', back: ['ok', 'thanks'], pts: 2 },
      { text: 'Hypothetical, sure. What would the person be afraid of?', back: ['losing it', 'mostly'], pts: 2 },
    ],
  },
];

export const pings = [
  {
    msgs: ['new arrivals just came in. one of them is obscene'],
    replies: [
      { text: 'Save it for me?', back: ['already behind the counter'], pts: 1 },
      { text: 'Obscene how?', back: ['the bass', 'that\'s all i\'m saying'], pts: 1 },
    ],
  },
  {
    when: { weather: ['rain'] },
    msgs: ['rain day. shop is empty. i am playing something sad but not too sad', 'come listen if you want'],
    replies: [
      { text: 'On my way.', back: ['i\'ll put the kettle on'], pts: 1 },
      { text: 'Save the good chair.', back: ['there is one chair. it is the good chair'], pts: 1 },
    ],
  },
  {
    when: { slot: [3] },
    minRank: 2,
    msgs: ['couldn\'t sleep', 'playing something quiet. you\'re not required to answer'],
    replies: [
      { text: 'What are you playing?', back: ['a nick drake record. the one with the cover you\'d expect'], pts: 1 },
      { text: 'Same. Want company?', back: ['for a song or two, yeah'], pts: 2 },
    ],
  },
  {
    msgs: ['top 3 songs about mornings. go. no thinking'],
    replies: [
      { text: 'I can only name one. Is that okay?', back: ['depends on the song'], pts: 1 },
      { text: 'Too early to think.', back: ['fair', 'that was a trap'], pts: 1 },
    ],
  },
  {
    msgs: ['a guy came in today and asked if we sell CDs. i said yes and he said "cool" and left. i don\'t know how to feel about that'],
    replies: [
      { text: 'Proud, I think.', back: ['ok. i\'ll go with that'], pts: 1 },
      { text: 'Did he buy one?', back: ['no', 'never'], pts: 1 },
    ],
  },
];

// ----------------------------------------------------------------- finale
export function finale(env) {
  const path = env.state.flags.dez_path;
  const rank = env.state.bonds.dez.rank;
  if (rank < 1) return [];
  if (rank < 3) {
    return [
      narr('Dez has a card table set up beside the stage with a crate of records and a sign that says "ASK ME WHAT TO LISTEN TO." Nobody is asking. He looks quietly delighted about it.'),
    ];
  }
  const play = [
    show('dez', 'serious'),
    narr('The small stage by the pier is lit with paper lanterns. Cole steps up to the mic. Dez walks up behind him with a bass on a worn strap and no tuner, no notes, no plan.'),
    C('happy', 'This one is for the bass player. He\'s been gone a while.'),
    narr('The song starts slowly. Dez plays a line under it. Then a wrong note. He grins at it, and keeps going.'),
    narr('By the last chorus the whole pier is singing the words to a song about leaving a town you love.'),
    show('dez', 'happy'),
    D('happy', 'Did you hear that? Middle of the bridge. I got it.'),
  ];
  const dj = [
    show('dez', 'happy'),
    narr('Dez set up a turntable beside the small stage. He plays a set of nothing but songs about home, and each record comes with a one sentence introduction over a scratchy microphone.'),
    narr('Halfway through, Cole climbs up and sings one song over the top. Dez keeps the beat with a nod. He is smiling.'),
    D('happy', 'Not playing bass. Still playing. I think that\'s the answer.'),
  ];
  const unsure = [
    show('dez', 'thinking'),
    narr('Dez is at his record table, handing out cassettes in plain cases. The stage behind him is loud and bright, and he glances at it more than once.'),
    D('neutral', "I called him back. Told him next year. He said okay. It's the nicest okay I've ever heard."),
  ];
  const pick = path === 'play' ? play : path === 'dj' ? dj : unsure;
  return [
    bg('festival'),
    ...pick,
    iff({ rank: ['dez', 4] }, [
      D('smirk', 'Hey. Come here.'),
      narr('He presses a cassette into your palm. The label reads, in slanting handwriting, "for {name}. track three."'),
      iff({ romance: 'dez' }, [
        D('blush', 'Walk with me after this? There is a song I want to hear with you. I want to hear it next to someone.'),
        me('Yes.'),
        romance('dez', 'together'),
      ], [
        D('happy', 'Thanks. For the whole thing. I mean it. You made this place feel like a shop again and not a place I was hiding.'),
      ]),
    ]),
  ];
}
