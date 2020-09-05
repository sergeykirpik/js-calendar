function randomInt(min: number, max: number): number {
  // random number from min to (max+1)
  const rand = min + Math.random() * (max + 1 - min);
  return Math.floor(rand);
}

function padWithZero(value: number|string): string {
  return value < 10 ? `0${value}` : `${value}`;
}

function isValueInRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}

export { randomInt, padWithZero, isValueInRange };
