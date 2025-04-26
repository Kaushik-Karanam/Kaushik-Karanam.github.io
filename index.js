/**
 * Portfolio Website JavaScript
 * Author: Kaushik Karanam (Enhanced)
 */

// ====== DOM Elements ======
const cursor = document.querySelector('.cursor');
const cursorFollower = document.querySelector('.cursor-follower');
const header = document.querySelector('header');
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');
const navItems = document.querySelectorAll('.nav-links a');
const skillBars = document.querySelectorAll('.skill-progress');
const filterBtns = document.querySelectorAll('.filter-btn');
const projectCards = document.querySelectorAll('.project-card');
const contactForm = document.getElementById('contactForm');
const themeToggle = document.getElementById('themeIcon');

// ====== On DOM Loaded ======
document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('currentYear').textContent = new Date().getFullYear();
  
  initCursor();
  initNavigation();
  initTypewriter();
  initSkillBars();
  initProjectFilters();
  initContactForm();
  initScrollReveal();
  initThemeToggle();
});

// ====== Custom Cursor ======
function initCursor() {
  if (!cursor || !cursorFollower) return;

  document.addEventListener('mousemove', (e) => {
    cursor.style.left = `${e.clientX}px`;
    cursor.style.top = `${e.clientY}px`;

    setTimeout(() => {
      cursorFollower.style.left = `${e.clientX}px`;
      cursorFollower.style.top = `${e.clientY}px`;
    }, 50);
  });

  const hoverTargets = document.querySelectorAll('a, button, .btn, .project-card, .timeline-content, .stat-box, .skill-category');

  hoverTargets.forEach(target => {
    target.addEventListener('mouseenter', () => {
      cursor.style.width = '0';
      cursor.style.height = '0';
      cursorFollower.style.transform = 'translate(-50%, -50%) scale(2)';
      cursorFollower.style.opacity = '0.7';
    });
    target.addEventListener('mouseleave', () => {
      cursor.style.width = '10px';
      cursor.style.height = '10px';
      cursorFollower.style.transform = 'translate(-50%, -50%) scale(1)';
      cursorFollower.style.opacity = '0.5';
    });
  });
}

// ====== Navigation ======
function initNavigation() {
  if (!header) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    // Active Nav Highlight
    let currentSection = '';
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 120;
      const sectionHeight = section.offsetHeight;
      if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
        currentSection = section.getAttribute('id');
      }
    });

    navItems.forEach(item => {
      item.classList.remove('active');
      if (item.getAttribute('href') === '#' + currentSection) {
        item.classList.add('active');
      }
    });
  });

  // Hamburger toggle
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navLinks.classList.toggle('active');
  });

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      hamburger.classList.remove('active');
      navLinks.classList.remove('active');
    });
  });
}

// ====== Typewriter ======
function initTypewriter() {
  const txtRotate = document.querySelector('.txt-rotate');
  if (!txtRotate) return;

  const period = parseInt(txtRotate.getAttribute('data-period')) || 2000;
  const toRotate = JSON.parse(txtRotate.getAttribute('data-rotate'));
  let loopNum = 0;
  let txt = '';
  let isDeleting = false;

  function tick() {
    const i = loopNum % toRotate.length;
    const fullTxt = toRotate[i];

    if (isDeleting) {
      txt = fullTxt.substring(0, txt.length - 1);
    } else {
      txt = fullTxt.substring(0, txt.length + 1);
    }

    txtRotate.textContent = txt;

    let delta = 200 - Math.random() * 100;
    if (isDeleting) delta /= 2;

    if (!isDeleting && txt === fullTxt) {
      delta = period;
      isDeleting = true;
    } else if (isDeleting && txt === '') {
      isDeleting = false;
      loopNum++;
      delta = 500;
    }

    setTimeout(tick, delta);
  }

  tick();
}

// ====== Skill Bars Animation ======
function initSkillBars() {
  if (skillBars.length === 0) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const bar = entry.target;
        const width = bar.getAttribute('style').match(/\d+/)[0];
        bar.style.width = width + '%';
      }
    });
  }, {
    threshold: 0.5
  });

  skillBars.forEach(bar => observer.observe(bar));
}

// ====== Project Filters ======
function initProjectFilters() {
  if (filterBtns.length === 0 || projectCards.length === 0) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      filterBtns.forEach(b => b.classList.remove('active'));
      this.classList.add('active');

      const filter = this.getAttribute('data-filter');

      projectCards.forEach(card => {
        if (filter === 'all' || card.getAttribute('data-category') === filter) {
          card.style.display = 'block';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

// ====== Contact Form Validation ======
function initContactForm() {
  if (!contactForm) return;

  contactForm.addEventListener('submit', function(e) {
    e.preventDefault();

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const subject = document.getElementById('subject').value.trim();
    const message = document.getElementById('message').value.trim();

    if (!name || !email || !subject || !message) {
      alert('Please fill all fields.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert('Please enter a valid email address.');
      return;
    }

    alert('Thank you for your message! I will get back to you soon.');
    contactForm.reset();
  });
}

// ====== Scroll Reveal Animations ======
function initScrollReveal() {
  ScrollReveal().reveal('.section-header, .about-content, .skills-content, .projects-grid, .experience-timeline, .contact-wrapper', {
    duration: 1200,
    distance: '60px',
    easing: 'ease-out',
    origin: 'bottom',
    interval: 150,
    reset: false
  });
}

// ====== Dark Mode Toggle ======
function initThemeToggle() {
  if (!themeToggle) return;

  themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark');
    themeToggle.classList.toggle('fa-moon');
    themeToggle.classList.toggle('fa-sun');
  });
}
