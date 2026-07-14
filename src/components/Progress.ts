/**
 * Progress.ts
 * 
 * Animates the learning progress bars from 0% to their target percentages
 * when the user scrolls the progress section into view.
 */

export function initProgress(): void {
  const progressBars = document.querySelectorAll<HTMLElement>('.progress-bar');
  
  if (progressBars.length === 0) return;

  const observerOptions: IntersectionObserverInit = {
    root: null, // viewport
    rootMargin: '0px 0px -10% 0px', // Trigger when it is slightly inside the screen
    threshold: 0.1 // Trigger when 10% of the bar is visible
  };

  const progressObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const bar = entry.target as HTMLElement;
        const targetPercent = bar.getAttribute('data-progress') || '0';
        
        // Set the width of the bar to trigger the CSS transition
        bar.style.width = `${targetPercent}%`;
        
        // Unobserve after animating once so it doesn't re-trigger
        observer.unobserve(bar);
      }
    });
  }, observerOptions);

  // Attach observer to each progress bar
  progressBars.forEach(bar => progressObserver.observe(bar));
}
