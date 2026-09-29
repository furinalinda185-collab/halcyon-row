import {
  voice, me, narr, choice, opt, iff, pts, set, romance, item, bg, show, hide, stat,
} from '../../core/dsl.js';

const J = voice('junie');
const H = voice('hana');

export const scenes = [
  // ------------------------------------------------------------------ 1
  {
    n: 1,
    at: ['cafe'],
    title: 'A Cortado With Brown Sugar',
    recap: 'You met Junie on your first morning on the Row. She read you in ten seconds and made you a cortado with brown sugar you never asked for. She offered you shifts at the café.',
    nodes: [
      bg('cafe'),
      narr('The bell over the door is an actual bell, and it is extremely loud. Behind the counter, someone is having a quiet argument with an espresso machine.'),
      show('junie', 'annoyed'),
      J('annoyed', 'No. No, we talked about this. You did this yesterday too.'),
      narr('The machine hisses at her. A thin line of water runs down its side and drips off the counter.'),
      J('neutral', "Sorry! Hi! One sec. I'm being held hostage by a twenty year old Italian appliance."),
      J('thinking', "Oh, wait. You're new. You have the face of someone who lives in a room full of boxes."),
      choice([
        opt('Is it that obvious?', [
          J('laugh', "You're holding your phone open to a map. And you're standing like the floor might be lava."),
          J('happy', "It's a compliment. Kind of. It means you're paying attention."),
        ], { pts: ['junie', 1] }),
        opt('How could you possibly tell?', [
          J('smirk', 'I run a café on a corner. I have seen every kind of first day. You are a boxes person.'),
        ], { pts: ['junie', 1] }),
        opt("Is that the machine's fault? The boxes thing?", [
          J('laugh', "Yes! Thank you! It is one hundred percent Gerald's fault."),
          J('happy', "Gerald's the machine. I name things. It's a whole thing, I'm working on it."),
        ], { pts: ['junie', 2] }),
      ]),
      J('neutral', "Okay, what can I get you? Fair warning, I only have opinions about coffee if you ask for my opinion."),
      choice([
        opt('Just a coffee, please.', [
          J('surprised', 'Just a coffee. Wow. Okay. Bold.'),
          J('smirk', "Are you a drip person, or a person who's been hurt by drip?"),
        ], { pts: ['junie', 1] }),
        opt("Whatever you'd drink.", [
          J('happy', 'Ooh. Okay, trust. I like that. Nobody says that.'),
        ], { pts: ['junie', 2] }),
        opt('Surprise me.', [
          J('laugh', "That's the most dangerous thing you could have said to me. I've been waiting all week for permission."),
        ], { pts: ['junie', 2] }),
      ]),
      narr('She turns her back. For a minute the only sounds are grinding, tamping, and Junie murmuring to Gerald in a soothing voice.'),
      J('happy', "Cortado. I put a little brown sugar in it. Don't argue. It's basically a hug in a cup."),
      narr("You take a sip. It's warm, a bit sweet, and exactly what the morning needed."),
      choice([
        opt("Okay. That's really good.", [
          J('blush', "Yeah? Good. I mean, obviously, I'm very good."),
          J('happy', "Sorry. It's my favorite thing when someone's face does that."),
        ], { pts: ['junie', 2] }),
        opt("You didn't even ask how I take it.", [
          J('smirk', 'I read you. Very fast. Please do not make it weird.'),
          J('happy', "It's a gift. It's also why I'm terrible at poker."),
        ], { pts: ['junie', 1] }),
      ]),
      J('thinking', "So where are you living? You're not a tourist. Tourists don't look this tired."),
      me('Above the laundromat. Suds & Duds.'),
      J('surprised', "Oh no. You're in Mr. Okonkwo's building. Okay, listen. He's going to try to sell you the fold service."),
      J('serious', "Say no. He'll ask again on Thursday. Say no again. It's like a dance."),
      J('laugh', "He's a sweetheart. He just really believes in folding."),
      J('neutral', 'So what brings you to Halcyon Row?'),
      choice([
        opt('I needed a fresh start.', [
          J('neutral', 'Oh.'),
          J('happy', "Yeah. Those are the best and worst reasons at the same time. I won't ask."),
          J('neutral', "You can tell me if you want to. Or not. The coffee's still good either way."),
        ], { pts: ['junie', 2] }),
        opt('A job, sort of. Still figuring it out.', [
          J('thinking', 'Hm. Okay.'),
          J('smirk', 'Can you carry three things at once and not cry?'),
        ], { pts: ['junie', 1] }),
        opt("Honestly? I don't know yet.", [
          J('happy', "That's the best answer. Everyone who says they know is either lying or from here."),
        ], { pts: ['junie', 2] }),
      ]),
      J('neutral', 'Okay, and this is completely unrelated, and you can absolutely say no.'),
      J('worried', "My aunt and I run this place, and my aunt keeps 'retiring' for about two hours at a time, and I'm short on Tuesdays and Thursdays. And most other days."),
      J('happy', "If you're ever bored, I'd take you for a shift. Cash and pastry seconds. It's a terrible deal. People love it."),
      set('job_cafe'),
      choice([
        opt("Honestly, I'd love that.", [
          J('surprised', "Wait, really? Okay! Okay. I'm not going to make it weird."),
          J('laugh', "I'm making it weird. Sorry. Come in whenever you want. You don't have to say when."),
        ], { pts: ['junie', 2] }),
        opt('Let me settle in first.', [
          J('happy', "Totally. It's a standing offer. Like the bell. It just stays there, being loud."),
        ], { pts: ['junie', 1] }),
      ]),
      narr('Behind her, Gerald lets out a long wet sigh and sprays a fine mist across the pastry case.'),
      J('surprised', 'Gerald!'),
      choice([
        opt('(Grab a towel and help.)', [
          narr('You wipe down the glass while she turns valves and mutters. Between you, you save four croissants.'),
          J('laugh', "You just saved four croissants. That's an extra eight dollars of my life."),
          J('happy', "I'm Junie, by the way. Junie Park. Barista, co owner, machine whisperer. Ask my aunt and she'll tell you something different."),
        ], { pts: ['junie', 3], silent: true }),
        opt('(Stay out of the way.)', [
          narr('She wrestles a valve shut, glares at the ceiling, and turns around with her hair stuck to her forehead.'),
          J('laugh', 'You are wise. Nobody should be near him when he gets like this.'),
          J('happy', "I'm Junie, by the way. Junie Park. Barista, co owner, machine whisperer."),
        ], { pts: ['junie', 1], silent: true }),
      ]),
      J('neutral', 'And you are?'),
      me('{name}.'),
      J('happy', "{name}. Okay, {name}. Come back tomorrow. I'll remember your order."),
      me("I don't have an order."),
      J('smirk', 'You do now.'),
    ],
  },

  // ------------------------------------------------------------------ 2
  {
    n: 2,
    at: ['cafe'],
    slots: [1, 2],
    minDay: 4,
    title: "Gerald's Bad Day",
    recap: 'You helped Junie fight Gerald the espresso machine. You met Aunt Hana, who is supposedly semi retired, and saw how fast Junie changes the subject about it.',
    nodes: [
      bg('cafe'),
      narr('It is the slow part of the afternoon. The light has gone long and gold across the tables, and the café has the sleepy feel of a stage between shows.'),
      show('junie', 'worried'),
      J('worried', "Okay, don't look at me. I'm having a Moment with a valve."),
      J('neutral', "Gerald is due for a descale, which is what you do to an espresso machine that is tired of living. I've been putting it off for a month because if I take him apart I might have to admit I don't know how to put him back together."),
      choice([
        opt("I can hold the flashlight.", [
          J('happy', "The flashlight! Yes. Perfect. That's a real job. That's the most useful job."),
        ], { pts: ['junie', 2] }),
        opt("I think that leak's the group head gasket, not the valve.", [
          J('surprised', 'Wait. How do you know that?'),
          me('There was a diagram taped to the side. It had arrows.'),
          J('laugh', "There's a diagram? I never look at the sides. Oh my god. Okay. Okay, you're a genius."),
        ], { req: { stat: ['wit', 1] }, pts: ['junie', 3] }),
        opt('Maybe a repair person should do it?', [
          J('thinking', 'Yeah. No, you are right. You are completely right.'),
          J('worried', "I'm just stubborn about it. Auntie says it's a family trait. Like the cheekbones."),
        ], { pts: ['junie', 1] }),
      ]),
      narr('For a while you work side by side. She talks the way people do when their hands are busy: sideways, half to you and half to the machine.'),
      J('neutral', "See, the thing about Gerald is he was here before me. Auntie bought him in like, the nineties. He's basically a family member who only works when he's offended."),
      narr('A door opens behind the counter. A small woman in a lilac cardigan steps out, teacup in hand, with the air of someone who has been awake the entire time.'),
      show('hana', 'neutral', 'right'),
      H('neutral', 'Junie-ya. Why is the machine in pieces?'),
      J('surprised', "It's a descale, Auntie. It's planned. It's a planned thing."),
      H('smirk', 'Mm. And this is the new tenant from the laundromat? The one with the boxes?'),
      J('worried', 'Everyone knows about the boxes.'),
      H('happy', 'Of course we know. I am semi retired, not blind.'),
      narr('Hana studies you for a second, then nods, apparently satisfied.'),
      H('neutral', 'You will eat something. I made too much.'),
      hide('hana'),
      narr('She sets a plate of sliced pear on the counter and disappears into the back again.'),
      J('worried', "She's been 'semi retiring' since spring. It mostly means she goes home at two and comes back at three to check I haven't burned it down."),
      J('neutral', "It's fine. It's honestly great. It's really good for her. She's earned it."),
      narr('She says this to the valve.'),
      choice([
        opt("Do you want the café? Eventually?", [
          J('surprised', "Wow. That's a big question for a Tuesday."),
          J('neutral', "I mean. Yeah. It's my family's place. It's got my whole childhood in it. There's a mark on that wall where I got my height measured."),
          J('worried', "I don't know. I don't know why you'd ask that. Hand me the wrench."),
          narr("She doesn't say no. She doesn't say yes. You hand her the wrench."),
        ], { pts: ['junie', 2] }),
        opt("You're the boss of Gerald. That's a title.", [
          J('laugh', 'Ha! Okay. Yes. Boss of Gerald. Put it on a business card.'),
          J('happy', "Thanks. Honestly. I needed that. I've been in my head all day."),
        ], { pts: ['junie', 2] }),
        opt('(Slide her the plate of pear.)', [
          J('blush', 'Oh.'),
          J('neutral', "That was... yeah. That was the right move. I haven't eaten since seven."),
          narr('She eats three slices standing up, without a word, and looks a little more like herself.'),
        ], { req: { stat: ['empathy', 1] }, pts: ['junie', 3], silent: true }),
      ]),
      J('happy', "Okay. Okay! Gerald is back. Ish. Come here and press this. When I say."),
      narr('The machine coughs, shudders, and produces a single perfect shot. You both stare at it.'),
      J('laugh', 'Did we... did we just do that?'),
      me('We did that.'),
      J('happy', "Okay, no notes. You're on the team now. That's legally binding, I checked."),
      set('junie_hana_seen'),
    ],
  },

  // ------------------------------------------------------------------ 3
  {
    n: 3,
    at: ['cafe'],
    slots: [2],
    minDay: 6,
    title: 'Collapsed Croissants',
    recap: 'You stayed late while Junie test baked for the festival. She told you about the pastry program she deferred two years ago, and the question she has been avoiding.',
    nodes: [
      bg('cafe'),
      narr("The café's closed. The chairs are up, the neon sign is off, and the only light is the kitchen pass and a lamp that Junie found in a drawer somewhere."),
      show('junie', 'worried'),
      J('worried', "Don't say anything about the smell. I know it smells like a bakery had a very small tragedy."),
      narr('On the steel counter is a tray of croissants. Every single one has folded in on itself like a sad little accordion.'),
      J('neutral', 'The festival committee wants pastries. Four hundred. I said yes because it was Tuesday and I was tired and someone asked nicely.'),
      J('annoyed', "Meanwhile, my laminate keeps collapsing, and I don't know why, and I know this. I know this. I trained for this."),
      choice([
        opt('Can I try one?', [
          J('surprised', 'You want to eat a failed croissant?'),
          me("It's still butter."),
          J('laugh', 'Fair. That is the fairest point anyone has made all week.'),
          narr("You bite into it. It's flat and a little greasy and also, you have to admit, kind of delicious."),
          J('happy', "Right? It's like eating a hug that didn't work out."),
        ], { pts: ['junie', 2] }),
        opt('Is it the butter temperature?', [
          J('thinking', "Hm. It's cold in here so it should hold... no. No, actually. I've been rushing the proof."),
          J('surprised', "Wait, I've been rushing the proof. That's it. I've been rushing the proof because I'm rushing everything."),
        ], { req: { stat: ['wit', 2] }, pts: ['junie', 3] }),
        opt("You've been on your feet since five. Sit down a second.", [
          J('worried', "I can't. If I sit down I'll think about things."),
          J('neutral', "...Okay. Fine. A second."),
        ], { pts: ['junie', 2] }),
      ]),
      narr("On the wall above the walk in fridge, a letter is pinned under a magnet shaped like a dumpling. The corner has curled from being touched too many times."),
      choice([
        opt('What is that letter?', [
          J('worried', "Oh. That. That's nothing."),
          J('neutral', 'That is a lot of nothing that I keep in a very visible place.'),
        ], { pts: ['junie', 1] }),
        opt('(Say nothing and wait.)', [
          narr("The refrigerator hums. Junie picks at a burned corner of parchment."),
        ], { pts: ['junie', 2] }),
      ]),
      J('neutral', "It's an acceptance letter. For a pastry program. In Lyon. Two years ago."),
      J('neutral', 'I got in. I deferred. For a year. Just one year, because Auntie had her knee thing, and it made sense, and then it was another year.'),
      J('worried', "And now she's semi retiring, and everyone's being so nice about it, and nobody says the thing."),
      me('What is the thing?'),
      J('sad', 'That I could go. That I could also stay. That I might stay only because leaving would mean deciding to.'),
      J('sad', "I don't know if I love this place or if I'm just really, really good at not leaving it."),
      narr('She says it fast, like ripping off a bandage, and then looks at the ceiling as if she might not have said it.'),
      choice([
        opt("You could do both, couldn't you? Somehow?", [
          J('thinking', "That's... what everyone says. It sounds so easy from outside."),
          J('neutral', "But thanks. Really. It's nice that it sounds easy to somebody."),
        ], { pts: ['junie', 1] }),
        opt("What would you do if nobody was watching?", [
          J('surprised', '...Wow.'),
          J('sad', "I'd bake for the sake of it. Just for people who came in on a bad day. And I'd want to be really good at it. Like, embarrassingly good."),
          J('blush', "I've never said that out loud. That was, uh. That was a lot for a Tuesday."),
        ], { req: { stat: ['empathy', 2] }, pts: ['junie', 4] }),
        opt('Write down what each choice costs, and what it gives. Just to see.', [
          J('thinking', 'A list.'),
          J('laugh', "You're a list person. Oh my god. Okay, get a pen."),
          narr('You spend twenty minutes making the world\'s worst pros and cons list on the back of a flour bag. Halfway through she starts laughing so hard she needs to lean on the counter.'),
          J('happy', 'That was so dumb. That helped so much. Do not tell anyone.'),
        ], { req: { stat: ['wit', 2] }, pts: ['junie', 4] }),
        opt("You don't have to figure it out tonight.", [
          J('neutral', 'No. I guess I don\'t.'),
          J('happy', "Thanks. That's a good line. I'm going to use it on myself later."),
        ], { pts: ['junie', 2] }),
      ]),
      narr('You stay until the last tray. The croissants still collapse. But for the first time she laughs at each one instead of glaring.'),
      J('happy', "Thanks for staying. Seriously. Nobody's stayed with the bad croissants before."),
      set('junie_letter_told'),
    ],
  },

  // ------------------------------------------------------------------ 4
  {
    n: 4,
    at: ['cafe'],
    slots: [2],
    minDay: 12,
    title: 'Rehearsing Auntie',
    recap: 'Junie decided to talk honestly to Aunt Hana. You played Hana in rehearsal, badly. You told her what you honestly thought, and she made up her own mind.',
    nodes: [
      bg('cafe'),
      narr('The light is going. Junie is pacing at the end of the counter with an unlit candle in one hand, which she seems to have forgotten about.'),
      show('junie', 'serious'),
      J('serious', "I'm going to talk to her. Tomorrow. Actually tomorrow. I already told Gerald so there's no backing out."),
      J('worried', "Can you be Auntie for a second? I need to practice."),
      choice([
        opt("Okay. I'll do my best Hana.", [
          J('laugh', "Oh my god. Please. Please do the voice."),
          me('Junie-ya. Why is the machine in pieces?'),
          J('laugh', "That's horrifying. That's exactly right. Okay okay okay, focus."),
        ], { pts: ['junie', 2] }),
        opt("I'd rather be me. Practice on me.", [
          J('neutral', "Yeah. Okay. That's better, actually. She's scarier than you."),
        ], { pts: ['junie', 2] }),
      ]),
      J('serious', 'Auntie. I need to tell you something and I need you not to say anything for a full minute.'),
      J('worried', '...And then I don\'t know what comes next. Every version I write in my head, she gets hurt.'),
      choice([
        opt('Tell her you want to keep it. But do it your way.', [
          J('thinking', 'My way.'),
          J('neutral', "New menu, a second person on the line, a day off. Maybe those sandwiches Dez keeps asking for."),
          J('happy', "Huh. That doesn't sound like giving up. It sounds like taking it."),
          set('junie_path', 'stay'),
        ], { pts: ['junie', 3] }),
        opt('Tell her you want to go to the program.', [
          J('surprised', 'Just... say it.'),
          J('worried', 'She might close the café, though. Or sell it. That feels like the worst thing anyone could do to a person who loves you.'),
          J('serious', "But she might also say go. She might have been waiting for me to say it."),
          set('junie_path', 'study'),
        ], { pts: ['junie', 3] }),
        opt('Tell her you don\'t know. Ask her for time to find out.', [
          J('sad', "That's the scariest one. That's just standing in front of her with nothing in my hands."),
          J('neutral', 'But it\'s true. And she\'s never once asked me to lie.'),
          J('happy', "Yeah. Okay. That one. I think that one might be mine."),
          set('junie_path', 'time'),
        ], { pts: ['junie', 3] }),
      ]),
      J('neutral', "Okay. Okay. I'm going to do it. I feel a little sick and also weirdly good."),
      narr('She sets the candle down on the counter and finally seems to notice it. She lights it. The flame is small and steady.'),
      J('happy', "Thank you. For, like, showing up. I keep waiting for you to get tired of me being like this."),
      choice([
        opt("I'm not going anywhere. That's what friends do.", [
          J('blush', 'Friends. Yeah. Okay.'),
          J('happy', "That's a good word. I like that one."),
          romance('junie', 'friends'),
        ], { pts: ['junie', 3] }),
        opt("You'd have worked it out. You always do.", [
          J('smirk', 'Nice try. I would have set the espresso machine on fire first.'),
          J('happy', 'But thank you for saying it.'),
          romance('junie', 'friends'),
        ], { pts: ['junie', 3] }),
        opt("Junie, I need to say something. I like you. More than a friend.", [
          J('surprised', '...Oh.'),
          J('blush', 'Oh! Okay. Wow. Okay. Hi.'),
          J('worried', "Sorry, my brain just fell out. Can I... can I tell you something honest? I've been not thinking about it for like a week."),
          J('happy', "I'm really glad you said it. I'm terrified, but I'm glad. Can we go slow? Like, whole loaf slow?"),
          me('Whole loaf slow.'),
          J('laugh', "I can't believe I just made a bread metaphor. This is what you get."),
          romance('junie', 'open'),
        ], { req: { romanceOn: 'junie' }, hide: true, pts: ['junie', 4] }),
      ]),
      stat('empathy', 1),
    ],
  },
];

// ---------------------------------------------------------------- hangouts
export const hangouts = [
  {
    id: 'j_guess_orders',
    at: ['cafe'],
    minRank: 1,
    nodes: [
      show('junie', 'smirk'),
      J('smirk', "New game. When someone walks in, we guess the order. No cheating. Loser washes the tiny spoons."),
      narr('The bell rings. A tall man in a suit walks in, looking at his phone like it insulted him.'),
      J('thinking', 'Black drip. Extra hot. No conversation.'),
      choice([
        opt('Cortado. He\'s pretending to be tough.', [
          narr('He orders a caramel oat latte with an extra shot and a whisper of embarrassment.'),
          J('laugh', 'Oh my god. Oh my GOD. You were closer than me. I hate this.'),
        ], { pts: ['junie', 2] }),
        opt('I think you\'re right.', [
          narr('He orders a black drip, extra hot, and does not speak.'),
          J('happy', 'Ha! Two for two. We are a very serious team.'),
        ], { pts: ['junie', 1] }),
      ]),
    ],
  },
  {
    id: 'j_croissant_notes',
    at: ['cafe'],
    minRank: 1,
    nodes: [
      show('junie', 'worried'),
      J('worried', "Okay, I need someone who will be honest with me. Taste this."),
      narr('She hands you a small, slightly lopsided pastry on a napkin.'),
      choice([
        opt('It\'s great. Really.', [
          J('thinking', "...That was too fast. You're being nice."),
          J('smirk', 'Try again. I can take it.'),
          narr('You eat some more. It is a bit dry.'),
          J('laugh', 'There it is. That face. Thank you.'),
        ], { pts: ['junie', 1] }),
        opt('It\'s a little dry, but the flavor is amazing.', [
          J('happy', 'YES. Dry! Thank you! I thought it was just me being paranoid.'),
          J('neutral', "Okay. More butter in the dough. Or less time in the oven. Or both. Ugh. I love this."),
        ], { pts: ['junie', 2] }),
      ]),
    ],
  },
  {
    id: 'j_pier_sunday',
    at: ['pier'],
    minRank: 1,
    nodes: [
      show('junie', 'happy'),
      J('happy', 'I only come out here on Sundays. My phone is in my other pocket and I do not know where that pocket is.'),
      narr('Gulls circle a bin. Junie eats a hot dog with the serious face of a person judging a bake off.'),
      J('thinking', "This is terrible. I want another one."),
      choice([
        opt('Can I have a bite?', [
          J('surprised', "Wow. Bold. Okay, here. But you're ranking it. Out of ten."),
          narr('You rank it a five. She gasps. She rates you a two for taste.'),
          J('laugh', 'Two for honesty. Ten for company.'),
        ], { pts: ['junie', 2] }),
        opt("Don't you make actual food for a living?", [
          J('smirk', "Exactly why I can eat this. If I eat good food on my day off it turns into research. This is rest."),
        ], { pts: ['junie', 1] }),
      ]),
    ],
  },
  {
    id: 'j_arcade_loss',
    at: ['arcade'],
    minRank: 1,
    nodes: [
      show('junie', 'annoyed'),
      J('annoyed', "I refuse to be beaten by a cartoon frog."),
      narr('She is hunched over the frog game with the intensity of someone defusing something.'),
      choice([
        opt('Want me to take a turn?', [
          narr('You lose in nine seconds.'),
          J('laugh', 'Okay so it is not just me. This game is rigged. It has to be.'),
        ], { pts: ['junie', 2] }),
        opt("It's a token game. You're not supposed to win.", [
          J('annoyed', "Do not say that to me in my own moment."),
          J('laugh', "...I'm laughing because you're right and I hate it."),
        ], { pts: ['junie', 1] }),
      ]),
    ],
  },
  {
    id: 'j_market_research',
    at: ['market'],
    minRank: 1,
    nodes: [
      show('junie', 'smirk'),
      J('smirk', "This isn't dinner. This is research."),
      narr('She is holding three different kinds of dumplings and writing notes on a napkin in tiny handwriting.'),
      J('thinking', 'Okay. This one has cabbage. Why does that work? Why does cabbage work? I need to understand.'),
      choice([
        opt('Because cabbage is secretly sweet.', [
          J('surprised', "It IS. It's sugar wearing a disguise. Oh, I'm putting that in a recipe."),
        ], { pts: ['junie', 2] }),
        opt('Do you ever stop working?', [
          J('neutral', "...Not really. I think that's a problem. Don't tell Auntie."),
          J('happy', 'Eat a dumpling. Eat one and be normal with me.'),
        ], { pts: ['junie', 2] }),
      ]),
    ],
  },
  {
    id: 'j_records_bicker',
    at: ['records'],
    minRank: 1,
    nodes: [
      show('junie', 'smirk'),
      J('smirk', 'I am here to argue with Dez about whether coffee is better than music. It is a friendly hobby.'),
      narr("From the counter, Dez doesn't look up. He mutters something about how coffee cannot make a bridge into a chorus."),
      J('laugh', 'A bridge into a chorus! He can\'t even complain right. That makes no sense.'),
      choice([
        opt('Coffee, obviously.', [
          J('happy', "THANK you. I knew I liked you."),
          narr("From the counter, Dez says, 'traitor,' without any heat at all."),
        ], { pts: ['junie', 2] }),
        opt('Music. Sorry.', [
          J('surprised', 'Betrayal! In my own hobby!'),
          J('laugh', "Fine. You get one free pastry and no more opinions."),
        ], { pts: ['junie', 1] }),
      ]),
    ],
  },
  {
    id: 'j_rain_tables',
    at: ['cafe'],
    minRank: 2,
    nodes: [
      show('junie', 'happy'),
      narr('It has been raining for an hour. The café smells like wet wool and warm sugar, and there are only two other people here, both asleep in their books.'),
      J('happy', 'This is my favorite kind of day. Nobody needs anything. I just get to sit here and listen to it.'),
      choice([
        opt('What does it sound like to you?', [
          J('thinking', "Like a room full of tiny people typing. Very fast. All on the same email."),
          J('laugh', 'I have no idea what the email is. It just seems important.'),
        ], { pts: ['junie', 2] }),
        opt('(Sit with her and say nothing.)', [
          narr('You listen to the rain for a long time. Junie eventually slides a pastry across the table without looking.'),
          J('happy', 'Thank you for being good at this.'),
        ], { pts: ['junie', 3] }),
      ]),
    ],
  },
  {
    id: 'j_tired_honest',
    at: 'any',
    minRank: 2,
    nodes: [
      show('junie', 'worried'),
      J('worried', "Can I be honest? I'm a little bit tired in a way sleep doesn't fix."),
      choice([
        opt('Do you want to talk about it or be distracted?', [
          J('happy', "...Distracted. Distract me. Tell me the worst haircut you've ever had."),
          narr("You tell her. It's a very bad haircut. She has to sit down for a minute."),
        ], { pts: ['junie', 3] }),
        opt('You can tell me all of it.', [
          J('neutral', "It's nothing big. It's just the pile. Emails, and the machine, and the list I keep in my head. You know how the list has a list."),
          J('neutral', 'Saying it made it feel like two piles instead of one. Thanks.'),
        ], { pts: ['junie', 3] }),
      ]),
    ],
  },
];

// ------------------------------------------------------------------- texts
export const texts = [
  {
    id: 'j_t1',
    minRank: 1,
    minDay: 2,
    msgs: ["hey it's junie. did gerald get you yet or is that a me thing", 'also do you want your usual tomorrow or should i go rogue'],
    replies: [
      { text: 'Rogue. Always rogue.', back: ['okay you asked for it'], pts: 1 },
      { text: 'The usual, please. You made it up, though.', back: ['it counts. i decree it'], pts: 1 },
    ],
  },
  {
    id: 'j_t2',
    minRank: 1,
    minDay: 5,
    msgs: ['auntie asked if you were "the boxes person" and i said yes and now she wants to know if you eat pork', 'i said i would find out'],
    replies: [
      { text: 'Yes to pork. Why is this an interview?', back: ['it is an audition for a stew', 'you are already in'], pts: 1 },
      { text: 'Tell her I eat anything she makes.', back: ['she is going to put that on a plaque'], pts: 2 },
    ],
  },
  {
    id: 'j_t3',
    minRank: 2,
    minDay: 9,
    msgs: ['ok so. the festival committee sent me a spreadsheet.', 'the spreadsheet has tabs.', 'i am so tired of tabs'],
    replies: [
      { text: 'I can look at it with you if you want.', back: ['you would do that??', 'ok bring snacks, i will bring tabs'], pts: 2 },
      { text: 'Tabs are the enemy.', back: ['thank you. finally someone who understands'], pts: 1 },
    ],
  },
  {
    id: 'j_t4',
    minRank: 3,
    minDay: 14,
    msgs: ['i made a real one today. laminate held. 27 layers.', 'i cried a little in the walk in. do not tell gerald'],
    replies: [
      { text: 'That is huge. Save me one.', back: ['it is already saved. it is in the good box'], pts: 2 },
      { text: 'Gerald knows everything. He was there.', back: ['he was. he hissed in solidarity'], pts: 1 },
    ],
  },
];

export const pings = [
  {
    msgs: ['morning. are you alive. blink twice if the alarm won'],
    replies: [
      { text: 'Barely. Blink blink.', back: ['heroic. come get a coffee'], pts: 1 },
      { text: 'I win most days.', back: ['show off'], pts: 1 },
    ],
  },
  {
    when: { weather: ['rain'] },
    msgs: ['it is pouring. the whole café smells like wet dog and cardamom. it is perfect', 'come sit if you are around'],
    replies: [
      { text: 'On my way.', back: ['i will save you the good chair'], pts: 1 },
      { text: 'Save me a pastry?', back: ['i have already saved you two'], pts: 1 },
    ],
  },
  {
    when: { weekday: [6] },
    msgs: ['sunday. no shift. what does a person even do on a sunday'],
    replies: [
      { text: 'Walk the pier and eat something bad.', back: ['ah you know me'], pts: 1 },
      { text: 'Nothing. On purpose.', back: ['i am going to try that. wish me luck'], pts: 1 },
    ],
  },
  {
    when: { slot: [3] },
    minRank: 2,
    msgs: ['are you up', 'not in a weird way, i just made too many things and i am staring at them'],
    replies: [
      { text: 'Bring them by tomorrow.', back: ['done. sleep well, nerd'], pts: 1 },
      { text: 'Send a picture.', back: ['[a tray of lopsided cookies, described in detail]', 'ok they look better in my head'], pts: 1 },
    ],
  },
  {
    msgs: ['reminder: mr okonkwo will ask you about folding today. you know what to do'],
    replies: [
      { text: 'Say no. Twice. Then dance.', back: ['i love that you listened'], pts: 1 },
      { text: 'What if I say yes?', back: ['then you will never leave that building', 'i will visit you'], pts: 1 },
    ],
  },
  {
    msgs: ['tell me one good thing that happened today. i need to hear about a good thing'],
    replies: [
      { text: 'Someone held a door for me.', back: ['that is genuinely so nice. i am putting that in my day'], pts: 1 },
      { text: 'This text.', back: ['okay that is cheating. i love it'], pts: 2 },
    ],
  },
];

// ----------------------------------------------------------------- finale
/** Junie's part of the festival. env.state is the game state. */
export function finale(env) {
  const path = env.state.flags.junie_path;
  const rank = env.state.bonds.junie.rank;
  if (rank < 1) return [];
  if (rank < 3) {
    return [
      narr('Junie is behind a folding table with a hand lettered sign that says MELON PAN, PROBABLY. She sees you and waves a pastry over her head like a flag.'),
    ];
  }
  const branch = {
    stay: [
      J('happy', "Auntie handed me the keys this morning. In front of everyone. She said it's the last time she's letting me pretend I don't want them."),
      J('laugh', "And then she said we're keeping Gerald."),
    ],
    study: [
      J('happy', "I'm going in the spring. Auntie told the whole committee before I could. She's already interviewing people to run the counter."),
      J('neutral', "I'm not leaving. I'm... expanding my range."),
    ],
    time: [
      J('happy', "I asked for a year. She said take two. She said she'd rather I was here on purpose than on time."),
      J('laugh', "I cried in the walk in for like an hour. Gerald was very supportive."),
    ],
  }[path] || [J('happy', "I don't know what happens next, but for tonight, I'm going to stand here and hand out pastries.")];
  return [
    bg('festival'),
    show('junie', 'happy'),
    narr('The café stall is glowing. Junie has hung every string light she owns, and a paper sign says KETTLE & CRUMB & EVERYTHING ELSE.'),
    ...branch,
    iff({ rank: ['junie', 4] }, [
      J('smirk', 'Hey. You. Come here. Hold this.'),
      narr('She presses a warm melon pan into your hands. It is still crackly on top.'),
      J('happy', 'Best one. Saved it from the first batch. Do not tell the committee.'),
      iff({ romance: 'junie' }, [
        J('blush', 'Stay after? When they close it down? I want to tell you a thing on the pier.'),
        me('Yes.'),
        romance('junie', 'together'),
      ], [
        J('happy', 'I am so glad I met you. Genuinely. You are the best thing that happened to me this year, and that includes the oven that finally works.'),
      ]),
    ]),
  ];
}
