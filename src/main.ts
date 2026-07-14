/**
 * main.ts
 * 
 * Main entry point of the personal portfolio website.
 * It imports the CSS styles, initializes the interactive TypeScript modules,
 * and sets up section fade-in animations on page scroll.
 */

import './styles/global.css';
import { initNavbar } from './components/Navbar.ts';
import { initProgress } from './components/Progress.ts';
import { initProjects } from './components/Projects.ts';
import { initContact } from './components/Contact.ts';

// Wait for the DOM to be fully loaded before running our scripts
document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize interactive elements
  initNavbar();
  initProgress();
  initProjects();
  initContact();

  // 2. Scroll Fade-in Animation (Intersection Observer)
  // Observes elements with the class 'fade-in-section' and transitions them on scroll
  const fadeSections = document.querySelectorAll<HTMLElement>('.fade-in-section');
  
  if (fadeSections.length > 0) {
    const fadeObserverOptions: IntersectionObserverInit = {
      root: null, // viewport
      rootMargin: '0px 0px -60px 0px', // Trigger slightly before section enters viewport
      threshold: 0.05 // Trigger when 5% is visible
    };

    const fadeObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target); // Only animate once
        }
      });
    }, fadeObserverOptions);

    fadeSections.forEach(section => fadeObserver.observe(section));
  }
});
