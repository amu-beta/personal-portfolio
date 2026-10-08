/* 全站公共交互：顶部导航收起、右侧章节导航高亮、返回顶部 */
(() => {
  const smooth = () => (matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth');

  /* 顶部导航：滚动后收成白色胶囊（与首页一致） */
  const nav = document.querySelector('.gnav');

  /* 右侧章节导航 */
  const rail = document.querySelector('.site-rail');
  const railLinks = rail ? [...rail.querySelectorAll('a[href^="#"]')] : [];
  const chapters = railLinks.map((a) => document.querySelector(a.getAttribute('href')));
  const allPages = document.querySelector('.all-pages');

  /* 返回顶部 */
  const toTop = document.querySelector('.site-to-top');
  if (toTop) toTop.addEventListener('click', () => scrollTo({ top: 0, behavior: smooth() }));

  let ticking = false;
  function onScroll() {
    const y = scrollY;
    if (nav) {
      if (y > 70) nav.classList.add('condensed');
      else if (y < 20) nav.classList.remove('condensed');
    }
    if (railLinks.length) {
      const line = innerHeight * 0.35;
      let active = 0;
      chapters.forEach((sec, i) => { if (sec && sec.getBoundingClientRect().top <= line) active = i; });
      railLinks.forEach((a, i) => (i === active ? a.setAttribute('aria-current', 'location') : a.removeAttribute('aria-current')));
    }
    if (rail && allPages) {
      const r = allPages.getBoundingClientRect();
      rail.classList.toggle('is-over-gallery', r.top < innerHeight * 0.75 && r.bottom > innerHeight * 0.25);
    }
    if (toTop) toTop.classList.toggle('is-visible', y > innerHeight * 0.8);
    ticking = false;
  }
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  addEventListener('resize', onScroll);
  onScroll();
})();

/* 详情页底部「全部页面」：从左向右匀速滑动，可拖拽快速预览 */
(() => {
  const SPEED = 40; // px / 秒
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.querySelectorAll('[data-all-pages]').forEach((viewport) => {
    const track = viewport.querySelector('.all-pages-track');
    const originals = [...track.children];
    let setWidth = 0;
    let offset = 0;
    let dragging = false;
    let startX = 0;
    let startOffset = 0;
    let last = 0;
    let visible = true;

    // 复制足够多份，保证任何位置都铺满整屏，循环无缝
    function build() {
      [...track.querySelectorAll('[data-clone]')].forEach((n) => n.remove());
      const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
      setWidth = originals.reduce((w, el) => w + el.getBoundingClientRect().width + gap, 0);
      if (!setWidth) return;
      const copies = Math.ceil(viewport.clientWidth / setWidth) + 1;
      for (let c = 0; c < copies; c++) {
        originals.forEach((el) => {
          const k = el.cloneNode(true);
          k.setAttribute('data-clone', '');
          k.setAttribute('aria-hidden', 'true');
          track.appendChild(k);
        });
      }
      offset = ((offset % setWidth) + setWidth) % setWidth;
      paint();
    }
    // offset 在 [0, setWidth) 之间循环；画面整体向右移动
    function paint() { track.style.transform = `translate3d(${offset - setWidth}px, 0, 0)`; }

    function tick(t) {
      const dt = last ? Math.min(t - last, 64) / 1000 : 0;
      last = t;
      if (!dragging && visible && !reduce && setWidth) {
        offset = (offset + SPEED * dt) % setWidth;
        paint();
      }
      requestAnimationFrame(tick);
    }

    viewport.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      dragging = true;
      startX = e.clientX;
      startOffset = offset;
      viewport.setPointerCapture(e.pointerId);
      viewport.classList.add('is-dragging');
    });
    viewport.addEventListener('pointermove', (e) => {
      if (!dragging || !setWidth) return;
      offset = (((startOffset + e.clientX - startX) % setWidth) + setWidth) % setWidth;
      paint();
    });
    const end = () => { dragging = false; viewport.classList.remove('is-dragging'); };
    viewport.addEventListener('pointerup', end);
    viewport.addEventListener('pointercancel', end);
    viewport.addEventListener('dragstart', (e) => e.preventDefault());

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([en]) => { visible = en.isIntersecting; }).observe(viewport);
    }
    originals.forEach((el) => el.querySelector('img')?.addEventListener('load', build, { once: true }));
    addEventListener('resize', build);
    build();
    requestAnimationFrame(tick);
  });
})();
