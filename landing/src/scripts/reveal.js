/* Simple IntersectionObserver-based fade-in for .reveal elements. */
(function () {
  if (typeof IntersectionObserver === 'undefined') return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function init() {
    const els = document.querySelectorAll('.reveal');
    if (!els.length) return;
    if (reduce) {
      els.forEach((el) => el.classList.add('is-in'));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-in');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -10% 0px' },
    );
    els.forEach((el) => io.observe(el));
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
