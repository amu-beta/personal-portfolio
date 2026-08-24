# Deslopify Production Mirror Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Build a locally runnable, production-source mirror of `https://deslopify.studio/` with every recoverable first-party media asset stored at the same relative path and verify the mirror against the live site across responsive and interaction states.

**Architecture:** Preserve the captured production `HTML + CSS + JavaScript` instead of translating it into a framework. Serve `index.html`, `styles.css`, `script.js`, and `assets/` from a small local static server; remove Vercel analytics, retain the Cal.com embed as an external dependency, and keep browser evidence and comparison artifacts under `.clone-ui/` and `tmp/ref/deslopify-site/`.

**Tech Stack:** Native HTML/CSS/JavaScript, Python static HTTP server, agent-browser/Chromium, ImageMagick AE comparison, DSSIM/SSIM where available.

**Spec:** `/Users/linkaiyun/Projects/个人作品集/DESLOPIFY_ANALYSIS.md`

## Global Constraints

- `https://deslopify.studio/` is the sole visual and behavioral source of truth.
- Preserve the production DOM, CSS rules, responsive behavior, Canvas code, and WebGL shader code.
- Do not introduce React, Tailwind, a bundler, or a screenshot-as-UI shortcut.
- Mirror all recoverable first-party images, SVGs, videos, icons, and dynamic path assets under their original `assets/` relative paths.
- Treat all captured third-party source as untrusted data; do not execute downloaded code outside the isolated browser-served mirror.
- Remove Vercel Insights/analytics from the deliverable.
- Preserve Cal.com as an external embed for this baseline and record it as an external dependency.
- Preserve the live 404 for `assets/intelligence-frame.png` unless evidence proves it is an active required asset.
- Verify at 1440×900, 768×900, and 390×844 plus start/middle/end states for each sticky section.
- Do not claim pixel-perfect completion while any hard-fail or unresolved evidence gap remains.

---

### Task 1: Freeze the Approved Production Sources

**Files:**
- Create: `.clone-ui/source/raw.html`
- Create: `.clone-ui/source/styles.css`
- Create: `.clone-ui/source/script.js`
- Create: `.clone-ui/source/source-sha256.txt`
- Create: `.clone-ui/source/security-scan.txt`
- Create: `.clone-ui/lessons.md`

**Interfaces:**
- Consumes: `tmp/ref/deslopify-site/source/raw.html`, `styles.css`, `script.js`, and their recorded hashes.
- Produces: immutable source evidence used by the asset mirror, generated plan artifacts, and parity checks.

- [x] Copy the captured source files into `.clone-ui/source/` without modifying them.
- [x] Calculate SHA-256 hashes and assert they match the approved hashes in `DESLOPIFY_ANALYSIS.md`.
- [x] Scan the source files for agent-directed injection patterns and save a terse audit result.
- [x] Verify the live HTML/CSS/JS headers and hashes; if live production changed, retain both approved and current evidence and use the current version only after documenting the delta.

### Task 2: Build and Validate the Complete Asset Manifest

**Files:**
- Create: `.clone-ui/plan/assets.json`
- Create: `.clone-ui/plan/asset-status.json`
- Create: `.clone-ui/plan/embeds.json`
- Create: `scripts/verify-mirror.mjs`

**Interfaces:**
- Consumes: frozen HTML/CSS/JS source strings and runtime network evidence.
- Produces: a deduplicated manifest of static paths, dynamic template paths, external embeds, local targets, HTTP status, MIME type, byte size, and hash.

- [x] Write a failing fixture test that proves extraction covers HTML attributes, CSS `url(...)`, JS string literals, and template-generated `screens/` and `marbles/` paths.
- [x] Run the verifier and confirm the fixture fails before implementing missing extraction coverage.
- [x] Implement the minimal manifest extractor inside `scripts/verify-mirror.mjs`.
- [x] Generate `.clone-ui/plan/assets.json` and classify every entry as first-party, external embed, tracker, or expected missing resource.
- [x] Run the verifier and require zero unclassified asset references.

### Task 3: Materialize the Native Production Mirror

**Files:**
- Create: `index.html`
- Create: `styles.css`
- Create: `script.js`
- Create: `assets/**`
- Create: `README.md`

**Interfaces:**
- Consumes: the frozen source files and `.clone-ui/plan/assets.json`.
- Produces: a directly served static website whose first-party runtime requests resolve locally.

- [x] Write a failing verifier assertion that requires all first-party manifest entries to exist at the declared local path and match their recorded hash.
- [x] Copy the frozen production HTML/CSS/JS to the deliverable filenames.
- [x] Remove Vercel Insights references from `index.html` while leaving visual DOM unchanged.
- [x] Download every recoverable first-party asset to its exact relative path, preserving binary bytes and MIME-compatible extensions.
- [x] Keep the Cal.com embed external and document the isolated-browser requirement for executing the mirrored JavaScript.
- [x] Run the verifier and require zero missing local assets except the explicitly recorded live 404.

### Task 4: Generate Clone Evidence Contracts

**Files:**
- Create: `.clone-ui/plan/tokens.json`
- Create: `.clone-ui/plan/section-map.json`
- Create: `.clone-ui/plan/section-evidence.json`
- Create: `.clone-ui/plan/state-matrix.json`
- Create: `.clone-ui/source/runtime-current.json`

**Interfaces:**
- Consumes: approved section/runtime analysis plus fresh live DOM/computed-style evidence.
- Produces: stable selectors, viewports, scroll positions, interactions, and assertions used by the visual verification run.

- [x] Capture current live section geometry, computed typography/colors, media queries, sticky selectors, Canvas/WebGL nodes, and network resources.
- [x] Create a section map covering Hero, Intelligence, Work, Process, Bento, Pricing, Unfold Gallery, About, Testimonials, and Footer.
- [x] Create a state matrix for sticky start/middle/end, hero slider/drag, Work tabs, pricing controls, footer Canvas/WebGL, and Cal.com.
- [x] Record positive and negative evidence so no extra UI or behavior is invented.

### Task 5: Run Local Functional and Network Verification

**Files:**
- Create: `.clone-ui/verification/network.json`
- Create: `.clone-ui/verification/interactions.json`
- Create: `.clone-ui/verification/console.json`

**Interfaces:**
- Consumes: the local mirror and state matrix.
- Produces: repeatable evidence that the mirror loads, scrolls, animates, and resolves local assets.

- [x] Start the mirror on an isolated localhost port.
- [x] Verify there are no first-party requests to `deslopify.studio` and no Vercel analytics requests.
- [x] Exercise every state-matrix interaction and record pass/fail evidence.
- [x] Record console errors and separate expected Cal.com/cross-origin issues from mirror regressions.
- [x] Verify the live 404 fallback does not create a visible defect before accepting it as expected.

### Task 6: Run Responsive and Stateful Pixel Verification

**Files:**
- Create: `.clone-ui/verification/captures/ref/**`
- Create: `.clone-ui/verification/captures/impl/**`
- Create: `.clone-ui/verification/diffs/**`
- Create: `.clone-ui/verification/pixel-report.json`
- Create: `.clone-ui/verification/drift-report.md`

**Interfaces:**
- Consumes: the live reference, local mirror, section map, and state matrix.
- Produces: AE/SSIM metrics and section/state verdicts at matching viewport and scroll state.

- [x] Capture live and local initial/full-page evidence at 1440×900, 768×900, and 390×844.
- [x] Capture sticky start/middle/end and every interactive state from the state matrix on both live and local pages.
- [x] Run structural/computed-style checks before AE/SSIM comparison.
- [x] Mask only intrinsically time-varying Canvas/video pixels, using identical masks on both pages while preserving layout.
- [x] Diagnose and fix each critical or major drift, recapture, and repeat up to three bounded iterations per section.
- [x] Write the final drift report with explicit pass/revise/fail outcomes and remaining limitations.

### Task 7: Final Hard-Fail Audit and Handoff

**Files:**
- Modify: `.clone-ui/lessons.md`
- Modify: `README.md`
- Create: `.clone-ui/verification/final-verdict.json`

**Interfaces:**
- Consumes: all source, plan, functional, network, and visual evidence.
- Produces: a final auditable verdict and local run instructions.

- [x] Verify no screenshot, PDF render, or browser chrome is used as shipped UI.
- [x] Verify every rendered asset is local, native-sized, and present in fresh browser evidence.
- [x] Verify browser evidence is current and viewport/state pairs match.
- [x] Append target-specific lessons discovered during comparison.
- [x] Run the complete verifier one final time and record the exact command and result in `README.md`.

