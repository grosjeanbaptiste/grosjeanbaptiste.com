document.addEventListener('DOMContentLoaded', () => {
  const themeToggle = document.getElementById('theme-toggle');
  const themeIcon = themeToggle.querySelector('i');
  const themeText = themeToggle.querySelector('span');
  
  // Check for saved user preference, if any
  const savedTheme = localStorage.getItem('theme') || 
                    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  
  // Apply the saved theme
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateButton(savedTheme);
  
  // Add click event listener to the theme toggle button
  themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    // Update the theme
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateButton(newTheme);
  });
  
  // Update the button icon and text based on the current theme
  function updateButton(theme) {
    if (theme === 'dark') {
      themeIcon.className = 'fas fa-sun';
      themeText.textContent = 'Light Mode';
    } else {
      themeIcon.className = 'fas fa-moon';
      themeText.textContent = 'Dark Mode';
    }
  }
});
