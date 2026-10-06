// The timeline of the site, opening the verso of the vertical CV: every
// experience, degree and competition with the projects and the volunteering it
// carried inside it (lib/timeline-model.js), drawn across the page in the rows
// of the screen (../timeline/compact.js).
const { tex } = require('../tex');
const { timelineOf } = require('../../timeline-model');
const { layOutCompact } = require('../timeline/compact');
const { buildPicture } = require('../timeline/picture');

// The verso is a landscape page: its text block is 281 mm wide — the lane
// titles, then the time axis.
const TITLES = { x: -23, width: 21, size: 7.5 };
const TRACK = 257;
// A row. The landscape page is 192 mm tall for the timeline and the
// references under it.
const PITCH = 3.6;
const FONT = 6.5;

function buildTimeline(resume, t, today) {
  const model = timelineOf(resume, today);
  if (!model.lanes.length) return '';
  const sheet = {
    ...layOutCompact(model, { track: TRACK, pitch: PITCH, font: FONT }),
    titles: TITLES,
  };
  return [`\\cvsection{${tex(t.timeline)}}`, `\\noindent${buildPicture(sheet, t)}\\par`].join('\n');
}

module.exports = { buildTimeline, TRACK, TITLES };
