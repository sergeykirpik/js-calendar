function showMessage(text: string): void {
  const el = document.createElement('div');
  el.className = 'message';
  el.textContent = text;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 4000);
}

declare global {
  interface Window { showMessage: (msg: string) => void }
}

window.showMessage = showMessage;

export { showMessage };
