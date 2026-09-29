import {
  voice, me, narr, choice, opt, iff, set, item, bg, show, hide, stat, money,
} from '../../core/dsl.js';

const T = voice('tomek');
const Z = voice('zosia');

export const scenes = [
  // ------------------------------------------------------------------ 1
  {
    n: 1,
    at: ['market'],
    slots: [2, 3],
    title: 'Sit.',
    recap: 'You wandered up to a ramen stall at closing. Tomek said "We are closed," then put a bowl in front of you and said "Sit." He asked you nothing and charged you nothing.',
    nodes: [
      bg('market'),
      narr('The night market is winding down. Strings of bulbs swing over the folding tables and half the stalls are already pulling their shutters.'),
      narr('Steam rises from the last cart at the end of the row. A large man in a flannel shirt with a towel over one shoulder is wiping down a counter with slow, thorough strokes.'),
      show('tomek', 'neutral'),
      narr('You have been walking for hours. You slow down without meaning to.'),
      T('serious', 'We are closed.'),
      narr('He says this while ladling broth into a bowl.'),
      T('neutral', 'Sit.'),
      choice([
        opt('Oh, I don\'t want to be a bother.', [
          T('neutral', 'You are standing in front of my cart looking like that. Sit.'),
        ], { pts: ['tomek', 1] }),
        opt('(Sit down.)', [
          T('neutral', 'Good.'),
        ], { pts: ['tomek', 2] }),
        opt('You said you were closed.', [
          T('serious', 'I am closed. This is a bowl. It is different.'),
          narr('You sit. It seems safer.'),
        ], { pts: ['tomek', 1] }),
      ]),
      narr('The bowl lands in front of you. The broth is pale gold and smells like a kitchen from a childhood you did not have but somehow miss. There are noodles, a soft egg, a scatter of dill.'),
      T('neutral', 'Eat first. Talk after.'),
      narr('You eat. It is the first thing you have tasted in days that has actually tasted like something.'),
      choice([
        opt('This is unbelievable. What\'s in it?', [
          T('neutral', 'Broth.'),
          me('What kind of broth?'),
          T('neutral', 'The good kind.'),
          narr('He wipes the counter. That, apparently, is the entire recipe.'),
        ], { pts: ['tomek', 1] }),
        opt('(Keep eating in silence.)', [
          narr('The steam curls up. Around you the market clatters shut, one shutter at a time. He lets the quiet sit there like a third person at the counter.'),
          T('neutral', 'Hm.'),
          narr('It sounds like approval.'),
        ], { pts: ['tomek', 3] }),
        opt('Is this ramen? It tastes like something my grandmother would make.', [
          T('surprised', '...Close.'),
          T('neutral', 'It is a soup my mother made. With noodles that are not hers.'),
          T('neutral', 'Do not tell the ramen people.'),
        ], { pts: ['tomek', 3] }),
      ]),
      T('neutral', 'You are new. I have not seen you before.'),
      me('I just moved in above the laundromat.'),
      T('neutral', 'Okonkwo. He will try to fold your shirts.'),
      me('That is what everyone keeps telling me.'),
      T('smirk', 'Then everyone is right. It is a small neighborhood.'),
      narr('He turns off the cart\'s burner. The market lights above you buzz.'),
      choice([
        opt('What\'s the stall called?', [
          T('neutral', 'Bowl and Anchor.'),
          me('Why an anchor?'),
          T('neutral', 'It came with the cart. I did not ask.'),
        ], { pts: ['tomek', 2] }),
        opt('How much do I owe you?', [
          T('neutral', 'First one is free. Second one is eight dollars.'),
          T('serious', 'That is not a favor. That is a rule.'),
        ], { pts: ['tomek', 2] }),
        opt('Thank you. Seriously.', [
          T('serious', 'Do not thank me. Eat.'),
          narr('He says it with a completely straight face. You are almost sure he is embarrassed.'),
        ], { pts: ['tomek', 2] }),
      ]),
      T('neutral', 'I am Tomek. I am here most nights. Not Wednesdays.'),
      me('Why not Wednesdays?'),
      T('serious', 'Wednesdays I am closed.'),
      narr('You get the feeling this is not the kind of question with a second answer.'),
      T('neutral', 'Come back. Second bowl is eight dollars.'),
      set('tomek_met'),
    ],
  },

  // ------------------------------------------------------------------ 2
  {
    n: 2,
    at: ['market'],
    slots: [2, 3],
    minDay: 4,
    title: 'Skimming',
    recap: 'You helped Tomek prep the stall. He taught you to skim broth, and told you about the night he walked out of the best kitchen in the city.',
    nodes: [
      bg('market'),
      show('tomek', 'neutral'),
      T('neutral', 'You came early. Good. I need hands.'),
      narr('He gives you an apron that goes around you nearly twice, and a long spoon.'),
      T('neutral', 'Broth. There is foam. It rises to the top. You take it off. Slowly. Not the fat. Only the foam.'),
      choice([
        opt('Like this?', [
          T('serious', 'Slower.'),
          narr('You slow down. He watches your hand.'),
          T('neutral', 'Better. You are rushing. Everyone rushes. The broth does not care that you have a life.'),
        ], { pts: ['tomek', 2] }),
        opt('What happens if I take the fat?', [
          T('neutral', 'You take the flavor. Then it is water with opinions.'),
          T('smirk', 'Like most people.'),
        ], { pts: ['tomek', 2] }),
        opt('(Focus and skim as carefully as you can.)', [
          narr('You breathe out and go slowly. The foam lifts away in pale ribbons. After a while you stop watching the spoon and start watching the pot.'),
          T('neutral', 'Hm.'),
          T('neutral', 'You have hands.'),
        ], { req: { stat: ['grit', 1] }, pts: ['tomek', 3] }),
      ]),
      narr('For a while there is just steam and the drifting sounds of the market setting up: a rolling shutter, a radio, someone laughing at the far end.'),
      T('neutral', 'You are quiet. Good. Most people talk when they are nervous.'),
      choice([
        opt('Where did you learn to cook like this?', [
          T('neutral', 'Mother. Then a lot of kitchens. Then one very good kitchen.'),
        ], { pts: ['tomek', 2] }),
        opt('Did you always want to run a stall?', [
          T('smirk', 'No. I wanted to run a kitchen. A big one. With a stove that costs more than a house.'),
          T('neutral', 'I did that.'),
        ], { pts: ['tomek', 2] }),
      ]),
      T('neutral', 'It was called Marchand. Downtown. Twelve tables. Tasting menu. You wait eight months to sit.'),
      T('neutral', 'I ran the line. Fourteen hours a day. Six days.'),
      narr('He skims a ribbon of foam and taps it off the spoon with the precision of a man who has done this ten thousand times.'),
      T('serious', 'One Saturday a plate came back. A guest said it was flat. I tasted it. It was flat.'),
      T('serious', 'It was my sauce. I had made that sauce three thousand times. And I could not taste it.'),
      T('serious', 'I tasted the next one. And the next one. Nothing. Salt, but nothing.'),
      narr('The ladle stops.'),
      T('neutral', 'I took off my apron. I put it on the pass. I walked out the back and sat in the alley for an hour. Then I went home.'),
      T('neutral', 'That is the story. It is not interesting.'),
      choice([
        opt('It sounds like you were completely burned out.', [
          T('neutral', 'Maybe. I stopped tasting my own food. That is a thing that happens, I am told.'),
          T('neutral', 'Not to me. I thought it was for other people.'),
        ], { req: { stat: ['empathy', 1] }, pts: ['tomek', 3] }),
        opt('Do you miss it?', [
          T('thinking', 'The kitchen? Some days.'),
          T('neutral', 'The plates. The order of it. Not the man I was in it.'),
        ], { pts: ['tomek', 3] }),
        opt('Can you taste now?', [
          T('surprised', '...'),
          T('neutral', 'Some. Sometimes. It is a slow thing. It comes back like a bad knee.'),
          narr('It is the first time you have seen him almost smile.'),
        ], { pts: ['tomek', 3] }),
        opt('(Keep skimming and let him have the quiet.)', [
          narr('You go on skimming. Neither of you says anything for a while. The foam rises, the foam is lifted. That seems to be enough.'),
        ], { pts: ['tomek', 2] }),
      ]),
      T('neutral', 'You are good at this. Come Fridays, if you like. I will pay you in soup.'),
      set('tomek_marchand'),
      stat('grit', 1),
    ],
  },

  // ------------------------------------------------------------------ 3
  {
    n: 3,
    at: ['market'],
    slots: [2, 3],
    minDay: 9,
    title: 'Wednesdays',
    recap: 'Tomek got a call from his daughter Zosia and lost the thread of it. Afterward he told you what he does on Wednesdays.',
    nodes: [
      bg('market'),
      show('tomek', 'neutral'),
      narr('It is a slow night. Tomek is drying bowls. You are at the counter with a cup of tea he did not ask if you wanted.'),
      narr('His phone buzzes on the shelf. The screen says ZOSIA. He looks at it for two rings, then wipes his hands on the towel, slowly, and picks up.'),
      T('worried', 'Hi. Hello. Yes, it is me.'),
      narr('You try to give him privacy by looking very hard at the menu board. You hear every word anyway.'),
      T('neutral', 'Good. Good, good. How is school? ...Good.'),
      T('neutral', 'The orchestra? That is good. You are... good at the... the string one.'),
      narr('There is a long pause.'),
      T('worried', 'No, it is not, I know it is a viola. Yes. Sorry.'),
      T('neutral', 'Okay. Yes. I know. Yes. Eat something. Okay. Goodbye. I mean, bye. I love you. Okay.'),
      hide('tomek'),
      narr('He puts the phone down and stands there with both hands flat on the counter.'),
      show('tomek', 'sad'),
      T('sad', 'Four minutes.'),
      T('sad', 'Every Sunday. Four minutes. I run out of things to say at four minutes.'),
      choice([
        opt('That sounded like a good call to me.', [
          T('neutral', 'It was not. It was a call. A polite one. Two people who were sorry for something.'),
        ], { pts: ['tomek', 2] }),
        opt('She sounds like she wants to talk to you.', [
          T('thinking', 'You think.'),
          me('I heard it in her voice.'),
          T('neutral', '...Hm. I did not hear that.'),
        ], { pts: ['tomek', 3] }),
        opt('What\'s Zosia like?', [
          T('neutral', 'Fifteen. Sharp. Plays viola. I forgot which one it is.'),
          T('sad', 'She has my mother\'s way of looking at you.'),
        ], { pts: ['tomek', 3] }),
      ]),
      T('neutral', 'You asked about Wednesdays.'),
      T('neutral', 'The first day you were here. I said closed.'),
      narr('He looks at the bowl in his hand as if surprised to be holding it.'),
      T('neutral', 'Wednesday she has orchestra. After school. Four to six.'),
      T('neutral', 'I take the noon train. Two hours. I sit in the back of the auditorium. Third seat from the door. In the dark.'),
      T('neutral', 'She does not know.'),
      choice([
        opt('How long have you been going?', [
          T('neutral', 'Since January.'),
          T('serious', 'Thirty one Wednesdays.'),
          narr('He has counted. Of course he has.'),
        ], { pts: ['tomek', 3] }),
        opt('Why not tell her?', [
          T('serious', 'Because then I have to be there. Actually there. In front of her. And I am afraid I will not be good at it.'),
          T('neutral', 'In the dark I can just look.'),
        ], { req: { stat: ['empathy', 1] }, pts: ['tomek', 4] }),
        opt('You should tell her. She might already know.', [
          T('surprised', 'She cannot know.'),
          T('thinking', '...Can she?'),
          set('tomek_path', 'tell'),
        ], { req: { stat: ['wit', 1] }, pts: ['tomek', 4] }),
        opt('That is one of the most loving things I have ever heard.', [
          T('neutral', 'It is a train ride.'),
          T('sad', '...But thank you.'),
        ], { pts: ['tomek', 3] }),
      ]),
      T('neutral', 'The festival is on the twenty eighth. Zosia\'s school has a long weekend. Her mother said she could come. If she wants.'),
      T('worried', 'I have not asked her yet. I do not know how to ask her.'),
      choice([
        opt('Just say it plainly. "I would like you to come."', [
          T('thinking', 'Plainly.'),
          T('neutral', 'I can try plainly.'),
          set('tomek_path', 'invite'),
        ], { pts: ['tomek', 3] }),
        opt('Cook her something. Let the soup ask.', [
          T('smirk', 'Hm. The soup can ask.'),
          T('neutral', 'That, I can do.'),
          set('tomek_path', 'soup'),
        ], { pts: ['tomek', 3] }),
        opt('Send her a picture of the stall. She will take it from there.', [
          T('neutral', 'A picture.'),
          T('thinking', 'That is... not stupid.'),
          set('tomek_path', 'invite'),
        ], { pts: ['tomek', 2] }),
      ]),
      T('neutral', 'You are a person who stays for the whole conversation. I did not know there were many of you.'),
      T('neutral', 'Sit. I will make you something. It is not a thank you. It is soup.'),
      set('tomek_wednesdays'),
      stat('empathy', 1),
    ],
  },

  // ------------------------------------------------------------------ 4
  {
    n: 4,
    at: ['market'],
    slots: [2, 3],
    minDay: 15,
    title: 'Third Seat From the Door',
    recap: 'Zosia turned up at the stall early. She told her father that she had known about the Wednesdays the whole time. You helped them both get through dinner.',
    nodes: [
      bg('market'),
      narr('A girl sits at the counter, very straight, with a backpack in her lap and a viola case leaning against her knee. She looks like Tomek if Tomek had been carved out of something lighter.'),
      show('zosia', 'neutral', 'right'),
      show('tomek', 'worried'),
      T('worried', 'You are early.'),
      Z('neutral', 'Mom put me on an earlier train. She said you would want to know.'),
      T('worried', 'I do. I did. I wanted to, I was going to, I... I made soup.'),
      Z('smirk', 'I can see. It is on the counter.'),
      narr('There is a bowl on the counter. He put it there ten minutes before she arrived. It has gone completely cold.'),
      T('sad', 'I will make you a fresh one.'),
      Z('neutral', 'Okay.'),
      narr('It falls quiet between them. You are holding a spoon for reasons no longer clear to you.'),
      Z('thinking', 'Who is this?'),
      T('neutral', 'This is {name}. They help. At the stall.'),
      choice([
        opt('Hi, Zosia. I\'ve heard about the viola.', [
          Z('surprised', 'You have?'),
          T('worried', 'I said it was a violin once. I have been forgiven. Mostly.'),
          Z('laugh', 'He called it the small cello for a whole year.'),
        ], { pts: ['tomek', 3] }),
        opt('Your dad makes the best soup I have ever eaten.', [
          Z('neutral', 'I know. I grew up on it.'),
          Z('thinking', 'Or, I did before.'),
          narr('It lands, and you hear it land.'),
        ], { pts: ['tomek', 2] }),
        opt('(Keep quiet and stir the pot.)', [
          narr('You stir. The broth turns slowly. Sometimes the best thing you can do is be a busy pair of hands at the edge of a family moment.'),
        ], { pts: ['tomek', 2] }),
      ]),
      T('neutral', 'I will make it fresh. Sit. Eat first.'),
      Z('annoyed', 'Talk after. I know. You say that to everyone.'),
      T('sad', 'It is a rule.'),
      Z('neutral', 'It is a bad rule. Sometimes talking first is fine.'),
      narr('Tomek stands very still with the ladle.'),
      Z('serious', 'I want to say something. And I don\'t want you to say anything until I finish. Okay?'),
      T('worried', 'Okay.'),
      Z('serious', 'I know about Wednesdays.'),
      T('sad', '...'),
      Z('neutral', 'Third seat from the door. In the dark. In the black jacket that you think makes you invisible. You are not invisible, Tata. You are six foot three.'),
      Z('sad', 'Every Wednesday since January. I always look for you before I start. If you are not there, I play worse.'),
      narr('Tomek turns away. He stares into the steam for a very, very long time. His shoulders shake once and then are still.'),
      choice([
        opt('(Give them space. Step away from the counter.)', [
          narr('You busy yourself with the bowls at the far end of the stall. You are aware of nothing except quiet voices, and the smell of cold soup being replaced by hot.'),
        ], { pts: ['tomek', 3] }),
        opt('(Put a hand on Tomek\'s shoulder for a second, and step back.)', [
          narr('He does not look at you. But he nods, once, and his breathing steadies.'),
        ], { req: { stat: ['empathy', 2] }, pts: ['tomek', 4] }),
        opt('Zosia, can I bring you some tea while he finishes the soup?', [
          Z('surprised', 'Yes. Please. Thank you.'),
          Z('neutral', 'You are the one who told him to ask me to come, aren\'t you?'),
          me('I only told him to say it plainly.'),
          Z('smirk', 'It was nice. He sent a picture of the stall. With a little handwritten note. "Come if you want." I read it eleven times.'),
        ], { req: { stat: ['charm', 1] }, pts: ['tomek', 4] }),
      ]),
      T('neutral', 'Zosia.'),
      Z('neutral', 'Yes.'),
      T('sad', 'I did not know how to be your father. From that far away. I thought, if I sit where you cannot see me, I am not in the way.'),
      Z('sad', 'You are not in the way. You never were.'),
      narr('He puts down the ladle. Zosia gets up from the counter, comes around the side of the cart, and hugs him. He stands there with his arms half raised for a full second, then puts them around her very carefully, like a man handling something he has waited to be handed.'),
      hide('zosia'),
      narr('You look at the menu board, at the ceiling, at your shoes. Eventually the sound of a spoon in a pot brings everyone back into the world.'),
      T('neutral', 'Eat first. Talk after.'),
      Z('laugh', 'Tata.'),
      T('smirk', 'Fine. Talk first. Once.'),
      narr('Later, when the market is mostly empty, Tomek slides a bowl in front of you. He does not say anything. He puts down a second spoon, and sits.'),
      T('neutral', 'You come Fridays. You eat free. That is not a favor. It is a rule.'),
      T('neutral', 'You are family, now. Do not tell anyone I said it.'),
      set('tomek_zosia'),
      stat('empathy', 1),
    ],
  },
];

// ---------------------------------------------------------------- hangouts
export const hangouts = [
  {
    id: 't_broth',
    at: ['market'],
    minRank: 1,
    nodes: [
      show('tomek', 'neutral'),
      T('neutral', 'Taste.'),
      narr('He holds out a spoon of broth. You blow on it and take a sip.'),
      choice([
        opt('It needs a little acid.', [
          T('surprised', '...Say again.'),
          me('Something bright. Like a squeeze of lemon at the very end.'),
          T('thinking', 'Hm.'),
          narr('He adds a drop of vinegar from a small bottle. The whole pot changes. He tastes it and closes his eyes.'),
          T('neutral', 'Yes. That was missing. Thank you.'),
        ], { req: { stat: ['wit', 1] }, pts: ['tomek', 3] }),
        opt('It is perfect.', [
          T('neutral', 'It is not. But thank you.'),
        ], { pts: ['tomek', 1] }),
        opt('It tastes like a house with the lights on.', [
          T('neutral', '...'),
          T('neutral', 'That is a strange thing to say. I like it.'),
        ], { pts: ['tomek', 3] }),
      ]),
    ],
  },
  {
    id: 't_dad_joke',
    at: ['market', 'pier', 'cafe'],
    minRank: 1,
    nodes: [
      show('tomek', 'serious'),
      T('serious', 'What do you call a fish with no eyes.'),
      choice([
        opt('I don\'t know. What?', [
          T('serious', 'Fsh.'),
          narr('He does not smile. His mustache does not move. The joke sits in the air for a full ten seconds.'),
          T('neutral', 'It is a good one. I have been saving it.'),
        ], { pts: ['tomek', 2] }),
        opt('Please don\'t.', [
          T('smirk', 'Too late.'),
          T('serious', 'Fsh.'),
        ], { pts: ['tomek', 2] }),
      ]),
    ],
  },
  {
    id: 't_pier_thermos',
    at: ['pier'],
    minRank: 1,
    nodes: [
      show('tomek', 'neutral'),
      narr('Tomek is sitting at the end of a bench with a thermos and a fishing line dangling over the water. There is no bait on the hook.'),
      T('neutral', 'The fish do not bite. I do not want them to.'),
      choice([
        opt('Then why do you come?', [
          T('neutral', 'It is a reason to sit. A man sitting looks strange. A man fishing looks respectable.'),
        ], { pts: ['tomek', 3] }),
        opt('Can I sit?', [
          T('neutral', 'Yes. There is tea. There is one cup.'),
          narr('He pours you the only cup and drinks from the thermos lid himself.'),
        ], { pts: ['tomek', 3] }),
      ]),
    ],
  },
  {
    id: 't_pastry_trade',
    at: ['cafe'],
    minRank: 1,
    nodes: [
      show('tomek', 'serious'),
      narr('Tomek and Junie are having a very serious negotiation across the counter. There is a thermos of broth on one side and a paper bag of pastries on the other.'),
      T('serious', 'Two melon pan. For a liter.'),
      narr('Junie counts on her fingers. Tomek waits with the stillness of a man who has done this exact trade for years.'),
      choice([
        opt('Should I be worried?', [
          T('neutral', 'It is fair. She robs me by a pastry every time. I allow it.'),
        ], { pts: ['tomek', 2] }),
        opt('What are the pastries for?', [
          T('neutral', 'Zosia. She likes them. She does not know I know.'),
          narr('He does not elaborate. He does not have to.'),
        ], { pts: ['tomek', 3] }),
      ]),
    ],
  },
  {
    id: 't_kids_noodles',
    at: ['market'],
    minRank: 1,
    nodes: [
      show('tomek', 'annoyed'),
      narr('A small kid, maybe eight, has been standing at the counter for a full minute without saying a word.'),
      T('annoyed', 'Extra noodles.'),
      narr('The kid nods.'),
      T('annoyed', 'You said you would eat all the vegetables last time.'),
      narr('The kid nods again, less confidently.'),
      T('serious', 'Hm.'),
      narr('He ladles a generous helping and puts a whole hard boiled egg on top.'),
      choice([
        opt('You are soft.', [
          T('serious', 'Do not spread that.'),
        ], { pts: ['tomek', 3] }),
        opt('(Quietly hand the kid a napkin.)', [
          narr('Tomek raises one eyebrow at you. It might be approval.'),
        ], { pts: ['tomek', 2] }),
      ]),
    ],
  },
  {
    id: 't_text_help',
    at: ['market'],
    minRank: 2,
    nodes: [
      show('tomek', 'worried'),
      T('worried', 'Come here. Look at this. Tell me if it is a good message.'),
      narr('He holds up his phone. The draft says: "How was school. I am well. The weather is fine. Love, Tata."'),
      choice([
        opt('It\'s a little stiff. Try one question she can answer.', [
          T('thinking', 'A question.'),
          narr('He writes: "What did you eat today?" He reads it, looks pleased, and sends it.'),
        ], { pts: ['tomek', 3] }),
        opt('It\'s good. Send it.', [
          T('neutral', 'Really.'),
          narr('He sends it. His shoulders come down about an inch.'),
        ], { pts: ['tomek', 2] }),
      ]),
    ],
  },
  {
    id: 't_quiet_any',
    at: 'any',
    minRank: 2,
    nodes: [
      show('tomek', 'neutral'),
      T('neutral', 'You are quiet today.'),
      choice([
        opt('Long day.', [
          T('neutral', 'Then be quiet. It is allowed.'),
          narr('You sit next to him. He does not ask any questions. When you get up, you feel better, and are not sure why.'),
        ], { pts: ['tomek', 3] }),
        opt('I\'m thinking about a lot of things.', [
          T('neutral', 'Pick one. Say it. The rest will wait.'),
          narr('You pick one. He listens to the whole thing. It is smaller than it seemed.'),
        ], { pts: ['tomek', 3] }),
      ]),
    ],
  },
];

export const texts = [
  {
    id: 't_t1',
    minRank: 1,
    minDay: 3,
    msgs: ['Come eat.'],
    replies: [
      { text: 'On my way.', back: ['Good.'], pts: 1 },
      { text: 'Is it a special occasion?', back: ['Tuesday.'], pts: 1 },
    ],
  },
  {
    id: 't_t2',
    minRank: 2,
    minDay: 8,
    msgs: ['New batch. Better. Not perfect.', 'You will tell me.'],
    replies: [
      { text: 'I\'ll be there.', back: ['Dobra.'], pts: 2 },
      { text: 'Honest feedback guaranteed.', back: ['That is why I asked you.'], pts: 2 },
    ],
  },
  {
    id: 't_t3',
    minRank: 3,
    minDay: 14,
    msgs: ['She wrote back.', 'Three words. "I ate pasta."', 'I have read it eleven times.'],
    replies: [
      { text: 'That is great, Tomek.', back: ['I know. I am pretending to be calm.'], pts: 2 },
      { text: 'Eleven times sounds right.', back: ['Twelve.'], pts: 2 },
    ],
  },
];

export const pings = [
  {
    msgs: ['Cold tonight. Soup is hot.'],
    replies: [
      { text: 'Save me a bowl.', back: ['Already saved.'], pts: 1 },
      { text: 'Is that a subtle invitation?', back: ['No. It is a very direct invitation.'], pts: 1 },
    ],
  },
  {
    when: { weather: ['rain'] },
    msgs: ['Rain. The cart has a roof. Come sit.'],
    replies: [
      { text: 'On my way.', back: ['Bring your own umbrella. I have one. It is old.'], pts: 1 },
      { text: 'Is it busy?', back: ['Nobody comes when it rains. Which means you can have the good seat.'], pts: 1 },
    ],
  },
  {
    when: { weekday: [2] },
    msgs: ['Wednesday. Stall is closed.'],
    replies: [
      { text: 'Safe travels.', back: ['...Thank you.'], pts: 2 },
      { text: 'Enjoy your day off.', back: ['It is not off. But thank you.'], pts: 1 },
    ],
  },
  {
    msgs: ['You eat today?'],
    replies: [
      { text: 'Yes. A real meal.', back: ['Good.'], pts: 1 },
      { text: 'Not yet.', back: ['Then come.'], pts: 1 },
    ],
  },
  {
    when: { slot: [3] },
    minRank: 2,
    msgs: ['Late. Tea is on. In case.'],
    replies: [
      { text: 'Thank you. I might.', back: ['Good.'], pts: 1 },
      { text: 'You should sleep, too.', back: ['Hm. Yes. Soon.'], pts: 1 },
    ],
  },
];

// ----------------------------------------------------------------- finale
export function finale(env) {
  const rank = env.state.bonds.tomek.rank;
  if (rank < 1) return [];
  if (rank < 3) {
    return [
      narr('Tomek\'s stall has a line twelve people long. He is ladling bowls with the calm of a man who has never been in a hurry in his life. He spots you and lifts his chin about an inch.'),
    ];
  }
  return [
    bg('festival'),
    show('tomek', 'happy'),
    narr('The sign above the stall has been repainted by someone with a steady hand. It reads BOWL AND ANCHOR (AND DAUGHTER). Behind the counter, Zosia is ladling broth with an expression of deep, professional seriousness.'),
    show('zosia', 'happy', 'right'),
    Z('happy', 'He let me pick the menu. There is a pierogi ramen. It is disgusting. It is my favorite thing.'),
    T('smirk', 'It is not disgusting.'),
    Z('smirk', 'It is amazing and disgusting.'),
    iff({ rank: ['tomek', 4] }, [
      T('neutral', 'Sit. Both of you. Eat first.'),
      narr('He puts a bowl in front of you. You take a sip. It tastes like a table with people around it.'),
      T('neutral', 'It tastes right now. All of it. I wanted you to know first.'),
      me('Tomek.'),
      T('neutral', 'Do not thank me. Eat.'),
      Z('laugh', 'He is so bad at this.'),
    ]),
  ];
}
