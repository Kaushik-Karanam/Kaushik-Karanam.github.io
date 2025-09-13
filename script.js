// ===== Helpers =====
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;

// ===== Theme =====
function applyTheme(theme){
  if (theme === 'dark') document.documentElement.classList.add('dark');
  else document.documentElement.classList.remove('dark');
}
function initTheme(){
  const saved = localStorage.getItem('theme');
  const current = saved || (prefersDark ? 'dark' : 'light');
  applyTheme(current);
  const toggle = $('.theme-toggle');
  toggle?.addEventListener('click', () => {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  });
}

// ===== Mobile Nav =====
function initNav(){
  const btn = $('.nav-toggle');
  const menu = $('#navMenu');
  btn?.addEventListener('click', () => {
    const open = menu.classList.toggle('show');
    btn.setAttribute('aria-expanded', String(open));
  });
  // Close on link click
  $$('#navMenu a').forEach(a => a.addEventListener('click', () => menu?.classList.remove('show')));
}

// ===== Role Carousel =====
function initRoles(){
  const items = $$('.role-item');
  if (!items.length) return;
  let i = 0;
  setInterval(() => {
    items.forEach(el => el.classList.remove('active'));
    i = (i + 1) % items.length;
    items[i].classList.add('active');
  }, 2600);
}

// ===== Reveal on scroll =====
function initReveal(){
  const els = $$('.reveal');
  if (!els.length) return;
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting){
        e.target.classList.add('is-visible');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: .18 });
  els.forEach(el => obs.observe(el));
}

// ===== Skills ring meters =====
function initRings(){
  const meters = $$('.ring-meter');
  if (!meters.length) return;

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const pct = Number(el.dataset.pct || 0);
      const circle = $('.fg', el);
      const r = Number(circle.getAttribute('r') || 54);
      const c = 2 * Math.PI * r;
      const offset = c * (1 - pct / 100);
      circle.style.strokeDasharray = String(c);
      requestAnimationFrame(() => circle.style.strokeDashoffset = String(offset));
      obs.unobserve(el);
    });
  }, { threshold: .5 });

  meters.forEach(m => obs.observe(m));
}

// ===== Project filters (kept if you ever re-enable chips) =====
function initFilters(){
  const chips = $$('.chip');
  const cards = $$('.project');
  if (!chips.length || !cards.length) return;

  function filter(cat){
    cards.forEach(card => {
      const ok = cat === 'all' || card.dataset.cat === cat;
      card.style.display = ok ? '' : 'none';
      if (ok) card.classList.add('is-visible');
    });
  }

  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      filter(chip.dataset.filter);
    });
  });
}

// ===== Contact form (AJAX to Formspree, no redirect) =====
const MIN_DWELL_MS = 1200;     // small anti-bot delay
const STATUS_OK_MS  = 5000;     // auto-hide success after 5s
const STATUS_ERR_MS = 8000;     // auto-hide error after 8s

function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  const endpoint = form.getAttribute('action');             // Formspree URL
  const statusEl = form.querySelector('.form-status');      // <p class="form-status">
  const btn = form.querySelector('.btn-submit');            // submit button
  const tsField = document.getElementById('formTs');        // time-trap
  const honeypot = form.querySelector('[name="_gotcha"]');  // honeypot

  // Prime time-trap when page loads
  if (tsField) tsField.value = String(Date.now());

  let statusTimer;
  const setStatus = (msg, type = '') => {
    if (!statusEl) return;
    clearTimeout(statusTimer);
    statusEl.className = `form-status${type ? ' ' + type : ''}`;
    statusEl.textContent = msg; // prevents HTML injection

    if (msg) {
      const ttl = type === 'error' ? STATUS_ERR_MS : STATUS_OK_MS;
      statusTimer = setTimeout(() => {
        statusEl.textContent = '';
        statusEl.className = 'form-status';
      }, ttl);
    }
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Native HTML validation first
    if (!form.checkValidity()) {
      form.reportValidity?.();
      return;
    }

    // Spam traps
    if (honeypot && honeypot.value) return; // bot filled hidden field
    const startedAt = Number(tsField?.value || Date.now());
    if (Date.now() - startedAt < MIN_DWELL_MS) {
      setStatus('Please try again.', 'error');
      return;
    }

    // Sending state
    btn && (btn.disabled = true);
    form.classList.add('is-sending');
    setStatus('Sending…');

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: new FormData(form)
      });

      if (res.ok) {
        form.reset();
        setStatus("Thanks! I’ll get back to you soon.", 'ok');

        // Keep URL clean & avoid stale inputs on Back
        if ('history' in window) {
          const url = location.pathname + location.search + '#contact';
          history.replaceState({}, document.title, url);
        }

        // Optional audio cue if you have playSound()
        if (typeof playSound === 'function') playSound('success');

        statusEl?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        let msg = 'Something went wrong. Please try again.';
        try {
          const j = await res.json();
          if (j?.errors?.length) msg = j.errors.map(e => e.message).join(', ');
        } catch {}
        setStatus(msg, 'error');
      }
    } catch {
      setStatus('Network error. Please try again later.', 'error');
    } finally {
      btn && (btn.disabled = false);
      form.classList.remove('is-sending');
      if (tsField) tsField.value = String(Date.now()); // reset time-trap
    }
  });

  // Clear old data if user returns via bfcache
  window.addEventListener('pageshow', (evt) => {
    if (evt.persisted) {
      form.reset();
      setStatus('');
    }
  });
}

// ===== Toast helper (optional) =====
function toast(text){
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = text;
  document.body.appendChild(t);
  requestAnimationFrame(() => t.classList.add('show'));
  setTimeout(() => {
    t.classList.remove('show');
    setTimeout(() => t.remove(), 300);
  }, 2200);
}

// Inline toast styles
const toastCSS = `
.toast{
  position:fixed; left:50%; bottom:24px; transform:translateX(-50%) translateY(8px);
  background:var(--surface); color:var(--text); border:1px solid var(--border);
  padding:10px 14px; border-radius:12px; box-shadow: var(--shadow); opacity:0; transition:240ms;
  z-index:60;
}
.toast.show{ opacity:1; transform:translateX(-50%) translateY(0); }
`;
const styleEl = document.createElement('style'); styleEl.textContent = toastCSS; document.head.appendChild(styleEl);

// ===== Back to top visibility =====
function initBackToTop(){
  const btn = $('.back-to-top');
  if (!btn) return;
  const onScroll = () => {
    btn.style.opacity = window.scrollY > 360 ? '1' : '0.35';
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive:true });
}

// ===== Init =====
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initNav();
  initRoles();
  initReveal();
  initRings();
  initFilters();
  initContactForm();   // ✅ correct function
  initBackToTop();
});
