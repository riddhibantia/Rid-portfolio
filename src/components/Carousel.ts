/**
 * Carousel.ts
 *
 * Centered 3D coverflow project carousel with autoplay,
 * click / keyboard / swipe navigation, and nav buttons.
 * Cards are real links that open a project detail page in a new tab.
 */

import { PROJECTS } from '../data/projects.ts';

const AUTOPLAY_MS = 2500;

export function initCarousel(): void {
  const carousel = document.getElementById('work-carousel');
  if (!carousel) return;

  const cards = carousel.querySelectorAll<HTMLElement>('.carousel__card');
  const nameEl = document.getElementById('carousel-name');
  const counterEl = document.getElementById('carousel-counter');
  const liveEl = document.getElementById('carousel-live');
  const prevBtn = document.getElementById('carousel-prev');
  const nextBtn = document.getElementById('carousel-next');

  if (cards.length === 0) return;

  const total = cards.length;
  let activeIndex = 0;

  function updateCarousel() {
    cards.forEach((card, i) => {
      card.classList.remove('is-active', 'is-prev', 'is-next', 'is-hidden');

      if (i === activeIndex) {
        card.classList.add('is-active');
      } else if (i === activeIndex - 1 || (activeIndex === 0 && i === total - 1)) {
        card.classList.add('is-prev');
      } else if (i === activeIndex + 1 || (activeIndex === total - 1 && i === 0)) {
        card.classList.add('is-next');
      } else {
        card.classList.add('is-hidden');
      }
    });

    // Update info bar
    if (nameEl) nameEl.textContent = PROJECTS[activeIndex] ? `/${PROJECTS[activeIndex].title}` : '';
    if (counterEl) counterEl.textContent = `${String(activeIndex + 1).padStart(2, '0')}/${String(total).padStart(2, '0')}`;
  }

  function step(dir: number) {
    activeIndex = (activeIndex + dir + total) % total;
    updateCarousel();
  }

  // ── Autoplay: slow, pauses on hover / off-screen / reduced motion ──
  let autoplayId = 0;
  let hovering = false;
  let visible = true;

  function startAutoplay() {
    stopAutoplay();
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    autoplayId = window.setInterval(() => {
      if (!visible || hovering) return;
      step(1);
    }, AUTOPLAY_MS);
  }

  function stopAutoplay() {
    if (autoplayId) {
      window.clearInterval(autoplayId);
      autoplayId = 0;
    }
  }

  carousel.addEventListener('mouseenter', () => { hovering = true; });
  carousel.addEventListener('mouseleave', () => { hovering = false; });

  const visibilityObserver = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
  }, { threshold: 0.1 });
  visibilityObserver.observe(carousel);

  // ── Click: rotate non-active cards to center; active card opens its page ──
  let suppressClick = false;
  cards.forEach((card, i) => {
    card.addEventListener('click', (e) => {
      if (suppressClick) {
        suppressClick = false;
        e.preventDefault();
        return;
      }
      if (i !== activeIndex) {
        e.preventDefault();
        activeIndex = i;
        updateCarousel();
      }
      // Active card → let the browser follow the link to the detail page
    });
  });

  // Nav buttons
  prevBtn?.addEventListener('click', () => step(-1));
  nextBtn?.addEventListener('click', () => step(1));

  // "View project" opens the active card's detail page in a new tab
  if (liveEl) {
    liveEl.addEventListener('click', () => {
      const href = cards[activeIndex]?.getAttribute('href');
      if (href) window.open(href, '_blank', 'noopener');
    });
  }

  // Swipe (touch) navigation
  let startX = 0;
  let startY = 0;
  carousel.addEventListener('touchstart', (e) => {
    startX = e.changedTouches[0].clientX;
    startY = e.changedTouches[0].clientY;
    suppressClick = false;
  }, { passive: true });
  carousel.addEventListener('touchmove', (e) => {
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 10) suppressClick = true;
  }, { passive: true });
  carousel.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - startX;
    const dy = e.changedTouches[0].clientY - startY;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
      step(dx < 0 ? 1 : -1);
    }
  }, { passive: true });

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (!e.key.startsWith('Arrow')) return;
    // Don't rotate the carousel while a dialog is open
    if (document.querySelector('dialog[open]')) return;

    const rect = carousel.getBoundingClientRect();
    const inView = rect.top < window.innerHeight && rect.bottom > 0;
    if (!inView) return;

    e.preventDefault();
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      step(1);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      step(-1);
    }
  });

  // Initialize
  updateCarousel();
  startAutoplay();
}
