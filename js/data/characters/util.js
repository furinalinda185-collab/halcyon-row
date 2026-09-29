// Shared helpers for character files.

/** The expressions every portrait supports. */
export const MOODS = [
  'neutral', 'happy', 'laugh', 'smirk', 'sad', 'worried',
  'surprised', 'annoyed', 'blush', 'thinking', 'sleepy', 'serious',
];

/**
 * Weekly schedule: seven rows (Monday to Sunday), four slots each
 * (Morning, Afternoon, Evening, Night). A location id means they are there;
 * null means they are busy with their own life.
 */
export function week(rows) {
  if (rows.length !== 7 || rows.some((r) => r.length !== 4)) throw new Error('A schedule needs 7 rows of 4 slots');
  return rows;
}
