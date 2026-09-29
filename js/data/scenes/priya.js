import {
  voice, me, narr, choice, opt, iff, set, romance, bg, show, hide, stat,
} from '../../core/dsl.js';

const P = voice('priya');
const V = voice('halvorsen');

export const scenes = [
  // ------------------------------------------------------------------ 1
  {
    n: 1,
    at: ['library'],
    title: 'Sorry, Quiet Please',
    recap: 'You met Priya at the library. She shushed you apologetically, then turned out to be the most enthusiastic person about the catalog you have ever met. She signed you up for a library card.',
    nodes: [
      bg('library'),
      narr('The reading room is enormous and hushed. The radiators knock at irregular intervals, like someone on the other side of a wall trying to get your attention.'),
      narr('You have barely sat down when a hand appears at the edge of your table, holding a small folded slip of paper.'),
      show('priya', 'worried'),
      P('worried', "Sorry. I'm so sorry. It's just that the acoustics in here are, um. Unusual. Your chair is making a sound."),
      P('worried', "It's not a bad sound. It's a nice sound. It's just very present."),
      choice([
        opt('Oh, sorry! I\'ll move.', [
          P('surprised', 'No! You don\'t have to move. I can move the chair. I can just, um, put a felt pad under it. Sorry, I have felt pads.'),
          narr('She produces a felt pad from her cardigan pocket with the calm of someone who has done this many times.'),
        ], { pts: ['priya', 1] }),
        opt('You keep felt pads in your pocket?', [
          P('blush', 'It is a very common problem. I am not embarrassed. I am a little bit embarrassed.'),
          P('smirk', 'The chairs are older than I am. They have opinions.'),
        ], { pts: ['priya', 2] }),
        opt('Is the shushing part of the job?', [
          P('thinking', 'Technically I shelve. The shushing is voluntary. I think of it as community stewardship.'),
          P('happy', 'Sorry, that was a joke. I am told I deliver them too flat.'),
        ], { pts: ['priya', 2] }),
      ]),
      P('neutral', "Were you looking for something in particular? You've been staring at the same page for eight minutes."),
      me("I was actually looking for something about the harbor. I just moved here."),
      P('surprised', '...The harbor.'),
      narr('She stands very still. Something behind her glasses changes, like a lamp coming on in a window.'),
      P('happy', 'The harbor. Okay. Okay! Do you want the history, or the tides, or the life in it? Because there is a very good book on each. Sorry. Which one. Which one is it.'),
      choice([
        opt('The life in it.', [
          P('happy', 'Yes. Yes! Okay. Wait here.'),
          narr('She vanishes into the stacks. There is the sound of quick footsteps, and one small triumphant "aha."'),
        ], { pts: ['priya', 3] }),
        opt('The tides. I have no idea how they work.', [
          P('thinking', 'That is a genuinely excellent starting point. Nobody actually knows how they work. They just think they do.'),
          P('happy', 'Okay, this is the one, but I have to warn you, it has a chapter on the moon that is, um, controversial.'),
        ], { pts: ['priya', 2] }),
        opt('Whichever one you like best.', [
          P('surprised', '...I love that question. Nobody has asked me what I like best in a long time.'),
          P('neutral', 'The life in it. Always. Sorry, give me a second.'),
        ], { pts: ['priya', 3] }),
      ]),
      narr('She returns with three books, a laminated tide chart, and a photo printed on regular paper. You blink at it.'),
      P('happy', 'That is a Flabellina. A nudibranch. A sea slug. No shell. It eats hydroids, keeps their stinging cells, and stores them in the tips of those little orange fingers. Like armor.'),
      P('blush', 'Sorry. I get very enthusiastic about the catalog.'),
      choice([
        opt('That\'s the coolest thing I\'ve heard all week.', [
          P('surprised', 'Really? People usually say "eww."'),
          P('happy', 'It IS the coolest thing. I have forty more. Sorry. I will pace myself.'),
        ], { pts: ['priya', 3] }),
        opt('They steal armor? That\'s metal.', [
          P('laugh', 'It is extremely metal.'),
          narr('It is the first time she has laughed. It is short and surprised and she covers her mouth as if it escaped.'),
        ], { req: { stat: ['charm', 1] }, pts: ['priya', 4] }),
        opt('Can I borrow the books?', [
          P('neutral', 'You need a card. It\'s free. It requires a form. I have the form.'),
        ], { pts: ['priya', 1] }),
      ]),
      P('neutral', 'You do need a card, actually. Give me one moment.'),
      narr('She fills it out with a fountain pen, in handwriting so neat it looks typeset.'),
      P('neutral', 'Name?'),
      me('{name}.'),
      P('thinking', '{name}. Good. That is a name that will look nice on a card.'),
      P('neutral', "I'm Priya. I shelve. I'm also a grad student, in marine biology, but nobody asked about that. Sorry. That was a lot."),
      choice([
        opt('It wasn\'t a lot. I like it.', [
          P('blush', 'Oh. Thank you.'),
          P('neutral', 'Come back whenever you like. I am here. Almost always. Sorry, that sounded more pathetic than I intended.'),
        ], { pts: ['priya', 2] }),
        opt('Marine biology sounds hard.', [
          P('sad', 'It is. But so is everything else. Ha. That was a joke. It also is not a joke.'),
        ], { pts: ['priya', 1] }),
      ]),
    ],
  },

  // ------------------------------------------------------------------ 2
  {
    n: 2,
    at: ['library'],
    slots: [1, 2],
    minDay: 4,
    title: 'Tea and Tables',
    recap: 'You studied with Priya until she admitted she had not slept properly in a week. You took her to the pier at dusk and she showed you her favorite photo of a sea slug.',
    nodes: [
      bg('library'),
      narr('Priya is at a corner table with a laptop, seven open books, a tin of tea, and dark circles under her eyes that could be seen from the parking lot.'),
      show('priya', 'sleepy'),
      P('sleepy', 'Oh. Hello. Sorry. I am, um. Working. On something. A section.'),
      P('neutral', 'It is coming along well. It is fine.'),
      choice([
        opt('Can I sit with you?', [
          P('surprised', 'Yes. Of course. Sorry, I thought you were leaving.'),
          narr('She pulls a stack of books off the second chair with great care, as if apologizing to each one.'),
        ], { pts: ['priya', 2] }),
        opt('You look exhausted.', [
          P('worried', 'I am fine. I have slept. I slept on Tuesday.'),
          P('sleepy', 'It was a nap. It counted.'),
        ], { pts: ['priya', 1] }),
      ]),
      narr('You study side by side for a while. She is fast, methodical, and pauses every few minutes to rub her eyes with the heel of her hand.'),
      P('worried', "Sorry, could you check something for me? Is this sentence grammatical? I've read it eleven times and it now looks like a foreign word."),
      narr('You read it. It is perfectly grammatical. It is also the best sentence on the page.'),
      choice([
        opt('It\'s perfect. It\'s a really good sentence.', [
          P('surprised', 'Oh. Really? It just... felt like a lie. I keep thinking I\'m going to be found out.'),
        ], { pts: ['priya', 2] }),
        opt('When did you last sleep?', [
          P('worried', "...Wednesday? Thursday? There was a Thursday. I think I slept in it."),
          P('serious', "It is not sustainable. I know that. I have a spreadsheet about it."),
        ], { req: { stat: ['empathy', 1] }, pts: ['priya', 3] }),
        opt('Take a walk with me? Ten minutes.', [
          P('thinking', 'I... have a deadline.'),
          P('neutral', "It is not until Friday. Which is, technically, two days away. That is a very long time."),
          P('neutral', 'Ten minutes. I will bring my tea.'),
        ], { pts: ['priya', 3] }),
      ]),
      bg('pier'),
      narr('The pier is quiet, blue and gold in the last of the light. The tide is coming in, and water slaps against the boards below your feet.'),
      show('priya', 'neutral'),
      P('neutral', 'I always forget it is this close. It is four minutes from the library. I have not been here in weeks.'),
      P('thinking', 'That tide pool, by the ladder. It is where I sample. Or where I did.'),
      narr('She takes out her phone. There is a photograph of a tiny creature with a blue body and orange fingers, no bigger than a thumb, sitting on a piece of pink rock like an ornament.'),
      P('happy', 'This one. Hermissenda. I found it in February, on a day I was sure I would fail my qualifying exam. It was just sitting there, being ridiculous.'),
      P('happy', 'I looked at it and thought, if that exists, then things are not entirely bad.'),
      choice([
        opt('That\'s a great reason to keep going.', [
          P('blush', "It's not a dissertation reason. It's just a reason."),
          P('happy', 'But I think it is the real one.'),
        ], { pts: ['priya', 3] }),
        opt('Can you show me more of them sometime?', [
          P('surprised', "I have four hundred and twelve photographs. Sorry. That is a very specific number. I counted."),
          P('laugh', 'You may regret asking.'),
        ], { pts: ['priya', 3] }),
        opt('You laughed just now. It\'s a good sound.', [
          P('blush', 'I... hm. Thank you. I am not sure what to do with that.'),
        ], { req: { stat: ['charm', 2] }, pts: ['priya', 4] }),
      ]),
      P('neutral', 'Thank you for making me take the walk. I feel, um, like a person.'),
      P('neutral', 'I still have a deadline. But I feel like a person who has a deadline, rather than a deadline with a person attached.'),
      set('priya_walk'),
    ],
  },

  // ------------------------------------------------------------------ 3
  {
    n: 3,
    at: ['library'],
    slots: [1, 2],
    minDay: 9,
    title: 'Reply All',
    recap: 'Priya avoided her advisor\'s email for three days. You sat with her while she read it. It was mostly good news, and she could not believe it. You helped her write the reply.',
    nodes: [
      bg('library'),
      show('priya', 'worried'),
      narr('Priya is staring at her laptop with the fixed expression of someone watching a pot she is certain will boil over.'),
      P('worried', 'I got an email. From Dr. Halvorsen. Three days ago. I have not opened it.'),
      P('serious', "It says 'Re: Chapter 3' in the subject line. Nobody writes 'Re: Chapter 3' unless the news is terrible."),
      choice([
        opt('Do you want me to read it first?', [
          P('worried', 'No. It should be me. But, um, would you sit here? While I do.'),
        ], { pts: ['priya', 3] }),
        opt('Three days is a long time to wonder.', [
          P('neutral', 'Yes. It is. I am aware. I have been wondering very thoroughly.'),
        ], { pts: ['priya', 1] }),
        opt('(Sit next to her and say nothing.)', [
          narr('She glances at you. She lets out a small, shaky breath.'),
          P('neutral', 'Okay. Okay. Thank you.'),
        ], { pts: ['priya', 3] }),
      ]),
      narr('She clicks. The email opens. She reads it slowly, mouthing some of the words. Her expression does not change for so long that you start to worry.'),
      show('halvorsen', 'neutral', 'right'),
      V('neutral', "Priya, Chapter 3 is the strongest work you have submitted. The tide flat data is exactly the kind of long term dataset this field needs. Two small revisions on the methods section, then let's talk about submitting for the regional conference."),
      V('smirk', "Also: sleep. This is an instruction."),
      hide('halvorsen'),
      narr('Priya reads it a second time. And a third.'),
      P('sad', 'This is a mistake.'),
      me('What?'),
      P('worried', 'He wrote this to the wrong person. Or he is being kind. He is a kind person. Kind people write things like this to soften the blow.'),
      P('worried', 'There is a second email coming. There must be. It says "but."'),
      choice([
        opt('There\'s no "but." Read it again.', [
          P('worried', 'I read it three times.'),
          me('Then you know what it says.'),
          P('sad', "I know what it says. I do not believe what it says. Those are different."),
        ], { pts: ['priya', 2] }),
        opt('That fear sounds exhausting. Not being able to trust good news.', [
          P('surprised', '...Yes. Yes, it is. It is extremely exhausting.'),
          P('sad', "I keep waiting for someone to notice I'm a fraud, and then when they don't, I feel like I've tricked them."),
        ], { req: { stat: ['empathy', 2] }, pts: ['priya', 4] }),
        opt('Let\'s look at the evidence. What does your data actually say?', [
          P('thinking', '...That the tide flat species richness has dropped eleven percent in three years.'),
          P('thinking', 'That the trend line is statistically significant. That my sampling design was sound.'),
          P('neutral', "That I did this correctly."),
          me('So the person who did it correctly says she is a fraud.'),
          P('surprised', 'That is a logical inconsistency.'),
          P('laugh', 'You are annoying. Thank you.'),
        ], { req: { stat: ['wit', 2] }, pts: ['priya', 4] }),
        opt('Priya, if this were someone else\'s email, what would you tell them?', [
          P('thinking', 'That they did well. That they should breathe.'),
          P('blush', 'Oh. That was a trick.'),
        ], { pts: ['priya', 3] }),
      ]),
      P('neutral', 'I should reply. Something professional. "Thank you for the feedback." That seems safe.'),
      choice([
        opt('Maybe say you\'re excited, too.', [
          P('blush', "I am not sure I'm allowed."),
          me('You are.'),
          narr('She types "I am very excited about the conference" and deletes it and types it again.'),
        ], { pts: ['priya', 2] }),
        opt('Let me read it over before you hit send.', [
          narr('You edit two commas. She thanks you as though you had saved her life.'),
        ], { pts: ['priya', 2] }),
      ]),
      narr('The reply goes out with a small whoosh. Priya stares at the screen, and then lets her forehead drop gently onto the desk.'),
      P('sleepy', 'I would like to sleep now. For eleven hours. Sorry. That is my announcement.'),
      P('neutral', "Thank you. That's a ridiculous thing to say to someone for sitting next to me. But thank you."),
      set('priya_email'),
    ],
  },

  // ------------------------------------------------------------------ 4
  {
    n: 4,
    at: ['pier'],
    slots: [0],
    minDay: 15,
    title: 'Low Tide, 6:40 AM',
    recap: 'Priya took you to her sampling site on the tide flats at dawn and told you the waterfront plan would pave over it. She decided how she wants to speak at the festival forum.',
    nodes: [
      bg('pier'),
      narr('The tide has gone out further than you thought a tide could go. The harbor floor is exposed, glistening, pocked with small pools that reflect a pink sky.'),
      show('priya', 'happy'),
      P('happy', 'This is my favorite hour. Sorry. The tide table says 6:41 for the minimum. We have about nine minutes of best.'),
      narr('She is wearing borrowed rubber boots that are two sizes too big. She looks completely, ridiculously happy.'),
      P('neutral', 'Watch your footing. The algae is slippery. That is not a warning. That is, um, a strong suggestion.'),
      choice([
        opt('Show me your favorite pool.', [
          P('happy', 'Oh. Okay. Okay! This way.'),
        ], { pts: ['priya', 3] }),
        opt('I\'m following you. Lead the way.', [
          P('happy', 'You should not trust me this much. I have fallen into every pool on this flat at least twice.'),
        ], { pts: ['priya', 2] }),
      ]),
      narr('She kneels beside a pool the size of a dinner table. In it, on a lip of dark rock, a tiny slug the color of a sunset glides along with impossible patience.'),
      P('happy', "That one. Her name is Margaret. I know they don't have names. She has one."),
      P('neutral', 'You can hold your finger near her. She will not sting you. Not, um, most of the time.'),
      narr('You hold your finger near. Margaret does not care about you at all. It is one of the best moments of your month.'),
      P('serious', 'This is what the waterfront plan covers. Not just this pool. All of this. The whole flat, under a concrete promenade.'),
      P('worried', "I have three years of data that say it's one of the richest sites on this coast. I am not sure that data has a voice."),
      choice([
        opt('It has yours.', [
          P('surprised', '...That is a very simple thing to say.'),
          P('blush', 'It is also true. I am not sure I like that it is true.'),
        ], { pts: ['priya', 3] }),
        opt('What would it take for people to listen?', [
          P('thinking', 'Someone to say it out loud. In a room. With a straight face. That is the part I cannot do.'),
        ], { pts: ['priya', 2] }),
      ]),
      P('neutral', 'The festival has a community forum. Ten minutes at the small stage. The committee asked me to speak. Dr. Halvorsen said I should.'),
      P('worried', 'I have not answered. I have not slept properly since they asked.'),
      choice([
        opt('You should do the talk. Say it in your own words.', [
          P('worried', 'In front of a hundred people.'),
          me('In front of a hundred people who need to hear it.'),
          P('serious', "...Okay. Okay. I will try. I might faint. But I will try."),
          set('priya_path', 'talk'),
        ], { pts: ['priya', 3] }),
        opt('Make a poster. Stand next to it and answer questions.', [
          P('thinking', 'A poster. With the data. I could do a poster. I like posters. Nobody has to look at me. They look at the graphs.'),
          P('happy', "That is, um, a very good compromise. Thank you."),
          set('priya_path', 'poster'),
        ], { req: { stat: ['wit', 1] }, pts: ['priya', 3] }),
        opt('You don\'t have to. It\'s your call.', [
          P('neutral', 'Yes. I know. That is why it is so hard.'),
          P('thinking', 'I will decide by Friday.'),
          set('priya_path', 'later'),
        ], { pts: ['priya', 2] }),
      ]),
      narr('The tide turns. You feel it before you see it: a change in the air, and then the first thin silver ribbon of water sliding back across the flat.'),
      P('neutral', 'That is the end of best. Sorry. It happens fast.'),
      P('happy', 'Thank you for coming. Nobody has ever come to see Margaret.'),
      choice([
        opt('I\'m glad I met her. And you.', [
          P('blush', 'Oh.'),
          P('happy', 'I am also glad. I am very glad. I am, um, having a good morning.'),
          romance('priya', 'friends'),
        ], { pts: ['priya', 3] }),
        opt('Priya, can I tell you something? I think I\'m falling for you.', [
          P('surprised', '...I need to sit down. Not because of the algae.'),
          P('blush', 'I did not have a plan for this. I make plans for everything. I have no plan for this.'),
          P('happy', "But I would like to find out what happens. Slowly. With a lot of tea. Is that acceptable?"),
          me('That is more than acceptable.'),
          P('laugh', 'That was a very formal reply. I love it.'),
          romance('priya', 'open'),
        ], { req: { romanceOn: 'priya' }, hide: true, pts: ['priya', 4] }),
      ]),
      stat('empathy', 1),
    ],
  },
  // ------------------------------------------------------------------ 5
  {
    n: 5,
    at: ['library'],
    minDay: 30,
    title: 'Acknowledgments',
    recap: 'Weeks after the festival, Priya showed you the acknowledgments in her conference paper. Your name was in it.',
    nodes: [
      bg('library'),
      show('priya', 'happy'),
      P('happy', 'The conference accepted my abstract. Also Dr. Halvorsen wrote "sleep" in the email again. That is the third time. I believe it is now a form of affection.'),
      P('neutral', 'I have something to show you. It is one line. It took me an entire evening.'),
      narr('She turns her laptop around. In the acknowledgments, under the funding and the advisor and the lab, it says: "To {name}, who took me for walks."'),
      choice([
        opt('That is the best line in the paper.', [P('blush', 'It is the only line in the paper that is not peer reviewed. It is also the truest.')], { pts: ['priya', 4] }),
        opt('You did the work. I just walked next to you.', [P('thinking', 'That is not nothing. That is, in fact, most of it.')], { pts: ['priya', 4] }),
      ]),
      iff({ romance: 'priya' }, [
        P('blush', 'I drew a small sea slug next to it in the draft. A Flabellina. It is holding a cup of tea. I took it out. I am telling you so you know it was there.'),
      ], [
        P('happy', 'Margaret sends her regards. She has been very smug lately.'),
      ]),
    ],
  },
];

// ---------------------------------------------------------------- hangouts
export const hangouts = [
  {
    id: 'p_sea_slug',
    at: ['library'],
    minRank: 1,
    nodes: [
      show('priya', 'happy'),
      P('happy', 'I have a fact. It is a good one. Do you want the fact?'),
      choice([
        opt('Absolutely. Give me the fact.', [
          P('happy', 'There is a sea slug called Elysia. It eats algae, and instead of digesting the chloroplasts, it keeps them. And then it lives on sunlight. For months.'),
          P('laugh', 'It is a leaf that decided to be a slug. I think about it more than I should.'),
          P('blush', 'Sorry. That was, um, the good one. I keep it for special occasions.'),
        ], { pts: ['priya', 3] }),
        opt('Is it a sad fact?', [
          P('thinking', 'No. It is a ridiculous fact. I only have ridiculous facts.'),
        ], { pts: ['priya', 2] }),
      ]),
    ],
  },
  {
    id: 'p_shelving',
    at: ['library'],
    minRank: 1,
    nodes: [
      show('priya', 'neutral'),
      P('neutral', 'Would you like to help me shelve? It is soothing. It is alphabet therapy.'),
      narr('You push the cart between the stacks. She hands you books in strict order and corrects you, kindly, three times.'),
      choice([
        opt('This is weirdly relaxing.', [
          P('happy', 'Yes! Thank you! No one believes me.'),
        ], { pts: ['priya', 2] }),
        opt('Why does everything go in this order?', [
          P('thinking', 'Because if it were not in order, we would lose track. Fear is a lot of what a library is. Fear of not finding things.'),
        ], { pts: ['priya', 2] }),
      ]),
    ],
  },
  {
    id: 'p_flat_white',
    at: ['cafe'],
    minRank: 1,
    nodes: [
      show('priya', 'worried'),
      P('worried', 'I am sorry. It is the same order again. Oat flat white. I feel like I should branch out.'),
      choice([
        opt('Why? It\'s a good order.', [
          P('surprised', 'Oh. It is. I like it. I just feel like other people find it boring.'),
          me('I do not.'),
          P('blush', 'Okay. Then I will not be sorry about it. Today.'),
        ], { pts: ['priya', 3] }),
        opt('Try something new. I\'ll pay.', [
          P('worried', 'I cannot let you do that. I will pay. I will pay for both, actually.'),
          narr('You split it, after a three minute argument that neither of you enjoys and both of you win.'),
        ], { pts: ['priya', 2] }),
      ]),
    ],
  },
  {
    id: 'p_tide_table',
    at: ['pier'],
    minRank: 1,
    nodes: [
      show('priya', 'thinking'),
      P('thinking', 'Do you know why we have two tides a day and not one? Most people do not. It is not obvious.'),
      choice([
        opt('The moon pulls the water?', [
          P('smirk', 'The moon does pull it. Yes. But it pulls the water on the far side, too. So you get two bulges. Sorry, I know that is slightly confusing.'),
          narr('She draws a diagram in the air with her hands. You genuinely understand it, for about four minutes.'),
        ], { pts: ['priya', 2] }),
        opt('No idea. Tell me.', [
          P('happy', 'Oh! Okay! So imagine you are spinning a ball on a string.'),
          narr('It is a long explanation. It is a wonderful one. You do not check your phone once.'),
        ], { pts: ['priya', 3] }),
      ]),
    ],
  },
  {
    id: 'p_granola',
    at: ['market'],
    minRank: 1,
    nodes: [
      show('priya', 'sleepy'),
      P('sleepy', 'I am having dinner. It is a granola bar. It counts as a grain, a nut, and a fruit.'),
      narr('Before you can respond, a bowl of steaming noodles is set down in front of her by a man who does not say a word and does not wait for a reply.'),
      P('surprised', '...I did not order this.'),
      choice([
        opt('Eat it. He\'s watching.', [
          P('worried', 'Is he watching?'),
          narr('Tomek, across the market, is definitely watching. Priya eats the entire bowl in silence.'),
          P('happy', 'That was the best thing I have eaten in my adult life.'),
        ], { pts: ['priya', 3] }),
        opt('You should eat real meals.', [
          P('worried', 'Yes. I know. I have been told. By a bowl of soup, apparently.'),
        ], { pts: ['priya', 2] }),
      ]),
    ],
  },
  {
    id: 'p_radio_secret',
    at: ['radio'],
    minRank: 2,
    nodes: [
      show('priya', 'blush'),
      P('blush', 'I have a confession. It is very small. I listen to Late Lantern almost every night.'),
      P('worried', 'I have never told Amara. I sometimes write in. Anonymously. From the library.'),
      choice([
        opt('She knows it\'s you. I\'m pretty sure.', [
          P('surprised', '...What?'),
          P('blush', 'Oh no. Oh, that is mortifying. It is also extremely nice.'),
        ], { pts: ['priya', 3] }),
        opt('What do you write to her?', [
          P('neutral', 'Mostly weather. Sometimes a fact about the sea. Occasionally, the truth.'),
        ], { pts: ['priya', 3] }),
      ]),
    ],
  },
  {
    id: 'p_five_minutes',
    at: 'any',
    minRank: 2,
    nodes: [
      show('priya', 'thinking'),
      P('thinking', 'I have instituted a five minute break rule. You are the enforcement.'),
      P('neutral', 'I set a timer. You make me stop. It has to be someone else, or I cheat.'),
      choice([
        opt('Deal. What do we do for five minutes?', [
          P('thinking', 'Nothing. That is the difficult part.'),
          narr('You sit together and do nothing for five minutes. When the timer goes off, she looks quietly astonished.'),
          P('happy', 'That was extraordinarily useful. It should not have been.'),
        ], { pts: ['priya', 3] }),
        opt('Sure. But I\'m getting a bribe.', [
          P('smirk', 'Tea. Loose leaf. I have a tin.'),
        ], { pts: ['priya', 2] }),
      ]),
    ],
  },
];

export const texts = [
  {
    id: 'p_t1',
    minRank: 1,
    minDay: 3,
    msgs: ['Hello. This is Priya, from the library. I took your number from the card. I hope that is not a violation.', 'I wanted to say the books are due on the 24th. And that it was nice to talk to you.'],
    replies: [
      { text: 'Not a violation. It was nice to talk to you too.', back: ['Good. I was concerned. Thank you for responding.'], pts: 1 },
      { text: 'Is this a library overdue notice? Already?', back: ['It is a friendly pre notice. I consider it a service.'], pts: 1 },
    ],
  },
  {
    id: 'p_t2',
    minRank: 2,
    minDay: 8,
    msgs: ['I found a new one today. Flabellina. Purple with orange tips.', 'I am telling you because you are the only person who has ever asked me for more than one fact.'],
    replies: [
      { text: 'Send a picture!', back: ['[A very small purple creature, on a very small rock.] Isn\'t she magnificent.'], pts: 2 },
      { text: 'I love that you told me.', back: ['Thank you. That is a very kind reply. I am going to go read it again.'], pts: 2 },
    ],
  },
  {
    id: 'p_t3',
    minRank: 3,
    minDay: 14,
    msgs: ['I made a poster. Then I made a second poster. Then I made a third poster to compare the first two.', 'This may be a symptom.'],
    replies: [
      { text: 'Send all three. I will review them.', back: ['That would be wonderful. And frightening.'], pts: 2 },
      { text: 'A symptom of caring a lot. That is fine.', back: ['That is a generous diagnosis. I will take it.'], pts: 2 },
    ],
  },
];

export const pings = [
  {
    msgs: ['Good morning. The tide is at 6:12 today. I thought you should know. It is the kind of information that improves a day.'],
    replies: [
      { text: 'Enjoy the low tide.', back: ['I will. Thank you. I will send a report.'], pts: 1 },
      { text: 'Tide facts at 6am. I love it.', back: ['You are the only person who says that.'], pts: 1 },
    ],
  },
  {
    when: { weather: ['rain'] },
    msgs: ['It is raining. The reading room sounds extraordinary today. If you happen to be nearby, I recommend it.'],
    replies: [
      { text: 'I am coming. Save me a seat.', back: ['I will save the good chair. The one that does not make the noise.'], pts: 1 },
      { text: 'Rain like a drum on glass?', back: ['Precisely. That is a good description.'], pts: 1 },
    ],
  },
  {
    when: { slot: [3] },
    minRank: 2,
    msgs: ['I am awake. That is not a request. It is a status update.', 'The radio is on. I am listening to someone say something kind to a stranger.'],
    replies: [
      { text: 'Go to bed soon. Doctor\'s orders.', back: ['You are not a doctor. But you are correct. Goodnight.'], pts: 2 },
      { text: 'What is she saying?', back: ['That people do not have to be fine every day. It is a good broadcast.'], pts: 2 },
    ],
  },
  {
    msgs: ['I ate lunch. A real one, with a plate. I wanted someone to know.'],
    replies: [
      { text: 'Proud of you.', back: ['Thank you. It was a sandwich. It was a very good one.'], pts: 2 },
      { text: 'What kind of sandwich?', back: ['Cheese and cucumber. I am aware that is not exciting.'], pts: 1 },
    ],
  },
  {
    msgs: ['Question, unrelated to anything: do you think it is strange to name a sea slug?'],
    replies: [
      { text: 'Not at all. What is her name?', back: ['Margaret. She is a Hermissenda. She is very dignified.'], pts: 2 },
      { text: 'A little strange. But good strange.', back: ['I will take that. I am comfortable with good strange.'], pts: 1 },
    ],
  },
];

// ----------------------------------------------------------------- finale
export function finale(env) {
  const path = env.state.flags.priya_path;
  const rank = env.state.bonds.priya.rank;
  if (rank < 1) return [];
  if (rank < 3) {
    return [
      narr('Priya is near the library tent, handing out tide charts and looking faintly startled that people are taking them. She spots you and waves with the tide chart, very formally.'),
    ];
  }
  const talk = [
    show('priya', 'serious'),
    narr('The small stage. A hundred faces in the lantern light. Priya is gripping the sides of the lectern like a ship\'s rail.'),
    P('serious', 'Good evening. My name is Priya Nair. I study the animals that live in the harbor. Three years of data. I will try to be brief.'),
    narr('She is not brief. She is not slick. But halfway through, she stops looking at her notes and starts looking at the crowd, and the room leans forward.'),
    show('priya', 'happy'),
    P('happy', 'It was all worth it. I forgot to be scared for about six minutes.'),
  ];
  const poster = [
    show('priya', 'happy'),
    narr('Her poster is bright, careful, and beautiful. A small line of people has formed in front of it. Priya answers every question like she has been waiting years to be asked.'),
    P('happy', 'A woman asked whether the slugs would come back if we made a small park. I said yes. I said it out loud. To a stranger.'),
  ];
  const later = [
    show('priya', 'thinking'),
    narr('Priya is at the edge of the crowd with her notes in her bag. She did not go up. She looks at the stage for a long time.'),
    P('neutral', 'Next time. There will be a next time. There are always more tides.'),
  ];
  const pick = path === 'talk' ? talk : path === 'poster' ? poster : later;
  return [
    bg('festival'),
    ...pick,
    iff({ rank: ['priya', 4] }, [
      P('happy', 'Come here. I have something for you.'),
      narr('It is a small jar with a lid, filled with seawater and a single piece of pink rock. A note on the lid reads "Not Margaret. A rock she used to like."'),
      iff({ romance: 'priya' }, [
        P('blush', 'Would you sit with me on the pier when the lanterns go out? I would like to be near you when it is quiet.'),
        me('Yes.'),
        romance('priya', 'together'),
      ], [
        P('happy', 'Thank you for coming to see Margaret. Nobody had before. That is a thing I will remember for a very long time.'),
      ]),
    ]),
  ];
}
