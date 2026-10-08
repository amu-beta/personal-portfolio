(() => {
  document.documentElement.classList.add('js');
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const smooth = () => (reduced.matches ? 'auto' : 'smooth');

  /* ---------- reading progress ---------- */
  const bar = $('#tc-progress-bar');
  let ticking = false;
  function onScroll() {
    const max = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = `scaleX(${max > 0 ? Math.min(1, scrollY / max) : 0})`;
    ticking = false;
  }
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  /* ---------- reveal ---------- */
  const reveals = $$('.reveal');
  if ('IntersectionObserver' in window && !reduced.matches) {
    const io = new IntersectionObserver(entries => entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
    }), { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(el => io.observe(el));
    setTimeout(() => reveals.forEach(el => { if (el.getBoundingClientRect().top < innerHeight) el.classList.add('is-in'); }), 1200);
  } else reveals.forEach(el => el.classList.add('is-in'));

  /* roving tabs helper */
  function roving(items, select, keys = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }) {
    items.forEach((t, i) => {
      t.addEventListener('click', () => select(i, false, true));
      t.addEventListener('keydown', e => {
        const k = keys[e.key];
        if (k) { e.preventDefault(); select((i + k + items.length) % items.length, true, true); }
      });
    });
  }

  /* ---------- before / after compare ---------- */
  const compare = $('#tc-compare');
  const range = $('#tc-compare-range');
  const tagB = $('.tc-compare-tag--before', compare);
  const tagA = $('.tc-compare-tag--after', compare);
  function setPos(v, animate) {
    compare.classList.toggle('is-animating', !!animate && !reduced.matches);
    compare.style.setProperty('--pos', `${v}%`);
    range.value = v;
    range.setAttribute('aria-valuetext', v >= 98 ? '只显示改版前' : v <= 2 ? '只显示改版后' : `改版前 ${Math.round(v)}%，改版后 ${Math.round(100 - v)}%`);
    tagB.style.opacity = v < 8 ? 0 : 1;
    tagA.style.opacity = v > 92 ? 0 : 1;
  }
  const intro = reduced.matches ? [] : [setTimeout(() => setPos(72, true), 700), setTimeout(() => setPos(50, true), 1400)];
  const stopIntro = () => intro.forEach(clearTimeout);
  range.addEventListener('pointerdown', stopIntro);
  range.addEventListener('input', () => { stopIntro(); setPos(Number(range.value)); });
  $$('[data-compare]').forEach(b => b.addEventListener('click', () => { stopIntro(); setPos(Number(b.dataset.compare), true); }));
  compare.addEventListener('transitionend', () => compare.classList.remove('is-animating'));
  setPos(50);

  /* ---------- pain points ---------- */
  const pains = $$('.tc-pain');
  const pins = $$('.tc-pin');
  function setPain(i, focus) {
    pains.forEach((p, j) => { p.setAttribute('aria-selected', String(i === j)); p.tabIndex = i === j ? 0 : -1; });
    pins.forEach((p, j) => p.classList.toggle('is-on', i === j));
    if (focus) pains[i].focus();
  }
  roving(pains, setPain);
  pains.forEach((p, i) => p.addEventListener('mouseenter', () => { if (finePointer.matches) setPain(i); }));
  setPain(0);

  /* ---------- components ---------- */
  const compTabs = $$('.tc-comp-tabs [role="tab"]');
  const compPanels = $$('.tc-comp-panel');
  const hots = $$('.tc-hot');
  let comp = 0;
  let compTimer = null;
  function setComp(i, focus, byUser) {
    comp = i;
    compTabs.forEach((t, j) => { t.setAttribute('aria-selected', String(i === j)); t.tabIndex = i === j ? 0 : -1; });
    compPanels.forEach((p, j) => { p.hidden = i !== j; });
    hots.forEach((h, j) => { h.classList.toggle('is-on', i === j); h.setAttribute('aria-pressed', String(i === j)); });
    if (focus) compTabs[i].focus();
    if (byUser) stopCompAuto();
  }
  roving(compTabs, setComp);
  hots.forEach((h, i) => {
    h.addEventListener('click', () => setComp(i, false, true));
    h.addEventListener('mouseenter', () => { if (finePointer.matches) setComp(i, false, true); });
  });
  function stopCompAuto() { clearInterval(compTimer); compTimer = null; }
  const compSection = $('#components');
  if (!reduced.matches && 'IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => {
      if (e.isIntersecting && compTimer === null && !compSection.dataset.touched) {
        compTimer = setInterval(() => setComp((comp + 1) % compTabs.length), 4200);
      } else if (!e.isIntersecting) stopCompAuto();
    }, { threshold: 0.4 }).observe(compSection);
    compSection.addEventListener('pointerdown', () => { compSection.dataset.touched = '1'; stopCompAuto(); });
    compSection.addEventListener('keydown', () => { compSection.dataset.touched = '1'; stopCompAuto(); });
  }
  setComp(0);

  // 转化按钮：按下 → 进入信息填写
  const ctaShow = $('.tc-show--cta');
  const ctaTry = $('#tc-cta-try');
  const ctaHint = $('#tc-cta-hint');
  let ctaTimer;
  ctaTry.addEventListener('click', () => {
    ctaTry.classList.add('is-press');
    setTimeout(() => ctaTry.classList.remove('is-press'), 160);
    ctaShow.classList.add('is-go');
    ctaHint.textContent = '进入「信息填写」';
    clearTimeout(ctaTimer);
    ctaTimer = setTimeout(() => { ctaShow.classList.remove('is-go'); ctaHint.textContent = '点一下按钮'; }, 2600);
  });

  // 模块板块：同一容器替换内容
  const MODULE_TITLES = [['帝王紫微斗數', '清晰掌握你的一生運程'], ['先知命局名師推薦', '此測算經名師認證']];
  const swaps = $$('[data-swap]');
  const contents = $$('.tc-module-content');
  const moduleTitle = $('#tc-module-title');
  swaps.forEach(b => b.addEventListener('click', () => {
    const i = Number(b.dataset.swap);
    swaps.forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    contents.forEach(c => c.classList.toggle('is-on', Number(c.dataset.content) === i));
    moduleTitle.innerHTML = `<b>${MODULE_TITLES[i][0]}</b><small>${MODULE_TITLES[i][1]}</small>`;
  }));

  /* ---------- decision path ---------- */
  const structure = $('.tc-structure');
  const scroller = $('#tc-phone-scroll');
  const longImg = $('#tc-long');
  const meter = $('#tc-phone-meter');
  const stages = $$('.tc-stages li');
  const lists = { new: $('[data-list="new"]'), old: $('[data-list="old"]') };
  const SRC = {
    new: { src: 'assets/portfolio/topic/new-long.jpg', h: 5584, alt: '改版后紫微命格详批完整长页' },
    old: { src: 'assets/portfolio/topic/old-long.jpg', h: 3143, alt: '改版前紫微命格详批完整长页' }
  };
  let mode = 'new';
  let steps = $$('.tc-step', lists.new);
  let current = 0;
  let programmatic = false;
  let progTimer;
  const scale = () => longImg.offsetHeight / SRC[mode].h;
  function markStep(i) {
    current = i;
    steps.forEach((s, j) => { s.setAttribute('aria-selected', String(i === j)); s.tabIndex = i === j ? 0 : -1; });
    const st = Number(steps[i].dataset.stage);
    stages.forEach((li, j) => { li.classList.toggle('is-on', j === st); li.classList.toggle('is-done', j < st); });
  }
  function goStep(i, focus) {
    markStep(i);
    programmatic = true;
    clearTimeout(progTimer);
    scroller.scrollTo({ top: Number(steps[i].dataset.at) * scale(), behavior: smooth() });
    progTimer = setTimeout(() => { programmatic = false; }, 800);
    if (focus) steps[i].focus();
  }
  function bindSteps(list) {
    const items = $$('.tc-step', list);
    items.forEach((s, i) => {
      s.addEventListener('click', () => goStep(i));
      s.addEventListener('keydown', e => {
        const k = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
        if (k) { e.preventDefault(); goStep((i + k + items.length) % items.length, true); }
      });
    });
  }
  bindSteps(lists.new);
  bindSteps(lists.old);
  function onPhoneScroll() {
    const max = scroller.scrollHeight - scroller.clientHeight;
    const ratio = max > 0 ? scroller.scrollTop / max : 0;
    const track = meter.parentElement.clientHeight - meter.clientHeight;
    meter.style.transform = `translateY(${ratio * track}px)`;
    if (programmatic) return;
    const pos = (scroller.scrollTop + scroller.clientHeight * 0.3) / scale();
    let i = 0;
    steps.forEach((s, j) => { if (pos >= Number(s.dataset.at)) i = j; });
    if (scroller.scrollTop >= max - 2) i = steps.length - 1;
    if (i !== current) markStep(i);
  }
  scroller.addEventListener('scroll', () => requestAnimationFrame(onPhoneScroll), { passive: true });
  const modeBtns = $$('[data-mode]').filter(b => b.tagName === 'BUTTON');
  modeBtns.forEach(b => b.addEventListener('click', () => {
    if (b.dataset.mode === mode) return;
    mode = b.dataset.mode;
    modeBtns.forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    structure.dataset.mode = mode;
    lists.new.hidden = mode !== 'new';
    lists.old.hidden = mode !== 'old';
    steps = $$('.tc-step', lists[mode]);
    longImg.classList.add('is-swapping');
    setTimeout(() => {
      longImg.src = SRC[mode].src;
      longImg.height = SRC[mode].h;
      longImg.alt = SRC[mode].alt;
      scroller.scrollTop = 0;
      longImg.classList.remove('is-swapping');
      markStep(0);
      onPhoneScroll();
    }, reduced.matches ? 0 : 220);
  }));
  markStep(0);

  /* ---------- results ---------- */
  const metricsEl = $('#tc-metrics');
  const metrics = $$('.tc-metric', metricsEl);
  const note = $('#tc-metric-note');
  const tip = $('#tc-tip');
  let view = 'after';
  function fmt(v) { return `${v > 0 ? '+' : v < 0 ? '-' : ''}${Math.abs(v)}%`; }
  function countTo(el, target) {
    if (reduced.matches) { el.textContent = fmt(target); return; }
    const t0 = performance.now();
    (function tick(t) {
      const k = Math.min(1, (t - t0) / 900);
      el.textContent = fmt(Math.round(target * (1 - Math.pow(1 - k, 3))));
      if (k < 1 && view === 'after') requestAnimationFrame(tick);
    })(t0);
  }
  function setView(v) {
    view = v;
    $$('[data-view]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.view === v)));
    metricsEl.classList.toggle('is-before', v === 'before');
    metrics.forEach(m => {
      const num = $('.tc-metric-num', m);
      if (v === 'before') num.textContent = '基准 100';
      else countTo(num, Number(m.dataset.delta));
    });
  }
  $$('[data-view]').forEach(b => b.addEventListener('click', () => setView(b.dataset.view)));
  function focusMetric(m) {
    metrics.forEach(x => x.classList.toggle('is-on', x === m));
    note.innerHTML = `<b>${$('.tc-metric-label', m).textContent} ${fmt(Number(m.dataset.delta))}</b>${m.dataset.note}`;
  }
  metrics.forEach(m => {
    m.tabIndex = 0;
    m.addEventListener('mouseenter', () => focusMetric(m));
    m.addEventListener('focus', () => focusMetric(m));
    m.addEventListener('click', () => focusMetric(m));
  });
  $$('.tc-bar').forEach(b => {
    b.addEventListener('pointermove', e => {
      tip.hidden = false;
      tip.textContent = view === 'before' && b.classList.contains('tc-bar--after') ? '改版前 · 100' : b.dataset.tip;
      tip.style.left = `${e.clientX}px`;
      tip.style.top = `${e.clientY}px`;
    });
    b.addEventListener('pointerleave', () => { tip.hidden = true; });
  });
  // 进入视口时从「改版前」动到「改版后」
  if ('IntersectionObserver' in window && !reduced.matches) {
    setView('before');
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setTimeout(() => setView('after'), 350); io.disconnect(); }
    }, { threshold: 0.5 });
    io.observe(metricsEl);
  } else setView('after');

  /* ---------- 全部页面：点击查看完整页面 ---------- */
  const dialog = $('#tc-lightbox');
  const lbImg = $('#tc-lb-img');
  const lbBody = $('#tc-lb-body');
  const viewport = $('.tc-pages [data-all-pages]');
  let down = null;
  viewport.addEventListener('pointerdown', e => { down = { x: e.clientX, y: e.clientY, t: Date.now() }; });
  viewport.addEventListener('pointerup', e => {
    if (!down) return;
    const moved = Math.hypot(e.clientX - down.x, e.clientY - down.y);
    const quick = Date.now() - down.t < 400;
    down = null;
    if (moved > 6 || !quick) return;
    const fig = document.elementFromPoint(e.clientX, e.clientY)?.closest('.tc-ap');
    if (!fig) return;
    $('#tc-lb-title').textContent = fig.dataset.title;
    lbImg.src = fig.dataset.full;
    lbImg.alt = fig.dataset.title;
    lbBody.scrollTop = 0;
    if (typeof dialog.showModal === 'function') dialog.showModal();
  });
  $('#tc-lb-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', e => { if (e.target === dialog) dialog.close(); });
  dialog.addEventListener('close', () => lbImg.removeAttribute('src'));
})();
