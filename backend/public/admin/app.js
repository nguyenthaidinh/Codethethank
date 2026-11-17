const dialog = document.querySelector('#confirm-dialog');
let pendingForm = null;
let confirmed = false;
document.querySelectorAll('form[data-confirm]').forEach(form => {
  form.addEventListener('submit', event => {
    if (confirmed || !dialog?.showModal) return;
    event.preventDefault();
    pendingForm = form;
    document.querySelector('#confirm-title').textContent = form.dataset.confirm;
    document.querySelector('#confirm-copy').textContent = form.dataset.copy;
    dialog.showModal();
    document.querySelector('#confirm-cancel').focus();
  });
});
document.querySelector('#confirm-cancel')?.addEventListener('click', () => dialog.close());
document.querySelector('#confirm-submit')?.addEventListener('click', () => {
  if (!pendingForm) return;
  confirmed = true;
  dialog.close();
  pendingForm.requestSubmit();
});
document.querySelectorAll('form[data-confirm], form[data-pending]').forEach(form => {
  form.addEventListener('submit', event => {
    if (event.defaultPrevented) return;
    form.setAttribute('aria-busy', 'true');
    form.querySelectorAll('button[type="submit"]').forEach(button => { button.disabled = true; button.textContent = 'Đang xử lý…'; });
  });
});
// Avoid redisplaying a prior user's letter from browser back/forward memory after logout.
window.addEventListener('pageshow', event => { if (event.persisted) location.reload(); });
document.documentElement.dataset.adminReady = 'true';
