/**
 * Contact.ts
 * 
 * Handles the contact form submission logic, validates inputs (email, name, message),
 * and displays a mock success message without sending any network request.
 */

export function initContact(): void {
  const form = document.querySelector<HTMLFormElement>('.contact__form');
  const statusMessage = document.querySelector<HTMLDivElement>('.form-status');

  if (!form || !statusMessage) return;

  form.addEventListener('submit', (event) => {
    event.preventDefault(); // Stop page reload on form submit

    const nameInput = form.querySelector<HTMLInputElement>('#name');
    const emailInput = form.querySelector<HTMLInputElement>('#email');
    const messageInput = form.querySelector<HTMLTextAreaElement>('#message');
    const submitBtn = form.querySelector<HTMLButtonElement>('button[type="submit"]');

    if (!nameInput || !emailInput || !messageInput) return;

    // Reset status display
    statusMessage.className = 'form-status';
    statusMessage.textContent = '';
    statusMessage.style.display = 'none';

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const message = messageInput.value.trim();

    // Verify all fields contain text
    if (!name || !email || !message) {
      statusMessage.className = 'form-status';
      statusMessage.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
      statusMessage.style.color = '#ef4444';
      statusMessage.style.border = '1px solid rgba(239, 68, 68, 0.2)';
      statusMessage.textContent = 'Please fill in all fields.';
      statusMessage.style.display = 'block';
      return;
    }

    // Validate email structure
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      statusMessage.className = 'form-status';
      statusMessage.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
      statusMessage.style.color = '#ef4444';
      statusMessage.style.border = '1px solid rgba(239, 68, 68, 0.2)';
      statusMessage.textContent = 'Please enter a valid email address.';
      statusMessage.style.display = 'block';
      return;
    }

    // Simulate sending delay
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `
        <svg class="animate-spin" style="animation: spin 1s linear infinite; width: 1rem; height: 1rem; margin-right: 0.5rem;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle style="opacity: 0.25;" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path style="opacity: 0.75;" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
        Sending...
      `;
    }

    setTimeout(() => {
      // Display success message
      statusMessage.className = 'form-status success';
      statusMessage.textContent = `Thank you, ${name}! Your message has been sent successfully (Mock).`;
      statusMessage.style.display = 'block';

      // Clear the form
      form.reset();

      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send message';
      }
    }, 1500);
  });
}
