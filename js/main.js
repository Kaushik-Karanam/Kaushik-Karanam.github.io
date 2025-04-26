/**
 * Portfolio Website JavaScript
 * Author: Kaushik Karanam (Enhanced and Cleaned)
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
const formStatus = document.getElementById('formStatus');
const themeToggleMoon = document.getElementById('themeIconMoon');
const themeToggleSun = document.getElementById('themeIconSun');
const formInputs = document.querySelectorAll('.form-group input, .form-group textarea');

// ====== On DOM Loaded ======
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('currentYear').textContent = new Date().getFullYear();
    
    initCursor();
    initNavigation();
    initTypewriter();
    initSkillBars();
    initProjectFilters();
    initContactForm();
    initThemeToggle();
});

// ====== Custom Cursor ======
function initCursor() {
    if (!cursor || !cursorFollower) return;

    const isHoverDevice = window.matchMedia('(hover: hover)').matches;
    if (!isHoverDevice) {
        cursor.style.display = 'none';
        cursorFollower.style.display = 'none';
        return;
    }

    document.body.style.cursor = 'none';
    
    document.addEventListener('mousemove', (e) => {
        cursor.style.left = `${e.clientX}px`;
        cursor.style.top = `${e.clientY}px`;

        setTimeout(() => {
            cursorFollower.style.left = `${e.clientX}px`;
            cursorFollower.style.top = `${e.clientY}px`;
        }, 50);
    });

    const hoverTargets = document.querySelectorAll('a, button, .btn, .project-card, .timeline-content, .stat-box, .skill-category, .filter-btn, .theme-toggle');

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

        let currentSection = '';
        const sections = document.querySelectorAll('section');

        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
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

    // Mobile menu toggle
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navLinks.classList.toggle('active');
        document.body.classList.toggle('nav-open');
    });

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navLinks.classList.remove('active');
            document.body.classList.remove('nav-open');
        });
    });

    document.addEventListener('click', (e) => {
        if (navLinks.classList.contains('active') && 
            !e.target.closest('.nav-links') && 
            !e.target.closest('.hamburger')) {
            hamburger.classList.remove('active');
            navLinks.classList.remove('active');
            document.body.classList.remove('nav-open');
        }
    });

    navItems.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                const offsetTop = targetElement.offsetTop - 80;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// ====== Typewriter Effect ======
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

    skillBars.forEach(bar => {
        bar.style.width = '0';
    });

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const width = entry.target.getAttribute('data-width');
                setTimeout(() => {
                    entry.target.style.width = width + '%';
                }, 200);

                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });

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
                card.style.opacity = '0';
                card.style.transform = 'translateY(20px)';

                setTimeout(() => {
                    if (filter === 'all' || card.getAttribute('data-category') === filter) {
                        card.style.display = 'block';
                        setTimeout(() => {
                            card.style.opacity = '1';
                            card.style.transform = 'translateY(0)';
                        }, 50);
                    } else {
                        card.style.display = 'none';
                    }
                }, 300);
            });
        });
    });
}

// ====== Contact Form Validation ======
function initContactForm() {
    if (!contactForm) return;

    formInputs.forEach(input => {
        input.addEventListener('blur', () => validateInput(input));
        input.addEventListener('input', () => {
            if (input.parentElement.classList.contains('error')) validateInput(input);
        });
    });

    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        let isValid = true;

        formInputs.forEach(input => {
            if (!validateInput(input)) isValid = false;
        });

        if (isValid) {
            formStatus.textContent = 'Thank you for your message! I will get back to you soon.';
            formStatus.className = 'form-status success';

            setTimeout(() => {
                contactForm.reset();
                formStatus.className = 'form-status';
            }, 3000);
        } else {
            formStatus.textContent = 'Please fill all required fields correctly.';
            formStatus.className = 'form-status error';
        }
    });

    function validateInput(input) {
        const formGroup = input.parentElement;
        const value = input.value.trim();
        let isValid = true;

        formGroup.classList.remove('error');

        if (value === '') {
            formGroup.classList.add('error');
            isValid = false;
        } else if (input.type === 'email') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                formGroup.classList.add('error');
                isValid = false;
            }
        }

        return isValid;
    }
}

// ====== Theme Toggle ======
function initThemeToggle() {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    const savedTheme = localStorage.getItem('theme');

    if (savedTheme === 'dark' || (!savedTheme && prefersDark.matches)) {
        document.body.classList.add('dark');
    }

    function toggleTheme() {
        document.body.classList.toggle('dark');
        localStorage.setItem('theme', document.body.classList.contains('dark') ? 'dark' : 'light');
    }

    if (themeToggleMoon) themeToggleMoon.addEventListener('click', toggleTheme);
    if (themeToggleSun) themeToggleSun.addEventListener('click', toggleTheme);
}
