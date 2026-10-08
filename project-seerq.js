const seerqHero = document.querySelector('.seerq-hero-board');

if (seerqHero) {
  let isVisible = true;

  const syncMotion = () => {
    seerqHero.classList.toggle('is-motion-active', isVisible && !document.hidden);
  };

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
      syncMotion();
    }, { threshold: 0.08 });

    observer.observe(seerqHero);
  } else {
    syncMotion();
  }

  document.addEventListener('visibilitychange', syncMotion);
}
