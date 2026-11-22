#!/usr/bin/env bash
# deploy.sh — 构建并推送到 GitHub Pages (gh-pages 分支)
# 用法:
#   ./deploy.sh                      # 使用已配置的 origin remote
#   ./deploy.sh <git-url>            # 首次部署, 直接给仓库地址
# 之后在 GitHub 仓库 Settings -> Pages 选 Source: gh-pages branch / (root)
set -euo pipefail
cd "$(dirname "$0")"

REMOTE_URL="${1:-$(git remote get-url origin 2>/dev/null || true)}"
if [[ -z "$REMOTE_URL" ]]; then
  echo "用法: ./deploy.sh <git-remote-url>" >&2
  echo "或先: git remote add origin <url>" >&2
  exit 1
fi

./build.sh

TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT

if git ls-remote --exit-code --heads "$REMOTE_URL" gh-pages >/dev/null 2>&1; then
  echo "==> 克隆已有 gh-pages 分支"
  git clone --depth 1 --branch gh-pages "$REMOTE_URL" "$TMP"
else
  echo "==> 创建 orphan gh-pages 分支"
  if git clone --depth 1 "$REMOTE_URL" "$TMP" 2>/dev/null; then
    git -C "$TMP" checkout --orphan gh-pages
    git -C "$TMP" rm -r --cached . >/dev/null 2>&1 || true
    find "$TMP" -mindepth 1 -maxdepth 1 ! -name .git -exec rm -rf {} +   # 保留 .git
  else
    git init -b gh-pages "$TMP"
    git -C "$TMP" remote add origin "$REMOTE_URL"
  fi
fi

echo "==> 同步构建产物"
cp index.html "$TMP"/
cp -R book "$TMP"/book

git -C "$TMP" add -A
if git -C "$TMP" diff --cached --quiet; then
  echo "无变更, 跳过推送"
else
  git -C "$TMP" commit -m "deploy: $(date '+%Y-%m-%d %H:%M') built from $(git rev-parse --short HEAD 2>/dev/null || echo untracked)"
  git -C "$TMP" push -f origin gh-pages
  echo "已推送 gh-pages。仓库 Settings -> Pages -> Source 选 'gh-pages branch / (root)'"
fi
