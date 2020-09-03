import { padWithZero } from './date_utils';

function randomInt(min, max) {
  // random number from min to (max+1)
  const rand = min + Math.random() * (max + 1 - min);
  return Math.floor(rand);
}

function randomColor() {
  const r = randomInt(0, 255).toString(16);
  const g = randomInt(0, 255).toString(16);
  const b = randomInt(0, 255).toString(16);

  return `#${padWithZero(r)}${padWithZero(g)}${padWithZero(b)}`;
}

export { randomInt, randomColor };
