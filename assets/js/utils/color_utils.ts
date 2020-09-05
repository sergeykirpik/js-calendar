import { randomInt, padWithZero } from './number_utils';

function makeGradient(color: string) {
  return `linear-gradient(#fff, ${color}, ${color}, ${color}, #fff)`;
}

function colorBrightness(hexColor: string) {
  // http://www.w3.org/TR/AERT#color-contrast

  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);

  return Math.round((299 * r + 587 * g + 114 * b) / 1000);
}

function setElementColor(el: HTMLElement, color: string): void {
  el.style.background = makeGradient(color);
  if (color && colorBrightness(color) <= 125) {
    el.style.color = 'white';
  } else {
    el.style.color = 'black';
  }
}

function randomColor(): string {
  const r = randomInt(0, 255).toString(16);
  const g = randomInt(0, 255).toString(16);
  const b = randomInt(0, 255).toString(16);

  return `#${padWithZero(r)}${padWithZero(g)}${padWithZero(b)}`;
}

export { setElementColor, randomColor };
