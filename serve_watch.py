#!/usr/bin/env python3
"""serve_watch.py — 实时预览服务器（零第三方依赖, 仅标准库）

功能:
  1. 静态服务整站 (与 python3 -m http.server 相同路径布局: / -> index.html, /book/...)
  2. 监视源文件 (qmd / figs / resources / landing / 配置), 变更后增量构建:
       *.qmd            -> quarto render 该页 (秒级)
       figs/*.html      -> 重渲染引用它的 qmd (include 展开)
       resources/**     -> 直接同步到 book/resources/ (无需渲染, 外链文件)
       landing.html     -> cp 为 index.html
       其余 (yml/bib/头文件) -> 全量 ./build.sh
  3. 每个响应注入一段轮询脚本: 构建完成后浏览器自动刷新 (HTML 页生效)

用法: python3 serve_watch.py [端口]      (由 serve.sh watch 调用)
"""
import glob
import http.server
import json
import os
import re
import shutil
import subprocess
import sys
import threading
import time
import urllib.parse

ROOT = os.path.dirname(os.path.abspath(__file__))
os.chdir(ROOT)

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8787

# 全局状态: 时间戳 + 构建标记 (浏览器轮询端点 /_watch_ts)
STATE = {"ts": time.time(), "building": False, "last": "ready", "log": ""}
LOCK = threading.Lock()

HEADER_FILES = ["back-to-landing.html", "kx-head.html", "alg-zh.html"]
FULL_BUILD_TRIGGERS = {"_quarto.yml", "references.bib", *HEADER_FILES, "build.sh"}

INJECT_JS = b"""
<script>
(function () {
  var last = null;
  function poll() {
    fetch('/_watch_ts', { cache: 'no-store' })
      .then(function (r) { return r.json(); })
      .then(function (s) {
        if (last === null) { last = s.ts; return; }
        if (!s.building && s.ts !== last) { location.reload(); }
        last = s.ts;
      }).catch(function () {});
  }
  setInterval(poll, 1000); poll();
})();
</script>
"""


# ---------------- 文件监视 ----------------

def snap():
    """当前监视清单: path -> mtime"""
    out = {}
    for f in ["_quarto.yml", "references.bib", "landing.html", *HEADER_FILES]:
        if os.path.isfile(f):
            out[f] = os.path.getmtime(f)
    out.update({f: os.path.getmtime(f) for f in glob.glob("*.qmd")})

    for f in glob.glob("resources/**/*", recursive=True):
        if os.path.isfile(f):
            out[f] = os.path.getmtime(f)
    return out


def fig_map():
    """figs/xxx.html -> 引用它的 qmd 列表 (由 {{< include ... >}} 决定)"""
    m = {}
    for q in glob.glob("*.qmd"):
        try:
            t = open(q, encoding="utf-8").read()
        except OSError:
            continue
        for fig in re.findall(r'\{\{<\s*include\s+(\S+?)\s*>\}\}|src="(resources/figs/\S+?\.html)"', t):
            fig = fig[0] or fig[1]
            if fig.startswith(("figs/", "resources/figs/")):
                m.setdefault(fig, set()).add(q)
    return m


def ensure_index():
    """quarto 全量渲染会删根 index.html — 补回落地页"""
    if not os.path.exists("index.html") and os.path.exists("landing.html"):
        shutil.copy("landing.html", "index.html")


def run(cmd, label):
    r = subprocess.run(cmd, capture_output=True, text=True)
    ok = r.returncode == 0
    tail = (r.stdout + r.stderr).strip().splitlines()
    tail = " | ".join(tail[-2:])[:160] if tail else ""
    print(f"[watch] {label}: {'OK' if ok else 'FAIL'} {('— ' + tail) if tail else ''}", flush=True)
    return ok, tail


def dispatch(changed):
    """按变更类型执行最小构建动作"""
    pages, syncs, full = set(), [], False
    fm = fig_map()
    for f in changed:
        if f == "landing.html":
            shutil.copy("landing.html", "index.html")
            print("[watch] landing.html -> index.html (同步)", flush=True)
        elif f in FULL_BUILD_TRIGGERS:
            full = True
        elif f.startswith("resources/figs/"):
            pages |= fm.get(f, set())
            syncs.append(f)      # 单页渲染不重拷 resources, 直接同步图文档
        elif f.startswith("resources/"):
            syncs.append(f)
        elif f.startswith("figs/"):
            pages |= fm.get(f, set())
        elif f.endswith(".qmd"):
            pages.add(f)
    # 手动同步的资源 (js/字体等外链文件, 无需渲染)
    for f in syncs:
        dst = os.path.join("book", f)
        os.makedirs(os.path.dirname(dst), exist_ok=True)
        shutil.copy2(f, dst)
    if syncs:
        print(f"[watch] 同步资源: {', '.join(syncs)}", flush=True)
    if full:
        ok, tail = run(["./build.sh"], "全量构建")
    elif pages:
        ok, tail = run(["quarto", "render", *sorted(pages)], f"渲染 {len(pages)} 页")
        ensure_index()
    elif syncs or changed == {"landing.html"}:
        ok, tail = True, ""
    else:
        ok, tail = True, ""
    with LOCK:
        STATE["building"] = False
        STATE["last"] = "ok" if ok else ("error: " + tail)
        if ok:
            STATE["ts"] = time.time()   # 只有成功构建才通知浏览器刷新


class Watcher(threading.Thread):
    def run(self):
        base = snap()
        pending, last_change = set(), 0.0
        while True:
            cur = snap()
            changed = {f for f, m in cur.items() if base.get(f) != m}
            if changed:
                pending |= changed
                base = cur
                last_change = time.time()
            # 防抖: 800ms 无新增变化即执行
            if pending and time.time() - last_change > 0.8:
                with LOCK:
                    STATE["building"] = True
                dispatch(pending)
                pending = set()
            time.sleep(0.4)


# ---------------- HTTP 服务 ----------------

class Handler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, fmt, *args):  # 精简访问日志
        sys.stdout.write(f"[http] {args[0]}\n")

    def do_GET(self):
        path = urllib.parse.unquote(urllib.parse.urlparse(self.path).path)
        if path == "/_watch_ts":
            with LOCK:
                body = json.dumps(STATE).encode()
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Cache-Control", "no-store")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return
        fpath = self.translate_path(self.path)
        if os.path.isdir(fpath):
            fpath = os.path.join(fpath, "index.html")
        if not os.path.isfile(fpath):
            self.send_error(404)
            return
        try:
            data = open(fpath, "rb").read()
        except OSError:
            self.send_error(500)
            return
        ctype = self.guess_type(fpath)
        if fpath.endswith(".html"):
            data = data.replace(b"</body>", INJECT_JS + b"</body>", 1)
            if INJECT_JS not in data:      # 无 </body> 的裸 html: 追加
                data += INJECT_JS
        self.send_response(200)
        self.send_header("Content-Type", ctype)
        self.send_header("Cache-Control", "no-store")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)


def main():
    if not (os.path.isdir("book") and os.path.exists("index.html")):
        print("[watch] 产物缺失, 先全量构建 ...", flush=True)
        run(["./build.sh"], "首次构建")
        ensure_index()
    Watcher(daemon=True).start()
    with LOCK:
        STATE["ts"] = time.time()
    srv = http.server.ThreadingHTTPServer(("", PORT), Handler)
    print(f"[watch] 实时预览: http://localhost:{PORT}/  (Ctrl-C 停止; 编辑源文件后自动构建与刷新)", flush=True)
    try:
        srv.serve_forever()
    except KeyboardInterrupt:
        print("\n[watch] 已停止")


if __name__ == "__main__":
    main()
