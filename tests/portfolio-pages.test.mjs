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
    '引导流程',
    '10个界面',
    '订阅页',
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

  assert.match(html, /<button\b[^>]*class="pill active"[^>]*\baria-pressed="true"[^>]*>\s*应用设计\s*</);
  assert.match(html, /<button\b[^>]*class="pill"[^>]*\baria-pressed="false"[^>]*>\s*应用商店素材\s*</);
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
  assert.match(html, /Codex 负责加速/);
  assert.doesNotMatch(html, /Claude|Rehan Ahmed/);
  assert.match(html, /id="back-to-top"[^>]*aria-label="回到顶部"/);

  assert.match(css, /\.hero-zone::before\s*\{[^}]*background:\s*#fff;/s);
  assert.match(css, /\.showcase-head h2[^}]*white-space:\s*nowrap;/s);
  assert.match(css, /\.about-head h2[^}]*white-space:\s*nowrap;/s);
  assert.match(css, /\.back-to-top\s*\{/);
  assert.match(js, /getElementById\('back-to-top'\)/);
});

test('works page uses the referenced portfolio content in the existing design system', () => {
  assert.equal(existsSync(pageUrl('works.html')), true, 'works.html must exist');
  const html = readPage('works.html');
  const runtime = readPage('pages.js');
  const projects = [
    { kind: 'app', title: '先知命局 SeerQ DESIGN', type: 'PRODUCT DESIGN', year: '2024 - 2026', cover: 'cover-seerq.jpg', details: ['app1.png', 'app2.png'], href: 'https://play.google.com/store/apps/details?id=com.mmc.seer.onnet&hl=zh' },
    { kind: 'website', title: '枫燧堂（香港）PC 端官网', type: 'WEB DESIGN', year: '2025', cover: 'cover-fengsuitang.jpg', details: ['fengsui1.jpg', 'fengsui2.jpg'], href: 'https://fengsuitang.com/' },
    { kind: 'topic', title: '运势专题改版', type: 'VISUAL DESIGN', year: '2025', cover: 'cover-topic.jpg', details: ['zhuangti1.jpg', 'zhuangti2.jpg'], href: 'https://www.seeronnet.com/seer/onlinecs' },
    { kind: 'operations', title: '运营活动视觉设计', type: 'AIGC VISUAL', year: '2025 - 2026', cover: 'cover-operations.jpg', details: ['haoyun1.png', 'haoyun2.png'], href: 'https://h5.seeronnet.net/dist/new-year-2026/' },
  ];

  assert.match(html, /<body\b[^>]*\bclass="[^"]*\bcontent-page\b[^"]*\bworks-page\b[^"]*"/);
  assert.match(html, /class="[^"]*\btree-logo\b[^"]*"/);
  assert.match(html, /href="index\.html"[^>]*>首页</);
  assert.match(html, /href="works\.html"[^>]*aria-current="page"[^>]*>作品集</);
  assert.match(html, /href="ai-learning\.html"[^>]*>AI 学习</);
  assert.match(html, /href="index\.html#about"[^>]*>关于</);
  assert.match(html, /<script\s+src="pages\.js(?:\?v=\d+)?"\s*><\/script>/);

  for (const { kind, title, type, year, cover, details, href } of projects) {
    assert.match(html, new RegExp(`<article\\b[^>]*\\bdata-project-kind="${kind}"[^>]*>[\\s\\S]*?<h2\\b[^>]*>\\s*${title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*<`));
    assert.match(html, new RegExp(type));
    assert.match(html, new RegExp(year.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
    assert.match(html, new RegExp(`assets/portfolio/${cover.replace('.', '\\.')}"`));
    details.forEach((detail) => assert.match(html, new RegExp(`assets/portfolio/${detail.replace('.', '\\.')}"`)));
    const htmlHref = href.replaceAll('&', '&amp;');
    assert.match(html, new RegExp(`href="${htmlHref.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`));
  }
  assert.equal((html.match(/assets\/portfolio\/(?:cover-[\w-]+\.jpg|[\w-]+\.(?:jpg|png))/g) || []).length, 24, 'four visible galleries and four dialog templates must each reference three local assets');
  for (const [kind, label] of [['app', 'App'], ['website', '官网'], ['topic', '专题页'], ['operations', '运营活动']]) {
    assert.match(html, new RegExp(`<button\\b[^>]*data-featured-filter="${kind}"[^>]*>\\s*${label}\\s*<`));
  }
  assert.match(html, /data-featured-filter="operations"[^>]*aria-pressed="true"/);
  assert.match(html, /<dialog\b[^>]*id="case-dialog"/);
  assert.equal((html.match(/data-open-case=/g) || []).length, 4);
  assert.doesNotMatch(html, /Founder|Indus|Hush|Flyout|Justgains/);
  assert.doesNotMatch(html, /<img\b[^>]*\bsrc="https?:\/\//, 'works page must not use remote image URLs');
  assert.match(runtime, /document\.documentElement\.classList\.add\(['"]js['"]\)/);
  assert.match(runtime, /function activateFeaturedProject\(selected\)/);
  assert.match(runtime, /project\.hidden\s*=\s*project\.dataset\.projectKind\s*!==\s*selected/);
  assert.match(runtime, /button\.setAttribute\(['"]aria-pressed['"],\s*String\(isActive\)\)/);
  assert.match(runtime, /dialog\.showModal\(\)/);
});

test('featured portfolio media is local, present, and resilient', () => {
  const works = readPage('works.html');
  const styles = readPage('styles.css');
  const media = ['cover-seerq.jpg', 'app1.png', 'app2.png', 'cover-fengsuitang.jpg', 'fengsui1.jpg', 'fengsui2.jpg', 'cover-topic.jpg', 'zhuangti1.jpg', 'zhuangti2.jpg', 'cover-operations.jpg', 'haoyun1.png', 'haoyun2.png'];
  media.forEach((filename) => {
    assert.equal(existsSync(pageUrl(`assets/portfolio/${filename}`)), true, `${filename} must be stored locally`);
    assert.match(works, new RegExp(`assets/portfolio/${filename.replace('.', '\\.')}"`));
  });
  assert.match(styles, /\.featured-project-gallery\s+img\s*\{[^}]*object-fit:\s*cover/s);
  assert.match(styles, /\.featured-project-gallery\s+img\.image-unavailable\s*\{[^}]*visibility:\s*hidden/s);
});

test('AI learning page is a static seven-article learning list', () => {
  assert.equal(existsSync(pageUrl('ai-learning.html')), true, 'ai-learning.html must exist');
  const html = readPage('ai-learning.html');
  const styles = readPage('styles.css');
  const expectedArticles = [
    ['精选', '如何建立自己的 AI 学习系统'],
    ['学习方法', '不追工具更新，先建立问题地图'],
    ['提示词', '好提示词不是咒语，而是清晰的上下文'],
    ['Agent', '从一次对话到可重复执行的工作流'],
    ['自动化', '先自动化最烦的十分钟'],
    ['AI 编程', '让 AI 写代码之前，先写清验收标准'],
    ['工具选择', '用任务选择工具，不用榜单替你决定'],
  ];

  assert.match(html, /<body\b[^>]*\bclass="[^"]*\bcontent-page\b[^"]*\blearning-page\b[^"]*"/);
  assert.match(html, /<a\b[^>]*\bclass="[^"]*\btree-logo\b[^"]*"[^>]*href="index\.html"/);
  assert.match(html, /href="index\.html"[^>]*>首页</);
  assert.match(html, /href="works\.html"[^>]*>作品集</);
  assert.match(html, /href="ai-learning\.html"[^>]*aria-current="page"[^>]*>AI 学习</);
  assert.match(html, /href="index\.html#about"[^>]*>关于</);
  assert.match(html, /<footer\b[\s\S]*?href="index\.html"[^>]*>首页<[\s\S]*?href="works\.html"[^>]*>作品集</);
  assert.doesNotMatch(html, /(?:联系我|联系我们|预约|Book a call|Contact)/i, 'learning page must not add a contact CTA');
  assert.equal((html.match(/<article\b/g) || []).length, 7, 'learning page must contain exactly seven articles');
  assert.equal((html.match(/<article\b[^>]*\bfeatured-article\b/g) || []).length, 1, 'one article must be featured');
  assert.equal((html.match(/<article\b[^>]*\barticle-card\b/g) || []).length, 6, 'six articles must use the standard card class');

  const learningCss = styles.slice(styles.indexOf('/* ============ AI LEARNING PAGE ============ */'));
  const learningSelectors = ['learning-intro', 'featured-article', 'article-list', 'article-card', 'article-meta', 'article-index', 'article-status', 'article-content', 'article-summary'];
  for (const selector of learningSelectors) {
    assert.match(learningCss, new RegExp(`\\.learning-page\\s+\\.${selector}\\b`), `${selector} must be scoped to the learning page`);
    assert.doesNotMatch(learningCss, new RegExp(`^\\s*\\.${selector}\\b`, 'm'), `${selector} must not leak into other pages`);
  }

  // Extract each block independently, refusing to cross another article opening
  // tag, so a link after one article cannot satisfy another article's assertion.
  const articleBlocks = [...html.matchAll(/<article\b[^>]*>(?:(?!<article\b)[\s\S])*?<\/article>/g)];
  assert.equal(articleBlocks.length, 7, 'every article opening tag must have a complete block');
  let summaryCount = 0;
  for (const [index, match] of articleBlocks.entries()) {
    const block = match[0];
    const [category, title] = expectedArticles[index];
    assert.match(block, new RegExp(`>${category}<`), `article ${index + 1} must contain its exact category`);
    assert.match(block, new RegExp(`<h2[^>]*>\\s*${title}\\s*<`), `article ${index + 1} must contain its exact title`);
    const summaries = [...block.matchAll(/<p\b[^>]*\barticle-summary\b[^>]*>([^<]*)<\/p>/g)];
    assert.equal(summaries.length, 1, `article ${index + 1} must contain one complete summary tag`);
    assert.match(summaries[0][1].trim(), /^[^。]+。$/, `article ${index + 1} summary must end with exactly one Chinese full stop`);
    summaryCount += summaries.length;
    assert.match(block, /<time\b[^>]*>[^<]+分钟阅读<\/time>/, `article ${index + 1} must contain reading time`);
    assert.match(block, /<span\b[^>]*\barticle-status\b[^>]*>学习笔记<\/span>/, `article ${index + 1} must contain a static status`);
    assert.doesNotMatch(block, /<a\b/, 'article cards must remain static, without dead links');
  }
  assert.equal(summaryCount, 7, 'learning page must contain seven complete summaries');
  const visibleCopy = html.replace(/<[^>]+>/g, ' ');
  assert.doesNotMatch(
    visibleCopy,
    forbiddenLearningMetrics,
    'learning page must not invent dates or view counts',
  );
});

test('learning date guard recognizes dot-separated dates', () => {
  assert.match('2026.08.24', forbiddenLearningMetrics);
});

test('deleted footer booking CSS does not survive as an orphan', () => {
  assert.doesNotMatch(readPage('styles.css'), /\.footer-book\b/);
});
