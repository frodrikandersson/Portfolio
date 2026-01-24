try {
  let theme = localStorage.getItem('theme');
  if (!theme) {
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    theme = mql.matches ? 'dark' : 'light';
  }
  document.documentElement.classList.add(theme);
} catch {
  document.documentElement.classList.add('light');
}
