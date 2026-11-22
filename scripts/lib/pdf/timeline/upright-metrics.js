// The measures of the upright timeline (./upright.js), in mm unless said.
const WIDTH = 190; // what the page leaves between its margins
const HEIGHT = 236; // the time axis, under the header
const AXIS = 8; // the years, left of the lanes
const LANE_GAP = 3.5;
const BAR = 1.3; // a bar's width, and the gap beside it
const GAP = 0.3;
const MIN_BAR = 0.9;
const FONT = 5.5;
const LINE = 2.7; // between two lines of a label (5.5 pt: poppler boxes a line, accents included, 1.4 em tall)
const BETWEEN = 0.3; // between two labels
const MARK = 1.6; // the colour square before a label
const GUTTER = 1.2;
const MIN_ROOM = 18; // the least a lane's labels may be given
const STEP = 2; // what moves from one lane to another while sharing the width
const MOON_ROOM = 3;
// A line is set on its baseline — a node centred on its box moves with the
// accents in it — this far under the line's middle.
const BASE = 0.7;
const CEILING = 1.5; // the highest a label may reach: the lane's rule is above
const PAD = 0.5; // inside a group's outline
const LABEL_GAP = 3.4; // between two year numbers

module.exports = {
  WIDTH,
  HEIGHT,
  AXIS,
  LANE_GAP,
  BAR,
  GAP,
  MIN_BAR,
  FONT,
  LINE,
  BETWEEN,
  MARK,
  GUTTER,
  MIN_ROOM,
  STEP,
  MOON_ROOM,
  BASE,
  CEILING,
  PAD,
  LABEL_GAP,
};
