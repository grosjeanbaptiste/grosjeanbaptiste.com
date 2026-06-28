// Renders the "typical day" doughnut from data injected by the generator
// (window.__DAILY_LIFE = {labels, data, colors}). Falls back to a no-op when
// the canvas, payload, or Chart.js global is missing.
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('dailyLifeChart');
  const payload = window.__DAILY_LIFE;
  if (!canvas || !payload || typeof Chart === 'undefined') return;
  if (!Array.isArray(payload.data) || payload.data.length === 0) return;

  new Chart(canvas.getContext('2d'), {
    type: 'doughnut',
    data: {
      labels: payload.labels,
      datasets: [{ data: payload.data, backgroundColor: payload.colors }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: { legend: { position: 'bottom' } },
    },
  });
});
