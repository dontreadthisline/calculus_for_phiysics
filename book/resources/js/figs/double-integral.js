// figs/double-integral.js — 图 double-integral: 累次积分的两种切法 (先 dy 后 dx / 先 dx 后 dy)
window.addEventListener('load', function () {
  if (typeof Sketch === 'undefined') return;
  const svg = document.getElementById('dintsvg');
  const P = { ink: '#3a4aa8', deep: '#2c3a8c', amber: '#bf8700', green: '#1a7f37', dim: '#9aa1b9' };
  const s = Sketch(svg);
  /* 区域 R: y 从 g1(x)=x²/4 到 g2(x)=1+x/2, x∈[0,2] 求交: x²/4 = 1+x/2 → x²-2x-4=0 → x=1+√5≈3.24 太大; 换 g2=0.5+x/2: x²/4=0.5+x/2 → x²-2x-2=0 → x=1+√3≈2.73; 再换 R 域 x∈[0,2.2] 手工截断 */
  const g1 = x => x * x / 5;          // 下边界 (抛物线)
  const g2 = x => 0.72 + 0.34 * x;    // 上边界 (直线)
  const xa = 0.42, xb = 2.5;          // 交点附近 (数值解)
  // 求交点
  function solve() { let lo = 0, hi = 4; for (let i = 0; i < 60; i++) { const m = (lo + hi) / 2; (g2(m) - g1(m) > 0) ? lo = m : hi = m; } return lo; }
  const xL = 0, xR = solve();

  function panel(OX, vertical) {
    const X0 = OX, X1 = OX + 290, YB = 240, YT = 30;
    const px = x => X0 + x / 2.9 * (X1 - X0);
    const py = y => YB - y / 1.8 * (YB - YT);
    /* 轴 */
    s.path(`M${X0} ${YB} L${X1} ${YB}`, { stroke: 'rgba(154,161,185,.6)', width: 1.2 });
    s.path(`M${X0} ${YB} L${X0} ${YT}`, { stroke: 'rgba(154,161,185,.6)', width: 1.2 });
    /* 边界曲线 */
    let dA = '', dB = '';
    for (let x = xL; x <= xR + 1e-9; x += .03) {
      dA += (dA ? ' L' : 'M') + px(x) + ' ' + py(g1(x));
      dB += (dB ? ' L' : 'M') + px(x) + ' ' + py(g2(x));
    }
    s.path(dA, { stroke: P.deep, width: 2 });
    s.path(dB, { stroke: P.deep, width: 2 });
    s.path(`M${px(xL)} ${py(g1(xL))} L${px(xL)} ${py(g2(xL))}`, { stroke: P.deep, width: 1.6 });
    /* 条带 */
    if (vertical) {
      [0.55, 1.15, 1.75, 2.28].forEach(function (x) {
        s.path(`M${px(x)} ${py(g1(x))} L${px(x)} ${py(g2(x))}`,
               { stroke: P.amber, width: 2.4, opacity: .85 });
        s.dot(px(x), py(g1(x)), P.amber, 3);
        s.dot(px(x), py(g2(x)), P.amber, 3);
      });
      /* 内层限标注 (右侧一条) */
      const xs = 2.28;
      kx(svg, px(xs) + 6, py(g1(xs)) + 12, 'y = g_1(x)', { fs: 11.5, color: P.green });
      kx(svg, px(xs) + 6, py(g2(xs)) - 8, 'y = g_2(x)', { fs: 11.5, color: P.green });
      kx(svg, (X0 + X1) / 2, 296, '\\iint_R f\\,\\mathrm{d}A = \\int_a^b\\!\\Big[\\int_{g_1(x)}^{g_2(x)} f\\,\\mathrm{d}y\\Big]\\mathrm{d}x', { fs: 13.5, color: P.deep });
      s.label((X0 + X1) / 2, 66, '竖切：先对 y 积分（内层），\n再对 x 积分（外层）'.split('\n')[0], { size: 13, color: P.dim });
      s.label((X0 + X1) / 2, 84, '区域信息全部进入积分限', { size: 12.5, color: P.dim });
    } else {
      /* 解析边界: 左 = 直线 g2 反解 (y<0.72 时为 x=0), 右 = 抛物线 g1 右支 */
      const h1 = y => Math.max(xL, (y - 0.72) / 0.34);
      const h2 = y => Math.sqrt(5 * y);
      [0.28, 0.56, 0.86, 1.18].forEach(function (y) {
        s.path(`M${px(h1(y))} ${py(y)} L${px(h2(y))} ${py(y)}`,
               { stroke: P.green, width: 2.4, opacity: .85 });
        s.dot(px(h1(y)), py(y), P.green, 3);
        s.dot(px(h2(y)), py(y), P.green, 3);
      });
      const ys = 0.86;
      kx(svg, px(h1(ys)) - 50, py(ys) + 18, 'x = h_1(y)', { fs: 11.5, color: P.amber });
      kx(svg, px(h2(ys)) - 40, py(ys) - 16, 'x = h_2(y)', { fs: 11.5, color: P.amber });
      kx(svg, (X0 + X1) / 2, 296, '= \\int_c^d\\!\\Big[\\int_{h_1(y)}^{h_2(y)} f\\,\\mathrm{d}x\\Big]\\mathrm{d}y', { fs: 13.5, color: P.green });
      s.label((X0 + X1) / 2, 66, '横切：先对 x 积分（内层），\n再对 y 积分（外层）'.split('\n')[0], { size: 13, color: P.dim });
      s.label((X0 + X1) / 2, 84, 'Fubini 定理：两种切法结果相等', { size: 12.5, color: P.dim });
    }
    s.label(X0 + 8, YB + 16, vertical ? 'x' : 'x', { size: 12, color: P.dim, mono: true });
    s.label(X0 - 12, YT + 14, 'y', { size: 12, color: P.dim, mono: true });
  }
  panel(36, true);
  panel(348, false);
});
