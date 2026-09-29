// Places on Halcyon Row. `open` lists the time slots (0 Morning .. 3 Night) when
// the public can go there. `map` is the pin position on the 400 x 300 city map.
// `sense` is a line of atmosphere used in AI prompts so friends can refer to the room.

export const LOCATIONS = [
  {
    id: 'home',
    name: 'Your Room',
    short: 'Home',
    open: [0, 1, 2, 3],
    map: { x: 62, y: 98 },
    blurb: 'A rented room above the Suds & Duds laundromat. It smells like warm cotton and there is a good window.',
    sense: 'a small rented room above a laundromat, warm cotton smell, a good window over the street',
  },
  {
    id: 'cafe',
    name: 'Kettle & Crumb',
    short: 'Café',
    open: [0, 1, 2],
    map: { x: 148, y: 72 },
    blurb: 'A narrow corner café with a leaking espresso machine, a pastry case that is always half empty, and regulars who have opinions.',
    sense: 'a narrow corner café, steamed milk, a chalkboard menu, the espresso machine that leaks a little',
  },
  {
    id: 'library',
    name: 'Halcyon Public Library',
    short: 'Library',
    open: [0, 1, 2],
    map: { x: 252, y: 58 },
    blurb: 'Tall windows, radiators that knock, and a reading room where you can hear the harbor if you hold still.',
    sense: 'a quiet old library, knocking radiators, tall windows, the reading room hush',
  },
  {
    id: 'records',
    name: 'Second Side Records',
    short: 'Records',
    open: [1, 2],
    map: { x: 190, y: 138 },
    blurb: 'Crates, posters, a turntable that is always mid record. Nobody hurries here.',
    sense: 'a record shop, crates of vinyl, gig posters, a turntable always playing something',
  },
  {
    id: 'arcade',
    name: 'Ferry Arcade',
    short: 'Arcade',
    open: [1, 2, 3],
    map: { x: 306, y: 122 },
    blurb: 'Carpet that has seen things, cabinets glowing in the dark, tokens that rattle in every pocket.',
    sense: 'a dim arcade, glowing cabinets, carpet with a pattern that hides everything, tokens rattling',
  },
  {
    id: 'market',
    name: 'Night Market',
    short: 'Market',
    open: [2, 3],
    map: { x: 338, y: 196 },
    blurb: 'String lights, steam, folding tables, and the best bowl of noodles you will have this year.',
    sense: 'a night market under string lights, steam from stalls, folding tables, noodle broth smell',
  },
  {
    id: 'radio',
    name: 'Lantern FM',
    short: 'Radio',
    open: [2, 3],
    map: { x: 92, y: 196 },
    blurb: 'A community radio station on a rooftop. A booth, a couch that gave up years ago, and the whole city below.',
    sense: 'a tiny rooftop radio station, a booth with foam walls, a tired couch, the city lights below',
  },
  {
    id: 'pier',
    name: 'The Pier',
    short: 'Pier',
    open: [0, 1, 2, 3],
    map: { x: 204, y: 246 },
    blurb: 'Boards, gulls, a long concrete wall that everyone paints, and the harbor going on forever.',
    sense: 'the pier and harbor, gulls, salt air, the long waterfront wall covered in paint',
  },
];

export const LOCATION_IDS = LOCATIONS.map((l) => l.id);
/** Backdrops a script can show. The festival scene is not a place you can walk to. */
export const BACKDROP_IDS = [...LOCATION_IDS, 'festival'];
export const LOCATION_BY_ID = Object.fromEntries(LOCATIONS.map((l) => [l.id, l]));

export function isOpen(locId, slot) {
  return LOCATION_BY_ID[locId].open.includes(slot);
}
