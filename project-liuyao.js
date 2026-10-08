(() => {
  document.documentElement.classList.add('js');
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const smooth = () => (reduced.matches ? 'auto' : 'smooth');

  /* ---------- nav: progress, active chapter ---------- */
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
    toTop.hidden = y < innerHeight * 1.2;
    const line = nav.offsetHeight + 60;
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
  toTop.addEventListener('click', () => scrollTo({ top: 0, behavior: smooth() }));

  /* ---------- reveal ---------- */
  const reveals = $$('.reveal');
  if ('IntersectionObserver' in window && !reduced.matches) {
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
    }), { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });
    reveals.forEach(el => io.observe(el));
    // safety net: never leave content hidden
    setTimeout(() => reveals.forEach(el => { if (el.getBoundingClientRect().top < innerHeight) el.classList.add('is-in'); }), 1200);
  } else reveals.forEach(el => el.classList.add('is-in'));

  /* ---------- cover parallax ---------- */
  const stage = $('#cover-stage');
  if (stage && finePointer.matches && !reduced.matches) {
    const phone = $('.cover-phone', stage);
    const cards = $$('.float-card', stage);
    $('#cover').addEventListener('pointermove', e => {
      const r = stage.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width / 2) / r.width;
      const y = (e.clientY - r.top - r.height / 2) / r.height;
      phone.style.transform = `translate(${x * -10}px, ${y * -8}px)`;
      cards.forEach(c => { const d = Number(c.dataset.depth || 20); c.style.transform = `translate(${x * d}px, ${y * d}px) rotate(4deg)`; });
    });
    $('#cover').addEventListener('pointerleave', () => { phone.style.transform = ''; cards.forEach(c => { c.style.transform = ''; }); });
  }

  /* ---------- component library tabs ---------- */
  const libTabs = $$('[data-lib]');
  const libPanels = $$('[data-lib-panel]');
  function setLib(i, focus) {
    libTabs.forEach((t, j) => { t.setAttribute('aria-selected', String(j === i)); t.tabIndex = j === i ? 0 : -1; });
    libPanels.forEach((p, j) => { p.hidden = j !== i; });
    if (focus) libTabs[i].focus();
  }
  libTabs.forEach((t, i) => {
    t.addEventListener('click', () => setLib(i));
    t.addEventListener('keydown', e => {
      const k = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
      if (k) { e.preventDefault(); setLib((i + k + libTabs.length) % libTabs.length, true); }
    });
  });

  /* ---------- home zones (scroll-driven on desktop) ---------- */
  const homePhone = $('#home-phone');
  const mask = $('#zone-mask');
  const annoBtns = $$('#home-annos button');
  const scrolly = $('#home-scrolly');
  const hint = $('#scroll-hint');
  const wide = matchMedia('(min-width: 981px)');
  let zone = -1;
  function setZone(i) {
    if (i === zone) return;
    zone = i;
    const [a, b] = annoBtns[i].dataset.zone.split(',').map(Number);
    mask.style.top = a + '%';
    mask.style.bottom = (100 - b) + '%';
    homePhone.classList.add('is-zoning');
    annoBtns.forEach((x, j) => x.setAttribute('aria-pressed', String(j === i)));
    $('#zone-count').textContent = `${i + 1} / ${annoBtns.length}`;
    const end = i === annoBtns.length - 1;
    hint.classList.toggle('is-end', end);
    $('#scroll-hint-text').textContent = end ? '已看完全部区域，继续向下' : '继续向下滚动，查看下一个区域';
  }
  function zoneFromScroll() {
    if (!wide.matches) return;
    const r = scrolly.getBoundingClientRect();
    const range = r.height - innerHeight;
    const prog = Math.min(1, Math.max(0, -r.top / range));
    setZone(Math.min(annoBtns.length - 1, Math.floor(prog * annoBtns.length)));
  }
  annoBtns.forEach((btn, i) => btn.addEventListener('click', () => {
    if (wide.matches) {
      const r = scrolly.getBoundingClientRect();
      const range = r.height - innerHeight;
      const top = scrollY + r.top + range * ((i + 0.5) / annoBtns.length);
      scrollTo({ top, behavior: smooth() });
    }
    setZone(i);
  }));
  addEventListener('scroll', () => requestAnimationFrame(zoneFromScroll), { passive: true });
  wide.addEventListener('change', zoneFromScroll);
  setZone(0);
  zoneFromScroll();

  /* ---------- cast prototype ---------- */
  const TRI = { '111': '乾', '110': '兑', '101': '离', '100': '震', '011': '巽', '010': '坎', '001': '艮', '000': '坤' }; // 初→上，1 = 阳
  const ORDER = ['乾', '兑', '离', '震', '巽', '坎', '艮', '坤'];
  const NAMES = [
    ['乾为天', '天泽履', '天火同人', '天雷无妄', '天风姤', '天水讼', '天山遁', '天地否'],
    ['泽天夬', '兑为泽', '泽火革', '泽雷随', '泽风大过', '泽水困', '泽山咸', '泽地萃'],
    ['火天大有', '火泽睽', '离为火', '火雷噬嗑', '火风鼎', '火水未济', '火山旅', '火地晋'],
    ['雷天大壮', '雷泽归妹', '雷火丰', '震为雷', '雷风恒', '雷水解', '雷山小过', '雷地豫'],
    ['风天小畜', '风泽中孚', '风火家人', '风雷益', '巽为风', '风水涣', '风山渐', '风地观'],
    ['水天需', '水泽节', '水火既济', '水雷屯', '水风井', '坎为水', '水山蹇', '水地比'],
    ['山天大畜', '山泽损', '山火贲', '山雷颐', '山风蛊', '山水蒙', '艮为山', '山地剥'],
    ['地天泰', '地泽临', '地火明夷', '地雷复', '地风升', '地水师', '地山谦', '坤为地']
  ]; // [上卦][下卦]
  const POS = ['初爻', '二爻', '三爻', '四爻', '五爻', '上爻'];
  const KIND = { 6: ['老阴', 0, '×'], 7: ['少阳', 1, ''], 8: ['少阴', 0, ''], 9: ['老阳', 1, '○'] };
  const hexName = l => NAMES[ORDER.indexOf(TRI[l.slice(3, 6).join('')])][ORDER.indexOf(TRI[l.slice(0, 3).join('')])];
  const cast = { vals: [], busy: false };
  const coins = $$('#coins .coin'), coinBox = $('#coins'), linesEl = $('#cast-lines'), dots = $$('#cast-dots li');
  const castBtn = $('#cast-btn'), castAll = $('#cast-all'), turtle = $('#turtle');
  function renderCast() {
    const n = cast.vals.length;
    $('#cast-count').textContent = `已起爻 ${n} / 6`;
    dots.forEach((d, i) => d.classList.toggle('on', i < n));
    castBtn.textContent = n === 6 ? '起卦完成' : `起${POS[n]}`;
    castBtn.disabled = castAll.disabled = turtle.disabled = n === 6 || cast.busy;
    if (n === 6) {
      const ben = cast.vals.map(v => KIND[v][1]);
      const bian = cast.vals.map(v => (v === 6 ? 1 : v === 9 ? 0 : KIND[v][1]));
      const moving = cast.vals.map((v, i) => (v === 6 || v === 9 ? POS[i] : null)).filter(Boolean);
      $('#cr-ben').textContent = hexName(ben);
      $('#cr-bian').textContent = moving.length ? hexName(bian) : '无变卦';
      $('#cr-dong').textContent = '动爻：' + (moving.length ? moving.join('、') : '无（静卦）');
      $('#cast-result').hidden = false;
    } else $('#cast-result').hidden = true;
  }
  function addLine(v, i) {
    const [kind, yang, mark] = KIND[v];
    const li = document.createElement('li');
    li.innerHTML = `<span>${POS[i]}</span><i class="${yang ? '' : 'yin'}${mark ? ' moving' : ''}" data-m="${mark}"></i><b>${yang ? '阳爻' : '阴爻'} · ${kind}</b>`;
    li.setAttribute('aria-label', `${POS[i]}：${yang ? '阳爻' : '阴爻'}，${kind}${mark ? '，动爻' : ''}`);
    linesEl.append(li);
  }
  function castOne() {
    return new Promise(resolve => {
      if (cast.vals.length >= 6) return resolve();
      const faces = [0, 1, 2].map(() => Math.random() < 0.5); // 背 = 3，字 = 2
      const v = faces.reduce((s, back) => s + (back ? 3 : 2), 0);
      const finish = () => { coins.forEach((c, i) => c.classList.toggle('is-back', faces[i])); cast.vals.push(v); addLine(v, cast.vals.length - 1); resolve(); };
      if (reduced.matches) return finish();
      coinBox.classList.remove('is-tossing'); void coinBox.offsetWidth; coinBox.classList.add('is-tossing');
      turtle.classList.remove('is-shaking'); void turtle.offsetWidth; turtle.classList.add('is-shaking');
      setTimeout(finish, 520);
    });
  }
  async function doCast(all) {
    if (cast.busy) return;
    cast.busy = true; renderCast();
    if (all) { while (cast.vals.length < 6) { await castOne(); await new Promise(r => setTimeout(r, reduced.matches ? 0 : 160)); } }
    else await castOne();
    cast.busy = false; renderCast();
  }
  castBtn.addEventListener('click', () => doCast(false));
  turtle.addEventListener('click', () => doCast(false));
  castAll.addEventListener('click', () => doCast(true));
  $('#cast-reset').addEventListener('click', () => { cast.vals = []; linesEl.replaceChildren(); coins.forEach(c => c.classList.remove('is-back')); renderCast(); });
  renderCast();
  if ('DeviceMotionEvent' in window && typeof DeviceMotionEvent.requestPermission !== 'function') {
    let last = 0;
    addEventListener('devicemotion', e => {
      const a = e.accelerationIncludingGravity; if (!a) return;
      const f = Math.abs(a.x || 0) + Math.abs(a.y || 0) + Math.abs(a.z || 0);
      const r = $('#cast-phone').getBoundingClientRect();
      if (f > 38 && Date.now() - last > 1200 && r.top < innerHeight && r.bottom > 0) { last = Date.now(); doCast(false); }
    });
  }
  const castScreen = $('.cast-screen');
  const ppBtns = $$('#pp-annos button');
  ppBtns.forEach(b => {
    const on = () => { castScreen.className = 'phone-screen cast-screen hl-' + b.dataset.hl; ppBtns.forEach(x => x.classList.toggle('is-on', x === b)); };
    b.addEventListener('mouseenter', on); b.addEventListener('focus', on); b.addEventListener('click', on);
  });
  $('#pp-annos').addEventListener('mouseleave', () => { castScreen.className = 'phone-screen cast-screen'; ppBtns.forEach(x => x.classList.remove('is-on')); });

  /* ---------- result phone ---------- */
  const rsScroll = $('#rs-scroll'), rsImg = $('#rs-img');
  const rsItems = $$('#rs-items button'), rsTabs = $$('#rs-tabs button');
  const scrollRs = pos => rsScroll.scrollTo({ top: Math.max(0, rsImg.offsetHeight * pos - 14), behavior: smooth() });
  rsItems.forEach(b => b.addEventListener('click', () => { rsItems.forEach(x => x.setAttribute('aria-pressed', String(x === b))); scrollRs(Number(b.dataset.pos)); }));
  rsTabs.forEach(b => b.addEventListener('click', () => scrollRs(Number(b.dataset.pos))));
  let rsTick = false;
  rsScroll.addEventListener('scroll', () => {
    if (rsTick) return; rsTick = true;
    requestAnimationFrame(() => {
      const f = (rsScroll.scrollTop + 40) / rsImg.offsetHeight;
      let idx = 0; rsTabs.forEach((t, i) => { if (f >= Number(t.dataset.pos)) idx = i; });
      rsTabs.forEach((t, i) => t.setAttribute('aria-pressed', String(i === idx)));
      const max = rsScroll.scrollHeight - rsScroll.clientHeight;
      $('#rs-pct').textContent = `已阅读 ${max > 0 ? Math.round(rsScroll.scrollTop / max * 100) : 0}%`;
      rsTick = false;
    });
  }, { passive: true });

  /* ---------- zoom dialog (screens, spec images, process image) ---------- */
  const dialog = $('#image-dialog');
  let group = [], sel = 0, opener;
  function show(i) {
    sel = (i + group.length) % group.length;
    const it = group[sel];
    $('#large-image').src = it.dataset.zoom;
    $('#large-image').alt = it.dataset.ztitle;
    $('#image-title').textContent = group.length > 1 ? `${it.dataset.ztitle} · ${sel + 1} / ${group.length}` : it.dataset.ztitle;
    dialog.classList.toggle('is-tall', it.dataset.group === 'screens');
    $('#image-prev').hidden = $('#image-next').hidden = group.length < 2;
    $('.image-scroll').scrollTop = 0;
  }
  $$('[data-zoom]').forEach(el => el.addEventListener('click', e => {
    opener = el;
    group = $$(`[data-zoom][data-group="${el.dataset.group}"]`);
    show(group.indexOf(el));
    dialog.showModal();
    $('#image-close').focus();
  }));
  $('#image-close').addEventListener('click', () => dialog.close());
  $('#image-prev').addEventListener('click', () => show(sel - 1));
  $('#image-next').addEventListener('click', () => show(sel + 1));
  dialog.addEventListener('click', e => { if (e.target === dialog) dialog.close(); });
  dialog.addEventListener('close', () => opener?.focus({ preventScroll: true }));
  dialog.addEventListener('keydown', e => {
    if (group.length < 2) return;
    if (e.key === 'ArrowRight') { e.preventDefault(); show(sel + 1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); show(sel - 1); }
  });
})();
