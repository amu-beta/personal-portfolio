#!/bin/bash
cd "$(dirname "$0")"
echo "启动作品集本地服务器..."
echo "访问地址: http://localhost:8000"
echo ""
echo "按 Ctrl+C 停止服务器"
echo ""
python3 -m http.server 8000
