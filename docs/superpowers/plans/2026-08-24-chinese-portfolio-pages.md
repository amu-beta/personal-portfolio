# Chinese Portfolio Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert the existing native static site into a Chinese three-page personal portfolio with a tree logo, a complete works collection, an AI-learning article list, and no pricing, testimonials, contact CTA, or Cal.com embed.

**Architecture:** Keep the existing plain HTML/CSS/JavaScript stack. `index.html` remains the animated home page, while `works.html` and `ai-learning.html` use shared page-level styles in `styles.css` and a small progressive-enhancement script in `pages.js`; all project media stays local under `assets/`.

**Tech Stack:** Native HTML5, CSS, JavaScript, Node.js built-in test runner, Python static HTTP server, agent-browser/Chromium.

**Spec:** `/Users/linkaiyun/Projects/个人作品集/docs/superpowers/specs/2026-08-24-chinese-portfolio-pages-design.md`

## Global Constraints

- Keep the home Work showcase and its App design / App Store interaction.
- Delete pricing, testimonials, contact/booking CTA, and Cal.com UI from the home page.
- Add `works.html` and `ai-learning.html` as real independent files; do not add a framework or build step.
- Use a code-native inline tree SVG and local project assets only.
- Translate user-visible interface copy to Chinese; English inside screenshots and project names may remain.
- The AI page is a non-clickable article list, not a CMS or article-detail system.
- Internal navigation must work under both `file://` and a local HTTP server.
- The current directory is not a Git repository, so task checkpoints use tests and evidence files instead of commits.

---

### Task 1: Add the Static Page Contract Tests

**Files:**
- Create: `tests/portfolio-pages.test.mjs`

**Interfaces:**
- Consumes: `index.html`, `works.html`, `ai-learning.html`, `styles.css`, `script.js`, `pages.js`.
- Produces: an executable content/structure contract for every later task.

- [ ] **Step 1: Write the failing page-contract test**

```js
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

test('three Chinese pages and shared navigation exist', () => {
  assert.equal(existsSync(new URL('../works.html', import.meta.url)), true);
  assert.equal(existsSync(new URL('../ai-learning.html', import.meta.url)), true);
  for (const file of ['index.html', 'works.html', 'ai-learning.html']) {
    const html = read(file);
    assert.match(html, /<html lang="zh-CN">/);
    assert.match(html, /class="tree-logo"/);
    assert.match(html, /href="works\.html"/);
    assert.match(html, /href="ai-learning\.html"/);
  }
});

test('home retains Work and removes commercial/social sections', () => {
  const html = read('index.html');
  assert.match(html, /<section class="showcase" id="work">/);
  assert.doesNotMatch(html, /class="pricing-sec"/);
  assert.doesNotMatch(html, /class="testimonials"/);
  assert.doesNotMatch(html, /id="cal-slot"|app\.cal\.com|href="#book"/);
});

test('works page contains every project family', () => {
  const html = read('works.html');
  for (const name of ['Founder', 'Indus', 'Hush', 'Flyout', 'Justgains']) {
    assert.match(html, new RegExp(`>${name}<`));
  }
  assert.match(html, /data-works-filter="design"/);
  assert.match(html, /data-works-filter="store"/);
});

test('AI learning page is a seven-article list without dead links', () => {
  const html = read('ai-learning.html');
  assert.equal((html.match(/<article\b/g) || []).length, 7);
  assert.doesNotMatch(html, /<article[^>]*>[^]*?<a\b/);
});
```

- [ ] **Step 2: Run the test and verify the expected RED state**

Run: `node --test tests/portfolio-pages.test.mjs`

Expected: FAIL because `works.html` and `ai-learning.html` do not exist.

### Task 2: Rebuild the Shared Navigation and Chinese Home Page

**Files:**
- Modify: `index.html`
- Modify: `script.js`
- Modify: `styles.css`
- Test: `tests/portfolio-pages.test.mjs`

**Interfaces:**
- Consumes: the approved page structure and existing home animations.
- Produces: the Chinese home page and canonical shared navigation markup.

- [ ] **Step 1: Add a failing Chinese-copy assertion**

```js
test('home interface copy is Chinese', () => {
  const html = read('index.html');
  for (const text of ['首页', '作品集', 'AI 学习', '让应用焕然一新', '改造前后', '作品展示', '工作流程', '设计细节', '关于我']) {
    assert.match(html, new RegExp(text));
  }
  assert.doesNotMatch(html, /Make Your App|Book a call|Our Work|Simple pricing|Testimonials/);
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run: `node --test --test-name-pattern="home interface copy" tests/portfolio-pages.test.mjs`

Expected: FAIL because the original English copy is still present.

- [ ] **Step 3: Replace the navigation with the shared Chinese tree-logo contract**

Use this inline SVG in all pages:

```html
<a class="nav-logo tree-logo" href="index.html" aria-label="返回首页">
  <svg viewBox="0 0 32 32" aria-hidden="true">
    <path d="M16 28V14" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>
    <path d="M16 16C8 16 5 12 6 7c5-1 9 1 10 6" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M16 18c8 0 11-4 10-9-5-1-9 1-10 6" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
</a>
```

Use links `index.html`, `works.html`, `ai-learning.html`, and `#about`; remove the nav CTA.

- [ ] **Step 4: Translate the retained home sections**

Apply this copy map while preserving DOM structure used by animations:

| Existing role | Chinese copy |
|---|---|
| Hero headline | 让应用焕然一新 |
| Hero type phrases | 更有质感 / 更像成品 / 让人记住 |
| Hero description | 把现有界面交给 AI 与设计判断，快速变成清晰、统一、可以继续开发的产品体验。 |
| Before / After pills | 改造前 / 改造后 |
| Intelligence heading | 从混乱界面，到清晰产品。 |
| Showcase heading | 真实项目，完整呈现。 |
| Process steps | 发来界面 / 重新设计 / 交付成品 |
| Bento heading | 每个细节，都有理由。 |
| About heading | 关于我和我的工作方式。 |
| Footer title | 在这里种下一棵树 |
| Footer controls | 选一种心情 / 放下一颗弹珠 |

- [ ] **Step 5: Delete pricing, testimonials, and contact/booking markup**

Remove the complete `.pricing-sec` and `.testimonials` sections, every `href="#book"`, `#cal-slot`, `.cal-frame`, and contact CTA. Keep `.showcase` unchanged structurally.

- [ ] **Step 6: Make the home script safe after DOM removal and translate runtime strings**

Keep the existing early-return guards for `#cfg-slider` and `#sub-toggle`; remove the Cal hydration block. Update runtime words, Work mode labels, process labels, marble UI labels, and accessible titles to Chinese. Do not remove Work, sticky, Canvas, or footer behavior.

- [ ] **Step 7: Adjust home spacing and tree-logo/mobile navigation CSS**

Remove pricing/testimonial selectors from shared section-margin lists, give `.about` a final `margin-bottom: 56px`, style `.tree-logo svg` at `28px`, add `[aria-current="page"]`, and make `.nav-links` horizontally scrollable rather than hidden below 768px.

- [ ] **Step 8: Run tests and verify the home contract is GREEN**

Run: `node --test tests/portfolio-pages.test.mjs tests/asset-extractor.test.mjs`

Expected: home tests pass; works/AI tests still fail only because their files are not created yet.

### Task 3: Build the Complete Works Collection Page

**Files:**
- Create: `works.html`
- Create: `pages.js`
- Modify: `styles.css`
- Test: `tests/portfolio-pages.test.mjs`

**Interfaces:**
- Consumes: local project images and the shared navigation/tree logo.
- Produces: `works.html` plus `pages.js` filter behavior used only when JavaScript is available.

- [ ] **Step 1: Run the Works test and verify RED**

Run: `node --test --test-name-pattern="works page" tests/portfolio-pages.test.mjs`

Expected: FAIL because `works.html` is missing.

- [ ] **Step 2: Create semantic Works page markup**

Create `works.html` with `lang="zh-CN"`, shared nav, `aria-current="page"` on 作品集, a Chinese hero, two filter buttons, and five `<section class="project-group">` blocks. Use the exact local image families:

```text
Founder: assets/projects/founder-1.jpg … founder-7.jpg
Indus: assets/projects/indus-1.jpg … indus-7.jpg
Hush: assets/projects/hush-1.jpg … hush-8.jpg
Flyout: assets/projects/flyout-1.jpg … flyout-6.jpg
Justgains: assets/projects/justgains-1.jpg … justgains-5.jpg
```

Tag Founder/Indus/Hush as `data-work-kind="design"` and Flyout/Justgains as `data-work-kind="store"`.

- [ ] **Step 3: Add progressive filter behavior in `pages.js`**

```js
document.documentElement.classList.add('js');

const filterButtons = [...document.querySelectorAll('[data-works-filter]')];
const projectGroups = [...document.querySelectorAll('[data-work-kind]')];

filterButtons.forEach((button) => button.addEventListener('click', () => {
  const selected = button.dataset.worksFilter;
  filterButtons.forEach((item) => item.classList.toggle('active', item === button));
  projectGroups.forEach((group) => { group.hidden = group.dataset.workKind !== selected; });
}));
```

With JavaScript disabled, all project groups remain visible.

- [ ] **Step 4: Add collection page styling**

Append scoped `.content-page`, `.page-hero`, `.works-filter`, `.project-group`, `.project-meta`, and `.project-grid` rules. Desktop project grids use `repeat(auto-fit, minmax(220px, 1fr))`; mobile uses two compact columns with no horizontal overflow.

- [ ] **Step 5: Run the Works contract test**

Run: `node --test --test-name-pattern="works page" tests/portfolio-pages.test.mjs`

Expected: PASS with all five project names, both filters, and only local assets.

### Task 4: Build the AI Learning Article List

**Files:**
- Create: `ai-learning.html`
- Modify: `styles.css`
- Test: `tests/portfolio-pages.test.mjs`

**Interfaces:**
- Consumes: shared navigation and page styles.
- Produces: a static, accessible seven-article learning list with no dead links.

- [ ] **Step 1: Run the AI page test and verify RED**

Run: `node --test --test-name-pattern="AI learning page" tests/portfolio-pages.test.mjs`

Expected: FAIL because `ai-learning.html` is missing.

- [ ] **Step 2: Create the featured article and six list articles**

Use these seven titles and categories:

1. 精选 / 如何建立自己的 AI 学习系统
2. 学习方法 / 不追工具更新，先建立问题地图
3. 提示词 / 好提示词不是咒语，而是清晰的上下文
4. Agent / 从一次对话到可重复执行的工作流
5. 自动化 / 先自动化最烦的十分钟
6. AI 编程 / 让 AI 写代码之前，先写清验收标准
7. 工具选择 / 用任务选择工具，不用榜单替你决定

Each `<article>` includes a category, title, one-sentence summary, and reading time. Do not wrap articles in anchors and do not invent dates or performance claims.

- [ ] **Step 3: Add scoped article-list styling**

Append `.learning-intro`, `.featured-article`, `.article-list`, `.article-card`, `.article-meta`, and `.article-index` rules. Preserve a quiet reading rhythm; cards use the existing blue/lavender palette without adding decorative icon boxes.

- [ ] **Step 4: Run the AI page contract test**

Run: `node --test --test-name-pattern="AI learning page" tests/portfolio-pages.test.mjs`

Expected: PASS with exactly seven articles and no article links.

### Task 5: Verify Navigation, Assets, Runtime, and Responsive Layout

**Files:**
- Modify: `README.md`
- Create: `.clone-ui/verification/chinese-portfolio-browser.json`
- Create: `.clone-ui/verification/chinese-portfolio-responsive.json`

**Interfaces:**
- Consumes: all three final pages and the local static server.
- Produces: fresh test, browser, console, and viewport evidence.

- [ ] **Step 1: Run the complete automated suite**

Run: `node --test tests/portfolio-pages.test.mjs tests/asset-extractor.test.mjs`

Expected: all tests PASS with zero failures.

- [ ] **Step 2: Start the local static server**

Run: `python3 -m http.server 4173 --bind 127.0.0.1`

- [ ] **Step 3: Verify routes and current-page navigation in a clean browser session**

Open `index.html`, `works.html`, and `ai-learning.html`; assert HTTP 200, `lang=zh-CN`, one tree logo, correct `aria-current`, and no Cal.com iframe or contact CTA.

- [ ] **Step 4: Exercise retained and new interactions**

On home, verify Work tab/project switching, `proc=0/0.5/1`, `jack=0/0.5/1`, and the marble drop. On Works, verify both filters select the expected project groups. AI articles remain static and readable.

- [ ] **Step 5: Capture 1440×900, 768×900, and 390×844 evidence**

For each page/viewport, record `scrollWidth <= clientWidth`, nav visibility, main heading visibility, and page height. Capture native viewport screenshots and inspect for overlap, clipping, blank runways, and distorted images.

- [ ] **Step 6: Check console/network output**

Require zero new exceptions caused by removed DOM, zero Cal.com or Vercel requests, and no unexpected local 404s. The source-parity `assets/intelligence-frame.png` 404 remains allowed only if still hidden.

- [ ] **Step 7: Update README**

Document the three routes, local run command, filter behavior, lack of article detail pages, and final verification commands.

- [ ] **Step 8: Run final verification once more**

Run:

```bash
node --test tests/portfolio-pages.test.mjs tests/asset-extractor.test.mjs
node scripts/verify-mirror.mjs verify
node scripts/verify-mirror.mjs audit
```

Expected: all tests pass, asset verifier reports no unexpected missing files, and the audit reports zero tracker/screenshot-as-UI issues.
