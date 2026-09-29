// Calendar, time slots and weather. Pure functions, no DOM.

export const SLOTS = ['Morning', 'Afternoon', 'Evening', 'Night'];
export const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
export const FESTIVAL_DAY = 28;

/** Day 1 is a Monday. Returns 0 (Mon) to 6 (Sun). */
export function weekdayIndex(day) {
  return (((day - 1) % 7) + 7) % 7;
}

export function weekdayName(day) {
  return WEEKDAYS[weekdayIndex(day)];
}

export function isWeekend(day) {
  return weekdayIndex(day) >= 5;
}

/** Small seeded PRNG (mulberry32) so weather and daily picks are stable per day. */
export function seeded(seed) {
  let a = seed >>> 0;
  return function next() {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function hashString(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** clear | cloudy | rain | fog. First day and the festival stretch are always clear. */
export function weatherFor(day) {
  if (day === 1 || day === FESTIVAL_DAY - 1 || day === FESTIVAL_DAY) return 'clear';
  const r = seeded(day * 7919 + 13)();
  if (r < 0.42) return 'clear';
  if (r < 0.68) return 'cloudy';
  if (r < 0.9) return 'rain';
  return 'fog';
}

/** Moves time forward one slot. Returns true when a new day started. */
export function advanceSlot(time) {
  time.slot += 1;
  if (time.slot >= SLOTS.length) {
    time.slot = 0;
    time.day += 1;
    return true;
  }
  return false;
}

export function dayLabel(day) {
  return `Day ${day} · ${weekdayName(day)}`;
}

export function daysUntilFestival(day) {
  return Math.max(0, FESTIVAL_DAY - day);
}
