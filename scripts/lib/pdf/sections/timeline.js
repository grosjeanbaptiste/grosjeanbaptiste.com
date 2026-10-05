// The timeline of the site, opening the verso of the vertical CV: every
// experience, degree and competition with the projects and the volunteering it
// carried inside it (lib/timeline-model.js), drawn across the page in the rows
// of the screen (../timeline/compact.js).
const { tex } = require('../tex');
const { timelineOf } = require('../../timeline-model');
const { layOutCompact } = require('../timeline/compact');
const { buildPicture } = require('../timeline/picture');

// The text block is 192 mm wide: the lane titles, then the time axis.
const TITLES = { x: -21, width: 19, size: 7 };
const TRACK = 170;
// A row. The verso is the timeline's and the references': it has the height
// to let the rows breathe.
const PITCH = 4.2;
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
