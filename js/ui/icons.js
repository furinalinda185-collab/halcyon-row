// Small stroke icons, drawn on a 24 grid. Static trusted markup.

const PATHS = {
  home: '<path d="M3 11 12 3l9 8v10h-7v-7h-4v7H3z"/>',
  cafe: '<path d="M4 8h12v7a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5zM16 10h2a3 3 0 0 1 0 6h-2M7 3v2M11 3v2"/>',
  records: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3"/><path d="M12 3a9 9 0 0 1 9 9"/>',
  library: '<path d="M4 5h7a1 1 0 0 1 1 1v14a1 1 0 0 0-1-1H4zM20 5h-7a1 1 0 0 0-1 1v14a1 1 0 0 1 1-1h7z"/>',
  pier: '<path d="M2 14q3-6 6 0t6 0 6 0M2 19q3-6 6 0t6 0 6 0M2 9q3-6 6 0"/>',
  arcade: '<circle cx="12" cy="6" r="3"/><path d="M12 9v6M5 20h14v-3a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2z"/>',
  market: '<path d="M9 3h6M8 5h8a5 6 0 0 1 0 12H8A5 6 0 0 1 8 5zM9 20h6M12 17v3"/>',
  radio: '<circle cx="12" cy="12" r="1.5"/><path d="M12 13.5V21M8 21h8M8.5 8.5a5 5 0 0 0 0 7M15.5 8.5a5 5 0 0 1 0 7M5.5 5.5a9 9 0 0 0 0 13M18.5 5.5a9 9 0 0 1 0 13"/>',
  map: '<path d="m3 6 6-2 6 2 6-2v14l-6 2-6-2-6 2zM9 4v14M15 6v14"/>',
  phone: '<rect x="7" y="2" width="10" height="20" rx="2.5"/><path d="M11 18h2"/>',
  heart: '<path d="M12 20C4 14 3 9 6 6.5c2.5-2 5-1 6 1.5 1-2.5 3.500-3.500 6-1.500 3 2.500 2 7.500-6 13.500z"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-5 4-7 8-7s8 2 8 7"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/>',
  close: '<path d="M5 5l14 14M19 5 5 19"/>',
  send: '<path d="M3 11 21 3l-7 18-3-8z"/>',
  back: '<path d="m15 5-7 7 7 7"/>',
  coin: '<circle cx="12" cy="12" r="9"/><path d="M12 7v10M9.500 9.500q2.500-2 5 0-2.500 2-2.500 2.500 0 .5 2.500 2.500-2.500 2-5 0"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2.500M12 19.500V22M2 12h2.500M19.500 12H22M5 5l1.800 1.800M17.200 17.200 19 19M19 5l-1.800 1.800M6.800 17.200 5 19"/>',
  cloud: '<path d="M7 18a4 4 0 0 1 0-8 5 5 0 0 1 10-1 4.500 4.500 0 0 1 0 9z"/>',
  rain: '<path d="M7 15a4 4 0 0 1 0-8 5 5 0 0 1 10-1 4.500 4.500 0 0 1 0 9zM8 18l-1 3M12 18l-1 3M16 18l-1 3"/>',
  fog: '<path d="M4 8h16M2 12h16M6 16h16M4 20h12"/>',
  moon: '<path d="M20 14A8 8 0 1 1 10 4a6 6 0 0 0 10 10z"/>',
  gift: '<rect x="3" y="8" width="18" height="13" rx="1"/><path d="M12 8v13M3 13h18M12 8C8 8 7 3 10 3c2 0 2 5 2 5zM12 8c4 0 5-5 2-5-2 0-2 5-2 5z"/>',
  sparkle: '<path d="m12 3 2 7 7 2-7 2-2 7-2-7-7-2 7-2z"/>',
  lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  chat: '<path d="M4 5h16v11h-8l-5 4v-4H4z"/>',
  book: '<path d="M4 4h12a3 3 0 0 1 3 3v13H7a3 3 0 0 1-3-3zM4 17a3 3 0 0 1 3-3h12"/>',
  bell: '<path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4zM10 21h4"/>',
  star: '<path d="m12 3 2.800 6 6.200.8-4.600 4.300 1.200 6.300L12 17.300 6.400 20.400l1.200-6.300L3 9.800 9.200 9z"/>',
  play: '<path d="M7 4v16l13-8z"/>',
  list: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
  wifi: '<path d="M2 9a15 15 0 0 1 20 0M5 13a10 10 0 0 1 14 0M8.500 16.500a5 5 0 0 1 7 0M12 20h.01"/>',
  moonbed: '<path d="M3 18V8M3 14h18v4M21 14v-3a3 3 0 0 0-3-3h-7v6"/>',
};

export function icon(name, size = 20) {
  const body = PATHS[name] ?? PATHS.sparkle;
  const t = document.createElement('template');
  t.innerHTML = `<svg class="ico" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${body}</svg>`;
  return t.content.firstElementChild;
}

export const WEATHER_ICON = { clear: 'sun', cloudy: 'cloud', rain: 'rain', fog: 'fog' };
export const SLOT_ICON = ['sun', 'sun', 'cloud', 'moon'];

/** Raw path markup for embedding an icon inside another SVG (the city map). */
export function iconMarkup(name) {
  return PATHS[name] ?? PATHS.sparkle;
}
