const DAY = 86400000;
const toDay = (s) => Date.parse(`${s}T00:00:00Z`) / DAY;

/** Today's YYYY-MM-DD in the given IANA timezone (falls back to UTC). */
export function todayInTimezone(timezone) {
  try {
    return new Date().toLocaleDateString('en-CA', { timeZone: timezone || 'UTC' });
  } catch {
    return new Date().toISOString().split('T')[0];
  }
}

/**
 * @param {string[]} dates  YYYY-MM-DD strings (duplicates allowed)
 * @param {string} today    YYYY-MM-DD
 * @returns {{currentStreak:number, longestStreak:number}}
 */
export function computeStreaks(dates, today) {
  const unique = [...new Set(dates)].sort(); // ascending
  if (!unique.length) return { currentStreak: 0, longestStreak: 0 };

  // Longest streak across all history
  let longest = 1;
  let run = 1;
  for (let i = 1; i < unique.length; i++) {
    run = toDay(unique[i]) - toDay(unique[i - 1]) === 1 ? run + 1 : 1;
    if (run > longest) longest = run;
  }

  // Current streak: must include today or yesterday
  const past = unique.filter((d) => d <= today);
  let current = 0;
  if (past.length) {
    const gap = toDay(today) - toDay(past[past.length - 1]);
    if (gap <= 1) {
      current = 1;
      for (let i = past.length - 1; i > 0; i--) {
        if (toDay(past[i]) - toDay(past[i - 1]) === 1) current++;
        else break;
      }
    }
  }
  return { currentStreak: current, longestStreak: longest };
}
