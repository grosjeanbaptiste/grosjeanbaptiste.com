document.addEventListener('DOMContentLoaded', function() {
  // Menu mobile toggle
  const menuToggle = document.getElementById('menu-toggle');
  const navMenu = document.getElementById('nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');
  
  // Toggle mobile menu
  menuToggle.addEventListener('click', function() {
    const nav = document.querySelector('nav');
    const isExpanded = navMenu.classList.toggle('active');
    
    // Update ARIA attributes and icons
    this.setAttribute('aria-expanded', isExpanded);
    this.querySelector('i').classList.toggle('fa-bars');
    this.querySelector('i').classList.toggle('fa-times');
    
    // Calculate and set dynamic height for the nav bar
    if (isExpanded) {
      const navHeight = nav.offsetHeight;
      const menuHeight = navMenu.offsetHeight;
      nav.style.transition = 'height 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)';
      nav.style.overflow = 'visible';
      nav.style.height = `${navHeight + menuHeight}px`;
    } else {
      nav.style.height = '70px';
      // Reset the height after transition completes
      setTimeout(() => {
        nav.style.transition = '';
        nav.style.overflow = '';
        nav.style.height = '';
      }, 400);
    }
  });
  
  // Close menu when clicking on a nav link
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth <= 768) {
        const nav = document.querySelector('nav');
        navMenu.classList.remove('active');
        menuToggle.setAttribute('aria-expanded', 'false');
        menuToggle.querySelector('i').classList.add('fa-bars');
        menuToggle.querySelector('i').classList.remove('fa-times');
        
        // Reset nav height
        nav.style.height = '70px';
        setTimeout(() => {
          nav.style.transition = '';
          nav.style.overflow = '';
          nav.style.height = '';
        }, 400);
      }
    });
  });
  
  // Highlight active section in navigation
  const sections = document.querySelectorAll('section[id]');
  
  function highlightActiveSection() {
    let current = '';
    
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 100;
      const sectionHeight = section.offsetHeight;
      
      if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
        current = '#' + section.getAttribute('id');
      }
    });
    
    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === current) {
        link.classList.add('active');
      }
    });
  }
  
  // Run on scroll and on load
  window.addEventListener('scroll', highlightActiveSection);
  highlightActiveSection();
  
  // Smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        window.scrollTo({
          top: targetElement.offsetTop - 80,
          behavior: 'smooth'
        });
      }
    });
  });
});
