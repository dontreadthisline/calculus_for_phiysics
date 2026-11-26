// figs/linearize.js — 图 linearize: 导数 = 局部线性近似 (普通 JS, 不经 Pandoc 处理)
window.addEventListener('load', function () {
  if (typeof Sketch === 'undefined') return;
  const svg = document.getElementById('linsvg');
  const P = { ink: '#3a4aa8', deep: '#2c3a8c', amber: '#bf8700', green: '#1a7f37', dim: '#9aa1b9' };
  const s = Sketch(svg);

  /* ---------- 左面板: 曲线 + 切线 + Δx/dy ---------- */
  const f = x => 0.34 * (x - 2.6) ** 2 + 0.9;         // 世界: x∈[0.4,5.6], y∈[0.4,3.4]
  const fp = x => 0.68 * (x - 2.6);
  const X0 = 30, X1 = 320, YB = 268, YT = 24;
  const px = x => X0 + (x - 0.4) / 5.2 * (X1 - X0);
  const py = y => YB - (y - 0.4) / 3.0 * (YB - YT);
  /* 轴 */
  s.path(`M${X0} ${YB} L${X1} ${YB}`, { stroke: 'rgba(154,161,185,.6)', width: 1.2 });
  s.path(`M${X0} ${YB} L${X0} ${YT}`, { stroke: 'rgba(154,161,185,.6)', width: 1.2 });
  /* 曲线 */
  let dC = '';
  for (let x = 0.4; x <= 5.6 + 1e-9; x += .04) dC += (dC ? ' L' : 'M') + px(x) + ' ' + py(f(x));
  s.path(dC, { stroke: P.deep, width: 2.2 });
  /* 切点与切线 */
  const x0 = 1.5, dx = 1.6, y0 = f(x0);
  const tl = t => y0 + fp(x0) * (t - x0);
  s.path(`M${px(x0 - .9)} ${py(tl(x0 - .9))} L${px(x0 + 2.6)} ${py(tl(x0 + 2.6))}`,
         { stroke: P.amber, width: 1.8 });
  s.dot(px(x0), py(y0), P.amber, 5);
  s.dot(px(x0 + dx), py(f(x0 + dx)), P.deep, 4.5);
  /* Δx / Δy / 误差 标注 */
  s.path(`M${px(x0)} ${py(y0)} L${px(x0)} ${py(f(x0 + dx))}`, { stroke: 'rgba(154,161,185,.7)', width: 1, rough: false });
  s.path(`M${px(x0 + dx)} ${py(y0)} L${px(x0 + dx)} ${py(f(x0 + dx))}`, { stroke: 'rgba(154,161,185,.7)', width: 1, rough: false });
  s.path(`M${px(x0)} ${py(f(x0 + dx))} L${px(x0 + dx)} ${py(f(x0 + dx))}`, { stroke: 'rgba(154,161,185,.7)', width: 1, rough: false });
  kx(svg, px(x0) - 26, py(f(x0 + dx)) + 4, '\\Delta x', { fs: 12.5, color: P.dim });
  kx(svg, px(x0 + dx) + 26, py((y0 + f(x0 + dx)) / 2), 'f\'\\!\\Delta x', { fs: 12.5, color: P.green });
  /* 切线与曲线间误差 (小段高亮) */
  s.path(`M${px(x0 + dx)} ${py(tl(x0 + dx))} L${px(x0 + dx)} ${py(f(x0 + dx))}`,
         { stroke: P.green, width: 2.4, rough: false });
  s.label(px(x0 + dx) + 4, py((tl(x0 + dx) + f(x0 + dx)) / 2) - 8, '误差 ~ (Δx)²', { size: 12, color: P.green, anchor: 'start' });
  kx(svg, 175, 40, 'f(x_0+\\Delta x)\\approx f(x_0)+f\'(x_0)\\,\\Delta x', { fs: 14.5, color: P.deep });
  s.label(175, 62, '曲线 (深蓝) 与切线 (琥珀) 在 x₀ 附近几乎重合', { size: 12.5, color: P.dim });
  s.pulse(dC, { t0: 0.4, travel: 3.4, period: 8, color: P.deep, size: 3 });

  /* ---------- 连接: 放大指示 ---------- */
  s.path(`M${px(x0 + dx * .5)} ${py(f(x0 + dx * .5)) + 8} L 358 150`, { stroke: 'rgba(154,161,185,.6)', width: 1.1, rough: false });
  s.path(`M${px(x0 + dx * .4)} ${py(tl(x0 + dx * .4)) - 8} L 358 110`, { stroke: 'rgba(154,161,185,.6)', width: 1.1, rough: false });
  s.label(352, 84, '放大', { size: 14, color: P.dim });

  /* ---------- 右面板: 放大后的邻域 ---------- */
  const RX0 = 372, RX1 = 644, RYB = 268, RYT = 24;
  const u0 = x0 + dx * .35, u1 = x0 + dx * 1.05;        // 放大窗口 (世界坐标)
  const qx = x => RX0 + (x - u0) / (u1 - u0) * (RX1 - RX0);
  const qy = y => RYB - (y - Math.min(y0, tl(u0)) - .05) / (tl(u1) - Math.min(y0, tl(u0)) - .1) * (RYB - RYT);
  /* 放大窗口内的曲线与切线: 几乎重合 */
  let dC2 = '';
  for (let x = u0; x <= u1 + 1e-9; x += (u1 - u0) / 90) dC2 += (dC2 ? ' L' : 'M') + qx(x) + ' ' + qy(f(x));
  s.path(dC2, { stroke: P.deep, width: 2.6 });
  s.path(`M${qx(u0)} ${qy(tl(u0))} L${qx(u1)} ${qy(tl(u1))}`, { stroke: P.amber, width: 1.8, opacity: .85 });
  s.dot(qx(x0 + dx * .7), py(0), 'none', 0);   // 占位
  s.label((RX0 + RX1) / 2, 40, '放大后的邻域', { size: 13.5, color: P.dim });
  s.label((RX0 + RX1) / 2, 62, '以直代曲：二者无法区分', { size: 13.5, color: P.deep });
  s.flow(dC2, { color: P.amber, size: 3.2, dur: 3.6 });
  /* 底部注 */
  s.label(330, 292, '导数 = 局部线性近似：f\'(x₀) 是放大后那条直线的斜率；一切「小量近似」都来自这里', { size: 13, color: P.dim });
});
