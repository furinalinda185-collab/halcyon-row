// Things you can buy and give. Tags decide how each friend reacts (see character `likes` / `dislikes`).

export const ITEMS = [
  { id: 'latte', name: 'Iced oat latte', price: 5, shop: 'cafe', tags: ['sweet', 'drink'], blurb: 'Cold, sweet, gone in ten minutes.' },
  { id: 'melonpan', name: 'Melon pan', price: 4, shop: 'cafe', tags: ['sweet', 'food'], blurb: 'Crackly top, soft inside. Junie guards the last one.' },
  { id: 'tea', name: 'Loose leaf tea tin', price: 8, shop: 'cafe', tags: ['tea', 'cozy'], blurb: 'Smoky black tea in a tin with a chipped lid.' },
  { id: 'zine', name: 'Local zine', price: 6, shop: 'records', tags: ['art', 'paper'], blurb: 'Stapled, photocopied, wonderful.' },
  { id: 'cassette', name: 'Mixtape cassette', price: 9, shop: 'records', tags: ['music'], blurb: 'Someone else\'s handwriting on the label.' },
  { id: 'paperback', name: 'Used paperback', price: 5, shop: 'library', tags: ['book', 'paper'], blurb: 'From the sale cart. Softened at the corners.' },
  { id: 'pens', name: 'Good pen set', price: 12, shop: 'library', tags: ['art', 'tool'], blurb: 'The kind you are scared to use.' },
  { id: 'plush', name: 'Arcade plush', price: 8, shop: 'arcade', tags: ['cute', 'silly'], blurb: 'A lopsided whale. It has a look.' },
  { id: 'spraycaps', name: 'Fat cap set', price: 10, shop: 'arcade', tags: ['art', 'tool'], blurb: 'Nozzles for spray cans. Small, useful, thoughtful.' },
  { id: 'dumplings', name: 'Dumpling box', price: 7, shop: 'market', tags: ['food', 'warm'], blurb: 'Eight of them, steaming through the paper.' },
  { id: 'basil', name: 'Basil seedling', price: 6, shop: 'market', tags: ['plant', 'cozy'], blurb: 'Tiny and hopeful.' },
  { id: 'lantern', name: 'Paper lantern', price: 10, shop: 'market', tags: ['warm', 'festival'], blurb: 'Folds flat. Glows when lit.' },
];

export const ITEM_BY_ID = Object.fromEntries(ITEMS.map((i) => [i.id, i]));
export const ITEM_IDS = ITEMS.map((i) => i.id);
