// figs/flux-work.js — 图 flux-work: 功 (切向投影累积) 与通量 (法向投影累积)
window.addEventListener('load', function () {
  if (typeof Sketch === 'undefined') return;
  const svg = document.getElementById('fwsvg');
  const P = { ink: '#3a4aa8', deep: '#2c3a8c', amber: '#bf8700', green: '#1a7f37', dim: '#9aa1b9' };
  const s = Sketch(svg);

  /* ---------- 左: 沿路径做功 ---------- */
  const cx = 175, cy = 150;
  /* 路径: 一段弧 */
  let dPath = `M${cx - 110} ${cy + 58}`;
  const pts = [];
  for (let a = -0.42; a <= 1.05; a += .147) {
    const x = cx - 110 + 220 * (a + .42) / 1.47;
    const y = cy + 58 - 116 * Math.sin(a + .3) - 8 * (a + .42);
    pts.push([x, y]);
    dPath += ` L${x} ${y}`;
  }
  s.path(dPath, { stroke: P.deep, width: 2.4 });
  s.flow(dPath, { color: P.deep, size: 3.4, dur: 3.4 });
  /* 力向量与切向投影 */
  pts.forEach(function (p, i) {
    if (i % 2 || i === 0 || i === pts.length - 1) return;   // 跳过端点 (差分退化)
    const ang = 1.9 + i * 0.32;                        // 力的方向 (随位置变化)
    const F = [34 * Math.cos(ang), -34 * Math.sin(ang)];
    /* 完整力向量 (淡) */
    s.path(`M${p[0]} ${p[1]} L${p[0] + F[0]} ${p[1] + F[1]}`, { stroke: 'rgba(58,74,168,.42)', width: 1.4, arrow: true });
    /* 切向单位向量: 中心差分 */
    const qa = pts[i - 1], qb = pts[i + 1];
    let tx = qb[0] - qa[0], ty = qb[1] - qa[1];
    const n = Math.hypot(tx, ty); tx /= n; ty /= n;
    const comp = F[0] * tx + F[1] * ty;                // 切向分量 (可正可负)
    s.path(`M${p[0]} ${p[1]} L${p[0] + tx * comp} ${p[1] + ty * comp}`,
           { stroke: comp >= 0 ? P.amber : P.green, width: 2.6, arrow: true });
  });
  s.label(cx, 34, '功：沿路径累积切向分量', { size: 14.5, color: P.deep });
  kx(svg, cx, 262, 'W = \\int_C \\mathbf{F}\\cdot\\mathrm{d}\\mathbf{r} = \\int_C \\mathbf{F}\\cdot\\hat{\\mathbf{T}}\\;\\mathrm{d}s', { fs: 14, color: P.deep });
  s.label(cx - 66, 62, '淡蓝: 力 F', { size: 12, color: 'rgba(58,74,168,.8)' });
  s.label(cx + 30, 62, '琥珀: 切向投影 (做功的部分)', { size: 12, color: P.amber });

  /* ---------- 右: 穿曲面的通量 ---------- */
  const SX = 500, SY = 148;
  /* 曲面: 参数网格 (马鞍形微曲) */
  const su = u => SX - 128 + u * 256;
  const sv = v => SY - 62 + v * 124;
  const hgt = (u, v) => -30 * Math.sin(Math.PI * u) * Math.cos(Math.PI * v * .9);   // 曲面高度起伏
  /* 网格线 */
  for (let v = 0; v <= 4; v++) {
    let d = '';
    for (let u = 0; u <= 16; u += 1) {
      d += (d ? ' L' : 'M') + (su(u / 16) + hgt(u / 16, v / 4) * .4) + ' ' + (sv(v / 4) + hgt(u / 16, v / 4));
    }
    s.path(d, { stroke: 'rgba(58,74,168,.4)', width: 1.1, rough: false });
  }
  for (let u = 0; u <= 6; u++) {
    let d = '';
    for (let v = 0; v <= 12; v += 1) {
      d += (d ? ' L' : 'M') + (su(u / 6) + hgt(u / 6, v / 12) * .4) + ' ' + (sv(v / 12) + hgt(u / 6, v / 12));
    }
    s.path(d, { stroke: 'rgba(58,74,168,.4)', width: 1.1, rough: false });
  }
  /* 边框 (深) */
  [[0, 1], [1, 1], [1, 0], [0, 0]].forEach(function () {});
  let dEdge = '';
  [[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]].forEach(function (c, i) {
    const x = su(c[0]) + hgt(c[0], c[1]) * .4, y = sv(c[1]) + hgt(c[0], c[1]);
    dEdge += (i ? ' L' : 'M') + x + ' ' + y;
  });
  s.path(dEdge, { stroke: P.deep, width: 1.8 });
  /* 穿过的场向量: 沿法向 (近似竖直向上) */
  for (let i = 0; i < 5; i++) {
    for (let j = 0; j < 2; j++) {
      const u = .12 + i * .19, v = .28 + j * .44;
      const x = su(u) + hgt(u, v) * .4, y = sv(v) + hgt(u, v);
      const up = j === 0 ? -1 : 1;                    // 上下两排, 都向上穿
      s.path(`M${x} ${y + up * 16} L${x} ${y - 30 + up * 16}`, { stroke: P.amber, width: 2.2, arrow: true });
      s.dot(x, y, P.deep, 2.6);
    }
  }
  s.label(SX, 34, '通量：穿曲面累积法向分量', { size: 14.5, color: P.deep });
  kx(svg, SX, 262, '\\Phi = \\iint_S \\mathbf{F}\\cdot\\mathrm{d}\\mathbf{A} = \\iint_S \\mathbf{F}\\cdot\\hat{\\mathbf{n}}\\;\\mathrm{d}S', { fs: 14, color: P.green });
  s.label(SX, 286, '琥珀箭头: 穿过曲面的法向分量; 面元 dA = n̂ dS 带方向', { size: 12, color: P.dim });
  s.label(cx, 286, '微元 dr = T̂ ds 沿切向', { size: 12, color: P.dim });
});
