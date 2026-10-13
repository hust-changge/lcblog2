export function setTheme(theme) {
  const selected = theme === 'light' ? 'light' : 'dark';
  document.documentElement.dataset.theme = selected;
  try {
    localStorage.setItem('b1gchang-theme', selected);
  } catch (_) {
    // Private browsing may block storage; switching still works for this page.
  }
  return selected;
}

export function initTheme() {
  let saved;
  try {
    saved = localStorage.getItem('b1gchang-theme');
  } catch (_) {}
  return setTheme(saved === 'light' ? 'light' : 'dark');
}
