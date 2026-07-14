/**
 * Navbar.ts
 * 
 * Handles all interactive behavior for the navigation header:
 * 1. Sticky header background blur and shadow on scroll.
 * 2. Mobile hamburger menu toggle.
 * 3. Active menu link highlighting using the Intersection Observer API.
 */

export function initNavbar(): void {
  const header = document.querySelector<HTMLElement>('.header');
  const menuToggle = document.querySelector<HTMLButtonElement>('.menu-toggle');
  const navMenu = document.querySelector<HTMLUListElement>('.nav-menu');
  const navLinks = document.querySelectorAll<HTMLAnchorElement>('.nav-link');
  const sections = document.querySelectorAll<HTMLElement>('section');

  if (!header) return;

  // 1. Sticky Header Scroll Effect
  // Adds a background blur and border when the user scrolls down
  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // 2. Mobile Drawer Menu Toggle
  if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', () => {
      const isOpen = navMenu.classList.contains('open');
      if (isOpen) {
        navMenu.classList.remove('open');
        // Update SVG inside hamburger button to "Menu" icon
        menuToggle.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
        `;
      } else {
        navMenu.classList.add('open');
        // Update SVG inside hamburger button to "Close" icon
        menuToggle.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/></svg>
        `;
      }
    });

    // Close mobile menu when clicking a navigation link
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('open');
        menuToggle.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
        `;
      });
    });
  }

  // 3. Active Link Observer
  // Highlights the link in the navbar representing the section currently visible on screen
  const observerOptions: IntersectionObserverInit = {
    root: null, // viewport
    rootMargin: '-50% 0px -50% 0px', // Trigger when section occupies center of screen
    threshold: 0
  };

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    });
  }, observerOptions);

  // Attach observer to all section elements
  sections.forEach(section => sectionObserver.observe(section));
}
