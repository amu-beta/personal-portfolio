import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const modulePath = new URL('../scripts/verify-mirror.mjs', import.meta.url);

test('extractAssetReferences covers HTML, CSS, JS, and dynamic marble assets', async () => {
  assert.equal(
    existsSync(modulePath),
    true,
    'manifest extractor is not implemented yet',
  );

  const { extractAssetReferences } = await import(modulePath.href);
  const result = extractAssetReferences({
    html: `
      <img data-screen="hush-home" src="assets/hero.jpg">
      <img data-src="assets/lazy.jpg">
      <video data-vsrc="assets/loop.mp4"></video>
      <img srcset="assets/small.jpg 1x, assets/large.jpg 2x">
    `,
    css: `.hero { background-image: url('assets/background.png'); }`,
    js: `
      const fallback = 'assets/fallback.svg';
      im.src = 'assets/marbles/c' + i + '.svg';
    `,
  });

  assert.deepEqual(result, [
    'assets/background.png',
    'assets/fallback.svg',
    'assets/hero.jpg',
    'assets/large.jpg',
    'assets/lazy.jpg',
    'assets/loop.mp4',
    'assets/marbles/c0.svg',
    'assets/marbles/c1.svg',
    'assets/marbles/c2.svg',
    'assets/marbles/c3.svg',
    'assets/marbles/c4.svg',
    'assets/marbles/c5.svg',
    'assets/marbles/c6.svg',
    'assets/marbles/c7.svg',
    'assets/screens/hush-home-before.jpg',
    'assets/small.jpg',
  ]);
});

test('buildAssetManifest maps each asset to its exact local path and source URL', async () => {
  const module = await import(modulePath.href);
  assert.equal(
    typeof module.buildAssetManifest,
    'function',
    'asset manifest builder is not implemented yet',
  );

  assert.deepEqual(
    module.buildAssetManifest(['assets/hero.jpg'], 'https://deslopify.studio/'),
    [
      {
        classification: 'first-party-media',
        localPath: 'assets/hero.jpg',
        path: 'assets/hero.jpg',
        sourceUrl: 'https://deslopify.studio/assets/hero.jpg',
      },
    ],
  );
});

test('extractExternalDependencies separates fonts, embeds, and trackers', async () => {
  const module = await import(modulePath.href);
  assert.equal(
    typeof module.extractExternalDependencies,
    'function',
    'external dependency classifier is not implemented yet',
  );

  assert.deepEqual(
    module.extractExternalDependencies(`
      <link href="https://fonts.googleapis.com/css2?family=Inter" rel="stylesheet">
      <div data-cal="https://app.cal.com/example?embed=true"></div>
      <script defer src="/_vercel/insights/script.js"></script>
    `),
    [
      {
        action: 'retain-external',
        classification: 'external-font',
        url: 'https://fonts.googleapis.com/css2?family=Inter',
      },
      {
        action: 'retain-external',
        classification: 'external-embed',
        url: 'https://app.cal.com/example?embed=true',
      },
      {
        action: 'remove',
        classification: 'tracker',
        url: '/_vercel/insights/script.js',
      },
    ],
  );
});

test('generateManifestFiles writes complete assets and embed plans from frozen sources', async () => {
  const module = await import(modulePath.href);
  assert.equal(
    typeof module.generateManifestFiles,
    'function',
    'manifest file generator is not implemented yet',
  );

  const root = await mkdtemp(join(tmpdir(), 'deslopify-manifest-'));
  mkdirSync(join(root, '.clone-ui/source'), { recursive: true });
  writeFileSync(
    join(root, '.clone-ui/source/raw.html'),
    '<img src="assets/hero.jpg"><div data-cal="https://app.cal.com/example?embed=true"></div>',
  );
  writeFileSync(
    join(root, '.clone-ui/source/styles.css'),
    '.hero{background:url("assets/bg.png")}',
  );
  writeFileSync(join(root, '.clone-ui/source/script.js'), '');

  const summary = module.generateManifestFiles({
    baseUrl: 'https://deslopify.studio/',
    root,
  });

  assert.deepEqual(summary, { assets: 2, dependencies: 1 });
  assert.deepEqual(
    JSON.parse(readFileSync(join(root, '.clone-ui/plan/assets.json'), 'utf8')),
    [
      {
        classification: 'first-party-media',
        localPath: 'assets/bg.png',
        path: 'assets/bg.png',
        sourceUrl: 'https://deslopify.studio/assets/bg.png',
      },
      {
        classification: 'first-party-media',
        localPath: 'assets/hero.jpg',
        path: 'assets/hero.jpg',
        sourceUrl: 'https://deslopify.studio/assets/hero.jpg',
      },
    ],
  );
});

test('verifyLocalAssets reports missing files and hashes present files', async () => {
  const module = await import(modulePath.href);
  assert.equal(
    typeof module.verifyLocalAssets,
    'function',
    'local asset verifier is not implemented yet',
  );

  const root = await mkdtemp(join(tmpdir(), 'deslopify-assets-'));
  mkdirSync(join(root, 'assets'), { recursive: true });
  writeFileSync(join(root, 'assets/present.svg'), '<svg/>');
  const result = module.verifyLocalAssets(
    [
      { localPath: 'assets/present.svg' },
      { localPath: 'assets/missing.png' },
    ],
    root,
  );

  assert.equal(result.summary.present, 1);
  assert.equal(result.summary.missing, 1);
  assert.equal(result.items[0].bytes, 6);
  assert.match(result.items[0].sha256, /^[a-f0-9]{64}$/);
  assert.equal(result.items[1].status, 'missing');
});

test('auditDeliverableHtml detects remote first-party media and trackers', async () => {
  const module = await import(modulePath.href);
  assert.equal(
    typeof module.auditDeliverableHtml,
    'function',
    'deliverable HTML audit is not implemented yet',
  );

  assert.deepEqual(
    module.auditDeliverableHtml(`
      <meta property="og:image" content="https://deslopify.studio/assets/og.jpg">
      <img src="https://deslopify.studio/assets/runtime.jpg">
      <script src="/_vercel/insights/script.js"></script>
    `),
    {
      remoteFirstPartyMedia: ['https://deslopify.studio/assets/runtime.jpg'],
      screenshotAsUiReferences: [],
      trackers: ['/_vercel/insights/script.js'],
    },
  );
});

test('auditDeliverablePages attributes aggregated audit findings to filenames', async () => {
  const module = await import(modulePath.href);
  assert.equal(
    typeof module.auditDeliverablePages,
    'function',
    'multi-page deliverable audit is not implemented yet',
  );

  assert.deepEqual(
    module.auditDeliverablePages({
      'index.html': '<img src="https://deslopify.studio/assets/runtime.jpg">',
      'works.html': '<script src="/_vercel/insights/script.js"></script>',
      'ai-learning.html': '<main>local page</main>',
    }),
    {
      issueCount: 2,
      pages: {
        'index.html': {
          remoteFirstPartyMedia: ['https://deslopify.studio/assets/runtime.jpg'],
          screenshotAsUiReferences: [],
          trackers: [],
        },
        'works.html': {
          remoteFirstPartyMedia: [],
          screenshotAsUiReferences: [],
          trackers: ['/_vercel/insights/script.js'],
        },
        'ai-learning.html': {
          remoteFirstPartyMedia: [],
          screenshotAsUiReferences: [],
          trackers: [],
        },
      },
    },
  );
});

test('auditDeliverablePages attributes screenshot-as-UI findings to their page', async () => {
  const module = await import(modulePath.href);

  assert.deepEqual(
    module.auditDeliverablePages({
      'index.html': '<main>local page</main>',
      'works.html': '<img src=".clone-ui/verification/screenshot.png">',
      'ai-learning.html': '<main>local page</main>',
    }),
    {
      issueCount: 1,
      pages: {
        'index.html': {
          remoteFirstPartyMedia: [],
          screenshotAsUiReferences: [],
          trackers: [],
        },
        'works.html': {
          remoteFirstPartyMedia: [],
          screenshotAsUiReferences: ['src=".clone-ui/verification/screenshot.png"'],
          trackers: [],
        },
        'ai-learning.html': {
          remoteFirstPartyMedia: [],
          screenshotAsUiReferences: [],
          trackers: [],
        },
      },
    },
  );
});

test('audit CLI fails for screenshot-as-UI references and succeeds once clean', async () => {
  const root = await mkdtemp(join(tmpdir(), 'deslopify-audit-cli-'));
  mkdirSync(join(root, '.clone-ui/verification'), { recursive: true });
  writeFileSync(join(root, 'index.html'), '<main>local page</main>');
  writeFileSync(
    join(root, 'works.html'),
    '<img src="tmp/ref/desktop-full.png">',
  );
  writeFileSync(join(root, 'ai-learning.html'), '<main>local page</main>');

  const runAudit = () =>
    spawnSync(process.execPath, [fileURLToPath(modulePath), 'audit'], {
      cwd: root,
      encoding: 'utf8',
    });

  const failing = runAudit();
  assert.equal(failing.status, 1, failing.stderr);
  const failingReport = JSON.parse(
    readFileSync(join(root, '.clone-ui/verification/hard-fail-audit.json'), 'utf8'),
  );
  assert.equal(failingReport.issueCount, 1);
  assert.deepEqual(
    failingReport.pages['works.html'].screenshotAsUiReferences,
    ['src="tmp/ref/desktop-full.png"'],
  );

  writeFileSync(join(root, 'works.html'), '<main>clean page</main>');
  const clean = runAudit();
  assert.equal(clean.status, 0, clean.stderr);
  const cleanReport = JSON.parse(
    readFileSync(join(root, '.clone-ui/verification/hard-fail-audit.json'), 'utf8'),
  );
  assert.equal(cleanReport.issueCount, 0);
});
