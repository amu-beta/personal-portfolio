# Deslopify 1:1 复刻分析报告

分析日期：2026-08-24  
目标站点：https://deslopify.studio/

## 结论

应优先走“线上生产源码镜像”路线，不建议先重写成 React/Tailwind。

目标站点直接公开了线上实际运行的 `HTML + CSS + JavaScript`：

- `https://deslopify.studio/`
- `https://deslopify.studio/styles.css?v=200`
- `https://deslopify.studio/script.js?v=187`

这三份文件已经包含完整页面结构、样式、响应式规则、滚动驱动动画、Canvas 物理效果和 WebGL shader。保持其目录结构并下载全部原站素材，可以比重新推导组件和动画更准确，也能避免重写造成的交互偏差。

GitHub 没有发现与该网站匹配的公开仓库。以 `deslopify` 搜到的 21 个同名仓库均为文本去 AI 味、浏览器扩展或其他无关项目；用域名、页面完整标题、独特源码注释和素材文件名进行精确查询也没有结果。页面源码自身没有 GitHub 链接、repository 字段或 source map。

## 技术栈确认

目标站不是 React、Vue、Svelte、Webflow 或当前 Framer 导出，而是部署在 Vercel 的原生静态站：

| 项目 | 结果 |
|---|---|
| 页面结构 | 原生 HTML |
| 样式 | 单文件 `styles.css`，约 119 KB |
| 交互 | 单文件 `script.js`，约 65 KB |
| HTML | 约 69 KB |
| 部署 | Vercel 静态托管 + Vercel Insights |
| 字体 | Inter、Plus Jakarta Sans（Google Fonts） |
| 外部运行依赖 | Google Fonts、Cal.com、Vercel Insights |
| 第三方动画库 | 无 |
| 主要断点 | `max-width: 767px` |
| 中间尺寸适配 | 768–1199px 对 1200px 设计画布执行自定义缩放 |
| 桌面页面滚动高度 | 约 17,180px（1440×900） |
| 移动页面滚动高度 | 约 13,689px（390×844） |

生产源码快照 SHA-256：

```text
a83b25176edb121b22ab3d7fa87f815707003385e71bfe3e396622a7b354b1f8  raw.html
83cfb3d3a7ae3e4cd0690a82ee8cee5560a8f8826b299ab47c3cc4af8c2f9dc4  styles.css
29d1a9666c5abdc0733c64995eb1948aeb51be6108c8d9e9d26a0416dca0d004  script.js
```

## 关于 Framer 原站

目标 CSS 的注释写明，它基于 `deslopify.framer.website` 的 Ragnarok AI 模板配置重建。该 Framer 地址目前仍可访问，页面标题为 `Ragnarok - AI Agent Template`，但视觉和内容与 `deslopify.studio` 不同。

因此：

- `deslopify.studio` 才是本次 1:1 复刻的唯一视觉和行为真相。
- `deslopify.framer.website` 只能作为部分动效思路的背景材料，不能拿来替代当前站点。
- 当前生产 HTML/CSS/JS 已经是针对 Deslopify 的独立静态实现。

## 页面结构与滚动行为

桌面端主要章节：

| 章节 | 文档位置/高度 | 关键行为 |
|---|---:|---|
| Hero | top 141 / 369px | 打字标题、自动手机跑马灯、拖拽、Before/After 分割线 |
| Intelligence | top 1330 / 2700px | 900px sticky 视口，滚动驱动手机屏与两侧信息切换 |
| Work | top 4230 / 898px | App design / App store shots 切换与应用图标切换 |
| Process | top 5328 / 3400px | 900px sticky 视口，三阶段滚动叙事 |
| Bento | top 8928 / 1149px | 输入循环、附件/发送交互、ASCII/视频画布 |
| Pricing | top 10277 / 934px | 价格数字动画、交付速度配置、月付/试用切换 |
| Unfold Gallery | top 11411 / 2400px | 900px sticky 视口，作品卡从散开到网格的滚动变换 |
| About | top 14011 / 787px | 设计师档案卡、装饰浮动元素 |
| Testimonials | top 14998 / 1390px | 推文/评价跑马灯、手机与 Cal.com 预约嵌入 |
| Footer | 固定揭示式 | 弹珠罐、雨、闪电、WebGL burn reveal |

检测到三个主要 sticky 容器：

- `.intelligence-sticky`
- `.process-sticky`
- `.unfold-sticky`

页面使用原生滚动，不依赖 Lenis 或 Locomotive Scroll。

## 动效实现

全部高级动效由原生 JavaScript 实现，没有 GSAP、Framer Motion、Matter.js、Three.js、Spline、Rive 或 Lottie：

- 标题执行“输入 → 选中 → 重新输入”循环。
- 手机跑马灯保持约 80px/s 速度，支持拖拽和 hover 减速。
- Before/After 组件支持指针拖动。
- 多段 sticky section 根据 `scrollY` 计算进度。
- 价格使用 requestAnimationFrame 数字过渡。
- Unfold Gallery 按滚动进度计算每张独立卡片的 transform。
- Footer 弹珠罐是自写 2D Canvas 物理模拟。
- Footer 雨、闪电和粒子使用 2D Canvas。
- `#burn-canvas` 在对应区域激活时动态创建，使用自写 WebGL shader。

源码中可见：

- 22 处 `requestAnimationFrame`
- 6 处 `IntersectionObserver`
- 2 处 `ResizeObserver`
- 4 组 pointer-down 交互
- 只有一个主要 CSS 移动端断点，其余布局由自定义缩放处理

## 图片与媒体资产

不能使用一张长截图或一张图重复裁切。原站确实使用大量独立素材文件。

目前从 HTML、CSS、JS 中解析到至少 106 个独立引用路径，包括：

- 84 个 JPG
- 12 个 PNG
- 4 个 SVG
- 3 个 MP4
- 通过模板字符串动态生成的 screen/marble 路径

浏览器完整滚动后实际记录到 102 个资源请求：85 个图片请求、5 个视频实例、2 个脚本、4 个 CSS/字体资源、1 个 Cal.com iframe。当前传输量约 9.3 MB。

素材按以下目录组织：

```text
assets/
├── screens/       # Before/After 手机界面
├── projects/      # App 设计与商店宣传图
├── avatars/       # 评价与社交头像
├── marbles/       # Footer 弹珠角色
├── *.mp4          # ASCII/卡片动画来源视频
├── *.jpg/png/svg  # 背景、图标、Logo、装饰素材
```

发现一个线上既存问题：`assets/intelligence-frame.png` 当前返回 404。实施镜像时需确认它是否是废弃 fallback；不应擅自用近似图片覆盖，否则会偏离线上当前状态。

## GitHub 源码调查

已检查：

1. GitHub repository 搜索 `deslopify`：21 个结果，均与目标网站无关。
2. 精确搜索 `deslopify.studio`：0 个匹配仓库。
3. 精确搜索页面标题：0 个匹配仓库。
4. 精确搜索源码注释 `Ragnarok AI / 1:1 rebuild of deslopify.framer.website`：0 个匹配仓库。
5. 精确搜索独特素材名 `hush-home-after.jpg`：无结果。
6. 生产 HTML、CSS、JS 未包含 GitHub、repository 或 source map 指针。

结论：没有发现可验证的公开 GitHub 源码。仓库可能是私有的，也可能站点就是以静态文件直接部署。

## 推荐实施路线

### 1. 冻结线上版本

- 使用已经保存的生产 HTML、CSS、JS 和 SHA-256 作为基准。
- 生成完整资产清单。
- 下载每个原站素材到相同的本地相对路径。
- 记录无法下载、404 和外部嵌入项。

### 2. 建立本地静态镜像

- 保留原生 HTML/CSS/JS 架构。
- 不引入 React/Tailwind，不重写动画。
- 保留所有独立图片节点、Canvas 和 SVG。
- 默认移除 Vercel Insights；Cal.com 是否保持原账号由用户决定。

### 3. 逐状态验证

- 对比 1440×900、768 宽和 390×844。
- 为三个 sticky section 分别抓取开始、中间、结束状态。
- 测试跑马灯拖拽、Before/After、应用切换、价格配置、弹珠罐、Cal.com。
- 使用截图 AE/SSIM 与分段像素对比，不用主观“看起来差不多”作为完成标准。

### 4. 完成 1:1 后再改成个人作品集

如果最终要公开部署，建议在视觉复刻通过后再替换：

- Deslopify Logo、品牌名和版权文字
- Rehan Ahmed 资料与照片
- Cal.com 预约地址
- 用户评价、头像和具体 App 案例

这些替换应在 1:1 基线完成后单独进行，避免同时改内容和调视觉导致无法准确比较。

## 不建议的路线

- 不建议把页面截图直接当背景：无法交互、无法响应式，也违反 1:1 可用网页目标。
- 不建议现在改写成 React：会把现成的精确 DOM、CSS 和原生动画重新变成猜测。
- 不建议从 `deslopify.framer.website` 直接导出：它当前是 Ragnarok AI 模板，不是目标站成品。
- 不建议先用随机占位图：原站素材公开可抓，应该直接按相同路径保存。

## 当前分析证据

```text
tmp/ref/deslopify-site/source/raw.html
tmp/ref/deslopify-site/source/styles.css
tmp/ref/deslopify-site/source/script.js
tmp/ref/deslopify-site/analysis/asset-paths.txt
tmp/ref/deslopify-site/analysis/network.txt
tmp/ref/deslopify-site/analysis/source-sha256.txt
tmp/ref/deslopify-site/analysis/github-api-repos.json
tmp/ref/deslopify-site/analysis/sections.json
tmp/ref/deslopify-site/analysis/runtime.json
tmp/ref/deslopify-site/canvas-webgl-detection.json
tmp/ref/deslopify-site/static/ref/
tmp/ref/deslopify-site/scroll-video/ref/full-scroll-raw.webm
```

## 最终建议

批准后直接执行“生产源码 + 原站素材完整镜像”方案。这是当前证据下风险最低、视觉和交互精度最高、同时最符合“源码优先”的路线。
