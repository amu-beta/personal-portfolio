/* 先知命局 · 交互与动效
   - 阅读进度、进入视口动画、数字滚动
   - 案例各章节的联动交互（策略 / 框架 / 聚光标注 / A/B）
   - 付费弹窗链路可交互原型
   - 全部页面展示：弧形滚动带 + 拖动 + 长页面自动滚动 + 放大查看 */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.body.classList.add('sq-js');

  /* 进入视口一次 */
  const once = (el, cb, threshold = 0.25, rootMargin = '0px') => {
    if (!el) return;
    if (!('IntersectionObserver' in window)) { cb(); return; }
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { io.disconnect(); cb(); } }), { threshold, rootMargin });
    io.observe(el);
  };
  /* 可见性持续监听（用于暂停自动轮播） */
  const watch = (el, cb, threshold = 0.2) => {
    if (!el) return;
    if (!('IntersectionObserver' in window)) { cb(true); return; }
    new IntersectionObserver(es => es.forEach(e => cb(e.isIntersecting)), { threshold }).observe(el);
  };
  /* 简易自动轮播：可见时运行，用户交互后停止 */
  const autoCycle = (host, count, apply, ms = 2800) => {
    let i = 0, timer = 0, stopped = false, visible = false;
    const tick = () => { apply(i); i = (i + 1) % count; };
    const run = () => { clearInterval(timer); if (!stopped && visible && !document.hidden) { tick(); timer = setInterval(tick, ms); } };
    watch(host, v => { visible = v; run(); }, 0.35);
    document.addEventListener('visibilitychange', run);
    return { stop() { stopped = true; clearInterval(timer); } };
  };

  /* ---------- 1. 阅读进度 ---------- */
  const bar = $('.sq-progress i');
  let ticking = false;
  const onScroll = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    if (bar) bar.style.transform = `scaleX(${max > 0 ? Math.min(1, scrollY / max) : 0})`;
    ticking = false;
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  /* ---------- 2. 进入视口动画 ---------- */
  const revealSel = [
    '.project-detail-overview > *', '.seerq-section-heading', '.seerq-subheading', '.seerq-section-ruler', '.seerq-framework-ruler', '.seerq-ab-intro',
    '.seerq-star-grid > article', '.seerq-journey-card', '.seerq-insight-right > *', '.seerq-goal-map > *', '.seerq-callout',
    '.seerq-report-collage', '.seerq-report-flow', '.seerq-strategy-evidence', '.seerq-strategy-summary', '.seerq-four-cards > article',
    '.seerq-language-grid > article', '.seerq-component-grid > *', '.seerq-library-row', '.seerq-framework > *',
    '.seerq-home-delivery > figure', '.seerq-home-notes > article', '.seerq-segment-figure', '.seerq-ab-grid > figure', '.seerq-light-note',
    '.seerq-service-showcase > *', '.seerq-info-grid > *', '.seerq-consult-grid > *', '.seerq-live-grid > *',
    '.seerq-growth-copy > *', '.seerq-growth-visual', '.seerq-popup-model > *', '.sq-proto',
    '.seerq-result-grid > article', '.seerq-summary-pills > span', '.project-detail-end'
  ].join(',');
  const reveals = $$(revealSel);
  if (!REDUCED && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
    }), { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(el => {
      if (el.getBoundingClientRect().top < innerHeight * 0.92) return; // 首屏内容不做隐藏，避免闪烁
      const sibs = [...el.parentElement.children].filter(c => reveals.includes(c));
      el.style.setProperty('--sq-d', `${Math.min(sibs.indexOf(el), 6) * 80}ms`);
      el.classList.add('sq-reveal');
      io.observe(el);
    });
  }

  /* ---------- 3. 数字滚动 ---------- */
  const countUp = el => {
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) { if (/\d/.test(node.nodeValue)) break; }
    if (!node) return;
    const m = node.nodeValue.match(/(\d[\d,]*\.?\d*)/);
    if (!m) return;
    const raw = m[1], target = parseFloat(raw.replace(/,/g, ''));
    const decimals = (raw.split('.')[1] || '').length, comma = raw.includes(',');
    const before = node.nodeValue.slice(0, m.index), after = node.nodeValue.slice(m.index + raw.length);
    const fmt = v => { const t = v.toFixed(decimals); return comma ? Number(t).toLocaleString('en-US', { minimumFractionDigits: decimals }) : t; };
    if (REDUCED) return;
    const host = el.closest('article') || el;
    node.nodeValue = before + fmt(0) + after;
    once(el, () => {
      const t0 = performance.now(), dur = 1500;
      const step = now => {
        const p = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - p, 3);
        node.nodeValue = before + fmt(target * e) + after;
        if (p < 1) requestAnimationFrame(step); else host.classList.add('is-done');
      };
      requestAnimationFrame(step);
    }, 0.6);
  };
  $$('.seerq-hero-stats strong, .seerq-result-mini-grid strong, .seerq-inline-metrics strong, .seerq-ab-grid figcaption b span, .seerq-result-grid b').forEach(countUp);

  /* ---------- 4. Hero：项目重点轮流高亮 ---------- */
  const heroTabs = $$('.seerq-hero-tabs span');
  if (heroTabs.length && !REDUCED) autoCycle($('.seerq-hero-board'), heroTabs.length, i => heroTabs.forEach((t, j) => t.classList.toggle('is-on', i === j)), 2200);

  /* ---------- 5. STAR 依次点亮 ---------- */
  const star = $$('.seerq-star-grid > article');
  once($('.seerq-star-grid'), () => star.forEach((a, i) => setTimeout(() => a.classList.add('is-lit'), REDUCED ? 0 : 250 + i * 260)), 0.3);

  /* ---------- 6. 思考点轮播 ---------- */
  const dl = $('.seerq-question-card dl');
  if (dl) {
    const dts = $$('dt', dl);
    const groups = dts.map(dt => {
      const g = document.createElement('div');
      g.className = 'sq-q';
      const dd = dt.nextElementSibling;
      dl.insertBefore(g, dt); g.append(dt); if (dd && dd.tagName === 'DD') g.append(dd);
      return g;
    });
    const set = i => groups.forEach((g, j) => g.classList.toggle('is-active', i === j));
    const cyc = autoCycle(dl, groups.length, set, 2600);
    groups.forEach((g, i) => g.addEventListener('mouseenter', () => { cyc.stop(); set(i); }));
  }

  /* ---------- 7. 洞察报告：流转逐步点亮 ---------- */
  const flow = $('.seerq-report-flow');
  if (flow && !REDUCED) {
    const parts = [...flow.children];
    autoCycle(flow, parts.length + 2, i => parts.forEach((p, j) => p.classList.toggle('is-on', j === i)), 900);
  }

  /* ---------- 8. 策略拆解：问题 ↔ 目标 ---------- */
  const pills = $$('.seerq-outline-pills span');
  const four = $('.seerq-four-cards');
  if (pills.length && four) {
    const cards = $$('article', four);
    const MAP = [[0, 2], [1, 3], [2, 0]];
    const set = i => {
      pills.forEach((p, j) => { p.classList.toggle('is-on', i === j); p.setAttribute('aria-pressed', String(i === j)); });
      four.classList.toggle('has-focus', i >= 0);
      cards.forEach((c, j) => c.classList.toggle('is-match', i >= 0 && MAP[i].includes(j)));
    };
    const cyc = autoCycle(four.parentElement, pills.length, set, 2600);
    pills.forEach((p, i) => {
      p.classList.add('sq-pressable'); p.setAttribute('role', 'button'); p.tabIndex = 0;
      const go = () => { cyc.stop(); set(pills[i].classList.contains('is-on') ? -1 : i); };
      p.addEventListener('click', go);
      p.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
    });
    const hint = document.createElement('p');
    hint.className = 'sq-hint'; hint.textContent = '点选问题，查看对应的设计策略';
    pills[0].parentElement.after(hint);
  }

  /* ---------- 9. 框架重构：问题 → 重构 → 原型 ---------- */
  const fw = $('.seerq-framework');
  if (fw) {
    const probs = $$('.seerq-problem-stack span', fw), rebuild = $$('.seerq-rebuild-stack span', fw), wire = $$('.seerq-wireframe span', fw);
    const MAP = [{ r: 0, w: [0] }, { r: 1, w: [2, 3] }, { r: 1, w: [1] }, { r: 1, w: [3, 4] }, { r: 2, w: [4] }];
    const set = i => {
      fw.classList.toggle('has-focus', i >= 0);
      probs.forEach((p, j) => { p.classList.toggle('is-on', i === j); p.setAttribute('aria-pressed', String(i === j)); });
      rebuild.forEach((r, j) => r.classList.toggle('is-on', i >= 0 && MAP[i].r === j));
      wire.forEach((w, j) => w.classList.toggle('is-on', i >= 0 && MAP[i].w.includes(j)));
    };
    const wf = $('.seerq-wireframe', fw);
    if (wf && !REDUCED) {
      wire.forEach((w, i) => w.style.setProperty('--i', i));
      wf.classList.add('sq-build');
      once(wf, () => { wf.classList.add('is-built'); setTimeout(() => wf.classList.remove('sq-build', 'is-built'), 1600); }, 0.3);
    }
    let cyc;
    setTimeout(() => { cyc = autoCycle(fw, probs.length, set, 2600); }, REDUCED ? 0 : 1800);
    probs.forEach((p, i) => {
      p.classList.add('sq-pressable'); p.setAttribute('role', 'button'); p.tabIndex = 0;
      const go = () => { cyc && cyc.stop(); set(p.classList.contains('is-on') ? -1 : i); };
      p.addEventListener('click', go);
      p.addEventListener('mouseenter', () => { cyc && cyc.stop(); set(i); });
      p.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
    });
  }

  /* ---------- 10. 聚光标注 ---------- */
  // 每个洞画完回到左上角，连接线重合不会产生多余区域
  const polyHole = b => `${b.x}% ${b.y}%, ${b.x + b.w}% ${b.y}%, ${b.x + b.w}% ${b.y + b.h}%, ${b.x}% ${b.y + b.h}%, ${b.x}% ${b.y}%, 0% 0%`;
  const NONE = { x: 50, y: 50, w: 0, h: 0 };
  const spotlight = (figure, opts = {}) => {
    figure.classList.add('sq-spot-host');
    const layer = document.createElement('div');
    layer.className = 'sq-spot'; layer.setAttribute('aria-hidden', 'true');
    if (opts.clip) layer.style.clipPath = opts.clip;
    const dim = document.createElement('i'); dim.className = 'sq-spot-dim'; layer.append(dim);
    const boxes = [0, 1, 2].map(() => { const b = document.createElement('i'); b.className = 'sq-spot-box'; b.innerHTML = '<em></em>'; layer.append(b); return b; });
    figure.append(layer);
    return list => {
      const l = list || [];
      layer.classList.toggle('is-on', l.length > 0);
      const holes = [0, 1, 2].map(k => l[k] || NONE);
      dim.style.clipPath = `polygon(evenodd, 0% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 0%, ${holes.map(polyHole).join(', ')})`;
      boxes.forEach((b, k) => {
        const d = l[k];
        b.classList.toggle('is-on', !!d);
        if (!d) return;
        b.style.cssText = `--x:${d.x}%;--y:${d.y}%;--w:${d.w}%;--h:${d.h}%`;
        b.classList.toggle('is-low', d.y < 9);
        b.firstChild.textContent = d.label || '';
      });
    };
  };
  const bindSpots = (figure, triggers, opts) => {
    if (!figure || !triggers.length) return;
    const show = spotlight(figure, opts);
    const set = i => {
      triggers.forEach((t, j) => t.els.forEach(el => el.classList.toggle(t.cls || 'is-on', i === j)));
      show(i >= 0 ? triggers[i].boxes : null);
    };
    const cyc = autoCycle(figure.parentElement, triggers.length, set, 3000);
    triggers.forEach((t, i) => t.els.forEach(el => {
      el.classList.add('sq-spot-trigger', 'sq-pressable');
      el.addEventListener('mouseenter', () => { cyc.stop(); set(i); });
      el.addEventListener('click', () => { cyc.stop(); set(i); });
    }));
    figure.parentElement.addEventListener('mouseleave', () => { if (cyc) set(-1); });
  };

  // 首页方案落地：说明卡片 ↔ 改版首页
  const homeFig = $('.seerq-home-delivery > figure');
  const notes = $$('.seerq-home-notes > article');
  if (homeFig && notes.length >= 3) {
    const h4 = $$('h4', notes[2]);
    const pairOf = h => [h, h.nextElementSibling].filter(Boolean);
    bindSpots(homeFig, [
      { els: [notes[0]], boxes: [{ x: 9, y: 9.4, w: 82, h: 13.4, label: 'AI 对话入口' }] },
      { els: [notes[1]], boxes: [{ x: 9, y: 23.2, w: 82, h: 13.6, label: '① 核心服务' }, { x: 9, y: 37.6, w: 82, h: 42.3, label: '② 内容运营' }, { x: 9, y: 80.6, w: 82, h: 16.4, label: '③ 服务转化' }] },
      h4[0] && { els: pairOf(h4[0]), cls: 'is-on', boxes: [{ x: 9, y: 29.6, w: 82, h: 7, label: '通用图标入口' }] },
      h4[1] && { els: pairOf(h4[1]), cls: 'is-on', boxes: [{ x: 9, y: 37.6, w: 82, h: 33.6, label: '卡片分区 · Live&Oncall' }] },
      h4[2] && { els: pairOf(h4[2]), cls: 'is-on', boxes: [{ x: 9, y: 23.2, w: 82, h: 6.4, label: '核心功能前置' }] }
    ].filter(Boolean), { clip: 'inset(1.98% 7.17% 2.56% 7.17% round 16px)' });
  }

  // 商城测算：三条策略 ↔ 测算页
  const shopFig = $('.seerq-figma-phone--shop');
  const shopH3 = $$('.seerq-service-copy h3');
  if (shopFig && shopH3.length >= 3) {
    const pairOf = h => [h, h.nextElementSibling].filter(Boolean);
    bindSpots(shopFig, [
      { els: pairOf(shopH3[0]), boxes: [{ x: 2, y: 12.4, w: 64, h: 6, label: '分类前置' }, { x: 2, y: 19.6, w: 96, h: 6, label: '免费试用' }] },
      { els: pairOf(shopH3[1]), boxes: [{ x: 2, y: 28.6, w: 96, h: 58.4, label: '主标题 + 副标题' }] },
      { els: pairOf(shopH3[2]), boxes: [{ x: 75, y: 38.8, w: 22.5, h: 46, label: '1 步下单' }] }
    ]);
  }

  // 咨询页面：用户疑问 ↔ 信息架构 ↔ 列表页
  const table = $('.seerq-consult-table');
  const consultFig = $('.seerq-consult-grid > figure');
  if (table && consultFig) {
    const cells = [...table.children].filter(c => c.tagName !== 'B');
    const rows = [];
    for (let i = 0; i + 2 < cells.length; i += 3) rows.push(cells.slice(i, i + 3));
    const BOX = [
      [{ x: 2, y: 7.6, w: 96, h: 15.6, label: '搜索 + 分类标签' }],
      [{ x: 3, y: 48.2, w: 45, h: 3.6, label: '价格前置' }, { x: 51, y: 48.2, w: 46, h: 3.6, label: '' }],
      [{ x: 3, y: 25.6, w: 45, h: 12.8, label: '头像 · 姓名 · 在线' }, { x: 51, y: 25.6, w: 46, h: 12.8, label: '' }],
      [{ x: 3, y: 40.4, w: 94, h: 7, label: '擅长领域 · 服务说明' }],
      [{ x: 3, y: 37.2, w: 94, h: 3.2, label: '评分 + 咨询人数' }]
    ];
    bindSpots(consultFig, rows.slice(0, BOX.length).map((els, i) => ({ els, cls: 'sq-row-on', boxes: BOX[i] })));
  }

  /* ---------- 11. A/B：点击率对比条 ---------- */
  const abCaps = $$('.seerq-ab-grid figcaption');
  const abRaw = [3.21, 6.39], abMax = 6.39; // 两个方案的 AI 点击率提升
  abCaps.forEach((c, i) => {
    const s = document.createElement('span');
    s.className = 'sq-ab-bar'; s.setAttribute('aria-hidden', 'true');
    s.innerHTML = `<i style="--v:${(abRaw[i] || abMax) / abMax}"></i>`;
    c.querySelector('b').after(s);
    once(c, () => s.classList.add('is-in'), 0.6);
  });

  /* ---------- 12. AI 增长：前后手机切换 ---------- */
  const gFront = $('.seerq-growth-phone--front'), gBack = $('.seerq-growth-phone--back');
  if (gFront && gBack) {
    const swap = () => {
      const a = $('.seerq-growth-phone--front'), b = $('.seerq-growth-phone--back');
      a.classList.replace('seerq-growth-phone--front', 'seerq-growth-phone--back');
      b.classList.replace('seerq-growth-phone--back', 'seerq-growth-phone--front');
    };
    [gFront, gBack].forEach(f => { f.setAttribute('role', 'button'); f.tabIndex = 0; f.setAttribute('aria-label', '切换前后两张页面'); f.addEventListener('click', () => { if (f.classList.contains('seerq-growth-phone--back')) swap(); }); f.addEventListener('keydown', e => { if (e.key === 'Enter') swap(); }); });
  }

  /* ---------- 13. 倒计时（原型里的所有 29:59:99） ---------- */
  const cds = $$('.sq-cd');
  const cdStart = performance.now();
  const total = (29 * 60 + 59) * 1000 + 990;
  const pad = n => String(n).padStart(2, '0');
  const cdTick = now => {
    const left = Math.max(0, total - ((now - cdStart) % total));
    const txt = `${pad(Math.floor(left / 60000))}:${pad(Math.floor(left / 1000) % 60)}:${pad(Math.floor(left / 10) % 100)}`;
    cds.forEach(c => { if (c.offsetParent !== null) c.textContent = txt; });
    requestAnimationFrame(cdTick);
  };
  if (cds.length && !REDUCED) requestAnimationFrame(cdTick);

  /* ---------- 14. 付费弹窗链路原型 ---------- */
  const proto = $('#sq-proto');
  if (proto) {
    const screen = $('.sq-proto-screen', proto);
    const layers = $$('[data-s]', screen);
    const steps = $$('.sq-proto-step', proto);
    const toastEl = $('.sq-proto-toast', proto);
    const tap = $('.sq-tap', proto);
    const spec = $('.sq-proto-spec', proto);
    const SPEC = [
      { kicker: 'STEP 01 · 免费结果页', title: '抽牌结果：在“有疑惑”的情绪点承接咨询', intent: '先给用户免费的抽牌结果建立信任，再在结果下方前置「找老师解读具体问题」，把老师卡片做成可横滑的轻量入口，引导用户自然进入一对一咨询。',
        motion: [['触发', '点击老师卡片「问问 TA」'], ['转场', '页面 Push：新页从右侧推入，旧页左移 28% 并压暗'], ['时长', '520ms'], ['曲线', 'cubic-bezier(.22,.8,.2,1)']], ease: [0.22, 0.8, 0.2, 1], dur: 2600 },
      { kicker: 'STEP 02 · 付费解锁', title: '内容半遮挡 + 次日全额返还，降低风险顾虑', intent: '老师回复被模糊处理，只露出“看得见的价值”；卡片与底部条双重承接，利益点「次日全额返还」放在价格之前，倒计时制造限时感。',
        motion: [['触发', '用户点击左上角返回（试图离开）'], ['倒计时', '每 10ms 刷新，30 分钟循环'], ['按钮', '底部吸附条常驻，减少回找成本'], ['曲线', '线性计时 · 无缓动']], ease: [0, 0, 1, 1], dur: 3200 },
      { kicker: 'STEP 03 · 退出挽留', title: '金蛋挽留：用惊喜感打断离开', intent: '在用户离开的瞬间弹出「你被幸运金蛋砸中啦」，叠加「次日全额返还 + 免费老师咨询」两项福利；主按钮「现在解锁」与次按钮「放弃福利」用颜色区分主次。',
        motion: [['遮罩', '淡入 300ms'], ['弹窗', 'Spring 缩放 0.55 → 1，620ms，回弹约 6%'], ['氛围', '高光扫过 2.6s 循环 + 主按钮呼吸 1.6s'], ['曲线', 'cubic-bezier(.34,1.56,.64,1)']], ease: [0.34, 1.56, 0.64, 1], dur: 3200 },
      { kicker: 'STEP 04 · 最后机会', title: '价格锚点再降门槛：USD$1.39 → 0.89', intent: '放弃福利后给出最后一次机会：用划线原价做锚点、红色倒计时强化稀缺，按钮文案统一为「立即解锁」。上线后弹窗点击率提升 20.7%。',
        motion: [['切换', '上一弹窗缩小淡出 240ms → 新弹窗 Spring 弹入'], ['倒计时', '红色胶囊实时跳动'], ['按钮', '呼吸放大 1.055 倍，1.6s 循环'], ['曲线', 'ease-in 退出 / spring 进入']], ease: [0.34, 1.56, 0.64, 1], dur: 3600 }
    ];
    let cur = -1, auto = true, autoTimer = 0, toastTimer = 0, inView = false;

    const curvePath = ([x1, y1, x2, y2]) => `M0 80 C${x1 * 120} ${80 - y1 * 80} ${x2 * 120} ${80 - y2 * 80} 120 0`;
    const fillSpec = i => {
      const d = SPEC[i];
      spec.classList.add('is-swapping');
      setTimeout(() => {
        $('[data-spec="kicker"]', spec).textContent = d.kicker;
        $('[data-spec="title"]', spec).textContent = d.title;
        $('[data-spec="intent"]', spec).textContent = d.intent;
        $('[data-spec="motion"]', spec).innerHTML = d.motion.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join('');
        $('[data-spec="ease"]', spec).textContent = `cubic-bezier(${d.ease.join(', ')})`;
        const curve = $('.sq-curve', spec);
        $('.sq-curve-path', spec).setAttribute('d', curvePath(d.ease));
        curve.classList.remove('is-draw'); void curve.offsetWidth; curve.classList.add('is-draw');
        animateDot(d.ease);
        spec.classList.remove('is-swapping');
      }, cur === -1 ? 0 : 220);
    };
    // 曲线上的小圆点按真实缓动跑一遍
    const bez = (t, p1, p2) => 3 * (1 - t) * (1 - t) * t * p1 + 3 * (1 - t) * t * t * p2 + t * t * t;
    const animateDot = e => {
      const dot = $('.sq-curve-dot', spec);
      if (REDUCED) { dot.setAttribute('cx', 120); dot.setAttribute('cy', 0); return; }
      const t0 = performance.now();
      const step = now => {
        const t = Math.min(1, (now - t0) / 1000);
        dot.setAttribute('cx', (bez(t, e[0], e[2]) * 120).toFixed(2));
        dot.setAttribute('cy', (80 - bez(t, e[1], e[3]) * 80).toFixed(2));
        if (t < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };

    const show = (i, opts = {}) => {
      if (i === cur && !opts.force) return;
      const prev = cur; cur = i;
      proto.dataset.step = i;
      layers.forEach(l => {
        const s = +l.dataset.s;
        if (l.classList.contains('sq-pscreen')) {
          const target = i >= 1 ? 1 : 0; // 弹窗叠在付费页之上
          l.classList.toggle('is-active', s === target);
          l.classList.toggle('is-past', s < target);
        } else {
          const open = s === i;
          if (!open && l.classList.contains('is-open') && i > s) {
            l.classList.add('is-leaving');
            setTimeout(() => l.classList.remove('is-open', 'is-leaving'), 240);
          } else {
            l.classList.remove('is-leaving');
            if (!open) l.classList.remove('is-open');
          }
          if (open) {
            const delay = prev === 2 && i === 3 ? 200 : 0;
            setTimeout(() => { if (cur === s) l.classList.add('is-open'); }, delay);
          }
        }
      });
      steps.forEach((b, j) => {
        b.setAttribute('aria-selected', String(i === j));
        b.classList.toggle('is-done', j < i);
        const bar = b.querySelector('i'); if (bar) { bar.style.animation = 'none'; void bar.offsetWidth; bar.style.animation = ''; }
      });
      proto.style.setProperty('--dur', `${SPEC[i].dur}ms`);
      fillSpec(i);
    };

    const toast = msg => {
      toastEl.textContent = msg; toastEl.classList.add('is-on');
      clearTimeout(toastTimer); toastTimer = setTimeout(() => toastEl.classList.remove('is-on'), 1800);
    };
    const pay = () => toast('✓ 已唤起支付 · USD$0.89 解锁完整报告');

    const setManual = () => {
      if (!auto) return;
      auto = false; clearTimeout(autoTimer);
      proto.classList.remove('is-auto');
      tap.classList.remove('is-on');
    };

    // 自动演示：模拟手指点击热区
    const pressAt = (hot, then) => {
      const r = screen.getBoundingClientRect(), h = hot.getBoundingClientRect();
      tap.style.left = `${h.left - r.left + h.width / 2}px`;
      tap.style.top = `${h.top - r.top + h.height / 2}px`;
      tap.classList.add('is-on');
      autoTimer = setTimeout(() => {
        tap.classList.remove('is-press'); void tap.offsetWidth; tap.classList.add('is-press');
        autoTimer = setTimeout(() => { tap.classList.remove('is-on', 'is-press'); then(); }, 380);
      }, 650);
    };
    const AUTO_NEXT = ['[data-go="1"]', '[data-go="2"]', '[data-go="3"]', '[data-pay]'];
    const autoStep = () => {
      clearTimeout(autoTimer);
      if (!auto || !inView || document.hidden) return;
      autoTimer = setTimeout(() => {
        const layer = layers.find(l => +l.dataset.s === cur);
        const hot = layer && $(AUTO_NEXT[cur], layer);
        if (!hot) return;
        pressAt(hot, () => {
          if (cur < 3) { show(cur + 1); autoStep(); }
          else { pay(); autoTimer = setTimeout(() => { show(0); autoStep(); }, 2200); }
        });
      }, Math.max(600, SPEC[cur].dur - 1030));
    };
    const startAuto = () => {
      if (REDUCED) { setManual(); return; }
      auto = true; proto.classList.add('is-auto');
      show(0, { force: true }); autoStep();
    };

    // 用户操作
    proto.addEventListener('click', e => {
      const hot = e.target.closest('.sq-hot');
      const step = e.target.closest('.sq-proto-step');
      if (e.target.closest('.sq-proto-replay')) { startAuto(); return; }
      if (!hot && !step && !e.target.closest('.sq-proto-screen')) return;
      setManual();
      if (step) { show(+step.dataset.step); return; }
      if (hot) {
        if (hot.dataset.go) show(+hot.dataset.go);
        else if ('pay' in hot.dataset) pay();
        else if (hot.dataset.toast) toast(hot.dataset.toast);
        return;
      }
      // 点到非热区：像 Figma 一样闪一下可点击区域
      screen.classList.remove('is-flash'); void screen.offsetWidth; screen.classList.add('is-flash');
      setTimeout(() => screen.classList.remove('is-flash'), 700);
    });
    proto.addEventListener('keydown', e => {
      if (!e.target.closest('.sq-proto-steps')) return;
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') { e.preventDefault(); setManual(); show(Math.min(3, cur + 1)); steps[cur].focus(); }
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') { e.preventDefault(); setManual(); show(Math.max(0, cur - 1)); steps[cur].focus(); }
    });

    show(0, { force: true });
    if (REDUCED) setManual(); else proto.classList.add('is-auto');
    watch(proto, v => { inView = v; if (v) autoStep(); else clearTimeout(autoTimer); }, 0.45);
    document.addEventListener('visibilitychange', () => { if (!document.hidden) autoStep(); });
  }
})();
