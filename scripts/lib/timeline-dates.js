// Where the entries of the CV fall in time, for its timelines: months counted
// as year * 12 + month - 1, dates placed to the day, an ongoing entry running
// to the end of the current month.
const ISO = /^(\d{4})(?:-(\d{2}))?(?:-(\d{2}))?$/;

function monthOf(text) {
  const match = ISO.exec(String(text));
  if (!match) throw new Error(`Unreadable date "${text}" (expected YYYY, YYYY-MM or YYYY-MM-DD)`);
  return Number(match[1]) * 12 + (match[2] ? Number(match[2]) : 1) - 1;
}

const ongoing = (end) => !end || end === 'Present';

// Where a date falls, in months and to the day: the 15th of a 30-day month is
// 14/30 of the way in. A date given to the month only is its first day.
function dayOf(text) {
  const month = monthOf(text);
  const day = ISO.exec(String(text))[3];
  if (!day) return month;
  const days = new Date(Date.UTC(Math.floor(month / 12), (month % 12) + 1, 0)).getUTCDate();
  return month + (Number(day) - 1) / days;
}

// A bar runs from `start` to `end + 1` (the convention of whole months, kept:
// an entry dated to the month covers its last month). Dated to the day, it
// stops as its last day begins — so an entry that begins the day another ends
// follows it without overlapping — and is never shorter than a day.
const A_DAY = 1 / 31;
function spanOf(record, name, now) {
  const start = dayOf(record.startDate);
  if (ongoing(record.endDate)) return { start, end: now };
  const toTheDay = ISO.exec(String(record.endDate))?.[3];
  const until = toTheDay ? dayOf(record.endDate) : monthOf(record.endDate) + 1;
  if (until < start)
    throw new Error(`${name} ends (${record.endDate}) before it starts (${record.startDate})`);
  return { start, end: Math.max(until, start + A_DAY) - 1 };
}

const monthNow = (today) => today.getUTCFullYear() * 12 + today.getUTCMonth();

module.exports = { monthOf, monthNow, ongoing, spanOf };
