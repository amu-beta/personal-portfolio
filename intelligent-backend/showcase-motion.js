'use strict';
/* =========================================================
   先知命局介绍页 · 动效与交互层
   滚动视差 / 鼠标光斑与 3D 倾斜 / 磁吸按钮 / 数字滚动
   模块自动轮播 / 布局热点联动 / 打字机 / 制作步骤自动演示
   ========================================================= */
(() => {
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const easeOut = t => 1 - Math.pow(1 - t, 3);

  /* ---------- 1. 进入视口标记（标题下划线、手写副标等） ---------- */
  const inView = new IntersectionObserver(entries => entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('is-in');
    entry.target.dispatchEvent(new CustomEvent('inview'));
    inView.unobserve(entry.target);
  }), { threshold: .25 });
  $$('.sec-title, [data-count], .stats-grid, .chat-fan, .hotspot').forEach(el => inView.observe(el));

  /* ---------- 2. 数字滚动 ---------- */
  function countUp(el) {
    const target = Number(el.dataset.count);
    const prefix = el.dataset.prefix || '';
    const textNode = [...el.childNodes].find(n => n.nodeType === 3);
    if (!textNode || Number.isNaN(target)) return;
    const format = v => prefix + Math.round(v).toLocaleString('en-US');
    if (reduceMotion) { textNode.textContent = format(target); return; }
    const duration = target > 1000 ? 1600 : 1100;
    const start = performance.now();
    const tick = now => {
      const t = clamp((now - start) / duration, 0, 1);
      textNode.textContent = format(target * easeOut(t));
      if (t < 1) requestAnimationFrame(tick);
    };
    textNode.textContent = format(0);
    requestAnimationFrame(tick);
  }
  $$('[data-count]').forEach(el => el.addEventListener('inview', () => {
    const delay = el.closest('.hero') ? 1100 : 0;
    setTimeout(() => countUp(el), delay);
  }, { once: true }));

  /* ---------- 3. 滚动驱动：视差 / 首屏退场 / 扇形展开 ---------- */
  const hero = $('.hero');
  const chatFan = $('.chat-fan');
  const parallax = $$('[data-parallax]');
  const statsS = $('.stats-s');
  const toTop = $('.to-top');
  const ringLen = 2 * Math.PI * 20;
  let ticking = false;
  function onScroll() {
    ticking = false;
    const vh = innerHeight;
    // 首屏：内容随滚动上移淡出，显示器略微后退
    if (hero) {
      const p = clamp(scrollY / hero.offsetHeight, 0, 1);
      hero.style.setProperty('--hero-p', p.toFixed(3));
    }
    // 通用视差
    parallax.forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200) return;
      const offset = (r.top + r.height / 2 - vh / 2) / vh;
      el.style.setProperty('--py', `${(offset * Number(el.dataset.parallax) * 100).toFixed(1)}px`);
    });
    // 数据条里的 S 随滚动旋转
    if (statsS) {
      const r = statsS.parentElement.getBoundingClientRect();
      const t = clamp(1 - (r.top + r.height) / (vh + r.height), 0, 1);
      statsS.style.setProperty('--spin', `${(-30 + t * 40).toFixed(1)}deg`);
    }
    // 聊天截图扇形展开
    if (chatFan) {
      const r = chatFan.getBoundingClientRect();
      const t = clamp((vh - r.top) / (vh * .7), 0, 1);
      chatFan.style.setProperty('--fan', easeOut(t).toFixed(3));
    }
    // 返回顶部进度环
    if (toTop) {
      const max = document.documentElement.scrollHeight - vh;
      const p = max > 0 ? scrollY / max : 0;
      toTop.style.setProperty('--dash', (ringLen * (1 - p)).toFixed(1));
      toTop.classList.toggle('is-visible', scrollY > vh * .8);
    }
  }
  if (toTop) toTop.style.setProperty('--ring', ringLen.toFixed(1));
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  addEventListener('resize', onScroll);
  onScroll();

  /* ---------- 4. 鼠标：光斑跟随 + 3D 倾斜 + 磁吸 ---------- */
  if (finePointer && !reduceMotion) {
    $$('.ov-card, .sb-card, .toolkit article, .task-columns article, .moods figure, .lockup, .human-role, .codex-role, .construction, .delivery, .conversation-details').forEach(el => {
      el.classList.add('has-spotlight');
      el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect();
        el.style.setProperty('--mx', `${e.clientX - r.left}px`);
        el.style.setProperty('--my', `${e.clientY - r.top}px`);
      });
    });

    $$('.goal-tiles figure, .lockup, .moods figure, .nav-shot, .chat-shot, .toolkit article').forEach(el => {
      el.classList.add('has-tilt');
      el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - .5;
        const y = (e.clientY - r.top) / r.height - .5;
        const strength = el.classList.contains('chat-shot') ? 8 : 10;
        el.style.setProperty('--ry', `${(x * strength).toFixed(2)}deg`);
        el.style.setProperty('--rx', `${(-y * strength).toFixed(2)}deg`);
      });
      el.addEventListener('pointerleave', () => { el.style.setProperty('--rx', '0deg'); el.style.setProperty('--ry', '0deg'); });
    });

    $$('.button, .ai-send, .nav-action, .car-arrow').forEach(el => {
      el.classList.add('is-magnetic');
      el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect();
        el.style.setProperty('--tx', `${((e.clientX - r.left) / r.width - .5) * 10}px`);
        el.style.setProperty('--ty', `${((e.clientY - r.top) / r.height - .5) * 8}px`);
      });
      el.addEventListener('pointerleave', () => { el.style.setProperty('--tx', '0px'); el.style.setProperty('--ty', '0px'); });
    });

    // 聊天区的小知跟随鼠标
    const banner = $('.ai-banner');
    if (banner) {
      banner.addEventListener('pointermove', e => {
        const r = banner.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        banner.style.setProperty('--bx', `${(x * 30).toFixed(1)}px`);
        banner.style.setProperty('--by', `${(y * 20).toFixed(1)}px`);
      });
      banner.addEventListener('pointerleave', () => { banner.style.setProperty('--bx', '0px'); banner.style.setProperty('--by', '0px'); });
    }

    // 结尾 S 标志追随
    const closing = $('.closing');
    if (closing) {
      closing.addEventListener('pointermove', e => {
        const r = closing.getBoundingClientRect();
        closing.style.setProperty('--cx', `${((e.clientX - r.left) / r.width - .5) * 24}px`);
        closing.style.setProperty('--cy', `${((e.clientY - r.top) / r.height - .5) * 16}px`);
      });
    }
  }

  /* ---------- 5. 模块标签：滑动指示器 + 轮播自动播放 ---------- */
  const track = $('.module-tabs');
  const indicator = $('.tab-indicator');
  const tabs = $$('[data-module]');
  const panel = $('.module-panel');
  const bar = $('.car-progress i');
  const AUTOPLAY_MS = 3000;
  let hoverPause = false, apStart = performance.now(), apElapsed = 0, stageVisible = false;
  function placeIndicator() {
    const current = tabs.find(t => t.getAttribute('aria-selected') === 'true');
    if (!current || !indicator) return;
    indicator.style.width = `${current.offsetWidth}px`;
    indicator.style.transform = `translateX(${current.offsetLeft}px)`;
  }
  new MutationObserver(placeIndicator).observe(track, { attributes: true, subtree: true, attributeFilter: ['aria-selected'] });
  addEventListener('resize', placeIndicator);
  if (document.fonts) document.fonts.ready.then(placeIndicator);
  placeIndicator();
  // 任何切换（点击、拖动、箭头）都会重置计时
  document.addEventListener('module-change', () => { apElapsed = 0; if (bar) bar.style.transform = 'scaleX(0)'; });
  function apLoop(now) {
    if (!reduceMotion && !hoverPause && stageVisible && !document.hidden) {
      apElapsed += now - apStart;
      if (bar) bar.style.transform = `scaleX(${clamp(apElapsed / AUTOPLAY_MS, 0, 1)})`;
      if (apElapsed >= AUTOPLAY_MS) { apElapsed = 0; const i = tabs.findIndex(t => t.getAttribute('aria-selected') === 'true'); activateModule(tabs[(i + 1) % tabs.length].dataset.module, false, true); }
    }
    apStart = now;
    requestAnimationFrame(apLoop);
  }
  if (panel) {
    new IntersectionObserver(([e]) => { stageVisible = e.isIntersecting; }, { threshold: .35 }).observe(panel);
    const carousel = $('.carousel');
    carousel?.addEventListener('pointerenter', () => { hoverPause = true; });
    carousel?.addEventListener('pointerleave', () => { hoverPause = false; });
    requestAnimationFrame(apLoop);
  }

  /* ---------- 6. 布局讲解 ↔ 设备热点联动 ---------- */
  const notes = $$('.layout-notes li');
  const spots = $$('.hotspot');
  function setSpot(i) {
    notes.forEach(n => n.classList.toggle('is-active', n.dataset.spot === String(i)));
    spots.forEach(s => s.classList.toggle('is-active', s.dataset.spot === String(i)));
  }
  notes.forEach(n => {
    n.addEventListener('pointerenter', () => setSpot(n.dataset.spot));
    n.addEventListener('focusin', () => setSpot(n.dataset.spot));
    n.tabIndex = 0;
  });
  spots.forEach(s => s.addEventListener('pointerenter', () => setSpot(s.dataset.spot)));
  // 滚动经过时自动依次点亮
  const noteObserver = new IntersectionObserver(entries => entries.forEach(e => { if (e.isIntersecting) setSpot(e.target.dataset.spot); }), { rootMargin: '-45% 0px -45% 0px' });
  notes.forEach(n => noteObserver.observe(n));
  setSpot(0);

  /* ---------- 7. 提问框打字机 + 示例问题 ---------- */
  const typer = $('#prompt-typer');
  const chips = $$('.prompt-chips [data-prompt]');
  const prompts = chips.map(c => c.dataset.prompt);
  let currentPrompt = prompts[0] || '';
  let typerTimer, typerIndex = 0, typerLocked = false;
  function typeText(text, done) {
    clearTimeout(typerTimer);
    currentPrompt = text;
    if (!typer) return;
    if (reduceMotion) { typer.textContent = text; done?.(); return; }
    let i = 0;
    const step = () => { typer.textContent = text.slice(0, ++i); if (i < text.length) typerTimer = setTimeout(step, 55); else done?.(); };
    step();
  }
  function cycle() {
    if (typerLocked) return;
    typerIndex = (typerIndex + 1) % prompts.length;
    chips.forEach((c, i) => c.classList.toggle('is-active', i === typerIndex));
    typeText(prompts[typerIndex], () => { typerTimer = setTimeout(cycle, 2600); });
  }
  if (typer && prompts.length) {
    chips[0]?.classList.add('is-active');
    const box = $('.ai-prompt-box');
    new IntersectionObserver(([e], o) => { if (e.isIntersecting) { o.disconnect(); typerIndex = -1; cycle(); } }, { threshold: .5 }).observe(box);
    chips.forEach((c, i) => c.addEventListener('click', () => {
      typerLocked = true;
      chips.forEach(x => x.classList.toggle('is-active', x === c));
      typeText(c.dataset.prompt);
    }));
  }
  // “问问小知”：把当前问题带进嵌入的后台小知
  $$('[data-open-assistant]').forEach(btn => btn.addEventListener('click', () => {
    if (!btn.classList.contains('ai-send')) return;
    try {
      const input = $('#assistant-frame')?.contentDocument?.querySelector('#assistantInput');
      if (input && currentPrompt) {
        input.value = currentPrompt;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.focus();
      }
    } catch (_) { /* 跨源打开时忽略，由原有逻辑在新窗口打开后台 */ }
  }));

  /* ---------- 8. 制作步骤：切换时面板入场 + 代码打字 ---------- */
  const code = $('#build-code');
  let codeTimer;
  function typeCode() {
    if (!code || reduceMotion) return;
    clearTimeout(codeTimer);
    const full = code.textContent;
    let i = 0;
    code.classList.add('is-typing');
    const step = () => {
      i = Math.min(full.length, i + 3);
      code.textContent = full.slice(0, i);
      if (i < full.length) codeTimer = setTimeout(step, 14); else code.classList.remove('is-typing');
    };
    step();
  }
  document.addEventListener('build-step', () => {
    const panelEl = $('#build-panel');
    panelEl.classList.remove('is-switching'); void panelEl.offsetWidth; panelEl.classList.add('is-switching');
    typeCode();
  });

  /* ---------- 9a. 页头：下滑隐藏、上滑出现 ---------- */
  const header = $('.site-header');
  let lastY = scrollY;
  addEventListener('scroll', () => {
    const y = scrollY;
    if (Math.abs(y - lastY) < 6) return;
    header?.classList.toggle('is-hidden', y > lastY && y > 400 && !document.activeElement?.closest?.('.site-header'));
    lastY = y;
  }, { passive: true });

  /* ---------- 9. 首屏显示器：悬停时界面缓慢滚动 ---------- */
  const monitor = $('.monitor');
  if (monitor && finePointer) {
    monitor.addEventListener('pointerenter', () => monitor.classList.add('is-scrolling'));
    monitor.addEventListener('pointerleave', () => monitor.classList.remove('is-scrolling'));
  }
})();
