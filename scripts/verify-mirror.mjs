import { createHash } from 'node:crypto';
import {
  existsSync,
  mkdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const ASSET_PATTERN = /assets\/[A-Za-z0-9_./@+-]+\.(?:avif|gif|ico|jpe?g|mp4|png|svg|webm|webp|woff2?|ttf|otf)/gi;

export function extractAssetReferences({ html = '', css = '', js = '' }) {
  const references = new Set();

  for (const source of [html, css, js]) {
    for (const match of source.matchAll(ASSET_PATTERN)) {
      references.add(match[0]);
    }
  }

  if (/assets\/marbles\/c['"]?\s*\+\s*i\s*\+\s*['"]?\.svg/.test(js)) {
    for (let index = 0; index < 8; index += 1) {
      references.add(`assets/marbles/c${index}.svg`);
    }
  }

  for (const match of html.matchAll(/data-screen=["']([^"']+)["']/g)) {
    references.add(`assets/screens/${match[1]}-before.jpg`);
  }

  return [...references].sort();
}

export function buildAssetManifest(paths, baseUrl) {
  return paths.map((assetPath) => ({
    classification: 'first-party-media',
    localPath: assetPath,
    path: assetPath,
    sourceUrl: new URL(assetPath, baseUrl).href,
  }));
}

export function extractExternalDependencies(html) {
  const dependencies = [];
  const rules = [
    {
      action: 'retain-external',
      classification: 'external-font',
      pattern: /https:\/\/fonts\.googleapis\.com\/[^"'\s<>]+/g,
    },
    {
      action: 'retain-external',
      classification: 'external-embed',
      pattern: /https:\/\/app\.cal\.com\/[^"'\s<>]+/g,
    },
    {
      action: 'remove',
      classification: 'tracker',
      pattern: /\/_vercel\/insights\/script\.js/g,
    },
  ];

  for (const rule of rules) {
    for (const match of html.matchAll(rule.pattern)) {
      dependencies.push({
        action: rule.action,
        classification: rule.classification,
        url: match[0].replaceAll('&amp;', '&'),
      });
    }
  }

  return dependencies.filter(
    (dependency, index, all) =>
      all.findIndex((candidate) => candidate.url === dependency.url) === index,
  );
}

export function generateManifestFiles({ root, baseUrl }) {
  const sourceRoot = resolve(root, '.clone-ui/source');
  const planRoot = resolve(root, '.clone-ui/plan');
  const html = readFileSync(resolve(sourceRoot, 'raw.html'), 'utf8');
  const css = readFileSync(resolve(sourceRoot, 'styles.css'), 'utf8');
  const js = readFileSync(resolve(sourceRoot, 'script.js'), 'utf8');
  const assets = buildAssetManifest(
    extractAssetReferences({ html, css, js }),
    baseUrl,
  );
  const dependencies = extractExternalDependencies(html);

  mkdirSync(planRoot, { recursive: true });
  writeFileSync(
    resolve(planRoot, 'assets.json'),
    `${JSON.stringify(assets, null, 2)}\n`,
  );
  writeFileSync(
    resolve(planRoot, 'embeds.json'),
    `${JSON.stringify(dependencies, null, 2)}\n`,
  );

  return { assets: assets.length, dependencies: dependencies.length };
}

export function verifyLocalAssets(manifest, root, { expectedMissing = [] } = {}) {
  const expected = new Set(expectedMissing);
  const items = manifest.map((asset) => {
    const absolutePath = resolve(root, asset.localPath);
    if (!existsSync(absolutePath)) {
      return {
        ...asset,
        status: expected.has(asset.localPath) ? 'expected-missing' : 'missing',
      };
    }

    const bytes = statSync(absolutePath).size;
    const sha256 = createHash('sha256')
      .update(readFileSync(absolutePath))
      .digest('hex');
    return { ...asset, bytes, sha256, status: 'present' };
  });

  const count = (status) => items.filter((item) => item.status === status).length;
  return {
    items,
    summary: {
      expectedMissing: count('expected-missing'),
      missing: count('missing'),
      present: count('present'),
      total: items.length,
    },
  };
}

export function auditDeliverableHtml(html) {
  const collect = (pattern, source = html) => [
    ...new Set([...source.matchAll(pattern)].map((match) => match[0])),
  ];
  const mediaMarkup = [...html.matchAll(/<(?:img|picture|source|video)\b[^>]*>/gi)]
    .map((match) => match[0])
    .join('\n');
  return {
    remoteFirstPartyMedia: collect(
      /https:\/\/deslopify\.studio\/assets\/[A-Za-z0-9_./@+-]+/g,
      mediaMarkup,
    ),
    screenshotAsUiReferences: collect(
      /(?:src|href)=["'][^"']*(?:\.clone-ui|tmp\/ref|desktop-full|mobile-full|screenshot)[^"']*["']/gi,
    ),
    trackers: collect(/\/_vercel\/insights\/script\.js/g),
  };
}

export function auditDeliverablePages(pages) {
  const results = Object.fromEntries(
    Object.entries(pages).map(([filename, html]) => [
      filename,
      auditDeliverableHtml(html),
    ]),
  );
  const issueCount = Object.values(results).reduce(
    (pageTotal, page) =>
      pageTotal + Object.values(page).reduce(
        (findingTotal, findings) => findingTotal + findings.length,
        0,
      ),
    0,
  );

  return { issueCount, pages: results };
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  const command = process.argv[2];
  if (!['audit', 'generate', 'verify'].includes(command)) {
    process.stderr.write('Usage: node scripts/verify-mirror.mjs <audit|generate|verify>\n');
    process.exitCode = 2;
  } else if (command === 'audit') {
    const root = process.cwd();
    const report = auditDeliverablePages(
      Object.fromEntries(
        ['index.html', 'works.html', 'ai-learning.html'].map((filename) => [
          filename,
          readFileSync(resolve(root, filename), 'utf8'),
        ]),
      ),
    );
    writeFileSync(
      resolve(root, '.clone-ui/verification/hard-fail-audit.json'),
      `${JSON.stringify(report, null, 2)}\n`,
    );
    process.stdout.write(`${JSON.stringify(report)}\n`);
    if (report.issueCount > 0) process.exitCode = 1;
  } else if (command === 'generate') {
    const summary = generateManifestFiles({
      baseUrl: 'https://deslopify.studio/',
      root: process.cwd(),
    });
    process.stdout.write(`${JSON.stringify(summary)}\n`);
  } else {
    const root = process.cwd();
    const manifest = JSON.parse(
      readFileSync(resolve(root, '.clone-ui/plan/assets.json'), 'utf8'),
    );
    const result = verifyLocalAssets(manifest, root, {
      expectedMissing: ['assets/intelligence-frame.png'],
    });
    const outputPath = resolve(root, '.clone-ui/plan/asset-status.json');
    writeFileSync(outputPath, `${JSON.stringify(result, null, 2)}\n`);
    process.stdout.write(`${JSON.stringify(result.summary)}\n`);
    if (result.summary.missing > 0) process.exitCode = 1;
  }
}
