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
    '从混乱界面，到清晰产品。',
    '真实项目，完整呈现。',
    '发来界面',
    '重新设计',
    '交付成品',
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

  assert.match(
    html,
    /class="hero-overlay-circles"[^>]*\brole="slider"[^>]*\btabindex="0"[^>]*\baria-valuemin="0"[^>]*\baria-valuemax="100"[^>]*\baria-valuenow="50"/,
  );
  for (const key of ['ArrowLeft', 'ArrowRight', 'Home', 'End']) {
    assert.match(runtime, new RegExp(`['"]${key}['"]`), `slider must handle ${key}`);
  }
  assert.match(runtime, /sliderHandle\.setAttribute\(['"]aria-valuenow['"],\s*String\(/);

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

test('works page contains every project family and both work filters', () => {
  assert.equal(existsSync(pageUrl('works.html')), true, 'works.html must exist');
  const html = readPage('works.html');
  const runtime = readPage('pages.js');
  const projectGroups = [
    { name: 'Founder', kind: 'design', alts: ['Founder 高级会员升级页，含钻石礼盒插画', 'Founder 会员权益对比与票券套餐页', 'Founder 股票图表课程的付费方案页', 'Founder 用户资料页，展示连接人数与项目', 'Founder 附近活动列表页，含植物活动卡片', 'Founder 活动详情页，含紫色花卉封面与地图', 'Founder 上传头像与选择人物头像页'] },
    { name: 'Indus', kind: 'design', alts: ['Indus 印度与新西兰牌照验证欢迎页', 'Indus 基金探索页，展示热门基金与分类', 'Indus BNK 基金详情页，展示收益走势图', 'Indus 钱包页，展示余额、充值与提现操作', 'Indus 投资仪表盘，展示价值与收益曲线', 'Indus 身份验证与邀请好友任务卡片', 'Indus 基金拆分页，展示持有基金卡片'] },
    { name: 'Hush', kind: 'design', alts: ['Hush 荧光绿品牌启动页', 'Hush 欢迎页，说明回信解锁聊天', 'Hush 手机号码登录与验证码键盘页', 'Hush 消息收件箱，含置顶会话与筛选', 'Hush 与 Rehan 的文字聊天记录页', 'Hush 与 Rehan 的语音通话页', 'Hush 与 Rehan 的视频通话街景页', 'Hush 最近通话列表页'] },
    { name: 'Flyout', kind: 'store', alts: ['Flyout 与创作者视频通话的商店展示图', 'Flyout 创作者内容信息流的商店展示图', 'Flyout 每日发现创作者的商店展示图', 'Flyout 预约通话日期与时段的商店展示图', 'Flyout 用户评价墙的商店展示图', 'Flyout 私信聊天功能的商店展示图'] },
    { name: 'Justgains', kind: 'store', alts: ['Justgains 扫描牛角包并识别营养数据的商店展示图', 'Justgains 喝水与习惯连续记录的商店展示图', 'Justgains 食谱深浅主题切换的商店展示图', 'Justgains 跑步路线地图的商店展示图', 'Justgains Apple Watch 习惯追踪的商店展示图'] },
  ];

  assert.match(html, /<body\b[^>]*\bclass="[^"]*\bcontent-page\b[^"]*\bworks-page\b[^"]*"/);
  assert.match(html, /class="[^"]*\btree-logo\b[^"]*"/);
  assert.match(html, /href="index\.html"[^>]*>首页</);
  assert.match(html, /href="works\.html"[^>]*aria-current="page"[^>]*>作品集</);
  assert.match(html, /href="ai-learning\.html"[^>]*>AI 学习</);
  assert.match(html, /href="index\.html#about"[^>]*>关于</);
  assert.match(html, /<script\s+src="pages\.js"\s*><\/script>/);

  for (const { name, kind, alts } of projectGroups) {
    assert.match(html, new RegExp(`<section\\b[^>]*\\bdata-work-kind="${kind}"[^>]*>[\\s\\S]*?<h2\\b[^>]*>\\s*${name}\\s*<`), `${name} must use the ${kind} group kind`);
    alts.forEach((alt, index) => {
      assert.match(
        html,
        new RegExp(`<img\\b[^>]*\\bsrc="assets/projects/${name.toLowerCase()}-${index + 1}\\.jpg"[^>]*\\balt="${alt}"`),
        `${name} image ${index + 1} must use its exact local path and content-specific alt text`,
      );
    });
  }
  assert.equal((html.match(/assets\/projects\/[\w-]+\.jpg/g) || []).length, 33, 'works page must use all 33 project images exactly once');
  assert.match(html, /<button\b[^>]*data-works-filter="design"[^>]*aria-pressed="true"[^>]*>\s*App 设计\s*</);
  assert.match(html, /<button\b[^>]*data-works-filter="store"[^>]*aria-pressed="false"[^>]*>\s*App Store 展示图\s*</);
  assert.doesNotMatch(html, /<img\b[^>]*\bsrc="https?:\/\//, 'works page must not use remote image URLs');
  assert.match(runtime, /document\.documentElement\.classList\.add\(['"]js['"]\)/);
  assert.match(runtime, /function activateWorksFilter\(selected\)/);
  assert.match(runtime, /group\.hidden\s*=\s*group\.dataset\.workKind\s*!==\s*selected/);
  assert.match(runtime, /button\.setAttribute\(['"]aria-pressed['"],\s*String\(isActive\)\)/);
});

test('project media has stable native geometry, local failure handling, and shared Chinese alts', () => {
  const works = readPage('works.html');
  const home = readPage('index.html');
  const styles = readPage('styles.css');
  const heights = {
    founder: [1127, 1127, 1127, 1127, 1126, 1126, 1124],
    indus: [1127, 1127, 1124, 1130, 1127, 1127, 1121],
    hush: Array(8).fill(1127),
    flyout: Array(6).fill(1127),
    justgains: Array(5).fill(1125),
  };
  const attr = (tag, name) => tag.match(new RegExp(`\\b${name}="([^"]*)"`))?.[1];

  for (const [project, projectHeights] of Object.entries(heights)) {
    projectHeights.forEach((height, index) => {
      const source = `assets/projects/${project}-${index + 1}.jpg`;
      const escapedSource = source.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const worksTag = works.match(new RegExp(`<img\\b[^>]*\\bsrc="${escapedSource}"[^>]*>`))?.[0];
      const homeTag = home.match(new RegExp(`<img\\b[^>]*(?:src|data-src)="${escapedSource}"[^>]*>`))?.[0];

      assert.ok(worksTag, `${source} must exist on Works`);
      assert.ok(homeTag, `${source} must exist on the home showcase`);
      assert.equal(attr(worksTag, 'width'), '520');
      assert.equal(attr(worksTag, 'height'), String(height));
      assert.equal(
        attr(worksTag, 'onerror'),
        "this.hidden=true;this.parentElement.classList.add('image-unavailable')",
      );
      assert.equal(attr(homeTag, 'alt'), attr(worksTag, 'alt'), `${source} must reuse the Works alt`);
      assert.match(attr(homeTag, 'alt') || '', /[\u3400-\u9fff]/, `${source} needs a meaningful Chinese alt`);
      assert.match(
        works,
        new RegExp(`<figure\\b[^>]*style="--shot-ratio:\\s*520\\s*\\/\\s*${height};"[^>]*>\\s*<img\\b[^>]*\\bsrc="${escapedSource}"`),
        `${source} must reserve its native aspect ratio`,
      );
    });
  }

  assert.match(styles, /\.project-shot\s*\{[^}]*aspect-ratio:\s*var\(--shot-ratio\)/s);
  assert.match(styles, /\.project-shot\.image-unavailable\s+img\s*\{[^}]*display:\s*none/s);
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
