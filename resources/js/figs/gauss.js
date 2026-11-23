// figs/gauss.js — 图 gauss 的画图脚本 (普通 JS 文件, 不经 Pandoc 处理)
window.addEventListener('load', function () {
  if (typeof Sketch === 'undefined') return;
  const svg = document.getElementById('gaussvg');
  const P = { ink: '#3a4aa8', deep: '#2c3a8c', amber: '#bf8700', green: '#1a7f37', dim: '#9aa1b9' };
  const s = Sketch(svg);
  function panel(cx, qy, qin) {
    const cy = 150, R = 92;
    let circle = '';
    for (let a = 0; a <= 6.4; a += .15) circle += (circle ? ' L' : 'M') + (cx + R*Math.cos(a)) + ' ' + (cy + R*Math.sin(a));
    s.path(circle + ' Z', { stroke: 'rgba(58,74,168,.8)', width: 1.8 });
    s.label(cx, cy + R + 44, '高斯面', { size: 13, color: P.deep });
    const qx = qin ? cx : cx + R + 78;
    s.dot(qx, qy, P.amber, 7);
    s.label(qx, qy - 14, '+q', { size: 15, color: P.amber, mono: true });
    const hits = [];
    for (let i = 0; i < 12; i++) {
      const a = i/12*2*Math.PI, L = 150;
      const ex = qx + L*Math.cos(a), ey = qy + L*Math.sin(a);
      s.path(`M${qx + 10*Math.cos(a)} ${qy + 10*Math.sin(a)} L${ex} ${ey}`,
             { stroke: 'rgba(191,135,0,.5)', width: 1.2, rough: false });
      const dx = ex - qx, dy = ey - qy;
      const fx = qx - cx, fy = qy - cy;
      const A = dx*dx + dy*dy, B = 2*(fx*dx + fy*dy), C = fx*fx + fy*fy - R*R;
      const disc = B*B - 4*A*C;
      if (disc > 0) {
        [(-B - Math.sqrt(disc))/(2*A), (-B + Math.sqrt(disc))/(2*A)].forEach(t => {
          if (t > 0.05 && t < 1) {
            const px = qx + t*dx, py = qy + t*dy;
            s.path(`M${px - 9*Math.cos(a)} ${py - 9*Math.sin(a)} L${px} ${py}`,
                   { stroke: P.green, width: 1.6, arrow: true, rough: false });
            hits.push([a, px, py]);
          }
        });
      }
    }
    return hits;
  }
  const hL = panel(170, 150, true);
  panel(510, 150, false);
  s.label(170, 40, '电荷在面内：每条线都穿出', { size: 15, color: P.deep });
  s.label(510, 40, '电荷在面外：穿入 = 穿出', { size: 15, color: P.deep });
  kx(svg, 148, 268, '\\oint\\mathbf{E}\\cdot\\mathrm{d}\\mathbf{A}=q/\\varepsilon_0', { fs: 14, color: P.green });
  s.label(252, 272, '（净通量 > 0）', { size: 13.5, color: P.green });
  kx(svg, 488, 268, '\\oint\\mathbf{E}\\cdot\\mathrm{d}\\mathbf{A}=0', { fs: 14, color: P.green });
  s.label(578, 272, '（净通量 = 0）', { size: 13.5, color: P.green });
  if (hL.length) { const [a, px, py] = hL[0];
    s.pulse(`M170 150 L${px} ${py}`, { t0: 0.5, travel: 1.2, period: 5, color: P.green }); }
  const qxr = 510 + 92 + 78;
  const through = [-0.35, -0.15, 0.15, 0.35];
  through.forEach((da, i) => {
    const a = Math.PI + da;
    const ex = qxr + 150*Math.cos(a), ey = 150 + 150*Math.sin(a);
    s.pulse(`M${qxr + 10*Math.cos(a)} ${150 + 10*Math.sin(a)} L${ex} ${ey}`,
            { t0: 1.2 + i*0.4, travel: 1.6, period: 6, color: P.green });
  });
});
