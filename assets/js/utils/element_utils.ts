function setVisibility(el: HTMLElement, shown = false): void {
  el.classList.toggle('d-none', !shown);
}

function showElement(el: HTMLElement): void {
  setVisibility(el, true);
}

function hideElement(el: HTMLElement): void {
  setVisibility(el, false);
}

function makeDraggable(element: HTMLElement): void {
  let lastMouseDownEvent: MouseEvent|null = null;

  const drag = (e: MouseEvent) => {
    if (!lastMouseDownEvent) {
      return;
    }
    element.style.left = `${e.clientX - lastMouseDownEvent.offsetX}px`;
    element.style.top = `${e.clientY - lastMouseDownEvent.offsetY}px`;
  };

  const dragStop = () => {
    document.removeEventListener('mousemove', drag);
    document.removeEventListener('mouseup', dragStop);
  };

  element.addEventListener('mousedown', (e: MouseEvent) => {
    if (e.button !== 0) {
      return;
    }
    const el = e.target as HTMLElement;
    if (el.classList.contains('drag-handle')) {
      document.addEventListener('mousemove', drag);
      document.addEventListener('mouseup', dragStop);
      lastMouseDownEvent = e;
    }
  });
}


export { showElement, hideElement, setVisibility, makeDraggable };
