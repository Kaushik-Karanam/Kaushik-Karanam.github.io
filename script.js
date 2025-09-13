// ===== Helpers =====
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;

// ===== Theme =====
function applyTheme(theme){
  if(theme === 'dark') document.documentElement.classList.add('dark');
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
  $$('#navMenu a').forEach(a => a.addEventListener('click', () => menu.classList.remove('show')));
}

// ===== Role Carousel =====
function initRoles(){
  const items = $$('.role-item');
  if(!items.length) return;
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
  if(!els.length) return;
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if(e.isIntersecting){
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
  if(!meters.length) return;

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(!entry.isIntersecting) return;
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

// ===== Project filters =====
function initFilters(){
  const chips = $$('.chip');
  const cards = $$('.project');
  if(!chips.length || !cards.length) return;

  function filter(cat){
    cards.forEach(card => {
      const ok = cat === 'all' || card.dataset.cat === cat;
      card.style.display = ok ? '' : 'none';
      if(ok){ card.classList.add('is-visible'); }
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

// ===== Contact form =====
// REPLACE your existing initContactForm() with this version
// Ensure it's called on DOMContentLoaded (your bootstrap already does this)

/* CHANGE HERE (optional): adjust minimum dwell time (ms) to thwart bots */
const MIN_DWELL_MS = 1200;

function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  const statusEl = form.querySelector('.form-status');
  const btn = form.querySelector('.btn-submit');

  // Timestamp trap (bots submit instantly)
  const tsField = document.getElementById('formTs');
  if (tsField) tsField.value = String(Date.now());

  const setStatus = (msg, type) => {
    if (!statusEl) return;
    statusEl.textContent = msg;               // textContent prevents XSS
    statusEl.classList.remove('ok', 'error');
    if (type) statusEl.classList.add(type);
  };

  const setInvalid = (el, invalid = true) => {
    if (!el) return;
    el.setAttribute('aria-invalid', invalid ? 'true' : 'false');
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Honeypot
    const hp = form.querySelector('input[name="_gotcha"]');
    if (hp && hp.value) return;

    // Time trap
    const startedAt = Number(tsField?.value || Date.now());
    if (Date.now() - startedAt < MIN_DWELL_MS) {
      setStatus('Please try again.', 'error');
      return;
    }

    // Required fields
    const required = ['name', '_replyto', 'subject', 'message'];
    for (const n of required) {
      const el = form.querySelector(`[name="${n}"]`);
      const val = el?.value?.trim() || '';
      setInvalid(el, !val);
      if (!val) {
        setStatus('Please fill out all fields.', 'error');
        el?.focus();
        return;
      }
    }

    // Email format
    const emailEl = form.querySelector('[name="_replyto"]');
    const email = emailEl.value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setInvalid(emailEl, true);
      setStatus('Enter a valid email address.', 'error');
      emailEl.focus();
      return;
    } else {
      setInvalid(emailEl, false);
    }

    // Sending state
    btn.disabled = true;
    form.classList.add('is-sending');
    setStatus('Sending…');

    try {
      const res = await fetch(form.action, {
        method: 'POST',
        mode: 'cors',
        referrerPolicy: 'no-referrer',
        headers: { 'Accept': 'application/json' },
        body: new FormData(form)
      });

      if (res.ok) {
        form.reset();
        setStatus('Thanks! Your message has been sent.', 'ok');
        // Optional: use your existing sound system if defined
        if (typeof playSound === 'function') playSound('success');
      } else {
        const data = await res.json().catch(() => ({}));
        const msg = data?.errors?.[0]?.message || 'Something went wrong. Please try again.';
        setStatus(msg, 'error');
      }
    } catch {
      setStatus('Network error. Please try again.', 'error');
    } finally {
      btn.disabled = false;
      form.classList.remove('is-sending');
      // Reset time trap for subsequent submissions
      if (tsField) tsField.value = String(Date.now());
    }
  });

  /* ================================
   Contact form — AJAX submission
   - No page redirect
   - Clears fields on success
   - Shows status text
   - Clears on back/forward cache return
   - Works with your existing Formspree endpoint
================================== */
(() => {
  const form = document.getElementById('contactForm');
  if (!form) return; // guard if form doesn't exist on a page

  const endpoint = form.getAttribute('action');                // Formspree URL
  const statusEl = form.querySelector('.form-status');         // <p class="form-status">
  const submitBtn = form.querySelector('.btn-submit');         // the submit <button>
  const tsField = form.querySelector('#formTs');               // hidden time-trap
  const honeypot = form.querySelector('[name="_gotcha"]');     // hidden honeypot (spam trap)

  // Helper: set status message
  function setStatus(msg, type = '') {
    if (!statusEl) return;
    statusEl.className = `form-status${type ? ' ' + type : ''}`;
    statusEl.textContent = msg;
  }

  // Helper: disable/enable UI while sending
  function setSendingState(isSending) {
    if (isSending) {
      form.classList.add('is-sending');
      submitBtn && (submitBtn.disabled = true);
      setStatus('Sending…');
    } else {
      form.classList.remove('is-sending');
      submitBtn && (submitBtn.disabled = false);
    }
  }

  // Intercept submit → send with fetch (AJAX)
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Native HTML5 validation (uses your `required` attributes)
    if (!form.checkValidity()) {
      form.reportValidity?.();
      return;
    }

    // Spam traps
    if (honeypot && honeypot.value) {
      // Bot filled the hidden field → silently drop
      return;
    }
    if (tsField && !tsField.value) {
      // time-trap: stamp when the user actually submits
      tsField.value = String(Date.now());
    }

    setSendingState(true);

    try {
      const data = new FormData(form);

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Accept': 'application/json' }, // ask Formspree for JSON
        body: data
      });

      if (res.ok) {
        // Reset fields
        form.reset();

        // Show success
        setStatus("Thanks! I’ll get back to you soon.", 'ok');

        // Keep URL clean and prevent stale inputs when navigating back
        if ('history' in window) {
          const url = location.pathname + location.search + '#contact';
          history.replaceState({}, document.title, url);
        }

        // Optionally move focus to the status message for accessibility
        statusEl?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        // Try to show Formspree’s error details
        let msg = 'Something went wrong. Please try again or email me directly.';
        try {
          const j = await res.json();
          if (j?.errors?.length) msg = j.errors.map(e => e.message).join(', ');
        } catch (_) {}
        setStatus(msg, 'error');
      }
    } catch (err) {
      setStatus('Network error. Please try again later.', 'error');
    } finally {
      setSendingState(false);
    }
  });

  // When the user returns via back/forward cache, clear any old input/status
  window.addEventListener('pageshow', (evt) => {
    if (evt.persisted) {
      form.reset();
      setStatus('');
    }
  });
})();

}

// If you don't already call it elsewhere:
// document.addEventListener('DOMContentLoaded', initContactForm);


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

// Create toast styles (small inline helper)
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
  if(!btn) return;
  const onScroll = () => {
    btn.style.opacity = window.scrollY > 360 ? '1' : '0.35';
  };
  onScroll(); window.addEventListener('scroll', onScroll, { passive:true });
}

// ===== Init =====
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initNav();
  initRoles();
  initReveal();
  initRings();
  initFilters();
  initForm();
  initBackToTop();
});
