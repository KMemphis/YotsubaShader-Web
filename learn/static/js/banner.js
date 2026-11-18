// Home banners: the squares on the left of each banner choose what its left side shows: the language name alone
// (first square) or an example shader written in that language (second square).
// Without this script the language name is shown and the page is still fully usable.
(() => {
  for (const slide of document.querySelectorAll('.banner .slide')) {
    const dots = [...slide.querySelectorAll('.slide-dots button')];
    const panes = [...slide.querySelectorAll('.art-pane')];
    const show = (n) => {
      panes.forEach((p, i) => p.classList.toggle('is-active', i === n));
      dots.forEach((d, i) => d.setAttribute('aria-current', String(i === n)));
    };
    dots.forEach((d, i) => d.addEventListener('click', () => show(i)));
    slide.querySelector('.slide-dots')?.addEventListener('keydown', (e) => {
      const step = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
      if (!step) return;
      e.preventDefault();
      const next = (dots.findIndex((d) => d.getAttribute('aria-current') === 'true') + step + dots.length) % dots.length;
      show(next);
      dots[next].focus();
    });
  }
})();
