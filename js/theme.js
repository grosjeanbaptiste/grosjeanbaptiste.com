document.addEventListener('DOMContentLoaded', () => {
  const themeToggle = document.getElementById('theme-toggle');
  if (!themeToggle) return;
  const themeIcon = themeToggle.querySelector('i');
  const themeText = themeToggle.querySelector('span');
  const labelDark = themeToggle.dataset.labelDark || 'Dark mode';
  const labelLight = themeToggle.dataset.labelLight || 'Light mode';

  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  const savedTheme = localStorage.getItem('theme') || (mediaQuery.matches ? 'dark' : 'light');

  applyTheme(savedTheme);

  themeToggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    localStorage.setItem('theme', next);
    applyTheme(next);
  });

  // Follow OS changes only when the user hasn't pinned a preference.
  mediaQuery.addEventListener('change', (e) => {
    if (localStorage.getItem('theme')) return;
    applyTheme(e.matches ? 'dark' : 'light');
  });

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'dark') {
      if (themeIcon) themeIcon.className = 'fas fa-sun';
      if (themeText) themeText.textContent = labelLight;
    } else {
      if (themeIcon) themeIcon.className = 'fas fa-moon';
      if (themeText) themeText.textContent = labelDark;
    }
  }
});
