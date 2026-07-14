/**
 * Projects.ts
 * 
 * Handles the opening and closing of detail modals (dialog elements)
 * for the different projects.
 */

export function initProjects(): void {
  const openButtons = document.querySelectorAll<HTMLButtonElement>('[data-dialog-target]');
  const closeButtons = document.querySelectorAll<HTMLButtonElement>('.btn-close-dialog');
  const dialogs = document.querySelectorAll<HTMLDialogElement>('.project-dialog');

  // Open modal
  openButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const dialogId = btn.getAttribute('data-dialog-target');
      if (dialogId) {
        const dialog = document.getElementById(dialogId) as HTMLDialogElement;
        if (dialog) {
          dialog.showModal();
          // Prevent body scroll when dialog is active
          document.body.style.overflow = 'hidden';
        }
      }
    });
  });

  // Close modal using close button
  closeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const dialog = btn.closest('dialog') as HTMLDialogElement;
      if (dialog) {
        dialog.close();
        document.body.style.overflow = '';
      }
    });
  });

  // Close modal when clicking on backdrop (outside the dialog body)
  dialogs.forEach(dialog => {
    dialog.addEventListener('click', (event) => {
      const rect = dialog.getBoundingClientRect();
      const isInDialog = (
        rect.top <= event.clientY &&
        event.clientY <= rect.top + rect.height &&
        rect.left <= event.clientX &&
        event.clientX <= rect.left + rect.width
      );
      if (!isInDialog) {
        dialog.close();
        document.body.style.overflow = '';
      }
    });

    // Reset scroll if modal is cancelled via Escape key
    dialog.addEventListener('cancel', () => {
      document.body.style.overflow = '';
    });
  });
}
