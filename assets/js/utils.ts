function makeDraggable(element: Element): void {
  let lastMouseDownEvent: MouseEvent? = null;

  const drag = (e) => {
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
    if (e.target.classList.contains('drag-handle')) {
      document.addEventListener('mousemove', drag);
      document.addEventListener('mouseup', dragStop);
      lastMouseDownEvent = e;
    }
  });
}

function die(message: string): never {
  throw new Error(message);
}

function inRange(val: number, min: number, max: number): boolean {
  return val >= min && val <= max;
}

function currentUser(): string {
  return document.body.dataset.user;
}

export {
  die, makeDraggable, inRange, currentUser,
};
