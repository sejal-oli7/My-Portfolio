// =============================================================
// Theme toggle (DISPLAY: DARK / LIGHT)
// =============================================================
const root = document.documentElement;
const themeToggle = document.getElementById('theme-toggle');
const themeValue = document.getElementById('theme-value');

function applyTheme(theme) {
  root.setAttribute('data-theme', theme);
  themeValue.textContent = theme.toUpperCase();
  themeToggle.setAttribute('aria-pressed', String(theme === 'light'));
  try {
    window.localStorage?.setItem('sejal-theme', theme);
  } catch (_) {
    /* storage unavailable — theme just won't persist */
  }
}

function getPreferredTheme() {
  try {
    const saved = window.localStorage?.getItem('sejal-theme');
    if (saved === 'dark' || saved === 'light') return saved;
  } catch (_) {
    /* ignore */
  }
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

applyTheme(getPreferredTheme());

themeToggle.addEventListener('click', () => {
  const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  applyTheme(next);
});

// =============================================================
// Mobile menu
// =============================================================
const menuBtn = document.getElementById('menu-btn');
const navbar = document.querySelector('.navbar');
const navList = document.getElementById('nav-list');

function closeMenu() {
  menuBtn.classList.remove('is-open');
  menuBtn.setAttribute('aria-expanded', 'false');
  navbar.classList.remove('is-open');
}

menuBtn.addEventListener('click', () => {
  const isOpen = navbar.classList.toggle('is-open');
  menuBtn.classList.toggle('is-open', isOpen);
  menuBtn.setAttribute('aria-expanded', String(isOpen));
});

navList.addEventListener('click', (event) => {
  if (event.target.matches('.nav-link')) closeMenu();
});

// =============================================================
// Terminal typing sequence (hero signature element)
// =============================================================
const terminalBody = document.getElementById('terminal-body');

const terminalScript = [
  { type: 'prompt', text: 'whoami' },
  { type: 'output', text: 'Sejal Oli — Full-Stack Developer' },
  { type: 'prompt', text: 'cat focus.txt' },
  { type: 'output', text: 'auth systems · multi-tenant architecture · clean APIs' },
  { type: 'prompt', text: 'status --check' },
  { type: 'output', text: 'All systems operational. Open to new projects.' },
];

function typeLine(container, prefix, text, speed = 28) {
  return new Promise((resolve) => {
    const line = document.createElement('p');
    line.className = 'terminal-line';
    const prefixSpan = document.createElement('span');
    prefixSpan.className = prefix.className;
    prefixSpan.textContent = prefix.text;
    line.appendChild(prefixSpan);
    const textSpan = document.createElement('span');
    line.appendChild(textSpan);
    container.appendChild(line);

    let i = 0;
    const timer = setInterval(() => {
      textSpan.textContent += text[i];
      i += 1;
      if (i >= text.length) {
        clearInterval(timer);
        resolve();
      }
    }, speed);
  });
}

async function runTerminal() {
  if (!terminalBody) return;
  terminalBody.innerHTML = '';

  for (const step of terminalScript) {
    if (step.type === 'prompt') {
      // eslint-disable-next-line no-await-in-loop
      await typeLine(terminalBody, { className: 'terminal-prompt', text: '$ ' }, step.text, 32);
    } else {
      // eslint-disable-next-line no-await-in-loop
      await typeLine(terminalBody, { className: 'terminal-output', text: '> ' }, step.text, 12);
    }
  }

  const cursorLine = document.createElement('p');
  cursorLine.className = 'terminal-line';
  const prompt = document.createElement('span');
  prompt.className = 'terminal-prompt';
  prompt.textContent = '$ ';
  const cursor = document.createElement('span');
  cursor.className = 'terminal-cursor';
  cursorLine.append(prompt, cursor);
  terminalBody.appendChild(cursorLine);
}

// Respect reduced-motion preference: skip the animated typing, show it instantly
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (prefersReducedMotion) {
  terminalBody.innerHTML = terminalScript
    .map((step) => {
      const cls = step.type === 'prompt' ? 'terminal-prompt' : 'terminal-output';
      const prefix = step.type === 'prompt' ? '$ ' : '> ';
      return `<p class="terminal-line"><span class="${cls}">${prefix}</span>${step.text}</p>`;
    })
    .join('');
} else {
  runTerminal();
}

// =============================================================
// Scroll-reveal for sections
// =============================================================
const revealTargets = document.querySelectorAll(
  '.about-grid, .skills-grid, .project-grid, .timeline, .contact-form'
);

revealTargets.forEach((el) => el.classList.add('reveal'));

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  revealTargets.forEach((el) => observer.observe(el));
} else {
  revealTargets.forEach((el) => el.classList.add('is-visible'));
}

// =============================================================
// Active nav link on scroll
// =============================================================
const sections = document.querySelectorAll('main section[id]');
const navLinks = document.querySelectorAll('.nav-link');

function setActiveLink(id) {
  navLinks.forEach((link) => {
    link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
  });
}

if ('IntersectionObserver' in window) {
  const navObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveLink(entry.target.id);
        }
      });
    },
    { rootMargin: '-40% 0px -55% 0px', threshold: 0 }
  );

  sections.forEach((section) => navObserver.observe(section));
}

// =============================================================
// Contact form validation
// =============================================================
const form = document.getElementById('contact-form');
const formStatus = document.getElementById('form-status');

const validators = {
  name: (value) => (value.trim().length >= 2 ? '' : 'Enter your name (2+ characters).'),
  email: (value) => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()) ? '' : 'Enter a valid email address.'),
  message: (value) => (value.trim().length >= 10 ? '' : 'Message should be at least 10 characters.'),
};

function validateField(field) {
  const row = field.closest('.form-row');
  const errorEl = document.getElementById(`${field.id}-error`);
  const message = validators[field.id]?.(field.value) ?? '';

  row.classList.toggle('has-error', Boolean(message));
  if (errorEl) errorEl.textContent = message;

  return !message;
}

form.addEventListener('submit', (event) => {
  event.preventDefault();

  const fields = [form.name, form.email, form.message];
  const allValid = fields.map(validateField).every(Boolean);

  if (!allValid) {
    formStatus.textContent = 'Please fix the highlighted fields.';
    formStatus.style.color = 'var(--danger)';
    return;
  }

  // No backend wired up yet — this is where a fetch() to an endpoint would go.
  formStatus.textContent = `Thanks, ${form.name.value.trim().split(' ')[0]} — message captured locally. Wire this form up to an endpoint to send it for real.`;
  formStatus.style.color = 'var(--accent)';
  form.reset();
});

[form.name, form.email, form.message].forEach((field) => {
  field.addEventListener('blur', () => validateField(field));
});
