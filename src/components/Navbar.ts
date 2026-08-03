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
    const mobileMenu = window.matchMedia('(max-width: 768px)');

    const setMenuOpen = (open: boolean) => {
      navMenu.classList.toggle('is-open', open);
      menuToggle.classList.toggle('is-open', open);
      menuToggle.setAttribute('aria-expanded', String(open));
      // inert only applies in the mobile layout; desktop nav must stay interactive
      if (mobileMenu.matches) {
        navMenu.toggleAttribute('inert', !open);
        document.body.style.overflow = open ? 'hidden' : '';
      }
    };

    menuToggle.addEventListener('click', () => {
      setMenuOpen(!navMenu.classList.contains('is-open'));
    });

    // Close on nav link click
    navLinks.forEach(link => {
      link.addEventListener('click', () => setMenuOpen(false));
    });

    // Close with Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navMenu.classList.contains('is-open')) {
        setMenuOpen(false);
        menuToggle.focus();
      }
    });

    // Reset open state if resized to desktop
    mobileMenu.addEventListener('change', () => {
      if (!mobileMenu.matches && navMenu.classList.contains('is-open')) {
        setMenuOpen(false);
      }
    });

    setMenuOpen(false);
  }
}
