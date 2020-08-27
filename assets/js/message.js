function showMessage(text) {
    const el = document.createElement('div');
    el.className = 'message';
    el.textContent = text;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 4000);
}

export { showMessage };
