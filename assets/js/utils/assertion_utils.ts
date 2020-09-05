function die(message?: string): never {
  throw new Error(message || 'An error occured.');
}

function assertThat(predicate: boolean, message?: string): void {
  if (!predicate) {
    die(message);
  }
}

export { die, assertThat };
