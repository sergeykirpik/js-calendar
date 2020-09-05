function currentUser(): string {
  return document.body.dataset.user || '';
}

export { currentUser };
