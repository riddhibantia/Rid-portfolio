/**
 * Navbar.ts — Header scroll effect + mobile menu toggle
 */

export function initNavbar(): void {
  const header = document.querySelector<HTMLElement>('.header');
  const menuToggle = document.querySelector<HTMLButtonElement>('.menu-toggle');
  const navMenu = document.querySelector<HTMLElement>('.nav__menu');
  const navLinks = document.querySelectorAll<HTMLAnchorElement>('.nav__link');

  if (!header) return;

  // 1. Sticky header — not needed with mix-blend-difference, but keep scroll class for potential use
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });

  // 2. Mobile menu toggle
  if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', () => {
      const isOpen = navMenu.classList.contains('is-open');
      navMenu.classList.toggle('is-open');
      menuToggle.classList.toggle('is-open');
      document.body.style.overflow = isOpen ? '' : 'hidden';
    });

    // Close on nav link click
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('is-open');
        menuToggle.classList.remove('is-open');
        document.body.style.overflow = '';
      });
    });
  }
}
