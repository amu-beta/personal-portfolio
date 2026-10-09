import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';

const pageUrl = (file) => new URL(`../${file}`, import.meta.url);
const readPage = (file) => readFileSync(pageUrl(file), 'utf8');
const forbiddenLearningMetrics = /\d{1,2}月\d{1,2}日|\d{4}年(?:\d{1,2}月)?(?:\d{1,2}日?)?|\d{1,4}[./-]\d{1,2}[./-]\d{1,4}|\d{4}[./-]\d{1,2}|\d+(?:\.\d+)?\s*(?:阅读|浏览|views?)/i;

test('home interface copy is Chinese', () => {
  const html = readPage('index.html');
  const runtime = readPage('script.js');
  const homeInterface = `${html}\n${runtime}`.replace(/<[^>]+>|\s+/g, '');

  for (const phrase of [
    '让应用焕然一新',
    '更有质感',
    '更像成品',
    '让人记住',
    '真实项目，完整呈现。',
    '每个细节，都有理由。',
    '关于我和我的工作方式。',
    '在这里种下一棵树',
    '选一种心情',
    '放下一颗弹珠',
    '系统化设计',
    '统一视觉语言，让每次迭代都有依据。',
    'SeerQ·色彩与图标规范',
  ]) {
    assert.match(homeInterface, new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }

  assert.doesNotMatch(html, /Make Your App|Book a call|Our Work|Simple pricing|Testimonials|Onboarding|10 screens|Auth|8 screens/);
});

test('home CSS removes deleted commercial section styles', () => {
  const styles = readPage('styles.css');

  assert.doesNotMatch(
    styles,
    /\.(?:pricing-sec|pricing-head|pricing-cards|price-card|testimonials|testi-head|testi-phone|tweet-ticker-wrap|cal-frame|cal-mid|cal-inner|cfg-[\w-]*|sub-[\w-]*|plan-(?:card|art|seal|top|name-row|desc|priceline|price|list|item|ico))/,
  );
});

test('home full-bleed width uses the visible client width when a scrollbar is present', () => {
  const runtime = readPage('script.js');

  assert.match(
    runtime,
    /canvas\.style\.setProperty\(['"]--vwz['"],\s*\(document\.documentElement\.clientWidth\s*\/\s*z\)\.toFixed\(1\)\s*\+\s*['"]px['"]\)/,
    'the full-bleed canvas width must be based on clientWidth, not 100vw including the scrollbar',
  );
  assert.doesNotMatch(
    runtime,
    /canvas\.style\.removeProperty\(['"]--vwz['"]\)/,
    'the visible-width override must also apply at desktop zoom',
  );
});

test('reduced motion freezes ASCII, Bento typing, and About video hydration', () => {
  const html = readPage('index.html');
  const runtime = readPage('script.js');

  assert.match(runtime, /const freezeAscii\s*=\s*STATIC\s*\|\|\s*REDUCED/);
  assert.match(runtime, /if\s*\(!freezeAscii\)\s*requestAnimationFrame\(draw\)/);
  assert.match(runtime, /if\s*\(freezeAscii\)\s*\{[\s\S]*?video\.pause\(\)/);
  assert.match(runtime, /if\s*\(STATIC\s*\|\|\s*REDUCED\)\s*\{\s*target\.textContent\s*=\s*TEXT;\s*return;\s*\}/);
  assert.match(
    html,
    /<video\b[^>]*class="about-bg"[^>]*\bposter="assets\/about-art-poster\.jpg"[^>]*>/,
    'the non-playing About state needs a readable local poster',
  );
  assert.match(runtime, /if\s*\(REDUCED\)\s*\{[\s\S]*?aboutVideo\.removeAttribute\(['"]autoplay['"]\)[\s\S]*?aboutVideo\.pause\(\)[\s\S]*?return;[\s\S]*?\}/);
});

test('home interactive selectors expose and update accessible state', () => {
  const html = readPage('index.html');
  const runtime = readPage('script.js');

  assert.doesNotMatch(html, /hero-overlay-circles|role="slider"/);

  assert.match(html, /<button\b[^>]*class="pill [^"]*active"[^>]*\baria-pressed="true"[^>]*>\s*产品界面\s*</);
  assert.match(html, /<button\b[^>]*class="pill ui-segmented__item"[^>]*\baria-pressed="false"[^>]*>\s*视觉专题\s*</);
  assert.equal((html.match(/class="app-icon[^"\n]*"[^>]*\baria-pressed="(?:true|false)"/g) || []).length, 5);
  assert.match(runtime, /icon\.setAttribute\(['"]aria-pressed['"],\s*String\(isSelected\)\)/);
  assert.match(runtime, /pill\.setAttribute\(['"]aria-pressed['"],\s*String\(isActive\)\)/);

  assert.match(runtime, /b\.setAttribute\(['"]aria-checked['"],\s*String\(i\s*===\s*picked\)\)/);
  assert.match(runtime, /b\.tabIndex\s*=\s*i\s*===\s*picked\s*\?\s*0\s*:\s*-1/);
  assert.match(runtime, /picker\.addEventListener\(['"]keydown['"]/);
  for (const key of ['ArrowLeft', 'ArrowRight', 'Home', 'End']) {
    assert.match(runtime, new RegExp(`case\\s+['"]${key}['"]`), `marble radios must handle ${key}`);
  }
});

test('works and AI learning pages exist with shared Chinese navigation', () => {
  assert.equal(existsSync(pageUrl('works.html')), true, 'works.html must exist');
  assert.equal(existsSync(pageUrl('ai-learning.html')), true, 'ai-learning.html must exist');

  for (const file of ['index.html', 'works.html', 'ai-learning.html']) {
    const html = readPage(file);
    assert.match(html, /<html\b[^>]*\blang="zh-CN"[^>]*>/, `${file} must declare lang=zh-CN`);
    assert.match(html, /class="[^"]*\btree-logo\b[^"]*"/, `${file} must contain the tree logo`);
    assert.match(html, /href="works\.html"/, `${file} must link to works.html`);
    assert.match(html, /href="ai-learning\.html"/, `${file} must link to ai-learning.html`);
  }
});

test('home retains the work showcase and removes commercial/social sections', () => {
  const html = readPage('index.html');
  assert.match(html, /<section class="showcase" id="work">/);
  assert.equal(html.includes('class="pricing-sec"'), false, 'home must not contain pricing');
  assert.equal(html.includes('class="testimonials"'), false, 'home must not contain testimonials');
  assert.equal(/id="cal-slot"|app\.cal\.com|href="#book"/.test(html), false, 'home must not contain booking UI');
});

test('intelligence heading stays on one responsive line', () => {
  const html = readPage('index.html');
  const css = readPage('styles.css');
  assert.doesNotMatch(html, /<section class="intelligence"/);
  assert.doesNotMatch(css, /\.intelligence\s*\{/);
});

test('browser feedback is reflected across the home page', () => {
  const html = readPage('index.html');
  const css = readPage('styles.css');
  const js = readPage('script.js');

  assert.match(html, /5 年全流程 UI 设计经验，以用户体验 \+ 数据驱动决策覆盖需求梳理、原型、视觉和落地；擅长把设计工具与 AI 体系结合到实际工作流里。/);
  assert.match(html, /<img src="assets\/codex-icon\.png" alt="">Codex 协作/);
  assert.doesNotMatch(html, /class="ba-pill"|class="ticker ticker-gray"|class="hero-overlay"/);
  assert.doesNotMatch(html, /<section class="intelligence"|<section class="process"/);
  assert.match(html, /<h2>真实项目，<span class="blue">完整呈现。<\/span><\/h2>/);
  assert.match(html, /<h2>关于我和我的<span class="blue">工作方式。<\/span><\/h2>/);
  assert.match(html, /Codex 协作/);
  assert.match(html, /<div class="ac-name">Chloe<\/div>/);
  assert.match(html, /我用 Codex 重新归纳和总结以往项目/);
  assert.doesNotMatch(html, /Claude|Rehan Ahmed/);
  assert.match(html, /id="back-to-top"[^>]*aria-label="回到顶部"/);

  assert.match(css, /\.hero-zone::before\s*\{[^}]*background:\s*#fff;/s);
  assert.match(css, /\.showcase-head h2[^}]*white-space:\s*nowrap;/s);
  assert.match(css, /\.about-head h2[^}]*white-space:\s*nowrap;/s);
  assert.match(css, /\.back-to-top\s*\{/);
  assert.match(js, /getElementById\('back-to-top'\)/);
});

test('all site buttons share the reference-driven variant system', () => {
  const css = readPage('styles.css');
  const home = readPage('index.html');
  const works = readPage('works.html');
  const script = readPage('script.js');
  const detailPages = ['project-seerq.html', 'project-fengsuitang.html', 'project-topic.html', 'project-overseas.html', 'project-overseas-en.html', 'project-operations.html'].map(readPage);

  for (const token of ['--control-solid-bg', '--control-outline-bg', '--control-muted-bg', '--button-height', '--button-radius']) {
    assert.match(css, new RegExp(`${token}:`), `${token} must be defined once for the shared button system`);
  }
  assert.match(css, /\.ui-button\s*\{[^}]*min-height:\s*var\(--button-height\)[^}]*border-radius:\s*var\(--button-radius\)/s);
  assert.match(css, /\.ui-button::after\s*\{[^}]*mask:[^}]*svg/s, 'text buttons must use the pixel chevron from the reference');
  assert.match(css, /\.ui-button--solid\s*\{[^}]*background:\s*var\(--control-solid-bg\)[^}]*color:\s*var\(--control-solid-fg\)/s);
  assert.match(css, /\.ui-button--outline\s*\{[^}]*border-color:\s*var\(--control-outline-border\)[^}]*background:\s*var\(--control-outline-bg\)/s);
  assert.match(css, /\.ui-button--muted\s*\{[^}]*background:\s*var\(--control-muted-bg\)[^}]*color:\s*var\(--control-muted-fg\)/s);
  assert.match(css, /\.ui-button--back::after\s*\{[^}]*order:\s*-1[^}]*scaleX\(-1\)/s, 'return buttons must place a reversed arrow before the label');
  assert.match(css, /\.ui-icon-button:focus-visible/);
  assert.match(css, /\.ui-segmented__item\.active\s*\{[^}]*background:\s*var\(--control-solid-bg\)/s);

  assert.match(home, /class="btn-dark ui-button ui-button--solid"[^>]*>\s*<span>查看作品集<\/span>/);
  assert.match(home, /class="pill-toggle ui-segmented"/);
  assert.match(home, /class="jar-drop ui-button ui-button--solid"/);
  assert.match(home, /class="back-to-top ui-icon-button ui-icon-button--outline"/);
  assert.equal((home.match(/ui-icon-button ui-icon-button--muted/g) || []).length, 5, 'five project icon selectors must use the muted icon-button variant');
  assert.match(script, /jar-pick ui-icon-button ui-icon-button--muted/);

  for (const [name, html] of [['home', home], ['works', works], ...detailPages.map((html, index) => [`detail-${index + 1}`, html])]) {
    for (const match of html.matchAll(/<button\b[^>]*>/g)) {
      assert.match(match[0], /class="[^"]*\bui-(?:button|icon-button|segmented__item)\b/, `${name} button must opt into the shared system: ${match[0]}`);
    }
  }

  assert.equal((works.match(/featured-case-button ui-button ui-button--solid/g) || []).length, 8);
  assert.equal((works.match(/featured-project-link ui-button ui-button--outline/g) || []).length, 4);
  assert.match(works, /class="featured-tabs ui-segmented"/);

  detailPages.forEach((html) => {
    assert.match(html, /class="project-back ui-button ui-button--muted ui-button--back"/);
    assert.match(html, /class="btn-dark ui-button ui-button--solid"/);
    assert.match(html, /class="ui-button ui-button--outline"[^>]*>\s*<span>下一个项目<\/span>/);
    assert.doesNotMatch(html, /[←→↗]/, 'button direction must come from the shared icon system, not text glyphs');
  });
});

test('works page uses the referenced portfolio content in the existing design system', () => {
  assert.equal(existsSync(pageUrl('works.html')), true, 'works.html must exist');
  const html = readPage('works.html');
  const runtime = readPage('pages.js');
  const projects = [
    { kind: 'app', title: '先知命局 SeerQ DESIGN', type: 'PRODUCT DESIGN', year: '2024 - 2026', page: 'project-seerq.html', cover: 'cover-seerq.jpg', details: ['app1.png', 'app2.png'], href: 'https://play.google.com/store/apps/details?id=com.mmc.seer.onnet&hl=zh' },
    { kind: 'app', title: 'AI 六爻卜卦', type: 'AI PRODUCT DESIGN', year: '2026', page: 'project-liuyao.html', cover: 'liuyao/2003-1109-raw-01.png', details: ['liuyao/2014-619-raw-03.png', 'liuyao/2020-961-raw-04.png'] },
    { kind: 'website', title: '枫燧堂（香港）PC 端官网', type: 'WEB DESIGN', year: '2025', page: 'project-fengsuitang.html', cover: 'cover-fengsuitang.jpg', details: ['fengsui1.jpg', 'fengsui2.jpg'], href: 'https://fengsuitang.com/' },
    { kind: 'topic', title: '运势专题改版', type: 'VISUAL DESIGN', year: '2025', page: 'project-topic.html', cover: 'cover-topic.jpg', details: ['zhuangti1.jpg', 'zhuangti2.jpg'], href: 'https://www.seeronnet.com/seer/onlinecs' },
    { kind: 'topic', title: '海外中文 · 视觉专题设计', type: 'VISUAL DESIGN', year: '2024', page: 'project-overseas.html', cover: 'cover-overseas.jpg', details: ['haiwai1.jpg', 'haiwai2.jpg'] },
    { kind: 'topic', title: '海外英文 · 视觉专题设计', type: 'VISUAL DESIGN', year: '2025', page: 'project-overseas-en.html', cover: 'cover-overseas-en.jpg', details: ['haiwai-en1.jpg', 'haiwai-en2.jpg'] },
    { kind: 'operations', title: '运营活动视觉设计', type: 'AIGC VISUAL', year: '2025 - 2026', page: 'project-operations.html', cover: 'cover-operations.jpg', details: ['haoyun1.png', 'haoyun2.png'], href: 'https://h5.seeronnet.net/dist/new-year-2026/' },
    { kind: 'materials', title: '运营素材 · 弹窗与广告 Banner', type: 'OPERATIONS VISUAL', year: '2025', page: 'project-materials.html', cover: 'cover-materials.jpg', details: ['materials1.png', 'materials2.png'] },
  ];

  assert.match(html, /<body\b[^>]*\bclass="[^"]*\bcontent-page\b[^"]*\bworks-page\b[^"]*"/);
  assert.match(html, /class="[^"]*\btree-logo\b[^"]*"/);
  assert.match(html, /href="index\.html"[^>]*>首页</);
  assert.match(html, /href="works\.html"[^>]*aria-current="page"[^>]*>作品集</);
  assert.match(html, /href="ai-learning\.html"[^>]*>AI 探索</);
  assert.match(html, /href="index\.html#about"[^>]*>关于</);
  assert.match(html, /<script\s+src="pages\.js(?:\?v=\d+)?"\s*><\/script>/);

  assert.doesNotMatch(html, /SELECTED WORK|<h1[^>]*>\s*精选作品\s*</, 'the removed portfolio heading must stay removed');
  assert.doesNotMatch(html, /class="works-summary"/, 'the works summary line was removed on request');

  for (const { kind, title, type, year, page, cover, details, href } of projects) {
    const article = [...html.matchAll(new RegExp(`<article\\b[^>]*\\bdata-project-kind="${kind}"[^>]*>[\\s\\S]*?<\\/article>`, 'g'))]
      .map((match) => match[0])
      .find((candidate) => candidate.includes(`href="${page}"`));
    assert.ok(article, `${kind} must have a complete project card`);
    assert.match(article, new RegExp(`<a\\b[^>]*href="${page.replace('.', '\\.')}"[^>]*>\\s*<h2\\b[^>]*>\\s*${title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*<`));
    assert.equal((article.match(new RegExp(`href="${page.replace('.', '\\.')}"`, 'g')) || []).length, 2, `${title} card and case action must both link to its detail page`);
    assert.match(article, new RegExp(type));
    assert.match(article, new RegExp(year.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
    assert.match(article, new RegExp(`assets/portfolio/${cover.replace('.', '\\.')}"`));
    details.forEach((detail) => assert.match(article, new RegExp(`assets/portfolio/${detail.replace('.', '\\.')}"`)));
    if (href) {
      const htmlHref = href.replaceAll('&', '&amp;');
      assert.match(article, new RegExp(`href="${htmlHref.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`));
    }
  }
  assert.equal((html.match(/assets\/portfolio\/(?:liuyao\/)?(?:cover-[\w-]+\.jpg|[\w-]+\.(?:jpg|png))/g) || []).length, 24, 'eight visible galleries must each reference three local assets once');
  for (const [kind, label] of [['app', 'App'], ['website', '官网'], ['topic', '专题页'], ['operations', '运营活动'], ['materials', '运营素材']]) {
    assert.match(html, new RegExp(`<button\\b[^>]*data-featured-filter="${kind}"[^>]*>\\s*${label}\\s*<`));
  }
  assert.match(html, /data-featured-filter="operations"[^>]*aria-pressed="true"/);
  assert.doesNotMatch(html, /<dialog\b|data-open-case=/, 'project details must use separate pages instead of a dialog');
  assert.doesNotMatch(html, /Founder|Indus|Hush|Flyout|Justgains/);
  assert.doesNotMatch(html, /<img\b[^>]*\bsrc="https?:\/\//, 'works page must not use remote image URLs');
  assert.match(runtime, /document\.documentElement\.classList\.add\(['"]js['"]\)/);
  assert.match(runtime, /function activateFeaturedProject\(selected\)/);
  assert.match(runtime, /project\.hidden\s*=\s*project\.dataset\.projectKind\s*!==\s*selected/);
  assert.match(runtime, /button\.setAttribute\(['"]aria-pressed['"],\s*String\(isActive\)\)/);
  assert.match(runtime, /project\.addEventListener\(['"]click['"]/);
  assert.match(runtime, /project\.querySelector\(['"]\.featured-project-title-link['"]\)\?\.click\(\)/);
});

test('featured portfolio cards are quiet and route to complete local detail pages', () => {
  const works = readPage('works.html');
  const styles = readPage('styles.css');
  const details = [
    { page: 'project-seerq.html', title: '先知命局', media: ['cover-seerq.jpg', 'app1.png', 'app2.png'] },
    { page: 'project-fengsuitang.html', title: '枫燧堂', media: ['cover-fengsuitang.jpg', 'fengsui1.jpg', 'fengsui2.jpg'] },
    { page: 'project-topic.html', title: '运势专题改版', media: ['cover-topic.jpg', 'zhuangti1.jpg', 'zhuangti2.jpg'] },
    { page: 'project-operations.html', title: '运营活动', media: ['cover-operations.jpg', 'haoyun1.png', 'haoyun2.png'] },
  ];

  assert.match(styles, /\.featured-project\s*\{[^}]*border:\s*0;[^}]*box-shadow:\s*0 12px 32px -28px/s);
  assert.match(styles, /\.featured-project-meta span\s*\{[^}]*color:\s*#818798/s);
  assert.doesNotMatch(styles, /\.featured-project-meta span:first-child\s*\{[^}]*var\(--blue\)/s);
  assert.match(styles, /\.featured-project-title-link::after\s*\{[^}]*position:\s*absolute;[^}]*inset:\s*0/s);
  assert.match(styles, /\.featured-project-gallery\s+img\s*\{[^}]*object-fit:\s*cover/s);
  assert.match(styles, /\.featured-project-gallery\s+img\.image-unavailable\s*\{[^}]*visibility:\s*hidden/s);

  for (const { page, title, media } of details) {
    assert.equal(existsSync(pageUrl(page)), true, `${page} must exist`);
    const detail = readPage(page);
    assert.match(detail, /<body\b[^>]*class="[^"]*project-detail-page[^"]*"/);
    assert.match(detail, new RegExp(`<h1[^>]*>[\\s\\S]*?${title}`));
    assert.match(detail, /href="works\.html"[^>]*>[\s\S]*?返回作品集/);
    assert.match(detail, /class="project-detail-cover"/);
    assert.match(detail, /class="project-detail-gallery"/);
    assert.equal((detail.match(/assets\/portfolio\//g) || []).length, 3, `${page} must show one cover and two detail images`);
    assert.doesNotMatch(detail, /<img\b[^>]*\bsrc="https?:\/\//, `${page} must not use remote images`);
    for (const filename of media) {
      assert.equal(existsSync(pageUrl(`assets/portfolio/${filename}`)), true, `${filename} must be stored locally`);
      assert.match(works, new RegExp(`assets/portfolio/${filename.replace('.', '\\.')}"`));
      assert.match(detail, new RegExp(`assets/portfolio/${filename.replace('.', '\\.')}"`));
    }
  }
});

test('AI exploration links three visual project cards to local content', () => {
  const html = readPage('ai-learning.html');
  const styles = readPage('ai-exploration.css');
  assert.match(html, /aria-current="page"[^>]*>AI 探索</);
  assert.match(styles, /grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/);
  assert.match(styles, /@media\s*\(max-width:\s*767px\)[\s\S]*?\.explore-grid\s*\{\s*grid-template-columns:\s*minmax\(0,\s*1fr\)/);
  const cards = [...html.matchAll(/<article\b[^>]*>(?:(?!<article\b)[\s\S])*?<\/article>/g)];
  assert.equal(cards.length, 3, 'only the three practical cases remain available');
  assert.doesNotMatch(html, /ai-notes\.html#/, 'method note cards should not appear on the AI exploration index');
  for (const [index, match] of cards.entries()) {
    const block = match[0];
    const target = block.match(/<a\b[^>]*href="([^"]+)"/)[1];
    const [file, fragment] = target.split('#');
    assert.equal(existsSync(pageUrl(file)), true, `card ${index + 1} has a real local destination`);
    if (fragment) assert.ok(readPage(file).includes(`id="${fragment}"`));
    const image = block.match(/<img\b[^>]*src="([^"]+)"/)[1];
    assert.equal(existsSync(pageUrl(image)), true, `card ${index + 1} image exists`);
    assert.ok(block.indexOf('<img') < block.indexOf('<h2'), 'each card puts its image above the title');
  }
  const visibleCopy = html.replace(/<[^>]+>/g, ' ');
  assert.doesNotMatch(visibleCopy, forbiddenLearningMetrics, 'cards must not invent dates or view counts');
});

test('knit rail case includes a self-contained demo and objective implementation narrative', () => {
  const html = readPage('ai-knit-rail.html');
  assert.match(html, /<iframe\b[^>]*src="demos\/knit-rail\/index\.html\?embed=1"/);
  assert.equal(existsSync(pageUrl('demos/knit-rail/index.html')), true);
  assert.doesNotMatch(html.replace(/<[^>]+>/g, ''), /我|学习与结果/);
  assert.ok(html.includes('id="implementation"'));
  assert.doesNotMatch(html, /id="(?:interaction|workflow)"|class="case-end"/);
  const demo = readPage('demos/knit-rail/index.html');
  for (const [, asset] of demo.matchAll(/(?:src=|(?:sideImage|frontImage):\s*)"(public\/assets\/[^\"]+)"/g)) {
    assert.equal(existsSync(pageUrl(`demos/knit-rail/${asset}`)), true, `demo asset ${asset} exists`);
  }
  assert.doesNotMatch(demo, /localhost:5173|from\s+["']three["']/);
});

test('learning date guard recognizes dot-separated dates', () => {
  assert.match('2026.08.24', forbiddenLearningMetrics);
});

test('deleted footer booking CSS does not survive as an orphan', () => {
  assert.doesNotMatch(readPage('styles.css'), /\.footer-book\b/);
});
