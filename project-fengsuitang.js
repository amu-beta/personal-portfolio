(() => {
  document.documentElement.classList.add('js');
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const smooth = () => (reduced.matches ? 'auto' : 'smooth');

  /* ---------- toast ---------- */
  const toastEl = $('#toast');
  let toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), 1800);
  }

  /* ---------- nav: progress + active chapter ---------- */
  const nav = $('#site-nav');
  const bar = $('#progress-bar');
  const navLinks = $$('.chapter-nav a');
  const chapters = navLinks.map(a => $(a.getAttribute('href')));
  const toTop = $('#to-top');
  let ticking = false;
  function onScroll() {
    const y = scrollY;
    const max = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = `scaleX(${max > 0 ? Math.min(1, y / max) : 0})`;
    nav.classList.toggle('is-scrolled', y > 10);
    if (toTop) toTop.hidden = y < innerHeight * 1.2;
    const line = nav.offsetHeight + 80;
    let active = 0;
    chapters.forEach((sec, i) => { if (sec && sec.getBoundingClientRect().top <= line) active = i; });
    navLinks.forEach((a, i) => {
      if (i === active) {
        if (!a.hasAttribute('aria-current')) {
          a.setAttribute('aria-current', 'location');
          const el = a.parentElement;
          if (el.scrollWidth > el.clientWidth) el.scrollTo({ left: a.offsetLeft - el.clientWidth / 2 + a.offsetWidth / 2, behavior: smooth() });
        }
      } else a.removeAttribute('aria-current');
    });
    ticking = false;
  }
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  addEventListener('resize', onScroll);
  onScroll();
  if (toTop) toTop.addEventListener('click', () => scrollTo({ top: 0, behavior: smooth() }));

  /* ---------- reveal ---------- */
  const reveals = $$('.reveal');
  if ('IntersectionObserver' in window && !reduced.matches) {
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
    }), { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });
    reveals.forEach(el => io.observe(el));
    setTimeout(() => reveals.forEach(el => { if (el.getBoundingClientRect().top < innerHeight) el.classList.add('is-in'); }), 1200);
  } else reveals.forEach(el => el.classList.add('is-in'));

  /* ---------- cover tilt ---------- */
  const coverBtn = $('.cover-zoom');
  if (coverBtn && finePointer.matches && !reduced.matches) {
    coverBtn.addEventListener('pointermove', e => {
      const r = coverBtn.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      coverBtn.style.transform = `rotateY(${x * 6}deg) rotateX(${y * -5}deg)`;
    });
    coverBtn.addEventListener('pointerleave', () => { coverBtn.style.transform = ''; });
  }

  /* ---------- count up ---------- */
  const counters = $$('[data-count]');
  if ('IntersectionObserver' in window && !reduced.matches) {
    const cio = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return;
      cio.unobserve(e.target);
      const end = Number(e.target.dataset.count);
      const t0 = performance.now();
      const step = t => {
        const p = Math.min(1, (t - t0) / 1100);
        e.target.textContent = Math.round(end * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }), { threshold: 0.6 });
    counters.forEach(el => cio.observe(el));
  }

  /* ---------- segmented helper ---------- */
  function segmented(buttons, onChange) {
    buttons.forEach(btn => btn.addEventListener('click', () => {
      buttons.forEach(b => {
        const on = b === btn;
        b.classList.toggle('active', on);
        if (b.hasAttribute('aria-pressed')) b.setAttribute('aria-pressed', String(on));
      });
      onChange(btn);
    }));
  }

  /* ---------- grid lab ---------- */
  const screen = $('#grid-screen');
  const blocks = $('#gs-blocks');
  const range = $('#vw-range');
  const MARGIN = 132, GUTTER = 20, COLS = 12;
  let layout = 12;
  function renderBlocks() {
    const span = layout === 12 ? 1 : layout;
    const count = layout === 12 ? 12 : (12 / span) * 2;
    blocks.innerHTML = '';
    for (let i = 0; i < count; i++) {
      const s = document.createElement('span');
      s.style.gridColumn = `span ${span}`;
      s.style.animationDelay = `${i * 30}ms`;
      if (layout === 12) s.style.height = '170px';
      s.textContent = layout === 12 ? '' : `${span} 列`;
      blocks.append(s);
    }
  }
  function renderGrid() {
    const vw = Number(range.value);
    const grid = vw - MARGIN * 2;
    const col = (grid - GUTTER * (COLS - 1)) / COLS;
    screen.style.setProperty('--pad', `${(MARGIN / vw) * 100}%`);
    screen.style.setProperty('--gap', `${(GUTTER / grid) * 100}%`);
    $('#vw-out').textContent = vw;
    $('#ruler-screen').textContent = `${vw}PX`;
    $('#ruler-grid').textContent = `${grid}PX`;
    $('#r-grid').textContent = grid;
    $('#r-col').textContent = col.toFixed(1);
  }
  if (screen) {
    segmented($$('[data-layout]'), btn => { layout = Number(btn.dataset.layout); renderBlocks(); });
    range.addEventListener('input', renderGrid);
    renderGrid();
    renderBlocks();
  }

  /* ---------- color copy ---------- */
  $$('[data-hex]').forEach(btn => btn.addEventListener('click', async () => {
    const hex = btn.dataset.hex;
    try { await navigator.clipboard.writeText(hex); toast(`已复制 ${hex}`); }
    catch { toast(hex); }
    btn.classList.add('copied');
    setTimeout(() => btn.classList.remove('copied'), 1400);
  }));

  /* ---------- page explorer ---------- */
  const media = $('#ex-media');
  const mediaCap = $('#ex-media-cap');
  const tabs = $$('[data-tab]');
  const panels = $$('[data-panel]');

  function showMedia(note) {
    const set = note && note.dataset.media;
    if (!set) { media.hidden = true; return; }
    $$('[data-media-set]', media).forEach(t => { t.hidden = t.dataset.mediaSet !== set; });
    mediaCap.textContent = `${note.querySelector('b').textContent} · 模块细节，点击放大`;
    media.hidden = false;
  }

  panels.forEach(panel => {
    const viewport = $('.ex-viewport', panel);
    const canvas = $('.ex-canvas', panel);
    const browser = $('.browser', panel);
    const hotspots = $$('.hotspot', panel);
    const notes = $$('.note', panel);
    const list = $('.notes', panel);
    const side = document.createElement('div');
    side.className = 'ex-side';
    list.before(side);
    side.append(list);
    panel._side = side;
    const total = Number(getComputedStyle(canvas).getPropertyValue('--h')) || 1;
    hotspots.forEach(h => { h.dataset.n = Number(h.dataset.mod) + 1; });
    let current = -1;
    let lock = false;
    let lockTimer;

    function setActive(i, fromScroll) {
      if (i === current) return;
      current = i;
      hotspots.forEach(h => h.classList.toggle('is-active', Number(h.dataset.mod) === i));
      notes.forEach(n => {
        const on = Number(n.dataset.mod) === i;
        n.classList.toggle('is-active', on);
        n.setAttribute('aria-pressed', String(on));
      });
      if (!panel.hidden) { side.append(media); showMedia(notes[i]); }
      if (fromScroll) return;
    }
    panel._activate = () => { const i = current < 0 ? 0 : current; current = -1; setActive(i); };

    function goTo(i) {
      const h = hotspots[i];
      const top = (parseFloat(h.style.getPropertyValue('--t')) / total) * canvas.offsetHeight;
      lock = true;
      clearTimeout(lockTimer);
      lockTimer = setTimeout(() => { lock = false; }, 700);
      viewport.scrollTo({ top: Math.max(0, top - 16), behavior: smooth() });
      setActive(i);
    }
    notes.forEach(n => n.addEventListener('click', () => goTo(Number(n.dataset.mod))));
    hotspots.forEach(h => h.addEventListener('click', () => goTo(Number(h.dataset.mod))));

    viewport.addEventListener('scroll', () => {
      browser.classList.add('scrolled');
      if (lock) return;
      const mid = viewport.scrollTop + viewport.clientHeight * 0.4;
      const scale = canvas.offsetHeight / total;
      let found = 0;
      hotspots.forEach(h => {
        if (parseFloat(h.style.getPropertyValue('--t')) * scale <= mid) found = Number(h.dataset.mod);
      });
      setActive(found, true);
    }, { passive: true });

    setActive(0);
  });

  function selectTab(btn, focus) {
    tabs.forEach(t => {
      const on = t === btn;
      t.classList.toggle('active', on);
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
    });
    panels.forEach(p => { p.hidden = p.dataset.panel !== btn.dataset.tab; });
    const panel = panels.find(p => !p.hidden);
    panel._activate();
    if (focus) btn.focus();
  }
  tabs.forEach((btn, i) => {
    btn.addEventListener('click', () => selectTab(btn));
    btn.addEventListener('keydown', e => {
      const map = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 };
      if (!(e.key in map)) return;
      e.preventDefault();
      selectTab(tabs[(map[e.key] + tabs.length) % tabs.length], true);
    });
  });
  showMedia(null);

  /* ---------- lightbox ---------- */
  const lb = $('#lightbox');
  const lbImg = $('#lb-img');
  const lbCap = $('#lb-cap');
  const lbCount = $('#lb-count');
  const lbStage = $('#lb-stage');
  const triggers = $$('[data-lightbox]');
  let idx = 0;
  function show(i) {
    idx = (i + triggers.length) % triggers.length;
    const img = $('img', triggers[idx]);
    lbImg.src = img.currentSrc || img.src;
    lbImg.alt = img.alt;
    lbCap.textContent = img.alt;
    lbCount.textContent = `${idx + 1} / ${triggers.length}`;
    lbStage.classList.remove('is-zoomed');
    lbStage.scrollTo(0, 0);
  }
  triggers.forEach((t, i) => t.addEventListener('click', () => {
    show(i);
    if (typeof lb.showModal === 'function') lb.showModal(); else lb.setAttribute('open', '');
    document.body.style.overflow = 'hidden';
  }));
  const close = () => { lb.close ? lb.close() : lb.removeAttribute('open'); };
  lb.addEventListener('close', () => { document.body.style.overflow = ''; });
  $('#lb-close').addEventListener('click', close);
  $('#lb-prev').addEventListener('click', () => show(idx - 1));
  $('#lb-next').addEventListener('click', () => show(idx + 1));
  const zoom = () => lbStage.classList.toggle('is-zoomed');
  $('#lb-zoom').addEventListener('click', zoom);
  lbImg.addEventListener('click', zoom);
  lbStage.addEventListener('click', e => { if (e.target === lbStage) close(); });
  lb.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') show(idx + 1);
    if (e.key === 'ArrowLeft') show(idx - 1);
  });
})();
