/**
 * main.ts — Riddhi Bantia Studio Portfolio
 */

import './styles/global.css';
import { initParticleStar } from './components/ParticleStar.ts';
import { initNavbar } from './components/Navbar.ts';
import { initCarousel } from './components/Carousel.ts';
import { initProjects } from './components/Projects.ts';
import { initContact } from './components/Contact.ts';
import { GradualBlur } from './components/GradualBlur.ts';

declare global {
  interface Window {
    gsap: any;
    ScrollTrigger: any;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // 1. Loading Curtain
  const curtain = document.getElementById('loading-curtain');
  if (curtain) {
    setTimeout(() => curtain.classList.add('is-open'), 800);
    setTimeout(() => { curtain.style.display = 'none'; }, 2200);
  }

  // 1b. Gradual Blur overlays
  // Navbar blur background (sticky header)
  const headerEl = document.getElementById('header');
  if (headerEl) {
    new GradualBlur(headerEl, {
      position: 'top',
      height: '100%',
      strength: 3,
      divCount: 8,
      opacity: 0.95,
      curve: 'bezier',
      zIndex: -1 // Sits behind logo and nav links
    });
  }



  // Capabilities section top transition boundary blur
  const capSection = document.getElementById('capabilities');
  if (capSection) {
    const transitionContainer = capSection.querySelector<HTMLElement>('.capabilities__transition');
    if (transitionContainer) {
      new GradualBlur(transitionContainer, {
        position: 'top',
        height: '6rem',
        strength: 4,
        divCount: 8,
        opacity: 1,
        curve: 'bezier'
      });
    }
  }

  // Section top transition boundary blurs (Services, Work, About, Contact, Footer)
  const blurSectionIds = ['services', 'work', 'about', 'contact', 'footer'];
  blurSectionIds.forEach(id => {
    const container = document.getElementById(`blur-${id}`);
    if (container) {
      new GradualBlur(container, {
        position: 'top',
        height: '8rem',
        strength: 3,
        divCount: 6,
        opacity: 0.9,
        curve: 'bezier'
      });
    }
  });

  // Section bottom transition boundary blurs
  const bottomBlurIds = ['services', 'work', 'capabilities', 'about', 'contact'];
  bottomBlurIds.forEach(id => {
    const container = document.getElementById(`blur-bottom-${id}`);
    if (container) {
      new GradualBlur(container, {
        position: 'bottom',
        height: '8rem',
        strength: 3,
        divCount: 6,
        opacity: 0.9,
        curve: 'bezier'
      });
    }
  });

  // 2. Particle Star (hero 3D effect)
  initParticleStar('#particle-star-canvas', {
    particleCount: 4500,
    baseColor: '#3b0764', // Deep cosmic purple
    glowColor: '#a855f7', // Bright magenta/violet
    edgeColor: '#ffffff', // Brilliant white core
    rotationSpeed: 0.08,
    mouseStrength: 1.2,
  });

  // 3. Interactive components
  initNavbar();
  initCarousel();
  initProjects();
  initContact();

  // 4. Scroll Reveal ([data-reveal])
  const revealElements = document.querySelectorAll<HTMLElement>('[data-reveal]');
  if (revealElements.length > 0) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -60px 0px', threshold: 0.05 });

    revealElements.forEach(el => revealObserver.observe(el));
  }

  // 5. Active nav link on scroll
  const sections = document.querySelectorAll<HTMLElement>('section[id]');
  const navLinks = document.querySelectorAll<HTMLElement>('.nav__link');

  if (sections.length > 0 && navLinks.length > 0) {
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navLinks.forEach(link => {
            link.classList.toggle('active',
              link.getAttribute('href') === `#${id}`
            );
          });
        }
      });
    }, { rootMargin: '-50% 0px -50% 0px' });

    sections.forEach(section => sectionObserver.observe(section));
  }

  // 6. GSAP scroll animations (if loaded)
  if (typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined') {
    const gsap = window.gsap;
    const ScrollTrigger = window.ScrollTrigger;
    gsap.registerPlugin(ScrollTrigger);

    // Parallax on hero title
    gsap.to('.hero__title', {
      yPercent: -20,
      ease: 'none',
      scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: 1
      }
    });

    // Fade out hero scroll hint
    gsap.to('.hero__scroll-hint', {
      opacity: 0,
      scrollTrigger: {
        trigger: '.hero',
        start: '10% top',
        end: '20% top',
        scrub: true
      }
    });
  }
});
