/* Click handler for any element with [data-copy="..."]. */
(function () {
  document.addEventListener('click', async (e) => {
    const target = e.target instanceof Element ? e.target.closest('[data-copy]') : null;
    if (!target) return;
    const value = target.getAttribute('data-copy');
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      const original = target.getAttribute('data-label-original') || target.textContent || '';
      target.setAttribute('data-label-original', original);
      target.setAttribute('data-copied', 'true');
      const labelEl = target.querySelector('[data-copy-label]');
      if (labelEl) labelEl.textContent = 'Copied!';
      setTimeout(() => {
        target.removeAttribute('data-copied');
        if (labelEl) labelEl.textContent = 'Copy';
      }, 1400);
    } catch {
      // clipboard unavailable; no-op
    }
  });
})();
