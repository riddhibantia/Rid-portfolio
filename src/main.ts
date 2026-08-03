/**
 * main.ts — Riddhi Bantia Studio Portfolio
 */

import './styles/global.css';
// ParticleStar replaced by LiquidEther fluid background
import { initNavbar } from './components/Navbar.ts';
import { initCarousel } from './components/Carousel.ts';
import { initProjects } from './components/Projects.ts';
import { initContact } from './components/Contact.ts';
import { GradualBlur } from './components/GradualBlur.ts';
import { initSpecularButtons } from './components/SpecularButton.ts';
import { initSpotlightCards } from './components/SpotlightCard.ts';
import { initLiquidEther } from './components/LiquidEther.ts';

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
  const blurSectionIds = ['work', 'about', 'certificates', 'contact', 'footer'];
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
  const bottomBlurIds = ['services', 'work', 'capabilities', 'about', 'certificates', 'contact'];
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

  // 2. Particle Star — disabled, replaced by LiquidEther fluid background

  // 2b. Liquid Ether (site-wide fluid background)
  try {
    initLiquidEther({
      container: '#liquid-ether-bg',
      colors: ['#160B2C', '#5227FF', '#FF9FFC', '#B497CF', '#F3E8FF'],
      mouseForce: 35,
      cursorSize: 180,
      resolution: 0.5,
      autoDemo: true,
      autoSpeed: 0.5,
      autoIntensity: 2.8,
      autoResumeDelay: 1000,
      autoRampDuration: 0.6,
      BFECC: true,
      iterationsPoisson: 32,
    });
  } catch (e) {
    console.warn('LiquidEther init failed:', e);
  }

  // 3. Interactive components
  initNavbar();
  initCarousel();
  initProjects();
  initContact();
  initSpecularButtons();
  initSpotlightCards();

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

    // Parallax on hero left content block
    gsap.to('.hero__left', {
      yPercent: -15,
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
