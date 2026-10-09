# 个人作品集

一个本地可直接运行的中文静态作品集，包含首页、作品集和 AI 探索三个页面。

## Run locally

```bash
python3 -m http.server 8000 --bind 127.0.0.1
```

打开以下路由：

- `http://127.0.0.1:8000/index.html`：首页
- `http://127.0.0.1:8000/works.html`：作品集
- `http://127.0.0.1:8000/ai-learning.html`：AI 探索

首页展示真实作品：可在「产品界面」（SeerQ、AI 六爻卜卦、好运节）与「视觉专题」（海外中文、海外英文）之间切换。作品集页按项目类型筛选，并链接到完整案例。AI 探索页采用双列图文卡片，包含塔罗牌展示、小知智能后台、服装衣架交互三个实践案例。塔罗牌与服装演示分别保存在 `demos/tarot-card/` 和 `demos/knit-rail/`，通过站内地址访问，无需独立开发服务器。塔罗牌说明页为 `ai-tarot.html`，支持页面内体验与新窗口在线浏览。

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
