/* ==============================
   ГРУЗАВТО — Main JS
   GSAP animations, nav, carousel
   ============================== */

/* ────────────────────────────────
   Particles — not used in new hero
   ──────────────────────────────── */
function createParticles() {}

/* ────────────────────────────────
   Sticky Nav + Active Link
   ──────────────────────────────── */
function initNav() {
  const header = document.getElementById('nav-header');
  const links  = document.querySelectorAll('.nav-link');
  const burger = document.getElementById('burger');
  const navLinks = document.getElementById('nav-links');

  burger.addEventListener('click', () => {
    burger.classList.toggle('open');
    navLinks.classList.toggle('open');
  });

  links.forEach(link => {
    link.addEventListener('click', () => {
      burger.classList.remove('open');
      navLinks.classList.remove('open');
    });
  });

  const sections = Array.from(document.querySelectorAll('section[id]'));

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;

    header.classList.toggle('scrolled', scrollY > 60);

    let current = '';
    sections.forEach(s => {
      const top = s.offsetTop - 100;
      if (scrollY >= top) current = s.id;
    });
    links.forEach(link => {
      const href = link.getAttribute('href').slice(1);
      link.classList.toggle('active', href === current);
    });
  }, { passive: true });
}

/* ────────────────────────────────
   Smooth scroll override
   ──────────────────────────────── */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 72;
      const top = target.getBoundingClientRect().top + window.scrollY - navH;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
}

/* ────────────────────────────────
   Reveal on Scroll — fallback
   ──────────────────────────────── */
function initRevealFallback() {
  const els = document.querySelectorAll('.reveal-up, .reveal-right, .news-card');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animated');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

  els.forEach(el => observer.observe(el));
}

/* ────────────────────────────────
   GSAP Animations  ★ УСКОРЕНО
   ──────────────────────────────── */
function initGSAP() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    console.warn('GSAP not loaded, falling back to CSS animations');
    initRevealFallback();
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  /* ── Hero entrance ── */
  gsap.set('.hero-eyebrow, .hero-title, .hero-slogan, .hero-brands, .hero-cta', { opacity: 0, y: 30 });
  gsap.set('.hero-image', { opacity: 0, x: 40 });

  const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });
  heroTl
    .to('.hero-eyebrow', { y: 0, opacity: 1, duration: 0.4, delay: 0.1 })
    .to('.hero-title',   { y: 0, opacity: 1, duration: 0.5 }, '-=0.25')
    .to('.hero-slogan',  { y: 0, opacity: 1, duration: 0.4 }, '-=0.3')
    .to('.hero-brands',  { y: 0, opacity: 1, duration: 0.3 }, '-=0.25')
    .to('.hero-cta',     { y: 0, opacity: 1, duration: 0.3 }, '-=0.2')
    .to('.hero-image',   { x: 0, opacity: 1, duration: 0.6, ease: 'power2.out' }, 0.1);

  /* ── Reveal up — все секции ── */
  ScrollTrigger.batch('.reveal-up', {
    onEnter: batch => gsap.fromTo(batch,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.45, stagger: 0.04, ease: 'power2.out' }
    ),
    start: 'top 90%',
    once: true
  });

  /* ── Reveal right ── */
  ScrollTrigger.batch('.reveal-right', {
    onEnter: batch => gsap.fromTo(batch,
      { opacity: 0, x: 30 },
      { opacity: 1, x: 0, duration: 0.5, ease: 'power2.out' }
    ),
    start: 'top 90%',
    once: true
  });

  /* ── Brand badges ── */
  ScrollTrigger.create({
    trigger: '.brands-grid',
    start: 'top 90%',
    once: true,
    onEnter: () => {
      gsap.from('.brand-badge', {
        y: 20,
        opacity: 0,
        duration: 0.35,
        stagger: 0.03,
        ease: 'power2.out'
      });
    }
  });

  /* ── Contract stats ── */
  ScrollTrigger.create({
    trigger: '.contract-stats',
    start: 'top 90%',
    once: true,
    onEnter: () => {
      gsap.from('.contract-stats', {
        y: 30,
        opacity: 0,
        duration: 0.5,
        ease: 'power2.out'
      });
    }
  });
}

/* ────────────────────────────────
   Hero title letter split
   ──────────────────────────────── */
function splitHeroTitle() {}

/* ────────────────────────────────
   Carousel
   ──────────────────────────────── */
function initCarousels() {
  document.querySelectorAll('.carousel').forEach(carousel => {
    const track = carousel.querySelector('.carousel-track');
    const images = track.querySelectorAll('img');
    const dotsContainer = carousel.querySelector('.carousel-dots');
    const prevBtn = carousel.querySelector('.carousel-prev');
    const nextBtn = carousel.querySelector('.carousel-next');
    const count = images.length;
    let current = 0;
    let autoplayTimer = null;
    const interval = parseInt(carousel.dataset.autoplay) || 5000;

    for (let i = 0; i < count; i++) {
      const dot = document.createElement('button');
      dot.classList.add('carousel-dot');
      if (i === 0) dot.classList.add('active');
      dot.setAttribute('aria-label', 'Фото ' + (i + 1));
      dot.addEventListener('click', () => goTo(i));
      dotsContainer.appendChild(dot);
    }
    const dots = dotsContainer.querySelectorAll('.carousel-dot');

    function goTo(index) {
      current = ((index % count) + count) % count;
      track.style.transform = 'translateX(-' + (current * 100) + '%)';
      dots.forEach((d, i) => d.classList.toggle('active', i === current));
      resetAutoplay();
    }

    function next() { goTo(current + 1); }
    function prev() { goTo(current - 1); }

    prevBtn.addEventListener('click', prev);
    nextBtn.addEventListener('click', next);

    let startX = 0;
    let isDragging = false;
    track.addEventListener('touchstart', e => { startX = e.touches[0].clientX; isDragging = true; }, { passive: true });
    track.addEventListener('touchend', e => {
      if (!isDragging) return;
      isDragging = false;
      const diff = e.changedTouches[0].clientX - startX;
      if (Math.abs(diff) > 40) { diff < 0 ? next() : prev(); }
    }, { passive: true });

    function startAutoplay() {
      autoplayTimer = setInterval(next, interval);
    }
    function resetAutoplay() {
      clearInterval(autoplayTimer);
      startAutoplay();
    }
    startAutoplay();

    carousel.addEventListener('mouseenter', () => clearInterval(autoplayTimer));
    carousel.addEventListener('mouseleave', startAutoplay);
  });
}

/* ────────────────────────────────
   Lightbox
   ──────────────────────────────── */
function initLightbox() {
  var overlay = document.getElementById('lightbox');
  if (!overlay) return;
  var img = overlay.querySelector('img');
  var counter = overlay.querySelector('.lightbox-counter');
  var prevBtn = overlay.querySelector('.lightbox-prev');
  var nextBtn = overlay.querySelector('.lightbox-next');
  var images = [];
  var current = 0;

  document.querySelectorAll('.carousel-track img').forEach(function(el) {
    el.style.cursor = 'zoom-in';
    el.addEventListener('click', function() {
      var carousel = el.closest('.carousel');
      images = Array.from(carousel.querySelectorAll('.carousel-track img')).map(function(i) { return i.src; });
      current = images.indexOf(el.src);
      show();
    });
  });

  function show() {
    img.src = images[current];
    counter.textContent = (current + 1) + ' / ' + images.length;
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function hide() {
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  function next() { current = (current + 1) % images.length; img.src = images[current]; counter.textContent = (current + 1) + ' / ' + images.length; }
  function prev() { current = (current - 1 + images.length) % images.length; img.src = images[current]; counter.textContent = (current + 1) + ' / ' + images.length; }

  overlay.querySelector('.lightbox-close').addEventListener('click', hide);
  overlay.addEventListener('click', function(e) { if (e.target === overlay) hide(); });
  prevBtn.addEventListener('click', function(e) { e.stopPropagation(); prev(); });
  nextBtn.addEventListener('click', function(e) { e.stopPropagation(); next(); });
  img.addEventListener('click', function(e) { e.stopPropagation(); });

  document.addEventListener('keydown', function(e) {
    if (!overlay.classList.contains('active')) return;
    if (e.key === 'Escape') hide();
    if (e.key === 'ArrowRight') next();
    if (e.key === 'ArrowLeft') prev();
  });
}

/* ────────────────────────────────
   Init
   ──────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  createParticles();
  initNav();
  initSmoothScroll();
  initCarousels();
  initLightbox();

  requestAnimationFrame(() => {
    setTimeout(initGSAP, 100);
  });
});