#!/usr/bin/env bash
# serve.sh — 本地预览整站 (落地页 + 书), 默认端口 8787
# 用法: ./serve.sh [端口]    Ctrl-C 停止
set -euo pipefail
cd "$(dirname "$0")"
PORT="${1:-8787}"

if [[ -f index.html && -d book ]]; then :; else
  echo "产物缺失, 先运行 ./build.sh" >&2; exit 1
fi

if lsof -tiTCP:"$PORT" -sTCP:LISTEN >/dev/null 2>&1; then
  echo "端口 $PORT 已被占用:" >&2; lsof -iTCP:"$PORT" -sTCP:LISTEN >&2; exit 1
fi

echo "落地页  http://localhost:$PORT/"
echo "书入口  http://localhost:$PORT/book/index.html"
exec python3 -m http.server "$PORT"
