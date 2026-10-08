(() => {
  document.documentElement.classList.add('js');
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const smooth = () => (reduced.matches ? 'auto' : 'smooth');
  const DATA = JSON.parse($('#ov-data').textContent);
  const TOPICS = DATA.topics;

  /* ---------- toast ---------- */
  const toast = $('#ov-toast');
  let toastTimer;
  function say(msg) {
    toast.textContent = msg;
    toast.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('is-on'), 1600);
  }

  /* ---------- reading progress ---------- */
  const bar = $('#ov-progress-bar');
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
    }), { threshold: 0.06, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(el => io.observe(el));
    setTimeout(() => reveals.forEach(el => { if (el.getBoundingClientRect().top < innerHeight) el.classList.add('is-in'); }), 1200);
  } else reveals.forEach(el => el.classList.add('is-in'));

  /* ---------- topic filter ---------- */
  const filterBtns = $$('[data-filter]');
  const cardItems = $$('.ov-card-item');
  filterBtns.forEach(b => b.addEventListener('click', () => {
    const f = b.dataset.filter;
    filterBtns.forEach(x => { const on = x === b; x.classList.toggle('active', on); x.setAttribute('aria-pressed', String(on)); });
    cardItems.forEach(li => {
      const show = f === 'all' || li.dataset.cat === f;
      li.hidden = !show;
      li.classList.remove('is-entering');
      if (show) { void li.offsetWidth; li.classList.add('is-entering'); }
    });
  }));

  /* ---------- topic detail ---------- */
  const dlg = $('#ov-detail');
  const body = $('#ov-d-body');
  const scroller = $('#ov-d-scroll');
  const img = $('#ov-d-img');
  const meter = $('#ov-d-meter');
  const secList = $('#ov-d-sections');
  let current = -1;
  let opener = null;
  let secBtns = [];
  let programmatic = false;
  let progTimer;
  const indexOf = slug => TOPICS.findIndex(t => t.slug === slug);

  function el(tag, props = {}, children = []) {
    const n = document.createElement(tag);
    Object.entries(props).forEach(([k, v]) => {
      if (k === 'style') Object.entries(v).forEach(([p, val]) => n.style.setProperty(p, val));
      else if (k in n) n[k] = v;
      else n.setAttribute(k, v);
    });
    children.forEach(c => n.append(c));
    return n;
  }

  function isShort() { return img.offsetHeight > 0 && img.offsetHeight <= scroller.clientHeight + 4; }

  function render(i) {
    const t = TOPICS[i];
    current = i;
    const n = TOPICS.length;
    $('#ov-d-count').textContent = `${String(i + 1).padStart(2, '0')} / ${n}`;
    $('#ov-d-kicker').textContent = DATA.hideIndex ? DATA.cats[t.cat] : `${String(i + 1).padStart(2, '0')} · ${DATA.cats[t.cat]}`;
    $('#ov-d-name').textContent = t.name;
    $('#ov-d-slogan').textContent = `「${t.slogan}」`;
    $('#ov-d-desc').textContent = t.desc;

    img.alt = `${t.name} H5 完整页面`;
    img.width = t.w; img.height = t.h;
    img.src = t.img;
    scroller.scrollTop = 0;
    dlg.classList.toggle('is-short', t.h / t.w < 2.1);
    $('#ov-d-hint').textContent = t.partial ? '设计稿中仅展示该专题的首屏局部' : (t.h / t.w < 2.1 ? '该专题展示首屏完整画面' : '在手机里滚动，浏览完整页面');

    secList.replaceChildren(...t.sections.map((s, j) => el('li', {}, [
      el('button', { type: 'button', className: 'ui-segmented__item ov-d-sec', textContent: s.n, 'data-at': s.at, 'aria-current': String(j === 0) })
    ])));
    secBtns = $$('.ov-d-sec', secList);
    secBtns.forEach((b, j) => b.addEventListener('click', () => goSection(j)));

    const screens = $('#ov-d-screens');
    if (screens) {
      screens.hidden = !(t.screens && t.screens.length);
      if (t.screens) {
        $('#ov-d-screens-grid').replaceChildren(...t.screens.map((sc, k) => {
          const btn = el('button', { type: 'button', className: 'ui-segmented__item ov-d-screen', 'data-src': sc.img, 'data-title': `${t.name} · ${sc.n}`, 'data-w': sc.w, 'data-h': sc.h, 'aria-label': `放大查看：${sc.n}` }, [
            el('figure', {}, [el('img', { src: sc.img, width: sc.w, height: sc.h, alt: sc.n, loading: 'lazy', decoding: 'async' })]),
            el('span', { textContent: sc.n, 'data-n': String(k + 1).padStart(2, '0') })
          ]);
          btn.addEventListener('click', () => openBoard(btn));
          return el('li', {}, [btn]);
        }));
      }
    }

    $('#ov-d-points').replaceChildren(...t.points.map(p => el('li', { textContent: p })));

    $('#ov-d-colors').replaceChildren(...t.colors.map(c => el('li', {}, [
      el('button', { type: 'button', className: 'ui-segmented__item ov-d-color', style: { '--c': c.hex }, 'data-hex': c.hex, 'aria-label': `复制 ${c.n} ${c.hex}` }, [
        el('i'), el('span', {}, [el('strong', { textContent: c.n }), el('code', { textContent: c.hex })])
      ])
    ])));
    $$('.ov-d-color').forEach(b => b.addEventListener('click', () => copyHex(b)));

    const comp = $('#ov-d-comp');
    comp.hidden = !t.comp;
    if (t.comp) {
      $('#ov-d-comp-grid').replaceChildren(...t.comp.items.map(c => el('li', {}, [
        el('figure', {}, [el('img', { src: c.img, width: c.w, height: c.h, alt: c.n, loading: 'lazy', decoding: 'async' })]),
        el('span', { textContent: c.n })
      ])));
      const b = $('#ov-d-board');
      if (b) {
        b.dataset.src = t.comp.board;
        b.dataset.title = `${t.comp.title} · 视觉组件解析`;
        b.dataset.w = t.comp.w || 1920; b.dataset.h = t.comp.h || 2425;
      }
    }

    const prev = TOPICS[(i - 1 + n) % n];
    const next = TOPICS[(i + 1) % n];
    $('#ov-d-pager-prev strong').textContent = prev.name;
    $('#ov-d-pager-next strong').textContent = next.name;

    body.scrollTop = 0;
    updateMeter();
  }

  function setSection(j) { secBtns.forEach((b, k) => b.setAttribute('aria-current', String(j === k))); }

  function goSection(j) {
    setSection(j);
    programmatic = true;
    clearTimeout(progTimer);
    const at = Number(secBtns[j].dataset.at);
    const max = scroller.scrollHeight - scroller.clientHeight;
    scroller.scrollTo({ top: Math.min(max, img.offsetHeight * at), behavior: smooth() });
    progTimer = setTimeout(() => { programmatic = false; }, 700);
    if (matchMedia('(max-width: 767px)').matches) {
      const r = scroller.getBoundingClientRect();
      if (r.top < 0 || r.bottom > innerHeight) body.scrollBy({ top: r.top - 80, behavior: smooth() });
    }
  }

  function updateMeter() {
    const max = scroller.scrollHeight - scroller.clientHeight;
    const ratio = max > 0 ? scroller.scrollTop / max : 0;
    const track = meter.parentElement.clientHeight - meter.clientHeight;
    meter.style.transform = `translateY(${ratio * track}px)`;
    if (programmatic || !secBtns.length) return;
    if (max <= 4) return;
    const atBottom = scroller.scrollTop >= max - 4;
    const pos = (scroller.scrollTop + scroller.clientHeight * 0.3) / img.offsetHeight;
    let j = 0;
    secBtns.forEach((b, k) => { if (pos >= Number(b.dataset.at)) j = k; });
    if (atBottom) j = secBtns.length - 1;
    setSection(j);
  }
  scroller.addEventListener('scroll', () => requestAnimationFrame(updateMeter), { passive: true });
  img.addEventListener('load', updateMeter);

  async function copyHex(b) {
    const hex = b.dataset.hex;
    try { await navigator.clipboard.writeText(hex); say(`已复制 ${hex}`); }
    catch { say(hex); }
    b.classList.add('is-copied');
    setTimeout(() => b.classList.remove('is-copied'), 1200);
  }

  function open(i, { push = true, from = null } = {}) {
    if (i < 0) return;
    if (from) opener = from;
    const wasOpen = dlg.open;
    if (wasOpen) {
      dlg.classList.remove('is-swapping'); void dlg.offsetWidth; dlg.classList.add('is-swapping');
    }
    render(i);
    const hash = `#topic-${TOPICS[i].slug}`;
    if (push && location.hash !== hash) {
      if (wasOpen) history.replaceState({ ovTopic: true }, '', hash);
      else history.pushState({ ovTopic: true }, '', hash);
    }
    document.title = `${TOPICS[i].name}｜${DATA.title || '海外中文 · 视觉专题设计'}｜Chloe`;
    if (!wasOpen) {
      document.documentElement.classList.add('ov-locked');
      if (typeof dlg.showModal === 'function') dlg.showModal(); else dlg.setAttribute('open', '');
      $('#ov-d-back').focus();
    }
  }

  const baseTitle = document.title;
  function finishClose() {
    document.documentElement.classList.remove('ov-locked');
    document.title = baseTitle;
    if (opener && document.contains(opener)) opener.focus({ preventScroll: true });
    else {
      const card = $(`.ov-card[data-topic="${TOPICS[current]?.slug}"]`);
      if (card) { card.focus({ preventScroll: true }); card.scrollIntoView({ block: 'center' }); }
    }
    opener = null;
  }
  function close() {
    if (!dlg.open) return;
    if (history.state && history.state.ovTopic) history.back(); // popstate 会真正关闭
    else {
      history.replaceState(null, '', location.pathname + location.search + '#topics');
      dlg.close();
    }
  }
  dlg.addEventListener('close', finishClose);
  dlg.addEventListener('cancel', e => { e.preventDefault(); close(); });

  const step = d => open((current + d + TOPICS.length) % TOPICS.length);
  $('#ov-d-back').addEventListener('click', close);
  $('#ov-d-prev').addEventListener('click', () => step(-1));
  $('#ov-d-next').addEventListener('click', () => step(1));
  $('#ov-d-pager-prev').addEventListener('click', () => step(-1));
  $('#ov-d-pager-next').addEventListener('click', () => step(1));
  dlg.addEventListener('keydown', e => {
    if (e.target.closest('input, textarea')) return;
    if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
  });

  // 所有 data-topic 链接（卡片、组件区「查看这个专题」）
  $$('a[data-topic]').forEach(a => a.addEventListener('click', e => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    open(indexOf(a.dataset.topic), { from: a });
  }));

  function syncFromHash() {
    const m = location.hash.match(/^#topic-([\w-]+)$/);
    const i = m ? indexOf(m[1]) : -1;
    if (i >= 0) open(i, { push: false });
    else if (dlg.open) dlg.close();
  }
  addEventListener('popstate', syncFromHash);
  addEventListener('hashchange', syncFromHash);
  // 直接带 #topic-xxx 打开：先把列表放进历史，返回即回到列表
  const initial = location.hash.match(/^#topic-([\w-]+)$/);
  if (initial && indexOf(initial[1]) >= 0) {
    history.replaceState(null, '', location.pathname + location.search + '#topics');
    $('#topics').scrollIntoView();
    open(indexOf(initial[1]));
  }

  /* ---------- components tabs ---------- */
  const tabs = $$('.ov-comp-tabs [role="tab"]');
  function selectTab(i, focus) {
    tabs.forEach((t, j) => {
      const on = i === j;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      $(`#${t.getAttribute('aria-controls')}`).hidden = !on;
    });
    if (focus) tabs[i].focus();
  }
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => selectTab(i));
    t.addEventListener('keydown', e => {
      const k = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
      if (k) { e.preventDefault(); selectTab((i + k + tabs.length) % tabs.length, true); }
    });
  });

  /* ---------- boards lightbox ---------- */
  const lb = $('#ov-lightbox');
  const lbImg = $('#ov-lb-img');
  const lbBody = $('#ov-lb-body');
  const lbZoom = $('#ov-lb-zoom');
  let lbOpener = null;
  function openBoard(b) {
    lbOpener = b;
    $('#ov-lb-title').textContent = b.dataset.title;
    lbBody.classList.remove('is-loaded', 'is-zoomed');
    lbBody.classList.toggle('is-phone', Number(b.dataset.w) < 800);
    lbZoom.setAttribute('aria-pressed', 'false');
    lbImg.alt = b.dataset.title;
    lbImg.width = Number(b.dataset.w);
    lbImg.height = Number(b.dataset.h);
    lbImg.onload = () => lbBody.classList.add('is-loaded');
    lbImg.src = b.dataset.src;
    lbBody.scrollTop = 0;
    if (typeof lb.showModal === 'function') lb.showModal();
    else window.open(b.dataset.src, '_blank', 'noopener');
  }
  $$('.ov-board-open').forEach(b => b.addEventListener('click', () => openBoard(b)));
  $('#ov-d-board')?.addEventListener('click', e => openBoard(e.currentTarget));
  lbZoom.addEventListener('click', () => {
    const on = lbBody.classList.toggle('is-zoomed');
    lbZoom.setAttribute('aria-pressed', String(on));
  });
  $('#ov-lb-close').addEventListener('click', () => lb.close());
  lb.addEventListener('click', e => { if (e.target === lb) lb.close(); });
  lb.addEventListener('close', () => { lbImg.removeAttribute('src'); if (lbOpener) lbOpener.focus({ preventScroll: true }); });
})();
