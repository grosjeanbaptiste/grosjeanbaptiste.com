const I18N = require('../i18n');
const { escapeHtml } = require('../format');

function generateDailyLife(resume, lang) {
  const t = I18N[lang];
  const items = resume.meta?.dailyLife?.items || [];
  const labels = items.map((i) => t.dailyLifeLabels[i.key] || i.key);
  const data = items.map((i) => i.hours);
  const colors = items.map((i) => i.color);
  const summary = items
    .map((i) => `${i.hours}${t.dailyLifeUnit} ${t.dailyLifeLabels[i.key] || i.key}`)
    .join(', ');
  const aria = `${t.dailyLifeAria}: ${summary}.`;
  const payload = JSON.stringify({ labels, data, colors });
  return [
    '<div class="daily-life">',
    `  <h2>${escapeHtml(t.typicalDay)}</h2>`,
    `  <canvas id="dailyLifeChart" width="200" height="200" role="img" aria-label="${escapeHtml(aria)}">`,
    `    <p class="sr-only">${escapeHtml(aria)}</p>`,
    '  </canvas>',
    `  <script>window.__DAILY_LIFE=${payload};</script>`,
    '</div>',
  ].join('\n');
}

module.exports = { generateDailyLife };
