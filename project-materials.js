(() => {
  document.documentElement.classList.add('js');
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const SEQ = JSON.parse($('#mt-data').textContent);

  /* ---------- 滚动渐显 ---------- */
  const reveals = $$('.reveal');
  if ('IntersectionObserver' in window && !reduced.matches) {
    const io = new IntersectionObserver(entries => entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
    }), { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(r => io.observe(r));
  } else reveals.forEach(r => r.classList.add('is-in'));

  /* ---------- 灯箱 ---------- */
  const lb = $('#mt-lb');
  const img = $('#mt-lb-img');
  const count = $('#mt-lb-count');
  let cur = 0;
  let opener = null;

  function show(i, swap) {
    cur = (i + SEQ.length) % SEQ.length;
    const it = SEQ[cur];
    const isPop = it.h > it.w;
    lb.classList.toggle('is-pop', isPop);
    lb.classList.toggle('is-banner', !isPop);
    img.src = it.src; img.width = it.w; img.height = it.h; img.alt = it.name;
    count.textContent = `${String(cur + 1).padStart(2, '0')} / ${String(SEQ.length).padStart(2, '0')}`;
    if (swap && !reduced.matches) { lb.classList.remove('is-swap'); void lb.offsetWidth; lb.classList.add('is-swap'); }
  }
  function open(i, from) {
    opener = from;
    show(i);
    document.documentElement.classList.add('mt-locked');
    lb.showModal();
  }
  lb.addEventListener('close', () => {
    document.documentElement.classList.remove('mt-locked');
    opener?.focus({ preventScroll: true });
  });
  lb.addEventListener('click', e => { if (e.target === lb || e.target.classList.contains('mt-lb-stage')) lb.close(); });
  lb.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') { e.preventDefault(); show(cur + 1, true); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); show(cur - 1, true); }
  });
  $('#mt-lb-close').addEventListener('click', () => lb.close());
  $('#mt-lb-prev').addEventListener('click', () => show(cur - 1, true));
  $('#mt-lb-next').addEventListener('click', () => show(cur + 1, true));

  // 手机上左右滑动切换
  let sx = null;
  lb.addEventListener('touchstart', e => { sx = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', e => {
    if (sx === null) return;
    const dx = e.changedTouches[0].clientX - sx;
    if (Math.abs(dx) > 50) show(cur + (dx < 0 ? 1 : -1), true);
    sx = null;
  });

  $$('[data-lb]').forEach(b => b.addEventListener('click', () => open(Number(b.dataset.lb), b)));
})();
