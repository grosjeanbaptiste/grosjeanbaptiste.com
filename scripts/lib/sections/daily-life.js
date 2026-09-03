const I18N = require('../i18n');
const { escapeHtml } = require('../format');

const CX = 100;
const CY = 100;
const R_OUTER = 80;
const R_INNER = 45;

// Convert a clockwise-from-top angle (degrees) to SVG (cx,cy) coordinates.
const pt = (angleDeg, radius) => {
  const rad = (angleDeg * Math.PI) / 180;
  return [CX + radius * Math.sin(rad), CY - radius * Math.cos(rad)];
};

const fmt = (n) => Math.round(n * 100) / 100;

function slicePath(a1, a2) {
  const largeArc = a2 - a1 > 180 ? 1 : 0;
  const [ox1, oy1] = pt(a1, R_OUTER);
  const [ox2, oy2] = pt(a2, R_OUTER);
  const [ix2, iy2] = pt(a2, R_INNER);
  const [ix1, iy1] = pt(a1, R_INNER);
  return [
    `M${fmt(ox1)} ${fmt(oy1)}`,
    `A${R_OUTER} ${R_OUTER} 0 ${largeArc} 1 ${fmt(ox2)} ${fmt(oy2)}`,
    `L${fmt(ix2)} ${fmt(iy2)}`,
    `A${R_INNER} ${R_INNER} 0 ${largeArc} 0 ${fmt(ix1)} ${fmt(iy1)}`,
    'Z',
  ].join(' ');
}

function generateDailyLife(resume, lang) {
  const t = I18N[lang];
  const items = (resume.meta?.dailyLife?.items || []).filter((i) => i.hours > 0);
  if (!items.length) return '<div class="daily-life"></div>';

  const total = items.reduce((s, i) => s + i.hours, 0);
  let cumAngle = 0;
  const slices = items.map((i) => {
    const start = cumAngle;
    const sweep = (i.hours / total) * 360;
    cumAngle = start + sweep;
    return {
      label: t.dailyLifeLabels[i.key] || i.key,
      hours: i.hours,
      color: i.color,
      start,
      end: cumAngle,
    };
  });

  const summary = slices.map((s) => `${s.hours}${t.dailyLifeUnit} ${s.label}`).join(', ');
  const aria = `${t.dailyLifeAria}: ${summary}.`;

  const paths = slices
    .map(
      (s) =>
        `    <path d="${slicePath(s.start, s.end)}" fill="${s.color}"><title>${escapeHtml(s.label)} — ${s.hours}${t.dailyLifeUnit}</title></path>`,
    )
    .join('\n');

  const legend = slices
    .map(
      (s) =>
        `    <li><span class="daily-life-dot" style="background:${s.color}" aria-hidden="true"></span>${escapeHtml(s.label)} — ${s.hours}${t.dailyLifeUnit}</li>`,
    )
    .join('\n');

  return [
    '<div class="daily-life">',
    `  <h2>${escapeHtml(t.typicalDay)}</h2>`,
    `  <svg class="daily-life-chart" viewBox="0 0 200 200" role="img" aria-label="${escapeHtml(aria)}">`,
    paths,
    '  </svg>',
    '  <ul class="daily-life-legend">',
    legend,
    '  </ul>',
    '</div>',
  ].join('\n');
}

module.exports = { generateDailyLife };
