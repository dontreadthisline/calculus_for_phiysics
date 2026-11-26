#!/usr/bin/env bash
# serve.sh — 本地预览整站
# 用法:
#   ./serve.sh                    # watch 模式 (默认): 监视源文件, 变更自动增量构建 + 浏览器自动刷新
#   ./serve.sh watch [端口]
#   ./serve.sh static [端口]      # 静态模式: 只服务构建产物, 不监视 (发布前检查用)
#   ./serve.sh stop [端口]        # 停止占用该端口的预览进程
# 兼容旧用法: ./serve.sh 8790  (数字被解释为端口, 等同 watch 模式)
# 端口被占时自动停止旧预览进程并接管 (打印被停进程, 留有痕迹)
set -euo pipefail
cd "$(dirname "$0")"

MODE="watch"; PORT="8787"
if [[ "${1:-}" =~ ^[0-9]+$ ]]; then
  PORT="$1"; shift
else
  case "${1:-}" in
    watch|static) MODE="$1"; shift ;;
    stop)         MODE="stop"; shift ;;
    "") ;;
    *) echo "用法: ./serve.sh [watch|static|stop] [端口]" >&2; exit 1 ;;
  esac
fi
if [[ "${1:-}" =~ ^[0-9]+$ ]]; then PORT="$1"; fi

takeover_port() {
  local pids
  pids=$(lsof -tiTCP:"$PORT" -sTCP:LISTEN 2>/dev/null || true)
  if [[ -z "$pids" ]]; then return 0; fi
  echo "端口 $PORT 被占用, 停止旧进程:"
  ps -p $pids -o pid=,command= 2>/dev/null || true
  kill $pids 2>/dev/null || true
  for _ in $(seq 1 20); do
    lsof -tiTCP:"$PORT" -sTCP:LISTEN >/dev/null 2>&1 || return 0
    sleep 0.15
  done
  echo "旧进程未退出, 强制结束" >&2
  kill -9 $(lsof -tiTCP:"$PORT" -sTCP:LISTEN) 2>/dev/null || true
  sleep 0.3
}

if [[ "$MODE" == "stop" ]]; then
  pids=$(lsof -tiTCP:"$PORT" -sTCP:LISTEN 2>/dev/null || true)
  if [[ -z "$pids" ]]; then echo "端口 $PORT 无进程"; exit 0; fi
  echo "停止:"; ps -p $pids -o pid=,command= 2>/dev/null || true
  kill $pids 2>/dev/null || true
  exit 0
fi

if [[ "$MODE" == "static" ]]; then
  if [[ -f index.html && -d book ]]; then :; else
    echo "产物缺失, 先运行 ./build.sh" >&2; exit 1
  fi
  takeover_port
  echo "落地页  http://localhost:$PORT/  (静态快照)"
  echo "书入口  http://localhost:$PORT/book/index.html"
  exec python3 -m http.server "$PORT"
fi

takeover_port
exec python3 serve_watch.py "$PORT"
