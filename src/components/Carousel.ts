/**
 * Carousel.ts
 *
 * 3D curved project carousel with click navigation,
 * keyboard support, and info bar updates.
 */

export function initCarousel(): void {
  const carousel = document.getElementById('work-carousel');
  if (!carousel) return;

  const cards = carousel.querySelectorAll<HTMLElement>('.carousel__card');
  const nameEl = document.getElementById('carousel-name');
  const counterEl = document.getElementById('carousel-counter');
  const liveEl = document.getElementById('carousel-live');

  if (cards.length === 0) return;

  const projectNames = ['/EduReels', '/Road Accident Prediction', '/Employee Attrition Predictor', '/Research Intelligence'];
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
    if (nameEl) nameEl.textContent = projectNames[activeIndex] || '';
    if (counterEl) counterEl.textContent = `${String(activeIndex + 1).padStart(2, '0')}/${String(total).padStart(2, '0')}`;
  }

  // Click navigation
  cards.forEach((card, i) => {
    card.addEventListener('click', () => {
      if (i === activeIndex) {
        // Click on active card opens dialog
        const dialogTarget = card.getAttribute('data-dialog-target');
        if (dialogTarget) {
          const dialog = document.getElementById(dialogTarget) as HTMLDialogElement;
          if (dialog) {
            dialog.showModal();
            document.body.style.overflow = 'hidden';
          }
        }
      } else {
        activeIndex = i;
        updateCarousel();
      }
    });
  });

  // "See live" click opens the active card's dialog
  if (liveEl) {
    liveEl.addEventListener('click', () => {
      const activeCard = cards[activeIndex];
      if (activeCard) {
        const dialogTarget = activeCard.getAttribute('data-dialog-target');
        if (dialogTarget) {
          const dialog = document.getElementById(dialogTarget) as HTMLDialogElement;
          if (dialog) {
            dialog.showModal();
            document.body.style.overflow = 'hidden';
          }
        }
      }
    });
  }

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    // Only respond if carousel is in viewport
    const rect = carousel.getBoundingClientRect();
    const inView = rect.top < window.innerHeight && rect.bottom > 0;
    if (!inView) return;

    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      activeIndex = (activeIndex + 1) % total;
      updateCarousel();
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      activeIndex = (activeIndex - 1 + total) % total;
      updateCarousel();
    }
  });

  // Initialize
  updateCarousel();
}
