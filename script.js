/* Ragnarok AI — interactions (rebuilt from the live Framer site's component configs) */

/* ?static=1 renders a deterministic still frame (used for screenshot comparison) */
const STATIC = new URLSearchParams(location.search).has('static');
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ============ 0. Responsive modes ============ */
/* ≥1200px: true design size. 768–1199px: zoom-scale the 1200px canvas.
   <768px: zoom off, real mobile layout via the media queries in styles.css. */
(() => {
  const canvas = document.querySelector('.canvas');
  const fit = () => {
    /* innerWidth matches CSS media queries (includes any scrollbar);
       clientWidth is what's actually visible — sizing from innerWidth made the
       zoomed canvas overflow-clip on the right for classic-scrollbar setups,
       shifting the whole site off-center */
    const mobile = window.innerWidth < 768;
    const w = document.documentElement.clientWidth;
    const z = mobile ? 1 : Math.min(1, w / 1200);
    canvas.style.zoom = z;
    document.documentElement.classList.toggle('is-mobile', mobile);
    /* vh/svh units inside the zoomed canvas get multiplied by the zoom factor,
       which un-centers the pinned stages; --vhz = the real viewport height
       expressed in zoomed-canvas units. At zoom 1 the CSS falls back to svh. */
    if (z < 1) {
      canvas.style.setProperty('--vhz', (window.innerHeight / z).toFixed(1) + 'px');
    } else {
      canvas.style.removeProperty('--vhz');
    }
    /* Use the visible width at every zoom level: 100vw includes a classic
       scrollbar, which otherwise creates a small horizontal page overflow. */
    canvas.style.setProperty('--vwz', (document.documentElement.clientWidth / z).toFixed(1) + 'px');
    /* unfold gallery: its 1180px grid is hand-authored in px; on mobile the
       whole grid scales down as one unit (scale prop, so it composes with
       the per-tile transform animations) */
    canvas.style.setProperty('--ufz', mobile ? (w / 1180).toFixed(4) : '1');
    /* left-align the hero column with the nav logo: the nav is fixed and
       sizes against the real viewport while the hero sits in the zoomed
       canvas, so the pad is (nav's left edge - canvas's left edge) expressed
       in zoomed-canvas units */
    const navLeft = Math.max(20, (w - Math.min(980, w - 40)) / 2);
    const canvasLeft = Math.max(0, (w - 1200 * z) / 2);
    canvas.style.setProperty('--heroPad', ((navLeft - canvasLeft) / z).toFixed(1) + 'px');
  };
  fit();
  window.addEventListener('resize', fit);
})();

/* ============ 0b. Condensing nav ============ */
(() => {
  const nav = document.getElementById('site-nav');
  if (!nav) return;
  const onScroll = () => {
    if (scrollY > 70) nav.classList.add('condensed');
    else if (scrollY < 20) nav.classList.remove('condensed');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

/* ============ 1. Typing headline (editor-style: type → select → retype) ============
   Each phrase is typed with per-char scramble-settle pops, sits under a blinking
   caret, then gets swept by a text-selection highlight and typed over. */
(() => {
  const words = ['更有质感', '更像成品', '让人记住'];
  const SCRAMBLE = '#*/{<>}$!+=?';
  const TYPE_MS = 62, HOLD_MS = 1600, SEL_MS = 36, SEL_HOLD_MS = 620;

  /* one instance per type-line (hero headline + testimonial statement) */
  function wire(el, cursor) {
    if (!el) return;
    if (STATIC || REDUCED) {
      el.textContent = words[0];
      return;
    }
    let wi = 0;
    const solid = on => cursor && cursor.classList.toggle('solid', on);

    function typeWord(word, done) {
      el.textContent = '';
      let i = 0;
      solid(true);
      (function next() {
        if (i >= word.length) { solid(false); return done(); }
        const ch = word[i++];
        const span = document.createElement('span');
        span.className = 'tch';
        span.textContent = ch;
        el.appendChild(span);
        /* scramble-settle: flash random glyphs before the real letter lands */
        if (ch !== ' ') {
          let flips = 2;
          (function flip() {
            if (flips-- > 0) {
              span.textContent = SCRAMBLE[Math.random() * SCRAMBLE.length | 0];
              setTimeout(flip, 36);
            } else span.textContent = ch;
          })();
        }
        setTimeout(next, TYPE_MS);
      })();
    }

    function selectAll(done) {
      const chars = [...el.children];
      let i = 0;
      solid(true);
      (function next() {
        if (i >= chars.length) return setTimeout(done, SEL_HOLD_MS);
        chars[i++].classList.add('sel');
        setTimeout(next, SEL_MS);
      })();
    }

    (function cycle() {
      typeWord(words[wi], () => setTimeout(() => selectAll(() => {
        wi = (wi + 1) % words.length;
        cycle();
      }), HOLD_MS));
    })();
  }

  wire(document.getElementById('type-text'), document.querySelector('.hero .type-cursor'));
  wire(document.getElementById('testi-type'), document.querySelector('.testi-big .type-cursor'));
})();

/* images are UI, not draggable assets — block native HTML5 image drag */
document.addEventListener('dragstart', e => {
  if (e.target.tagName === 'IMG') e.preventDefault();
});

/* ============ 2. Tickers (velocity 80px/s, drag, slow on hover) ============ */
document.querySelectorAll('.ticker:not(.ticker-gray)').forEach(ticker => {
  const track = ticker.querySelector('.ticker-track');
  const speed = parseFloat(ticker.dataset.speed || '80');
  const arc = parseFloat(ticker.dataset.arc || '0'); // virtual circle radius for arc mode
  const dir = ticker.dataset.direction === 'ltr' ? 1 : -1;
  const originals = [...track.children];
  // mirror layer (hero before/after slider) follows this track. It shows the
  // real "<name>-before.png" for each "<name>-after.png" slot; missing files
  // fall back before→after→placeholder, and fallback-only cards render
  // grayscale so the slider still reads until real pairs are dropped in.
  const grayTicker = ticker.parentElement.querySelector('.ticker-gray .ticker-track');
  const wireFallback = img => {
    if (img.__wired) return;
    img.__wired = true;
    const onErr = () => {
      if (img.src.includes('-before.')) {
        const card = img.closest('.phone-card');
        if (card) card.classList.add('no-before');
        img.src = img.src.replace('-before.', '-after.');
      } else if (img.dataset.fallback && !img.src.endsWith(img.dataset.fallback)) {
        const card = img.closest('.phone-card');
        if (card && grayTicker && grayTicker.contains(img)) card.classList.add('no-before');
        img.src = img.dataset.fallback;
      }
    };
    img.addEventListener('error', onErr);
    if (img.complete && img.naturalWidth === 0) onErr();
  };
  const syncGray = () => {
    track.querySelectorAll('img').forEach(wireFallback);
    if (!grayTicker) return;
    grayTicker.innerHTML = track.innerHTML;
    grayTicker.querySelectorAll('img').forEach(img => {
      img.__wired = false;
      wireFallback(img);
      if (img.src.includes('-after.')) img.src = img.src.replace('-after.', '-before.');
    });
    grayTicker.querySelectorAll('.ba-pill').forEach(p => { p.textContent = '改造前'; });
  };
  let loopWidth = 0;
  /* arc geometry, cached outside the frame loop: card centers never move
     inside the track (only the track's translateX does), so reading layout
     per-frame just forced a reflow every frame — that was the ticker jank */
  let centers = [], tickerLeft = 0, mid = 0, r0 = 0, zInv = 1;
  const measureArc = () => {
    if (!arc) return;
    tickerLeft = ticker.getBoundingClientRect().left;
    mid = window.innerWidth / 2;
    r0 = Math.max(arc, arc * (window.innerWidth * window.innerWidth) / (1280 * 1280));
    zInv = 1 / Math.min(1, window.innerWidth / 1200);
    centers = [...track.children].map(c => {
      c.style.willChange = 'transform';
      return c.offsetLeft + c.offsetWidth / 2;
    });
    if (grayTicker) [...grayTicker.children].forEach(c => c.style.willChange = 'transform');
  };
  const measure = () => {
    /* gap read live — it changes at the mobile breakpoint */
    const gap = parseFloat(getComputedStyle(track).gap) || 0;
    loopWidth = 0;
    originals.forEach(n => loopWidth += n.getBoundingClientRect().width + gap);
    // duplicate content until the track covers viewport + one full loop, so
    // wrapping is seamless in either direction. Re-runs whenever the ticker
    // is (re)sized — at first script run layout may not be settled yet.
    let added = false;
    while (loopWidth > 0 && track.scrollWidth < ticker.clientWidth + loopWidth && track.children.length < 60) {
      originals.forEach(n => track.appendChild(n.cloneNode(true)));
      added = true;
    }
    if (added || !track.__graySynced) { track.__graySynced = true; syncGray(); }
    measureArc();
  };
  measure();
  window.addEventListener('resize', measure);
  if (window.ResizeObserver) new ResizeObserver(measure).observe(ticker);

  let x = 0, mult = 1, dragging = false, lastPointerX = 0, last = performance.now();
  ticker.addEventListener('mouseenter', () => { if (!dragging) mult = 0.5; });
  ticker.addEventListener('mouseleave', () => { if (!dragging) mult = 1; });
  ticker.addEventListener('pointerdown', e => {
    dragging = true; mult = 0; lastPointerX = e.clientX;
    ticker.setPointerCapture(e.pointerId);
  });
  ticker.addEventListener('pointermove', e => {
    if (!dragging) return;
    x += e.clientX - lastPointerX;
    lastPointerX = e.clientX;
  });
  const endDrag = () => { dragging = false; mult = 1; };
  ticker.addEventListener('pointerup', endDrag);
  ticker.addEventListener('pointercancel', endDrag);

  function frame(now) {
    const m = (STATIC || REDUCED) ? 0 : mult; /* reduced motion: no auto-scroll, drag still works */
    const dt = Math.min(64, now - last) / 1000;
    last = now;
    x += dir * speed * m * dt;
    if (loopWidth > 0) {
      while (x <= -loopWidth) x += loopWidth;
      while (x > 0) x -= loopWidth;
    }
    track.style.transform = `translateX(${x}px)`;
    if (grayTicker) grayTicker.style.transform = `translateX(${x}px)`;
    if (arc) {
      // bend the row: each card lifts and tilts along a huge virtual circle.
      // The gray before-layer (hero slider) mirrors each card's transform by
      // index so both layers stay pixel-aligned through the curve.
      // The radius grows with viewport² so the EDGE lift stays constant on
      // any display — on wide monitors a fixed radius lifted edge cards
      // beyond the clip headroom and they vanished.
      // All geometry comes from the measureArc cache — zero layout reads here.
      // Cards far offscreen keep their last transform (they re-enter through
      // the update margin long before becoming visible).
      const cards = track.children;
      const grayCards = grayTicker ? grayTicker.children : null;
      const lim = mid + 600;
      const n = Math.min(cards.length, centers.length);
      for (let i = 0; i < n; i++) {
        const dx = tickerLeft + centers[i] + x - mid;
        if (dx < -lim || dx > lim) continue;
        const lift = -(dx * dx) / (2 * r0);
        const rot = -(dx / r0);
        const t = `translateY(${(lift * zInv).toFixed(2)}px) rotate(${rot.toFixed(4)}rad)`;
        cards[i].style.transform = t;
        if (grayCards && grayCards[i]) grayCards[i].style.transform = t;
      }
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
});

/* ============ 2b. Hero before/after slider ============ */
/* Everything left of the handle renders grayscale, right stays colorful —
   including mid-drag of both the handle and the carousel. */
(() => {
  const wrap = document.querySelector('.hero-ticker-wrap');
  if (!wrap) return;
  const grips = wrap.querySelectorAll('.hero-overlay-circles, .hero-overlay-bar');
  const sliderHandle = wrap.querySelector('.hero-overlay-circles[role="slider"]');
  let dragging = false;
  const setSplitPercent = value => {
    const percent = Math.min(100, Math.max(0, value));
    wrap.style.setProperty('--split', percent.toFixed(3) + '%');
    if (sliderHandle) {
      sliderHandle.setAttribute('aria-valuenow', String(Math.round(percent)));
      sliderHandle.setAttribute('aria-valuetext', `改造前 ${Math.round(percent)}%，改造后 ${100 - Math.round(percent)}%`);
    }
  };
  const setSplit = clientX => {
    const r = wrap.getBoundingClientRect();
    setSplitPercent((clientX - r.left) / r.width * 100);
  };
  grips.forEach(g => {
    g.addEventListener('pointerdown', e => {
      dragging = true;
      g.setPointerCapture(e.pointerId);
      setSplit(e.clientX);
      e.preventDefault();
      e.stopPropagation();
    });
    g.addEventListener('pointermove', e => { if (dragging) setSplit(e.clientX); });
    const end = () => { dragging = false; };
    g.addEventListener('pointerup', end);
    g.addEventListener('pointercancel', end);
  });
  sliderHandle?.addEventListener('keydown', event => {
    const current = Number(sliderHandle.getAttribute('aria-valuenow')) || 50;
    let next = current;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') next = current - 5;
    else if (event.key === 'ArrowRight' || event.key === 'ArrowUp') next = current + 5;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = 100;
    else return;
    event.preventDefault();
    setSplitPercent(next);
  });
  setSplitPercent(Number(sliderHandle?.getAttribute('aria-valuenow')) || 50);
})();

/* ============ 3. Logo flip columns ============ */
(() => {
  const stacks = document.querySelectorAll('.logo-flip-stack');
  if (REDUCED) return;
  let step = 0;
  setInterval(() => {
    step = (step + 1) % 3;
    stacks.forEach((s, i) => {
      setTimeout(() => {
        /* pitch measured live — logo size shrinks at the mobile breakpoint */
        const img = s.firstElementChild;
        const pitch = img.offsetHeight + parseFloat(getComputedStyle(img).marginBottom);
        s.style.transition = step === 0 ? 'none' : 'transform .6s cubic-bezier(.65,0,.35,1)';
        s.style.transform = `translateY(${-pitch * step}px)`;
      }, i * 120);
    });
  }, 2600);
})();

/* ============ 4. ASCII video renderer ============ */
/* Framer component config: charset "*#/$!", 7px grid, invert, brightness -0.05,
   playbackRate 0.5, custom color per instance */
(() => {
  const CHARSET = '*#/$!';
  const CELL = 7;
  const freezeAscii = STATIC || REDUCED;
  /* each source video feeds its own set of canvases */
  const groups = [
    { video: document.getElementById('ascii-video'), instances: [
      { canvas: document.getElementById('ascii-gear'), color: '#4d5564' },
    ] },
    { video: document.getElementById('ascii-video-cloud'),
      instances: [...document.querySelectorAll('.ascii-cloud')].map(c => ({ canvas: c, color: '#b9bcf6' })) },
    { video: document.getElementById('ascii-video-plane'), instances: [
      { canvas: document.querySelector('.ascii-plane'), color: '#a9adf5' },
      { canvas: document.querySelector('.ascii-footer'), color: '#cfd2e4' },
    ] },
  ].map(g => ({ ...g, instances: g.instances.filter(i => i.canvas) }))
   .filter(g => g.video && g.instances.length);

  groups.forEach(({ video }) => {
    if (STATIC) { video.removeAttribute('src'); video.load(); }
    if (freezeAscii) {
      video.removeAttribute('autoplay');
      video.pause();
    }
    video.playbackRate = 0.5;
  });
  const play = () => { if (!freezeAscii) groups.forEach(g => g.video.play().catch(() => {})); };
  play();
  if (!freezeAscii) document.addEventListener('click', play, { once: true });

  const sample = document.createElement('canvas');
  const sctx = sample.getContext('2d', { willReadFrequently: true });

  let lastDraw = 0, drawnOnce = false;
  function draw(now) {
    if (!freezeAscii) requestAnimationFrame(draw);
    else if (drawnOnce) return;
    if (!freezeAscii && now - lastDraw < 40) return; // ~24fps is plenty for ASCII
    lastDraw = now; drawnOnce = true;
    for (const { video, instances } of groups) {
      if (video.readyState < 2) continue;
      instances.forEach(({ canvas, color }) => {
        const ctx = canvas.getContext('2d');
        const w = canvas.width, h = canvas.height;
        const dpr = canvas.clientWidth > 0 ? w / canvas.clientWidth : 2;
        const cell = CELL * dpr; // device-pixel cell
        const cols = Math.ceil(w / cell), rows = Math.ceil(h / cell);
        if (sample.width !== cols || sample.height !== rows) {
          sample.width = cols; sample.height = rows;
        }
        sctx.drawImage(video, 0, 0, cols, rows);
        const data = sctx.getImageData(0, 0, cols, rows).data;
        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = color;
        ctx.font = `250 ${cell}px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`;
        ctx.textBaseline = 'top';
        for (let y = 0; y < rows; y++) {
          for (let xx = 0; xx < cols; xx++) {
            const i = (y * cols + xx) * 4;
            let lum = (data[i] * 0.2126 + data[i + 1] * 0.7152 + data[i + 2] * 0.0722) / 255;
            lum = Math.max(0, Math.min(1, 1 - lum - 0.05)); // invert + brightness
            if (lum < 0.15) continue;
            const ch = CHARSET[Math.min(CHARSET.length - 1, Math.floor(lum * CHARSET.length))];
            ctx.fillText(ch, xx * cell, y * cell);
          }
        }
      });
    }
  }
  if (freezeAscii) {
    groups.forEach(({ video }) => video.addEventListener('loadeddata', () => draw(performance.now()), { once: true }));
    draw(performance.now());
  } else {
    requestAnimationFrame(draw);
  }
})();

/* ============ 4b. Bento prompt typing loop ============ */
(() => {
  const target = document.getElementById('b3-type');
  if (!target) return;
  const TEXT = '把结账页做得更清晰、更有质感…';
  if (STATIC || REDUCED) { target.textContent = TEXT; return; }
  let i = 0, dir = 1;
  (function tick() {
    target.textContent = TEXT.slice(0, i);
    if (dir === 1 && i === TEXT.length) { dir = 0; setTimeout(tick, 2400); return; }
    if (dir === 0) { i = 0; dir = 1; setTimeout(tick, 500); return; }
    i += dir;
    setTimeout(tick, 38 + Math.random() * 45);
  })();
})();

/* ============ 4c. Process scroll-jack (v2, replaces hiw) ============ */
/* Pins for the runway; progress thirds select the step. Each step drives the
   phone (before / scanning / after-wipe), the straddling pills' thumb, the
   slide-out app icons, and the masked-line heading swap — all via data-step. */
(() => {
  const section = document.querySelector('.process');
  const sticky = document.querySelector('.process-sticky');
  if (!section || !sticky) return;
  const stage = document.querySelector('.proc-stage');
  const pills = [...document.querySelectorAll('.proc-pill')];
  const thumb = document.querySelector('.proc-thumb');
  const heads = [...document.querySelectorAll('.proc-h')];
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const PROC = new URLSearchParams(location.search).get('proc'); // debug freeze

  let cur = -1;
  function setStep(i) {
    if (i === cur) return;
    cur = i;
    stage.dataset.step = i;
    pills.forEach((p, j) => p.classList.toggle('on', j === i));
    heads.forEach((h, j) => h.classList.toggle('on', j === i));
    if (thumb && pills[i]) {
      thumb.style.transform = `translateX(${pills[i].offsetLeft}px)`;
      thumb.style.width = pills[i].offsetWidth + 'px';
    }
  }
  function update() {
    const r = section.getBoundingClientRect();
    const total = r.height - sticky.getBoundingClientRect().height;
    const p = PROC !== null ? parseFloat(PROC) : (STATIC ? 0 : clamp(-r.top / total, 0, 1));
    setStep(p < 1 / 3 ? 0 : p < 2 / 3 ? 1 : 2);
  }
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', () => { cur = -1; update(); });
  /* re-run once assets/fonts settle so the thumb measures real pill widths */
  window.addEventListener('load', () => { cur = -1; update(); });
  if (PROC !== null) {
    const r = section.getBoundingClientRect();
    const stageH = sticky.getBoundingClientRect().height;
    window.scrollTo({ top: scrollY + r.top + (r.height - stageH) * parseFloat(PROC), behavior: 'instant' });
  }
  update();
})();

/* ============ 5. How-it-works step cycle ============ */
(() => {
  const DUR = 6000;
  const tabs = [...document.querySelectorAll('.step-tab')];
  const contents = [...document.querySelectorAll('.step-content')];
  const anims = [...document.querySelectorAll('.step-anim')];
  const track = document.getElementById('steps-left-track');
  const track2 = document.getElementById('steps-right-track');
  if (!track || !track2) return; // section replaced by the v2 process scroll-jack
  let step = 0, timer = null, started = false, fadeTimer = null;

  /* adjacent steps slide (matching the left track's motion); non-adjacent
     jumps (tab 1 → 3, or the auto-cycle wrapping 3 → 1) fade-cut instead */
  function moveRight(i, skip) {
    if (!track2) return;
    const y = `translateY(${-anims[i].offsetTop}px)`;
    clearTimeout(fadeTimer);
    if (!skip) {
      track2.style.transition = '';
      track2.style.opacity = '1';
      track2.style.transform = y;
      return;
    }
    track2.style.transition = 'opacity .22s ease';
    track2.style.opacity = '0';
    fadeTimer = setTimeout(() => {
      track2.style.transition = 'none';
      track2.style.transform = y;
      void track2.offsetWidth;
      track2.style.transition = 'opacity .3s ease';
      track2.style.opacity = '1';
    }, 230);
  }

  function activate(i) {
    const skip = Math.abs(i - step) > 1;
    step = i;
    tabs.forEach((t, j) => t.classList.toggle('active', j === i));
    anims.forEach((a, j) => a.classList.toggle('active', j === i));
    contents.forEach((c, j) => {
      c.classList.remove('running');
      if (j === i) { void c.offsetWidth; c.classList.add('running'); }
    });
    /* offsetTop instead of a hard-coded 400 so the slide survives responsive
       height changes */
    track.style.transform = `translateY(${-contents[i].offsetTop}px)`;
    moveRight(i, skip);
    clearTimeout(timer);
    timer = setTimeout(() => activate((i + 1) % 3), DUR);
  }
  tabs.forEach((t, i) => t.addEventListener('click', () => activate(i)));

  new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && !started) { started = true; activate(0); }
  }, { threshold: 0.3 }).observe(document.querySelector('.steps-panel'));

  document.documentElement.style.setProperty('--step-dur', DUR + 'ms');
})();

/* ============ 5b. Project switcher (app icons ↔ ticker sets) ============ */
(() => {
  const wrap = document.querySelector('.showcase-ticker-wrap');
  const icons = [...document.querySelectorAll('.app-icon')];
  const projs = [...document.querySelectorAll('.showcase-ticker-wrap .ticker.proj')];
  if (!wrap || !icons.length || !projs.length) return;
  /* icons target tickers via data-proj; the pill toggle swaps which icon dock
     (design projects vs app-store shots) is visible */
  const activate = selectedIcon => {
    const target = 'proj-' + selectedIcon.dataset.proj;
    icons.forEach(icon => {
      const isSelected = icon === selectedIcon;
      icon.classList.toggle('sel', isSelected);
      icon.setAttribute('aria-pressed', String(isSelected));
    });
    projs.forEach(p => p.classList.toggle('active', p.classList.contains(target)));
    selectedIcon.classList.remove('pop');
    void selectedIcon.offsetWidth;
    selectedIcon.classList.add('pop');
  };
  icons.forEach(icon => icon.addEventListener('click', () => {
    if (!icon.classList.contains('sel')) activate(icon);
  }));
  window.showcaseSetMode = mode => {
    wrap.classList.toggle('mode-store', mode === 'store');
    const first = document.querySelector(`.app-icons[data-mode="${mode}"] .app-icon`);
    if (first) activate(first);
  };
})();

/* ============ 6. Showcase pill toggle (springy sliding thumb) ============ */
(() => {
  const toggle = document.getElementById('pill-toggle');
  if (!toggle) return;
  const pills = [...toggle.querySelectorAll('.pill')];
  const thumb = toggle.querySelector('.pill-thumb');
  const moveThumb = (btn, instant) => {
    if (instant) thumb.style.transition = 'none';
    thumb.style.left = btn.offsetLeft + 'px';
    thumb.style.width = btn.offsetWidth + 'px';
    if (instant) { void thumb.offsetWidth; thumb.style.transition = ''; }
  };
  pills.forEach((p, i) => p.addEventListener('click', () => {
    pills.forEach((pill, index) => {
      const isActive = index === i;
      pill.classList.toggle('active', isActive);
      pill.setAttribute('aria-pressed', String(isActive));
    });
    moveThumb(p);
    if (window.showcaseSetMode) window.showcaseSetMode(i === 0 ? 'design' : 'store');
  }));
  const init = () => moveThumb(toggle.querySelector('.pill.active'), true);
  init();
  window.addEventListener('load', init);
  window.addEventListener('resize', init);
})();

/* ============ 7b. Apple-Intelligence scroll-jack ============ */
/* Section pins for ~1800px of scroll; progress drives the viewport edge glow
   and a feathered radial wipe that morphs the old screen into the new one. */
(() => {
  const section = document.querySelector('.intelligence');
  const sticky = document.querySelector('.intelligence-sticky');
  const wave = document.querySelector('.ai-wave');
  const iphone = document.querySelector('.iphone');
  if (!section || !sticky || !wave) return;

  // real mockup dropped in assets/? then hide the CSS bezel
  const frameImg = document.querySelector('.iphone-frame');
  if (frameImg) {
    if (frameImg.complete && frameImg.naturalWidth > 0) iphone.classList.add('has-frame');
    frameImg.addEventListener('load', () => iphone.classList.add('has-frame'));
  }

  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const easeInOut = t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  const JACK = new URLSearchParams(location.search).get('jack'); // debug: freeze at progress

  // state toggle straddling the phone bottom (thumb slides across the morph)
  const stThumb = document.querySelector('.stage-toggle-thumb');
  const stItems = document.querySelectorAll('.stage-toggle .st-item');

  /* mobile single-card mode: the left card's copy flips to the right card's
     copy once the morph completes (both cards' markup stays the source) */
  const PHASES = (() => {
    const read = sel => {
      const c = document.querySelector(sel);
      return c && {
        chip: c.querySelector('.chip span')?.textContent,
        head: c.querySelector('.float-card-text h4')?.textContent,
        text: c.querySelector('.float-card-text p')?.textContent,
      };
    };
    return [read('.float-card-left'), read('.float-card-right')];
  })();
  let phase = 0, swapTimer = null;
  function setPhase(i) {
    if (i === phase || !PHASES[0] || !PHASES[1]) return;
    phase = i;
    const card = document.querySelector('.float-card-left');
    clearTimeout(swapTimer);
    card.classList.add('fc-swap');
    swapTimer = setTimeout(() => {
      card.querySelector('.chip span').textContent = PHASES[phase].chip;
      const h = card.querySelector('.float-card-text h4');
      if (h && PHASES[phase].head) h.textContent = PHASES[phase].head;
      card.querySelector('.float-card-text p').textContent = PHASES[phase].text;
      card.classList.remove('fc-swap');
    }, 180);
  }

  let raf = null;
  function update() {
    raf = null;
    const r = section.getBoundingClientRect();
    const stageH = sticky.getBoundingClientRect().height;
    const total = r.height - stageH;
    const p = JACK !== null ? parseFloat(JACK) : (STATIC ? 0 : clamp(-r.top / total, 0, 1));

    // edge glow: ramps in, holds through the morph, ramps out
    let glow = 0;
    if (p > 0.12 && p < 0.3) glow = (p - 0.12) / 0.18;
    else if (p >= 0.3 && p <= 0.7) glow = 1;
    else if (p > 0.7 && p < 0.88) glow = 1 - (p - 0.7) / 0.18;

    // screen morph: bottom-to-top sweep with an iOS-style liquid ripple.
    // Ripple intensity bells up mid-morph and settles to zero at both ends.
    const morph = clamp((p - 0.32) / 0.4, 0, 1);
    const rev = easeInOut(morph) * 100;
    const ripple = Math.sin(Math.PI * morph);
    const warp = document.querySelector('.screen-warp');
    const turb = document.getElementById('ai-turb');
    const disp = document.getElementById('ai-disp');
    /* the displacement-filter ripple is too heavy for phone GPUs; mobile keeps
       the (cheap) radial wipe morph and skips the liquid effect */
    const noRipple = document.documentElement.classList.contains('is-mobile');
    if (warp && noRipple) warp.classList.remove('rippling');
    if (warp && turb && disp && !noRipple) {
      const breathe = 1 + 0.25 * Math.sin(p * 60); // evolving wavefront
      disp.setAttribute('scale', (ripple * 26 * breathe).toFixed(2));
      turb.setAttribute('baseFrequency',
        (0.010 + ripple * 0.007).toFixed(4) + ' ' + (0.018 + ripple * 0.010).toFixed(4));
      warp.classList.toggle('rippling', ripple > 0.02);
    }

    // float cards: left ("Send screenshots") wipes in early,
    // right ("Get designs") wipes in after the morph completes.
    // Mobile: one card under the phone — its text swaps at the morph instead.
    const m1 = easeInOut(clamp((p - 0.05) / 0.18, 0, 1));
    const m2 = easeInOut(clamp((p - 0.58) / 0.18, 0, 1));
    const cardL = document.querySelector('.float-card-left');
    const cardR = document.querySelector('.float-card-right');
    if (cardL) cardL.style.setProperty('--m', m1.toFixed(3));
    if (cardR) cardR.style.setProperty('--m', m2.toFixed(3));
    setPhase(document.documentElement.classList.contains('is-mobile') && p >= 0.58 ? 1 : 0);

    // toggle thumb: slides left pill → right pill in lockstep with the morph,
    // interpolating position AND width since the two labels differ in length
    if (stThumb && stItems.length === 2) {
      const sw = easeInOut(morph);
      const [a, b] = stItems;
      const x = a.offsetLeft + (b.offsetLeft - a.offsetLeft) * sw;
      const w = a.offsetWidth + (b.offsetWidth - a.offsetWidth) * sw;
      stThumb.style.transform = `translateX(${x.toFixed(1)}px)`;
      stThumb.style.width = w.toFixed(1) + 'px';
      a.classList.toggle('on', sw < 0.5);
      b.classList.toggle('on', sw >= 0.5);
    }

    // bg veil: hidden until the morph fully lands on state 2 (p ≈ 0.72),
    // then a feathered radial mask wipes outward from behind the phone
    const bgr = STATIC ? 1 : easeInOut(clamp((p - 0.74) / 0.16, 0, 1));
    sticky.style.setProperty('--bgr', bgr.toFixed(3));

    sticky.style.setProperty('--p', p.toFixed(4));
    sticky.style.setProperty('--glow', glow.toFixed(3));
    sticky.style.setProperty('--r', rev.toFixed(2));
    wave.style.setProperty('--glow', glow.toFixed(3));
    wave.style.setProperty('--ang', (p * 720).toFixed(1) + 'deg');
    wave.classList.toggle('on', glow > 0.01);
  }
  window.addEventListener('scroll', () => {
    if (document.hidden) return update();
    if (!raf) raf = requestAnimationFrame(update);
  }, { passive: true });
  window.addEventListener('resize', update);
  if (JACK !== null) {
    const r = section.getBoundingClientRect();
    const stageH = sticky.getBoundingClientRect().height;
    window.scrollTo({ top: scrollY + r.top + (r.height - stageH) * parseFloat(JACK), behavior: 'instant' });
  }
  update();
})();

/* ============ 7c2. Unfold gallery (Framer University grid-scroll, 1:1) ============ */
/* Each tile carries its hand-authored start transform (scale + pull toward
   center, exact demo values); scroll scrubs every tile linearly to identity.
   A light lerp follower adds the springy trailing feel of the original. */
(() => {
  const section = document.querySelector('.unfold');
  const sticky = document.querySelector('.unfold-sticky');
  const grid = document.getElementById('unfold-grid');
  if (!section || !grid) return;
  const tiles = [...grid.children].map(t => ({
    el: t,
    s: parseFloat(t.dataset.s),
    tx: parseFloat(t.dataset.tx),
    ty: parseFloat(t.dataset.ty),
  }));
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  let target = 0, shown = -1, raf = null;
  const easeOut = t => 1 - Math.pow(1 - t, 2.2);
  function apply(p) {
    tiles.forEach(({ el, s, tx, ty }) => {
      if (el.classList.contains('u-hero')) {
        // the hero: starts big and shrinks into its grid slot
        const hp = easeOut(clamp(p / 0.75, 0, 1));
        el.style.opacity = '1';
        el.style.transform = `scale(${(2.35 - 1.35 * hp).toFixed(3)})`;
        return;
      }
      // surrounding tiles: converge/scale over the first 90% of the runway…
      const mp = clamp(p / 0.9, 0, 1);
      const k = 1 - mp;
      el.style.transform =
        `translate(${(tx * k).toFixed(1)}px, ${(ty * k).toFixed(1)}px) scale(${(s + (1 - s) * mp).toFixed(3)})`;
      // …while appearing as dim ghosts first, then brightening to full
      const d = (1 - s) * 0.15;
      let op;
      if (p < 0.10 + d) op = 0;
      else if (p < 0.5) op = 0.3 * (p - (0.10 + d)) / (0.4 - d);
      else op = 0.3 + 0.7 * clamp((p - 0.5) / 0.35, 0, 1);
      el.style.opacity = clamp(op, 0, 1).toFixed(3);
    });
  }
  function readTarget() {
    const r = section.getBoundingClientRect();
    const total = r.height - sticky.getBoundingClientRect().height;
    /* total 0 = section display:none (mobile) — hold at 0 instead of NaN */
    target = STATIC ? 1 : (total > 0 ? clamp(-r.top / total, 0, 1) : 0);
  }
  function tick() {
    raf = null;
    readTarget();
    shown += (target - shown) * 0.16;
    if (Math.abs(target - shown) < 0.001) shown = target;
    apply(shown);
    if (shown !== target) raf = requestAnimationFrame(tick);
  }
  window.addEventListener('scroll', () => {
    if (document.hidden) { readTarget(); shown = target; return apply(shown); }
    if (!raf) raf = requestAnimationFrame(tick);
  }, { passive: true });
  window.addEventListener('resize', () => { if (!raf) raf = requestAnimationFrame(tick); });
  readTarget(); shown = target; apply(shown);
})();

/* ============ 8b. Footer marble jar (port of the MarbleJar iOS sim) ============ */
/* Physics constants, jar-interior geometry, and behaviour ported 1:1 from
   the Swift MarbleWorld (fixed 60Hz timestep, neck funnel, corner arcs,
   squash-on-impact, pop-out). One marble per visitor per day, localStorage. */
(() => {
  const canvas = document.getElementById('jar-canvas');
  if (!canvas) return;
  const stage = document.getElementById('jar-stage');
  const picker = document.getElementById('jar-picker');
  const dropBtn = document.getElementById('jar-drop');
  const note = document.getElementById('jar-note');
  const ctx = canvas.getContext('2d');

  /* jar design space 377x356; canvas is 2x for retina */
  const SCALE = 2;
  const CHARS = [
    { name: '完成', rEff: 87.36, overhang: 1.095 },
    { name: '很好', rEff: 87.99, overhang: 1.284 },
    { name: '喜欢', rEff: 94.98, overhang: 1.214 },
    { name: '还好', rEff: 93.70, overhang: 1.278 },
    { name: '工作', rEff: 90.26, overhang: 1.235 },
    { name: '一般', rEff: 91.08, overhang: 1.198 },
    { name: '紧绷', rEff: 73.68, overhang: 1.297 },
    { name: '不容易', rEff: 87.21, overhang: 1.207 },
  ];
  const imgs = CHARS.map((c, i) => {
    const im = new Image();
    im.src = 'assets/marbles/c' + i + '.svg';
    return im;
  });

  // interior geometry (Swift: L/R/B/CR + neck funnel)
  const L = 84, R = 293, B = 307, CR = 60;
  const neckL = 143, neckR = 234, neckBottom = 96, shoulderBottom = 132;
  const grav = 0.53, rest = 0.34, pairRest = 0.12, fric = 0.995;
  const stepMS = 1 / 60;

  let marbles = [], spawnQueue = [], lastSpawn = 0, acc = 0, lastT = 0, settled = false;

  // deterministic ambient pile so every visitor sees a lived-in jar
  let seed = 20260821;
  const srand = () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296;

  const radiusFor = n => {
    if (n <= 0) return 26;
    const area = (R - L) * (B - 110) * 0.82;
    return Math.max(11, Math.min(27, Math.sqrt(area / (n * Math.PI))));
  };

  function enqueue(skin, rnd) {
    spawnQueue.push({ skin, rnd: rnd || Math.random });
    settled = false;
  }

  function spawnOne() {
    if (!spawnQueue.length) return;
    const s = spawnQueue.shift();
    const rnd = s.rnd;
    const base = radiusFor(Math.max(marbles.length + 1, 7)) * (0.94 + rnd() * 0.12);
    const overhang = 1 + (CHARS[s.skin].overhang - 1) * 0.9;
    marbles.push({
      skin: s.skin, r: base, wallR: base * overhang,
      x: 188.5 + (rnd() * 44 - 22), y: -34,
      vx: rnd() * 1.5 - 0.75, vy: 1.5,
      squash: 0, angle: rnd() - 0.5, spin: rnd() * 0.1 - 0.05, pop: null,
    });
  }

  const boundsAtY = y => {
    if (y <= neckBottom) return [neckL, neckR];
    if (y >= shoulderBottom) return [L, R];
    const t = (y - neckBottom) / (shoulderBottom - neckBottom);
    return [neckL + (L - neckL) * t, neckR + (R - neckR) * t];
  };

  function walls(m) {
    const [wl, wr] = boundsAtY(m.y);
    const r = m.wallR;
    if (m.x - r < wl) { m.x = wl + r; m.vx = Math.abs(m.vx) * rest; }
    if (m.x + r > wr) { m.x = wr - r; m.vx = -Math.abs(m.vx) * rest; }
    for (const cx of [L + CR, R - CR]) {
      const inCorner = cx === L + CR ? m.x < cx : m.x > cx;
      if (inCorner && m.y > B - CR) {
        const dx = m.x - cx, dy = m.y - (B - CR);
        const d = Math.hypot(dx, dy), maxD = CR - r;
        if (d > maxD && d > 0.001) {
          const nx = dx / d, ny = dy / d;
          m.x = cx + nx * maxD;
          m.y = (B - CR) + ny * maxD;
          const vn = m.vx * nx + m.vy * ny;
          if (vn > 0) {
            if (vn > 2.8) m.squash = Math.min(0.32, vn * 0.044);
            m.vx -= nx * vn * (1 + rest);
            m.vy -= ny * vn * (1 + rest);
          }
        }
        return;
      }
    }
    if (m.y + r > B) {
      m.y = B - r;
      if (m.vy > 2.8) m.squash = Math.min(0.32, m.vy * 0.044);
      m.vy = -m.vy * rest;
      m.vx *= 0.92;
    }
  }

  function step(now, allowSpawn = true) {
    if (allowSpawn && spawnQueue.length && now - lastSpawn > 0.17) {
      spawnOne();
      lastSpawn = now;
    }
    for (let i = marbles.length - 1; i >= 0; i--) {
      if (marbles[i].pop !== null) {
        marbles[i].pop += 0.07;
        if (marbles[i].pop >= 1) marbles.splice(i, 1);
      }
    }
    for (const m of marbles) {
      if (m.pop !== null) continue;
      m.vy += grav;
      m.vx *= fric; m.vy *= fric;
      m.x += m.vx; m.y += m.vy;
      m.squash *= 0.86;
      m.angle += m.spin;
      m.spin *= 0.94;
      walls(m);
    }
    for (let pass = 0; pass < 2; pass++) {
      for (let i = 0; i < marbles.length; i++) {
        if (marbles[i].pop !== null) continue;
        for (let j = i + 1; j < marbles.length; j++) {
          if (marbles[j].pop !== null) continue;
          const a = marbles[i], b = marbles[j];
          const dx = b.x - a.x, dy = b.y - a.y;
          const minD = a.r + b.r, d = Math.hypot(dx, dy);
          if (d < minD && d > 0.001) {
            const nx = dx / d, ny = dy / d, push = (minD - d) / 2;
            a.x -= nx * push; a.y -= ny * push;
            b.x += nx * push; b.y += ny * push;
            const vn = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;
            if (vn < 0) {
              const imp = -(1 + pairRest) * vn / 2;
              a.vx -= nx * imp; a.vy -= ny * imp;
              b.vx += nx * imp; b.vy += ny * imp;
            }
            walls(a); walls(b);
          }
        }
      }
    }
  }

  const isCalm = () => !spawnQueue.length && marbles.every(m =>
    m.pop === null && Math.abs(m.vx) + Math.abs(m.vy) < 0.113 && m.squash < 0.01 && Math.abs(m.spin) < 0.004);

  function advance(now) {
    if (!lastT) lastT = now;
    acc = Math.min(acc + (now - lastT), 0.12);
    lastT = now;
    while (acc >= stepMS) { step(now); acc -= stepMS; }
    settled = isCalm();
  }

  function settleInstantly(iter = 400) {
    while (spawnQueue.length) spawnOne();
    for (let i = 0; i < iter; i++) step(0, false);
    settled = true;
  }

  function poke(px, py) {
    for (const m of marbles) {
      if (Math.hypot(m.x - px, m.y - py) < 88) {
        m.vx += (m.x - px) * 0.06 + (Math.random() - 0.5);
        m.vy -= 3.8 + Math.random() * 2.5;
      }
    }
    settled = false;
  }

  /* ---- drawing ---- */
  const jarPath = new Path2D('M140.533,28.9117 L236.906,28.9117 C236.906,50.1136 290.874,48.1862 292.802,92.5175 C294.247,121.429 294.729,150.341 294.729,191.781 C294.729,250.568 292.802,279.48 271.6,294.9 C252.325,306.464 217.631,308.392 188.719,308.392 C159.808,308.392 125.114,306.464 105.839,294.9 C84.6372,279.48 82.7097,250.568 82.7097,191.781 C82.7097,150.341 83.1916,121.429 84.6372,92.5175 C86.5646,48.1862 140.533,50.1136 140.533,28.9117 Z');
  function draw() {
    ctx.setTransform(SCALE, 0, 0, SCALE, 0, 0);
    ctx.clearRect(0, 0, 377, 356);
    ctx.save();
    ctx.clip(jarPath);
    for (const m of marbles) {
      const img = imgs[m.skin];
      if (!img.complete || !img.naturalWidth) continue;
      const size = 224 * (m.r / CHARS[m.skin].rEff);
      const popS = m.pop !== null ? 1 + m.pop * 0.35 : 1;
      ctx.save();
      ctx.translate(m.x, m.y);
      ctx.rotate(m.angle);
      ctx.scale((1 + m.squash) * popS, (1 - m.squash) * popS);
      if (m.pop !== null) ctx.globalAlpha = 1 - m.pop;
      ctx.drawImage(img, -size / 2, -size / 2, size, size);
      ctx.restore();
    }
    ctx.restore();
  }

  /* ---- persistence + daily gate ---- */
  const today = () => new Date().toISOString().slice(0, 10);
  const readJSON = (k, fb) => {
    try { return JSON.parse(localStorage.getItem(k)) || fb; } catch { return fb; }
  };
  const history = readJSON('jarMarbles', []);
  const droppedToday = () => history.some(h => h.date === today());

  /* seed: a few ambient marbles + the visitor's own past drops */
  for (let i = 0; i < 3; i++) enqueue(Math.floor(srand() * CHARS.length), srand);
  history.slice(-60).forEach(h => enqueue(h.skin, Math.random));

  /* ---- picker UI ---- */
  let picked = Math.floor(Math.random() * CHARS.length);
  const selectMood = (index, focus = false) => {
    picked = Math.min(CHARS.length - 1, Math.max(0, index));
    [...picker.querySelectorAll('.jar-pick')].forEach((button, i) => {
      const isSelected = i === picked;
      button.classList.toggle('on', isSelected);
      button.setAttribute('aria-checked', String(isSelected));
      button.tabIndex = isSelected ? 0 : -1;
      if (focus && isSelected) button.focus();
    });
  };
  CHARS.forEach((c, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'jar-pick' + (i === picked ? ' on' : '');
    b.setAttribute('role', 'radio');
    b.setAttribute('aria-label', c.name);
    b.setAttribute('aria-checked', String(i === picked));
    b.tabIndex = i === picked ? 0 : -1;
    b.title = c.name;
    b.innerHTML = '<img src="assets/marbles/c' + i + '.svg" alt="">';
    b.addEventListener('click', () => selectMood(i));
    picker.appendChild(b);
  });
  picker.addEventListener('keydown', event => {
    const radio = event.target.closest('.jar-pick');
    if (!radio) return;
    const radios = [...picker.querySelectorAll('.jar-pick')];
    const current = radios.indexOf(radio);
    let next;
    switch (event.key) {
      case 'ArrowLeft':
      case 'ArrowUp': next = (current - 1 + radios.length) % radios.length; break;
      case 'ArrowRight':
      case 'ArrowDown': next = (current + 1) % radios.length; break;
      case 'Home': next = 0; break;
      case 'End': next = radios.length - 1; break;
      default: return;
    }
    event.preventDefault();
    selectMood(next, true);
  });

  let fills = 0;
  try { fills = parseInt(localStorage.getItem('jarFills')) || 0; } catch {}

  function refreshGate() {
    dropBtn.textContent = '放下一颗弹珠';
    const fillNote = fills ? '已经装满 ' + fills + ' 次。' : '';
    note.textContent = history.length
      ? fillNote + '这里收着你的 ' + history.length + ' 颗弹珠。'
      : fillNote + '选一种心情，再把它放进去。';
  }
  refreshGate();

  /* ---- jar-full celebration: confetti + wiggle, then every marble pops
     out (the app's own pop animation) and a fresh jar begins ---- */
  const FULL_N = 30;
  const fx = document.getElementById('jar-fx');
  const fxCtx = fx ? fx.getContext('2d') : null;
  let celebrating = false;

  function confetti() {
    if (!fxCtx) return;
    const box = fx.getBoundingClientRect();
    fx.width = box.width * 2; fx.height = box.height * 2;
    fxCtx.setTransform(2, 0, 0, 2, 0, 0);
    const FW = box.width, FH = box.height;
    const sr = stage.getBoundingClientRect();
    const mx = (sr.left - box.left) + sr.width * 0.5;
    const my = (sr.top - box.top) + sr.height * 0.06;
    const COLORS = ['#99D51E', '#FFD023', '#FD7478', '#7f9bff', '#8a55e8', '#f5a623', '#4f83ea', '#20a684'];
    const parts = [];
    for (let i = 0; i < 90; i++) {
      const a = -Math.PI / 2 + (Math.random() - 0.5) * 1.3;
      const sp = 5 + Math.random() * 8;
      parts.push({
        x: mx + (Math.random() - 0.5) * 60, y: my,
        vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
        rot: Math.random() * 6.3, vr: (Math.random() - 0.5) * 0.35,
        c: COLORS[Math.random() * COLORS.length | 0],
        round: Math.random() < 0.3,
        s: 4 + Math.random() * 5,
      });
    }
    const t0 = performance.now();
    (function fxLoop(now) {
      const t = (now - t0) / 1000;
      fxCtx.clearRect(0, 0, FW, FH);
      if (t > 3) return;
      for (const p of parts) {
        p.x += p.vx; p.y += p.vy;
        p.vy += 0.26; p.vx *= 0.99;
        p.rot += p.vr;
        if (p.y > FH + 20) continue;
        fxCtx.save();
        fxCtx.translate(p.x, p.y);
        fxCtx.rotate(p.rot);
        fxCtx.fillStyle = p.c;
        fxCtx.globalAlpha = Math.min(1, 3 * (3 - t) / 3);
        if (p.round) { fxCtx.beginPath(); fxCtx.arc(0, 0, p.s / 2, 0, 7); fxCtx.fill(); }
        else fxCtx.fillRect(-p.s / 2, -p.s * 0.8, p.s, p.s * 1.6);
        fxCtx.restore();
      }
      requestAnimationFrame(fxLoop);
    })(t0);
  }

  function celebrate() {
    if (celebrating) return;
    celebrating = true;
    fills++;
    try { localStorage.setItem('jarFills', String(fills)); } catch {}
    history.length = 0;
    try { localStorage.setItem('jarMarbles', '[]'); } catch {}

    if (REDUCED) {
      marbles.length = 0;
      for (let i = 0; i < 3; i++) enqueue(Math.floor(Math.random() * CHARS.length));
      settleInstantly(); draw();
      note.textContent = '这一罐已经装满 ' + fills + ' 次。换个新罐，继续放吧。';
      celebrating = false;
      return;
    }

    stage.classList.add('party');
    confetti();
    note.textContent = '装满了！\u{1F389} 正在为第 ' + (fills + 1) + ' 轮腾出空间…';

    /* cascade-pop every marble, oldest first */
    setTimeout(() => {
      marbles.forEach((m, i) => setTimeout(() => { m.pop = 0; settled = false; }, i * 45));
      running = true;
      requestAnimationFrame(loop);
      const wait = marbles.length * 45 + 900;
      setTimeout(() => {
        stage.classList.remove('party');
        for (let i = 0; i < 3; i++) enqueue(Math.floor(Math.random() * CHARS.length));
        running = true;
        requestAnimationFrame(loop);
        refreshGate();
        celebrating = false;
      }, wait);
    }, 950);
  }

  dropBtn.addEventListener('click', () => {
    history.push({ date: today(), skin: picked });
    try { localStorage.setItem('jarMarbles', JSON.stringify(history.slice(-60))); } catch {}
    enqueue(picked, Math.random);
    refreshGate();
    if (REDUCED) {
      settleInstantly();
      draw();
    } else {
      running = true;
      requestAnimationFrame(loop);
    }
    if (!celebrating && marbles.length + spawnQueue.length >= FULL_N) setTimeout(celebrate, 1300);
  });

  canvas.addEventListener('pointerdown', e => {
    const r = canvas.getBoundingClientRect();
    poke((e.clientX - r.left) / r.width * 377, (e.clientY - r.top) / r.height * 356);
    if (REDUCED) {
      settleInstantly();
      draw();
    } else {
      running = true;
      requestAnimationFrame(loop);
    }
  });

  /* ---- run loop: only while visible and not settled ---- */
  let running = false, visible = false;
  function loop(now) {
    if (!running) return;
    advance(now / 1000);
    draw();
    if (settled && !spawnQueue.length) { running = false; lastT = 0; return; }
    requestAnimationFrame(loop);
  }

  const start = () => {
    if (STATIC || REDUCED) { settleInstantly(); draw(); return; }
    if (!running) { running = true; lastT = 0; requestAnimationFrame(loop); }
  };

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(es => {
      es.forEach(e => {
        visible = e.isIntersecting;
        if (visible) start();
        else running = false;
      });
    }, { threshold: 0.1 }).observe(stage);
  } else start();

  /* images may finish loading after a settled draw — repaint once ready */
  imgs.forEach(im => im.addEventListener('load', () => { if (!running) draw(); }));

  /* debug handle (used by the build tooling; harmless in prod) */
  window.__jar = { settleInstantly, draw, enqueue, marbles: () => marbles, imgs };
})();

/* ============ 8d. Deferred-asset hydration ============ */
/* Hidden project sets, unfold tiles, and the About video only fetch when the
   visitor approaches them — crawlers and cold loads skip unnecessary requests. */
(() => {
  const hydrate = root => root.querySelectorAll('img[data-src]').forEach(i => {
    i.src = i.dataset.src;
    i.removeAttribute('data-src');
  });
  /* plain scroll-distance check (not IO): fires reliably even when the
     compositor throttles, and never fires for non-scrolling crawlers */
  const watch = (el, margin, fn) => {
    if (!el) return;
    let done = false;
    const check = () => {
      if (done) return;
      const r = el.getBoundingClientRect();
      if (r.top < innerHeight + margin && r.bottom > -margin) {
        done = true;
        window.removeEventListener('scroll', check);
        fn();
      }
    };
    window.addEventListener('scroll', check, { passive: true });
    window.addEventListener('load', check);
    (window.__hydrateKick = window.__hydrateKick || []).push(check);
    check();
  };
  watch(document.querySelector('.showcase-ticker-wrap'), 1400,
    () => hydrate(document.querySelector('.showcase-ticker-wrap')));
  watch(document.getElementById('unfold-grid'), 1400,
    () => hydrate(document.getElementById('unfold-grid')));
  const aboutVideo = document.querySelector('.about-bg[data-vsrc]');
  if (REDUCED) {
    if (aboutVideo) {
      aboutVideo.removeAttribute('autoplay');
      aboutVideo.pause();
    }
    return;
  }
  watch(aboutVideo, 1400, () => {
    if (!aboutVideo || aboutVideo.src) return;
    aboutVideo.src = aboutVideo.dataset.vsrc;
    aboutVideo.removeAttribute('data-vsrc');
    aboutVideo.play().catch(() => {});
  });
})();

/* ============ 8e. Footer weather: rain, cap splashes, lightning ============ */
(() => {
  const footer = document.querySelector('.footer-v2');
  const canvas = footer && footer.querySelector('.rain-canvas');
  if (!canvas || STATIC || REDUCED) return;
  const ctx = canvas.getContext('2d');
  const cover = document.querySelector('.page-cover');
  const stage = document.getElementById('jar-stage');
  const DPR = Math.min(2, window.devicePixelRatio || 1);
  let W = 0, H = 0, capY = 0, capL = 0, capR = 0, shoY = 0, bodyL = 0, bodyR = 0, groundY = 0;

  const size = () => {
    W = footer.clientWidth; H = footer.clientHeight;
    canvas.width = W * DPR; canvas.height = H * DPR;
    canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    /* jar hitboxes, measured off the live stage box (377x356 design space):
       cap spans x 128-249 at y~0, glass shoulders reach full body width ~y50 */
    const fr = footer.getBoundingClientRect(), sr = stage.getBoundingClientRect();
    const sx = sr.left - fr.left, sy = sr.top - fr.top, sw = sr.width, sh = sr.height;
    capL = sx + sw * 0.335; capR = sx + sw * 0.665; capY = sy + sh * 0.015;
    bodyL = sx + sw * 0.215; bodyR = sx + sw * 0.785; shoY = sy + sh * 0.145;
    groundY = H - 24;
  };
  size();
  window.addEventListener('resize', size);

  const drops = [], splashes = [];
  const spawn = d => Object.assign(d || {}, {
    x: Math.random() * (W + 80) - 40,
    y: -20 - Math.random() * H * 0.4,
    v: 9.5 + Math.random() * 5,
    len: 11 + Math.random() * 9,
    a: 0.16 + Math.random() * 0.24,
  });
  for (let i = 0; i < 70; i++) drops.push(spawn());

  const splash = (x, y, big) => {
    for (let i = 0, n = big ? 6 : 4; i < n; i++) {
      splashes.push({
        x, y,
        vx: (Math.random() - 0.5) * (big ? 3 : 2.2),
        vy: -(1.5 + Math.random() * (big ? 2.6 : 1.8)),
        life: 1,
        r: big ? 1.7 : 1.2,
      });
    }
  };

  let flash = 0, bolt = null, nextFlash = 0;
  const makeBolt = () => {
    const pts = [[W * (0.12 + Math.random() * 0.76), 0]];
    while (pts[pts.length - 1][1] < H * (0.3 + Math.random() * 0.25)) {
      const [px, py] = pts[pts.length - 1];
      pts.push([px + (Math.random() - 0.5) * 58, py + 22 + Math.random() * 32]);
    }
    return pts;
  };

  const WIND = 0.6;
  function draw(now) {
    ctx.clearRect(0, 0, W, H);
    if (!nextFlash) nextFlash = now + 3000 + Math.random() * 5000;

    /* lightning: sky flash with a double-pulse dip + a glowing bolt */
    if (now > nextFlash) {
      flash = 1;
      bolt = makeBolt();
      nextFlash = now + 7000 + Math.random() * 9000;
    }
    if (flash > 0) {
      const f = flash > 0.55 && flash < 0.7 ? 0.22 : flash;
      ctx.fillStyle = 'rgba(222,233,255,' + (f * 0.3).toFixed(3) + ')';
      ctx.fillRect(0, 0, W, H);
      if (bolt && flash > 0.55) {
        ctx.strokeStyle = 'rgba(255,255,255,' + flash.toFixed(2) + ')';
        ctx.lineWidth = 2.2;
        ctx.lineJoin = 'round';
        ctx.shadowColor = '#9db8ff';
        ctx.shadowBlur = 16;
        ctx.beginPath();
        bolt.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]));
        ctx.stroke();
        ctx.shadowBlur = 0;
      }
      flash -= 0.045;
      if (flash <= 0) { flash = 0; bolt = null; }
    }

    /* rain */
    ctx.strokeStyle = '#8fa8cf';
    ctx.lineCap = 'round';
    ctx.lineWidth = 1.4;
    for (const d of drops) {
      ctx.globalAlpha = d.a;
      ctx.beginPath();
      ctx.moveTo(d.x, d.y);
      ctx.lineTo(d.x - WIND * (d.len / d.v) * 2, d.y - d.len);
      ctx.stroke();
      d.x += WIND;
      d.y += d.v;
      const prevY = d.y - d.v;
      const hitCap = d.x > capL && d.x < capR && d.y >= capY && prevY < capY;
      const hitSho = !hitCap && d.x > bodyL && d.x < bodyR && d.y >= shoY && prevY < shoY;
      if (hitCap || hitSho) {
        splash(d.x, hitCap ? capY : shoY, hitCap);
        spawn(d);
        d.y = -20;
      } else if (d.y > groundY) {
        if (Math.random() < 0.55) splash(d.x, groundY, false);
        spawn(d);
        d.y = -20;
      }
    }
    ctx.globalAlpha = 1;

    /* splash particles */
    for (let i = splashes.length - 1; i >= 0; i--) {
      const s = splashes[i];
      s.life -= 0.055;
      if (s.life <= 0) { splashes.splice(i, 1); continue; }
      s.x += s.vx;
      s.y += s.vy;
      s.vy += 0.3;
      ctx.globalAlpha = s.life * 0.75;
      ctx.fillStyle = '#b8cdec';
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r * s.life + 0.4, 0, 7);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  let running = false;
  function frame(now) {
    if (!running) return;
    draw(now);
    requestAnimationFrame(frame);
  }
  const gate = () => {
    const on = !cover || cover.getBoundingClientRect().bottom < innerHeight - 40;
    if (on && !running) { running = true; requestAnimationFrame(frame); }
    else if (!on) running = false;
  };
  window.addEventListener('scroll', gate, { passive: true });
  gate();

  window.__rain = { draw, size }; /* debug handle */
})();

/* ============ 8c. Reveal-footer spacer ============ */
/* .page-cover's bottom margin must equal the fixed footer's height so the
   page can scroll far enough to fully reveal it. */
(() => {
  const f = document.querySelector('.footer-v2');
  const cover = document.querySelector('.page-cover');
  if (!f || !cover) return;
  const sync = () => { cover.style.marginBottom = f.offsetHeight + 'px'; };
  window.addEventListener('resize', sync);
  window.addEventListener('load', sync);
  sync();
})();

/* Original WebGL burn dissolve: an fbm noise field defines how the page
   surface chars away as scroll sweeps a threshold; a soft two-tone ember
   band glows along the burning edge, with drifting grain for texture. */
(() => {
  const wrap = document.querySelector('.burnwrap');
  const canvas = document.getElementById('burn-canvas');
  if (!wrap || !canvas) return;
  const gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: true });
  if (!gl) { canvas.remove(); return; }

  const VERT = `attribute vec2 a; void main(){ gl_Position = vec4(a, 0.0, 1.0); }`;
  const FRAG = `
precision mediump float;
uniform vec2 u_res;
uniform float u_p;    // burn progress 0..1
uniform float u_t;    // seconds, for ember flicker + noise drift
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float vnoise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
}
float fbm(vec2 p){
  float v = 0.0, a = 0.5;
  for (int k = 0; k < 4; k++) { v += a * vnoise(p); p *= 2.03; a *= 0.5; }
  return v;
}
void main(){
  vec2 uv = gl_FragCoord.xy / u_res;
  vec2 asp = vec2(u_res.x / u_res.y, 1.0);
  float n = fbm(uv * asp * 5.0 + vec2(0.0, u_t * 0.03));
  // burn field: noise + downward bias so the burn eats from the top
  float field = n * 0.72 + uv.y * 0.42;
  float th = u_p * 1.35 - 0.06;
  float solid = smoothstep(th, th + 0.015, field);      // untouched page
  float charBand  = smoothstep(th - 0.015, th, field);  // thin charred rim
  float emberBand = smoothstep(th - 0.075, th - 0.015, field);
  float glowBand  = smoothstep(th - 0.16, th - 0.075, field);
  float grain = (hash(uv * u_res * 0.5 + floor(u_t * 8.0)) - 0.5) * 0.022;
  float flick = 0.85 + 0.15 * vnoise(uv * asp * 22.0 + u_t * 1.6);
  vec3 page  = vec3(0.953, 0.953, 0.976) + grain;       // #F3F3F9 surface
  vec3 charc = vec3(0.13, 0.075, 0.05);
  vec3 ember = vec3(1.0, 0.42, 0.08) * flick;
  vec3 glow  = vec3(1.0, 0.72, 0.28) * flick;
  vec3 col = vec3(0.0);
  float aOut = 0.0;
  col += page * solid;                 aOut += solid;
  col += charc * (charBand - solid);   aOut += (charBand - solid);
  col += ember * (emberBand - charBand) * 0.95; aOut += (emberBand - charBand) * 0.9;
  col += glow * (glowBand - emberBand) * 0.45;  aOut += (glowBand - emberBand) * 0.35;
  gl_FragColor = vec4(col * min(aOut, 1.0), min(aOut, 1.0));
}`;

  function sh(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw gl.getShaderInfoLog(s);
    return s;
  }
  const prog = gl.createProgram();
  gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
  gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(prog); gl.useProgram(prog);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 3,-1, -1,3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'a');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const uRes = gl.getUniformLocation(prog, 'u_res');
  const uP = gl.getUniformLocation(prog, 'u_p');
  const uT = gl.getUniformLocation(prog, 'u_t');

  function resize() {
    const d = Math.min(2, devicePixelRatio || 1);
    canvas.width = canvas.clientWidth * d;
    canvas.height = canvas.clientHeight * d;
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform2f(uRes, canvas.width, canvas.height);
  }
  resize();
  window.addEventListener('resize', resize);

  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  let p = 0, visible = false, raf = null;
  function progress() {
    const r = wrap.getBoundingClientRect();
    const band = document.querySelector('.burn-sticky').getBoundingClientRect().height;
    const total = r.height - band;
    p = STATIC ? 1 : clamp(((innerHeight - band) - r.top) / total, 0, 1);
  }
  function draw(now) {
    raf = null;
    progress();
    gl.uniform1f(uP, p);
    gl.uniform1f(uT, (now || performance.now()) / 1000);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    // keep animating (ember flicker) while mid-burn and on screen
    if (visible && p > 0.001 && p < 0.999) raf = requestAnimationFrame(draw);
  }
  new IntersectionObserver(es => {
    visible = es[0].isIntersecting;
    if (visible && !raf) raf = requestAnimationFrame(draw);
  }).observe(wrap);
  window.addEventListener('scroll', () => {
    if (document.hidden) return draw();
    if (visible && !raf) raf = requestAnimationFrame(draw);
  }, { passive: true });
  draw();
})();

/* ============ 8. Reveal on scroll ============ */
(() => {
  const targets = document.querySelectorAll(
    '.hero > *, .showcase-head, .showcase-body > *, ' +
    '.bento-head, .bento-card, .hiw-head-content, .why-us'
  );
  if (STATIC) return;
  targets.forEach(t => t.classList.add('reveal'));
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); obs.unobserve(e.target); }
    });
  }, { threshold: 0.15 });
  targets.forEach(t => obs.observe(t));
})();
