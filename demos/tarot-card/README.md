# Tarot Card Study 静态演示

作品集在线演示入口：`demos/tarot-card/index.html`。通过作品集 HTTP 服务访问 `/demos/tarot-card/`，无需运行原项目的开发服务器。

## 原项目与构建

原项目位于 `/Users/linkaiyun/Projects/卡片`，使用 Vite、React、React Three Fiber 与 Three.js。当前静态副本构建于 2026-10-09，原项目源码未被修改。

构建必须指定 `--base ./`，以便脚本、字体、图片和纹理从演示目录内加载。Shader 已内联在 JavaScript 中；演示不依赖 `localhost:4173` 或外部素材服务。

`source-fallback.patch` 保存演示副本增加的兼容处理，涉及 `src/App.jsx`、`src/TarotScene.jsx`、`src/StaticTarotScene.jsx` 和 `src/styles.css`。下次构建时，将补丁应用到**临时源码副本**，不要应用到原项目。补丁基于当前版本；原项目升级后，先检查补丁是否仍可应用。

在原项目依赖已经安装的情况下，可按以下方式构建：

```sh
source_dir="/Users/linkaiyun/Projects/卡片"
portfolio_dir="/Users/linkaiyun/Projects/个人作品集"
build_dir=$(mktemp -d /tmp/portfolio-tarot.XXXXXX)

cp "$source_dir/package.json" "$source_dir/vite.config.js" "$source_dir/index.html" "$build_dir/"
cp -R "$source_dir/src" "$build_dir/src"
ln -s "$source_dir/assets" "$build_dir/assets"
ln -s "$source_dir/node_modules" "$build_dir/node_modules"

(
  set -e
  cd "$build_dir"
  git apply --check "$portfolio_dir/demos/tarot-card/source-fallback.patch"
  git apply "$portfolio_dir/demos/tarot-card/source-fallback.patch"
  npm run build -- --base ./ --outDir "$build_dir/dist"
)
```

构建成功后，用临时目录 `dist/` 中的 `index.html` 和 `assets/` 更新本目录中的对应产物，保留此 README 与补丁文件。通过作品集服务检查嵌套路径访问和交互后，再提交更新。

## 交互与兼容

- 正常 WebGL2 模式：圣杯女王、皇后、魔术师、星星和力量五张牌切换；纸纹与金箔材质；指针倾斜与局部反光；点击或横向拖拽翻牌；翻面按钮、方向键、空格和 Enter；Escape 回到正面并重置视角。
- 无 WebGL2 或场景渲染异常时：自动显示真实牌面和统一牌背，保留五张切牌、点击/横拖/按钮/键盘翻面、CSS 倾斜与视角重置。图片模式会显示状态说明，不提供实时金箔反光。
- 尊重减少动态效果偏好。正常 3D 与图片模式沿用同一外壳、选择器和底部控制区。

## 已完成检查

构建产物包含 70 个文件，约 25.4 MB。静态引用检查未发现缺失或绝对路径；在 `/demos/tarot-card/` 嵌套路径下，70 个文件均返回 HTTP 200，响应与本地文件内容一致。入口与场景 JavaScript 通过语法检查。

布局与交互需要在浏览器中验证，建议覆盖详情页桌面嵌入尺寸 `980 × 700`、手机嵌入尺寸 `358 × 620`，并检查无 WebGL 的图片模式。
