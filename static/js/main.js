document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.nav-links');
  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!open));
    nav.classList.toggle('is-open', !open);
  });
  nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
    toggle.setAttribute('aria-expanded', 'false');
    nav.classList.remove('is-open');
  }));

  const themeToggle = document.querySelector('.theme-toggle');
  const setTheme = (theme) => {
    document.body.dataset.theme = theme;
    const dark = theme === 'dark';
    themeToggle.setAttribute('aria-label', `Switch to ${dark ? 'light' : 'dark'} theme`);
    themeToggle.querySelector('.theme-icon').textContent = dark ? '☼' : '◐';
  };
  try {
    setTheme(localStorage.getItem('portfolio-theme') === 'dark' ? 'dark' : 'light');
  } catch {
    setTheme('light');
  }
  themeToggle.addEventListener('click', () => {
    const nextTheme = document.body.dataset.theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    try { localStorage.setItem('portfolio-theme', nextTheme); } catch { /* Theme still works for this visit. */ }
  });

  const projectDialog = document.querySelector('.project-dialog');
  document.querySelector('[data-open-project]').addEventListener('click', () => projectDialog.showModal());
  projectDialog.querySelector('.dialog-close').addEventListener('click', () => projectDialog.close());
  projectDialog.addEventListener('click', (event) => {
    if (event.target === projectDialog) projectDialog.close();
  });

  const copyButton = document.querySelector('[data-copy-email]');
  const toast = document.querySelector('.toast-message');
  let toastTimer;
  copyButton.addEventListener('click', async () => {
    const email = copyButton.dataset.copyEmail;
    try {
      await navigator.clipboard.writeText(email);
    } catch {
      const temporaryInput = document.createElement('textarea');
      temporaryInput.value = email;
      temporaryInput.setAttribute('readonly', '');
      temporaryInput.style.position = 'fixed';
      temporaryInput.style.opacity = '0';
      document.body.append(temporaryInput);
      temporaryInput.select();
      document.execCommand('copy');
      temporaryInput.remove();
    }
    copyButton.innerHTML = '<span class="copy-icon">✓</span> Email copied';
    toast.textContent = 'Email address copied to clipboard';
    toast.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove('is-visible');
      copyButton.innerHTML = '<span class="copy-icon">▢</span> Copy email address';
    }, 2400);
  });

  document.querySelectorAll('.skill-trigger').forEach((button) => {
    button.addEventListener('click', () => {
      const details = button.nextElementSibling;
      const expanded = button.getAttribute('aria-expanded') === 'true';
      button.setAttribute('aria-expanded', String(!expanded));
      details.hidden = expanded;
      button.classList.toggle('is-expanded', !expanded);
      button.querySelector('span').textContent = expanded ? '＋' : '－';
      button.firstChild.textContent = expanded ? 'Explore this area ' : 'Show less ';
    });
  });

  document.querySelector('[data-print-resume]').addEventListener('click', () => window.print());

  const runCodeButton = document.querySelector('[data-run-code]');
  const codeOutput = document.querySelector('[data-code-output]');
  const codeStatus = document.querySelector('.code-card-foot > span:first-child');
  runCodeButton.addEventListener('click', () => {
    const lines = [...document.querySelectorAll('[data-code-line]')];
    runCodeButton.disabled = true;
    runCodeButton.innerHTML = '<span>•••</span> Running';
    codeOutput.hidden = true;
    codeStatus.innerHTML = '<i class="tiny-green"></i> Running sample';
    lines.forEach((line) => line.classList.remove('is-current', 'is-complete'));
    lines.forEach((line, index) => {
      window.setTimeout(() => {
        if (index > 0) lines[index - 1].classList.replace('is-current', 'is-complete');
        line.classList.add('is-current');
        if (index === lines.length - 1) {
          window.setTimeout(() => {
            line.classList.replace('is-current', 'is-complete');
            codeOutput.hidden = false;
            codeStatus.innerHTML = '<i class="tiny-green"></i> Demo complete';
            runCodeButton.innerHTML = '<span>↻</span> Run again';
            runCodeButton.disabled = false;
          }, 360);
        }
      }, index * 390);
    });
  });

  const sections = [...document.querySelectorAll('main section[id]')];
  const navAnchors = [...nav.querySelectorAll('a[href^="#"]')];
  if ('IntersectionObserver' in window) {
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navAnchors.forEach((link) => {
          const active = link.hash === `#${entry.target.id}`;
          link.classList.toggle('is-active', active);
          if (active) link.setAttribute('aria-current', 'location');
          else link.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-30% 0px -60% 0px' });
    sections.forEach((section) => sectionObserver.observe(section));
  }

  const revealTargets = document.querySelectorAll('.section-kicker, .about-grid, .stat-row, .skill-card, .project-card, .timeline-item, .contact-layout');
  revealTargets.forEach((target) => target.classList.add('reveal'));
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, activeObserver) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          activeObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealTargets.forEach((target) => observer.observe(target));
  } else {
    revealTargets.forEach((target) => target.classList.add('is-visible'));
  }

  document.querySelector('#year').textContent = new Date().getFullYear();
});
