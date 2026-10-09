# 🚀 作品集本地服务器使用说明

## 快速启动

### 方法 1：使用启动脚本（推荐）

1. 打开 **终端**（Terminal）
2. 复制并粘贴以下命令：

```bash
cd ~/Projects/个人作品集
bash start-server.sh
```

### 方法 2：直接在终端运行

```bash
cd ~/Projects/个人作品集
python3 -m http.server 8000
```

## 访问网站

启动服务器后，在浏览器中打开：

### 🌐 主地址
- http://localhost:8000
- 或 http://127.0.0.1:8000

### 📄 主要页面
- **首页**: http://localhost:8000/
- **作品集**: http://localhost:8000/works.html
- **AI 探索**: http://localhost:8000/ai-learning.html
- **项目详情**: http://localhost:8000/project-seerq.html

## 停止服务器

在终端中按 **Ctrl + C** 即可停止服务器

## 需要帮助？

- 如果端口 8000 被占用，可以改用其他端口：
  ```bash
  python3 -m http.server 3000
  ```
  然后访问 http://localhost:3000

- 确保在终端中的工作目录是 `~/Projects/个人作品集`

---
Created: 2026-10-06
