// figs/phase.js — 图 phase: 方向场 + 解族 + 初值选解 (逻辑斯蒂方程为例)
window.addEventListener('load', function () {
  if (typeof Sketch === 'undefined') return;
  const svg = document.getElementById('phsvg');
  const P = { ink: '#3a4aa8', deep: '#2c3a8c', amber: '#bf8700', green: '#1a7f37', dim: '#9aa1b9' };
  const s = Sketch(svg);
  /* 世界: t∈[0,6], x∈[0,2.2];  dx/dt = x(1-x) (逻辑斯蒂) */
  const X0 = 46, X1 = 612, YB = 252, YT = 26;
  const pt = t => X0 + t / 6 * (X1 - X0);
  const qx = x => YB - x / 2.2 * (YB - YT);
  const g = (t, x) => x * (1 - x);
  /* 轴 */
  s.path(`M${X0} ${YB} L${X1} ${YB}`, { stroke: 'rgba(154,161,185,.6)', width: 1.3 });
  s.path(`M${X0} ${YB} L${X0} ${YT}`, { stroke: 'rgba(154,161,185,.6)', width: 1.3 });
  s.label(X1 - 6, YB + 16, 't', { size: 13, color: P.dim, mono: true });
  s.label(X0 - 14, YT + 8, 'x', { size: 13, color: P.dim, mono: true });
  /* 平衡线 x=1 (绿色虚) */
  s.path(`M${X0} ${qx(1)} L${X1} ${qx(1)}`, { stroke: 'rgba(26,127,55,.5)', width: 1.2, rough: false });
  s.label(X1 - 96, qx(1) - 9, '平衡解 x = 1（稳定）', { size: 12, color: P.green });
  /* 方向场: 短刻度 */
  for (let t = .3; t <= 6; t += .5) {
    for (let x = .12; x <= 2.15; x += .22) {
      const k = g(t, x), L = 9.5, n = Math.sqrt(1 + k * k);
      const dx = L / n / 6 * (X1 - X0) * .9, dy = k * L / n / 2.2 * (YB - YT) * .9;
      s.path(`M${pt(t) - dx} ${qx(x) + dy} L${pt(t) + dx} ${qx(x) - dy}`,
             { stroke: 'rgba(58,74,168,.32)', width: 1.1, rough: false });
    }
  }
  /* 解族 (解析: x(t) = 1/(1 + C e^{-t})) */
  function sol(x0) { const C = 1 / x0 - 1; return t => 1 / (1 + C * Math.exp(-t)); }
  [0.15, 0.35, 1.9, 0.62, 1.45].forEach(function (x0, i) {
    const f = sol(x0);
    let d = '';
    for (let t = 0; t <= 6.001; t += .06) {
      const x = f(t);
      if (x > 2.2) break;
      d += (d ? ' L' : 'M') + pt(t) + ' ' + qx(x);
    }
    s.path(d, { stroke: 'rgba(44,58,140,.55)', width: 1.5 });
  });
  /* 初值点 + 被选中的解 (两条, 绿色高亮) */
  [[0.9, 1.78], [1.8, 0.25]].forEach(function (iv) {
    const [t0, x0] = iv, f = sol(x0);
    let d = '';
    for (let t = t0; t <= 6.001; t += .04) {
      const x = f(t);
      if (x > 2.18) break;
      d += (d ? ' L' : 'M') + pt(t) + ' ' + qx(x);
    }
    /* 初值之前的部分 (时间倒推, 逆序数组拼接) */
    const segs = [];
    for (let t = t0; t >= 0; t -= .04) {
      const x = f(t);
      if (x > 2.18 || x < 0.02) break;
      segs.push(pt(t) + ' ' + qx(x));
    }
    segs.reverse();
    const dAll = (segs.length ? 'M' + segs.join(' L') + ' L' : 'M') + d.slice(1);
    s.path(dAll, { stroke: P.green, width: 2.4 });
    s.dot(pt(t0), qx(x0), P.amber, 6);
    kx(svg, pt(t0) - 4, qx(x0) - 14, '(t_0,\\,x_0)', { fs: 12, color: P.amber });
    s.pulse(dAll, { t0: 0.5, travel: 3.2, period: 8, color: P.green, size: 3.4 });
  });
  /* 图例 */
  s.label(180, 30, '短刻度：方向场 ẋ = f(x,t)（方程逐点规定的斜率）', { size: 13, color: P.dim });
  s.label(486, 52, '细曲线：解族（含待定常数）', { size: 13, color: 'rgba(44,58,140,.8)' });
  s.label(486, 74, '绿线：过初值点的唯一解', { size: 13, color: P.green });
  s.label(330, 284, '通解 = 曲线族；初值条件 (t₀,x₀) 从族中选出唯一一条——「阶数 = 所需初值个数」', { size: 13, color: P.dim });
});
