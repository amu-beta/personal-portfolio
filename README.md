# 个人作品集

一个本地可直接运行的中文静态作品集，包含首页、作品集和 AI 学习三个页面。

## Run locally

```bash
python3 -m http.server 4173 --bind 127.0.0.1
```

打开以下路由：

- `http://127.0.0.1:4173/index.html`：首页
- `http://127.0.0.1:4173/works.html`：作品集
- `http://127.0.0.1:4173/ai-learning.html`：AI 学习

作品集默认显示「App 设计」（Founder、Indus、Hush）；可切换到「App Store 展示图」（Flyout、Justgains）。AI 学习页是静态的七篇学习笔记列表，不提供文章详情页或卡片链接。

## 本地资源说明

- 页面样式、脚本和媒体均保存在本目录中。
- `assets/intelligence-frame.png` 是允许存在的源站对齐 404：页面会隐藏其失败状态，因此不构成可见缺陷。
- 验证证据、清单、哈希和截图保存在 `.clone-ui/`。

## Verify source and assets

```bash
node --test tests/portfolio-pages.test.mjs tests/asset-extractor.test.mjs
node scripts/verify-mirror.mjs verify
node scripts/verify-mirror.mjs audit
```

资产验证应报告 `missing: 0`；多页审计应报告 `issueCount: 0`。浏览器与响应式验证的截图和 JSON 证据位于 `.clone-ui/verification/chinese-portfolio/`。
