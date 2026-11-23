#!/usr/bin/env bash
# build.sh — 构建整站: quarto 书 + 手工落地页 + 自检
# 产物: 根目录 index.html (落地页入口) + book/ (quarto 渲染的书)
# GitHub Pages 子路径部署兼容: 全站资源均为相对路径
set -euo pipefail
cd "$(dirname "$0")"

echo "==> quarto render"
quarto render

echo "==> landing page"
# quarto render 会把根目录 index.html 视为 index.qmd 的过期产物删掉, 渲染后补回
cp landing.html index.html

echo "==> 自检"
for f in index.html landing.html back-to-landing.html \
         book/index.html book/conventions.html \
         book/01-fundamentals.html book/02-ode.html \
         book/03-space-curves.html book/04-curvilinear.html \
         book/05-multivariable.html book/06-vector-fields.html \
         book/07-multiple-integrals.html book/08-line-surface.html \
         book/09-integral-theorems.html book/10-pde.html \
         book/reading-map.html \
         book/resources/libs/katex/katex.min.css; do
  [[ -f "$f" ]] || { echo "缺失: $f" >&2; exit 1; }
done

# 站内引用必须全为相对路径, 否则 Pages 子路径 (user.github.io/<repo>/) 下 404
if grep -qE '(src|href)="/' index.html book/index.html; then
  echo "错误: 检测到根绝对路径引用 (/xxx), 子路径部署会 404:" >&2
  grep -nE '(src|href)="/' index.html book/index.html | head -5 >&2
  exit 1
fi

echo "OK  入口: index.html (落地页) -> book/index.html (书)"
