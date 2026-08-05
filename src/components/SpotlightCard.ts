/**
 * SpotlightCard.ts
 *
 * Vanilla TS port of React Bits' SpotlightCard.
 * Adds a mouse-tracking radial gradient spotlight to all .card-spotlight elements.
 */

export function initSpotlightCards(): void {
  const cards = document.querySelectorAll<HTMLElement>('.card-spotlight, .tech-card');
  cards.forEach(card => {
    card.addEventListener('mousemove', (e: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });
  });
}
