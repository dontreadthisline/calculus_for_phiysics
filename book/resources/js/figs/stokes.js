// figs/stokes.js — 图 stokes: 环流 (边界) ↔ 旋度通量 (内部), 同一边界可张不同曲面
window.addEventListener('load', function () {
  if (typeof Sketch === 'undefined') return;
  const svg = document.getElementById('stksvg');
  const P = { ink: '#3a4aa8', deep: '#2c3a8c', amber: '#bf8700', green: '#1a7f37', dim: '#9aa1b9' };
  const s = Sketch(svg);

  /* ---------- 左: 回路 C + 内部小涡旋 + 环流方向 ---------- */
  const cx = 180, cy = 152, R = 96;
  /* 变形的闭合回路 */
  let dC = '';
  for (let a = 0; a <= 6.30; a += .06) {
    const rr = R * (1 + 0.16 * Math.sin(2 * a) - 0.09 * Math.cos(3 * a));
    dC += (dC ? ' L' : 'M') + (cx + rr * Math.cos(a)) + ' ' + (cy + rr * Math.sin(a) * .82);
  }
  /* 内部网格 (曲面示意) */
  for (let k = -3; k <= 3; k++) {
    let d = '';
    for (let a = 0; a <= 6.30; a += .12) {
      const rr = R * Math.abs(k) / 3.2 * (1 + 0.16 * Math.sin(2 * a) - 0.09 * Math.cos(3 * a));
      d += (d ? ' L' : 'M') + (cx + rr * Math.cos(a)) + ' ' + (cy + rr * Math.sin(a) * .82);
    }
    s.path(d, { stroke: 'rgba(58,74,168,.22)', width: 1, rough: false });
  }
  for (let k = 0; k < 8; k++) {
    const a0 = k * Math.PI / 4;
    let d = '';
    for (let t = 0; t <= 1.001; t += .08) {
      const rr = R * t * (1 + 0.16 * Math.sin(2 * a0) - 0.09 * Math.cos(3 * a0));
      d += (d ? ' L' : 'M') + (cx + rr * Math.cos(a0)) + ' ' + (cy + rr * Math.sin(a0) * .82);
    }
    s.path(d, { stroke: 'rgba(58,74,168,.22)', width: 1, rough: false });
  }
  s.path(dC, { stroke: P.deep, width: 2.6 });
  /* 环流箭头 (沿回路顺时针 → 俯视顺时针) */
  s.flow(dC, { color: P.deep, size: 3.6, dur: 4.2 });
  /* 内部小涡旋 (旋度非零处: 小圆环流) */
  [[-42, -20], [30, -34], [-8, 30], [48, 22]].forEach(function (off) {
    const wx = cx + off[0], wy = cy + off[1], wR = 15;
    let dW = '';
    for (let a = 0; a <= 5.6; a += .35) dW += (dW ? ' L' : 'M') + (wx + wR * Math.cos(a)) + ' ' + (wy + wR * Math.sin(a) * .82);
    s.path(dW, { stroke: P.amber, width: 1.7, arrow: true });
    s.dot(wx, wy, P.amber, 2.5);
  });
  s.label(cx, 26, '边界回路 C 上的环流', { size: 14, color: P.deep });
  s.label(cx, 288, '琥珀小环: 内部各点的旋度 (单位面积环流)', { size: 12.5, color: P.amber });

  /* ---------- 右: 同一边界, 不同曲面 ---------- */
  const rx = 486, ry = 152, rr2 = 88;
  /* 曲面 1: 平面圆盘 (网线) */
  for (let k = -2; k <= 2; k++) {
    let d = '';
    for (let a = 0; a <= 6.30; a += .12) {
      d += (d ? ' L' : 'M') + (rx + rr2 * Math.abs(k) / 2.4 * Math.cos(a) + k * 4) + ' ' + (ry + rr2 * .74 * Math.abs(k) / 2.4 * Math.sin(a));
    }
    s.path(d, { stroke: 'rgba(26,127,55,.4)', width: 1, rough: false });
  }
  for (let k = 0; k < 6; k++) {
    const a0 = k * Math.PI / 3;
    let d = '';
    for (let t = 0; t <= 1.001; t += .08) d += (d ? ' L' : 'M') + (rx + rr2 * t * Math.cos(a0)) + ' ' + (ry + rr2 * .74 * t * Math.sin(a0));
    s.path(d, { stroke: 'rgba(26,127,55,.4)', width: 1, rough: false });
  }
  /* 曲面 2: 更鼓的曲面 (虚线, 同边界) */
  let dS2 = '';
  for (let a = 0; a <= 6.30; a += .1) {
    const bulge = 1 - 0.30 * Math.cos(a) ;       // 简单起伏
    dS2 += (dS2 ? ' L' : 'M') + (rx + rr2 * Math.cos(a) * bulge - 6) + ' ' + (ry + rr2 * .74 * Math.sin(a) * bulge - 14);
  }
  s.path(dS2, { stroke: 'rgba(191,135,0,.55)', width: 1.6, rough: false });
  /* 同一边界 (两曲面公共的椭圆) */
  let dB = '';
  for (let a = 0; a <= 6.30; a += .09) dB += (dB ? ' L' : 'M') + (rx + rr2 * Math.cos(a)) + ' ' + (ry + rr2 * .74 * Math.sin(a));
  s.path(dB, { stroke: P.deep, width: 2.4 });
  s.flow(dB, { color: P.deep, size: 3, dur: 4.4, delay: .4 });
  s.label(rx, 26, '同一边界 C，两张不同曲面', { size: 14, color: P.deep });
  s.label(rx - 30, 280, '绿网: 平面圆盘', { size: 12.5, color: P.green });
  s.label(rx - 30, 297, '琥珀虚线: 鼓起的曲面 — 环流相同', { size: 12.5, color: P.amber });
  /* 中央公式 */
  kx(svg, 330, 254, '\\oint_{\\partial S}\\!\\mathbf{F}\\cdot\\mathrm{d}\\mathbf{r} \\;=\\; \\iint_S (\\nabla\\!\\times\\!\\mathbf{F})\\cdot\\mathrm{d}\\mathbf{A}', { fs: 15.5, color: P.deep });
});
