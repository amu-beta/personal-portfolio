(() => {
  document.documentElement.classList.add('js');
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const smooth = () => (reduced.matches ? 'auto' : 'smooth');

  /* ---------- toast ---------- */
  const toast = $('#op-toast');
  let toastTimer;
  function say(msg) {
    toast.textContent = msg;
    toast.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('is-on'), 1800);
  }
  function replay(el, cls) {
    el.classList.remove(cls);
    void el.offsetWidth;
    el.classList.add(cls);
  }
  function visibleRatio(el) {
    const r = el.getBoundingClientRect();
    const h = Math.min(r.bottom, innerHeight) - Math.max(r.top, 0);
    return r.height ? Math.max(0, h) / Math.min(r.height, innerHeight) : 0;
  }

  /* ---------- progress + chapter rail ---------- */
  const bar = $('#op-progress-bar');
  const rail = $('.op-rail');
  const railLinks = $$('.op-rail a');
  const chapters = railLinks.map(a => $(a.getAttribute('href')));
  let ticking = false;
  function onScroll() {
    const max = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = `scaleX(${max > 0 ? Math.min(1, scrollY / max) : 0})`;
    const line = innerHeight * 0.35;
    let active = 0;
    chapters.forEach((sec, i) => { if (sec && sec.getBoundingClientRect().top <= line) active = i; });
    railLinks.forEach((a, i) => (i === active ? a.setAttribute('aria-current', 'location') : a.removeAttribute('aria-current')));
    ticking = false;
  }
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  addEventListener('resize', onScroll);
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

  /* ---------- generic tabs (roving focus) ---------- */
  function tabs(items, onSelect, { activeClass } = {}) {
    function select(i, focus) {
      items.forEach((t, j) => {
        t.setAttribute('aria-selected', String(i === j));
        t.tabIndex = i === j ? 0 : -1;
        if (activeClass) t.classList.toggle(activeClass, i === j);
      });
      onSelect(i);
      if (focus) items[i].focus();
    }
    items.forEach((t, i) => {
      t.addEventListener('click', () => select(i));
      t.addEventListener('keydown', e => {
        const k = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
        if (k) { e.preventDefault(); select((i + k + items.length) % items.length, true); }
      });
    });
    return select;
  }

  /* ---------- AIGC pipeline ---------- */
  const PIPE = [
    ['创意构思', '用 AI 发散创意灵感：以「港式新春夜景 + 团圆饭」为母题，快速试出多套主视觉方向，再和业务一起收敛到「沉浸式新春城市」，并确定好运狮 IP 形象。', '查看项目背景'],
    ['素材生成', 'Midjourney 模板化关键词 + 自训 LoRA，批量生成风格统一的 3D 菜品、祈福道具与人物 IP，抽奖弹窗也基于同一批素材快速拼装。', '查看 AIGC 设计资源'],
    ['视觉设计', '从生成结果中精选、合成、精修，搭建主会场城市长页、团圆饭玩法页与整套弹窗，统一视觉层级与品牌调性。', '查看主会场设计'],
    ['场景应用', '同一套素材复用到入口、团圆饭、新春卖场、许愿广场四个会场，并延展到社媒 KV、海报等多渠道物料。', '查看活动内容矩阵'],
    ['效果优化', '上线后追踪参与率、停留时长、转化率等数据，用数据驱动页面优化，并把经验沉淀回素材库与关键词库。', '查看设计验证数据'],
  ];
  const pipeSteps = $$('.op-pipe-step');
  const pipeShots = $('#op-pipe-shots');
  const pipeName = $('#op-pipe-name');
  const pipeText = $('#op-pipe-text');
  const pipeLink = $('#op-pipe-link');
  tabs(pipeSteps, i => {
    pipeShots.dataset.active = String(i);
    pipeName.innerHTML = `<b>0${i + 1}</b>${PIPE[i][0]}`;
    pipeText.textContent = PIPE[i][1];
    pipeLink.firstChild.textContent = PIPE[i][2];
    pipeLink.setAttribute('href', pipeSteps[i].dataset.target);
  });

  /* ---------- venue: design points + entry pins ---------- */
  const venue = $('#op-venue-phone');
  const points = $$('.op-point');
  const selectPoint = tabs(points, i => { venue.dataset.mode = String(i); });
  const ENTRY_TIP = {
    1: '团圆饭酒楼 · 集菜抽奖玩法，已切换到「团圆饭会场」',
    2: '新春卖场 · 特卖与名师咨询，已切换到「新春会场」',
    3: '许愿广场 · 许愿与红包雨，已切换到「许愿会场」',
  };
  $$('.op-pin').forEach(pin => pin.addEventListener('click', () => {
    if (venue.dataset.mode !== '2') selectPoint(2);
    const n = Number(pin.dataset.entry);
    if (n < 0) { say('品牌阁 · 品牌故事与名师矩阵，承接品牌认知'); return; }
    say(ENTRY_TIP[n]);
    goMatrix(n);
    $('#matrix').scrollIntoView({ behavior: smooth(), block: 'start' });
  }));

  /* ---------- strategy stages ---------- */
  const strategyPhone = $('#op-strategy-phone');
  const wire = $('#op-wire');
  tabs($$('.op-stage'), i => { strategyPhone.dataset.zone = String(i); wire.dataset.zone = String(i); });

  /* ---------- content matrix: auto carousel + wheel ---------- */
  const MATRIX = [
    {
      role: '分流 · 认知', title: '会场入口',
      desc: 'LuckNival 立体标题配合维港夜景，第一屏就交代「这是一场新春城市嘉年华」；四大玩法以建筑形式散落在城市中，用户无需阅读说明就知道往哪里点。',
      list: ['港式夜景建立国际化与本地文化的双重辨识度', '建筑即入口，四个玩法一屏可达', '人物 IP 散布场景，增加探索感'],
    },
    {
      role: '互动 · 拉新 · 留存', title: '团圆饭会场',
      desc: '「备风生水起团年饭」：集满 10 道菜即可抽奖。一家三口围坐圆桌，菜品逐道点亮，任务列表提供签到、好友助力、AI 团圆视频等获取次数的方式。',
      list: ['单一主线玩法，规则一句话讲清', '好友助力带来社交裂变与新用户', 'AI 团圆视频制造可分享的内容'],
    },
    {
      role: '付费转化', title: '新春会场',
      desc: '新春特卖场主打「最高 50% 折扣」，名师阵容作信任背书；测算、吉品、老师咨询三个分区承接活动中被激发的延伸付费需求。',
      list: ['名师形象 + 折扣数字双重强化吸引力', '测算 / 吉品 / 咨询分区，路径短', '商品卡统一评分与销量，降低决策成本'],
    },
    {
      role: '分享 · 情感连接', title: '许愿会场',
      desc: '在维港夜空下写下新年愿望：文字话题引导表达，愿望以弹幕形式滚动展示，红包雨倒计时制造回访理由，许愿人数实时增长营造热度。',
      list: ['话题模板降低 UGC 门槛', '弹幕式愿望墙放大参与感', '红包雨倒计时带动定时回访'],
    },
  ];
  const matrixBox = $('.op-matrix');
  const matrixBody = $('.op-matrix-body');
  const phones = $('#op-matrix-phones');
  const phoneImgs = $$('img', phones);
  const mxInfo = $('.op-matrix-info');
  let mxIndex = 0;
  function renderMatrix(i, animateInfo) {
    mxIndex = i;
    phones.dataset.active = String(i);
    phoneImgs.forEach((img, j) => {
      let o = (j - i + 4) % 4;
      if (o === 3) o = -1;
      const back = o === 2;
      img.style.setProperty('--o', back ? 0 : o);
      img.style.setProperty('--s', o === 0 ? 1 : back ? .68 : .82);
      img.style.setProperty('--op', o === 0 ? 1 : back ? .22 : .6);
      img.style.setProperty('--sat', o === 0 ? 1 : .6);
      img.style.setProperty('--z', o === 0 ? 3 : back ? 1 : 2);
    });
    const m = MATRIX[i];
    $('#op-mx-role').textContent = m.role;
    $('#op-mx-title').textContent = m.title;
    $('#op-mx-desc').textContent = m.desc;
    $('#op-mx-list').innerHTML = m.list.map(t => `<li>${t}</li>`).join('');
    if (animateInfo) replay(mxInfo, 'is-swapping');
  }
  let mxTimer = null;
  let mxInView = false;
  function startMatrix() {
    clearInterval(mxTimer);
    if (!mxInView || document.hidden) return;
    mxTimer = setInterval(() => renderMatrix((mxIndex + 1) % 4, true), 3200);
  }
  function goMatrix(i) { renderMatrix(i, true); startMatrix(); }
  phoneImgs.forEach((img, i) => img.addEventListener('click', () => goMatrix(i)));
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => { mxInView = e.isIntersecting; if (mxInView) startMatrix(); else clearInterval(mxTimer); }, { threshold: 0.35 }).observe(matrixBody);
  } else { mxInView = true; startMatrix(); }
  document.addEventListener('visibilitychange', () => (document.hidden ? clearInterval(mxTimer) : startMatrix()));
  // wheel: one notch / one gesture = one venue; at the first/last venue the page scrolls on
  let wheelLast = 0;
  let wheelStep = -1e9;
  matrixBox.addEventListener('wheel', e => {
    if (e.ctrlKey) return;
    const delta = Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
    if (!delta || visibleRatio(matrixBody) < 0.6) return;
    const now = performance.now();
    const continuing = now - wheelLast < 200;
    wheelLast = now;
    if (continuing && now - wheelStep < 1000) { e.preventDefault(); return; }
    const dir = delta > 0 ? 1 : -1;
    if ((dir > 0 && mxIndex === 3) || (dir < 0 && mxIndex === 0)) return;
    e.preventDefault();
    wheelStep = now;
    goMatrix(mxIndex + dir);
  }, { passive: false });
  renderMatrix(0, false);

  /* ---------- feast: collect 10 dishes ---------- */
  const GOAL = 10;
  const POPUPS = {
    0: ['assets/operations/popup-0.webp', '新用户引导 · 下载 APP +10 次抽菜', '新用户弹窗：下载 APP 加 10 次抽菜'],
    1: ['assets/operations/popup-1.webp', '集满 10 道菜 · 抽中神秘大奖', '抽奖结果弹窗：运气爆棚，抽中品牌 5 折券'],
    2: ['assets/operations/popup-2.webp', '获得主菜碎片', '获得主菜碎片弹窗：髮菜蚝豉汤，发财好事'],
    3: ['assets/operations/popup-3.webp', '获得祈福道具 · 万事顺意莲花灯', '获得祈福道具弹窗：万事顺意莲花灯'],
    4: ['assets/operations/popup-4.webp', '获得家常菜碎片', '获得家常菜碎片弹窗：清蒸鱼'],
  };
  Object.values(POPUPS).forEach(([src]) => { const im = new Image(); im.src = src; });
  const dishes = $$('.op-dish');
  const dishList = $('.op-dishes');
  const feastBar = $('#op-feast-bar');
  const feastCount = $('#op-feast-count');
  const feastHint = $('#op-feast-hint');
  const popupImg = $('#op-popup-img');
  const popupCap = $('#op-popup-caption');
  const thumbs = $$('.op-popup-thumb');
  function showPopup(n, custom) {
    const [src, cap, alt] = POPUPS[n];
    if (!popupImg.src.endsWith(src)) popupImg.src = src;
    popupImg.alt = alt;
    popupCap.textContent = custom || cap;
    thumbs.forEach(t => t.setAttribute('aria-pressed', String(t.dataset.popup === String(n))));
  }
  function renderFeast() {
    const n = dishes.filter(d => d.getAttribute('aria-pressed') === 'true').length;
    feastBar.style.width = `${(n / GOAL) * 100}%`;
    feastCount.textContent = `${n}/${GOAL}`;
    dishList.classList.toggle('is-full', n >= GOAL);
    feastHint.textContent = n >= GOAL ? '已集满，点击已上桌的菜可撤下' : n ? `还差 ${GOAL - n} 道菜` : '点击菜品端上桌';
    return n;
  }
  dishes.forEach(d => d.addEventListener('click', () => {
    const on = d.getAttribute('aria-pressed') === 'true';
    const count = dishes.filter(x => x.getAttribute('aria-pressed') === 'true').length;
    if (!on && count >= GOAL) { say('桌上已经摆满 10 道菜啦'); return; }
    d.setAttribute('aria-pressed', String(!on));
    const n = renderFeast();
    if (on) return;
    if (n === GOAL) { showPopup(1); say('集满 10 道菜，开始抽奖！'); }
    else showPopup(d.dataset.kind === 'main' ? 2 : 4, `${d.dataset.kind === 'main' ? '获得主菜碎片' : '获得家常菜碎片'} · ${d.dataset.name}`);
  }));
  $('#op-feast-reset').addEventListener('click', () => {
    dishes.forEach(d => d.setAttribute('aria-pressed', 'false'));
    renderFeast();
    showPopup(0);
  });
  thumbs.forEach(t => t.addEventListener('click', () => showPopup(Number(t.dataset.popup))));
  renderFeast();

  /* ---------- Midjourney template tags: show a sample per segment ---------- */
  const SAMPLES = [
    'Chinese New Year reunion dinner dish, braised abalone on a white porcelain plate, festive',
    '3D render, octane render, unreal engine 5, cinematic lighting, soft glow, PBR',
    'ultra-detailed, glossy surface, subsurface scattering, vibrant colors, clean background',
    '--ar 1:1 --v 6.1 --style raw --q 2',
  ];
  const sample = $('#op-sample');
  tabs($$('.op-chip'), i => { sample.textContent = SAMPLES[i]; });

  /* ---------- results: count up ---------- */
  const kpis = $('.op-kpis');
  function countUp() {
    kpis.classList.add('is-counted');
    $$('[data-to]', kpis).forEach(el => {
      const to = Number(el.dataset.to);
      if (reduced.matches) { el.textContent = to; return; }
      const t0 = performance.now();
      (function tick(t) {
        const p = Math.min(1, (t - t0) / 1100);
        el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(tick);
      })(t0);
    });
  }
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { countUp(); io.disconnect(); } }, { threshold: 0.3 });
    io.observe(kpis);
  } else countUp();

})();
