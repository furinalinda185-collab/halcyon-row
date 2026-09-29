// Supporting characters who appear in scenes but are not befriendable.
// They use the same portrait renderer, so `look` follows the same shape as a friend's.

export const NPCS = {
  hana: {
    id: 'hana',
    name: 'Aunt Hana',
    color: '#c9a27a',
    look: {
      face: 'round',
      skin: '#eecaa8',
      eyes: '#2f211c',
      brow: '#8b8b92',
      hair: { style: 'bun', color: '#b9b9c2' },
      outfit: { type: 'cardigan', color: '#8a6f9e', accent: '#f0e8dc', trim: '#c9a27a' },
      extras: ['glasses'],
    },
  },
  okonkwo: {
    id: 'okonkwo',
    name: 'Mr. Okonkwo',
    color: '#7fb0c8',
    look: {
      face: 'round',
      skin: '#5e3b2a',
      eyes: '#1c110d',
      brow: '#c9c9cf',
      hair: { style: 'buzz', color: '#c9c9cf' },
      outfit: { type: 'cardigan', color: '#3f6f8a', accent: '#efe8dc', trim: '#9cc' },
      extras: [],
    },
  },
  zosia: {
    id: 'zosia',
    name: 'Zosia',
    color: '#e7a0c9',
    look: {
      face: 'oval',
      skin: '#eac5a6',
      eyes: '#4d6a78',
      brow: '#6d5238',
      hair: { style: 'long', color: '#6d5238' },
      outfit: { type: 'hoodie', color: '#6c5b9a', accent: '#e9dfcf', trim: '#e7a0c9' },
      extras: ['studs'],
    },
  },
  cole: {
    id: 'cole',
    name: 'Cole',
    color: '#66a0d8',
    look: {
      face: 'oval',
      skin: '#f0cfae',
      eyes: '#3b566f',
      brow: '#4a3a2c',
      hair: { style: 'choppy', color: '#4a3a2c', under: '#4a3a2c' },
      outfit: { type: 'jacket', color: '#2f3d55', accent: '#e8e1d0', trim: '#66a0d8' },
      extras: ['stubble'],
    },
  },
  halvorsen: {
    id: 'halvorsen',
    name: 'Dr. Halvorsen',
    color: '#8fb8a8',
    look: {
      face: 'square',
      skin: '#efd0b4',
      eyes: '#4b5a68',
      brow: '#9a9aa2',
      hair: { style: 'buzz', color: '#9a9aa2' },
      outfit: { type: 'cardigan', color: '#4f6d63', accent: '#efe6da', trim: '#8fb8a8' },
      extras: ['glasses'],
    },
  },
};

export const NPC_IDS = Object.keys(NPCS);
