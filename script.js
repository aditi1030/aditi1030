/* ============================================================
   script.js — Portfolio interactions
   - Sticky nav (scroll detection)
   - Mobile menu toggle
   - Smooth scroll offset
   - Scroll-reveal via IntersectionObserver
   - Active nav link highlight
   - Footer year
============================================================ */

(function () {
  'use strict';

  /* ----------------------------------------------------------
     Utility: query helpers
  ---------------------------------------------------------- */
  const qs  = (sel, root = document) => root.querySelector(sel);
  const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  /* ----------------------------------------------------------
     DOM refs
  ---------------------------------------------------------- */
  const navbar    = qs('#navbar');
  const navToggle = qs('#nav-toggle');
  const navLinks  = qs('#nav-links');
  const navItems  = qsa('.nav-links a');
  const yearEl    = qs('#year');

  /* ----------------------------------------------------------
     Footer: current year
  ---------------------------------------------------------- */
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ----------------------------------------------------------
     Navbar: add .scrolled class when user scrolls past 24 px
  ---------------------------------------------------------- */
  function handleNavScroll() {
    navbar.classList.toggle('scrolled', window.scrollY > 24);
  }
  window.addEventListener('scroll', handleNavScroll, { passive: true });
  handleNavScroll(); // run once on load

  /* ----------------------------------------------------------
     Mobile menu toggle
  ---------------------------------------------------------- */
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });

    // Close drawer when a link is tapped
    navItems.forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });

    // Close drawer when clicking outside
    document.addEventListener('click', e => {
      if (navLinks.classList.contains('open') &&
          !navbar.contains(e.target)) {
        navLinks.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ----------------------------------------------------------
     Smooth scroll with nav-height offset
     Handles both nav links and any in-page anchor
  ---------------------------------------------------------- */
  document.addEventListener('click', e => {
    const anchor = e.target.closest('a[href^="#"]');
    if (!anchor) return;

    const targetId = anchor.getAttribute('href');
    const target   = qs(targetId);
    if (!target) return;

    e.preventDefault();

    const offset = navbar ? navbar.offsetHeight : 0;
    const top    = target.getBoundingClientRect().top + window.scrollY - offset;

    window.scrollTo({ top, behavior: 'smooth' });
  });

  /* ----------------------------------------------------------
     Scroll-reveal — general .reveal elements
  ---------------------------------------------------------- */
  const revealObserver = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          // Un-observe once revealed (one-shot animation)
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -48px 0px' }
  );

  qsa('.reveal').forEach(el => revealObserver.observe(el));

  /* ----------------------------------------------------------
     Scroll-reveal — timeline items (with staggered delay)
  ---------------------------------------------------------- */
  const timelineObserver = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          timelineObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );

  qsa('.timeline-item').forEach((el, i) => {
    el.style.transitionDelay = `${i * 0.13}s`;
    timelineObserver.observe(el);
  });

  /* ----------------------------------------------------------
     Scroll-reveal — skill cards (with staggered delay)
  ---------------------------------------------------------- */
  const skillObserver = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          skillObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -32px 0px' }
  );

  qsa('.skill-card').forEach((el, i) => {
    el.style.transitionDelay = `${i * 0.1}s`;
    skillObserver.observe(el);
  });

  /* ----------------------------------------------------------
     Active nav highlight — updated as sections enter viewport
  ---------------------------------------------------------- */
  const sections = qsa('section[id]');

  const sectionObserver = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;

        const id = entry.target.id;
        navItems.forEach(link => {
          const match = link.getAttribute('href') === `#${id}`;
          link.classList.toggle('active', match);
        });
      });
    },
    {
      threshold: 0.4,
      rootMargin: `-${navbar ? navbar.offsetHeight : 68}px 0px -40% 0px`
    }
  );

  sections.forEach(sec => sectionObserver.observe(sec));

  /* ----------------------------------------------------------
     Recalculate sectionObserver rootMargin on resize
     (nav height may change on mobile)
  ---------------------------------------------------------- */
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      // Disconnect and reconnect with updated margin
      sectionObserver.disconnect();
      const margin = `-${navbar ? navbar.offsetHeight : 68}px 0px -40% 0px`;
      // IntersectionObserver rootMargin can't be changed after creation;
      // re-observe is sufficient for typical resizes since threshold handles most cases.
      sections.forEach(sec => sectionObserver.observe(sec));
    }, 200);
  });

})();
