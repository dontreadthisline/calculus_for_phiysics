// figs/divcurl.js — 图 divcurl 的画图脚本 (普通 JS 文件, 不经 Pandoc 处理)
window.addEventListener('load', function () {
  if (typeof Sketch === 'undefined') return;
  const svg = document.getElementById('dvsvg');
  const P = { ink: '#3a4aa8', deep: '#2c3a8c', amber: '#bf8700', green: '#1a7f37', dim: '#9aa1b9' };
  const s = Sketch(svg);
  /* 左: 散度小盒 — 净流出 */
  const bx = 150, by = 120, w = 66, h = 54;
  s.path(`M${bx-w} ${by-h} L${bx+w} ${by-h} L${bx+w} ${by+h} L${bx-w} ${by+h} Z`, { stroke: 'rgba(58,74,168,.75)', width: 1.8 });
  s.dot(bx, by, P.amber, 6);
  [[-38,-52,34,-78],[-6,-56,0,-84],[40,-52,52,-76],[-44,56,-56,82],[30,56,42,82]].forEach(([x1,y1,x2,y2]) =>
    s.path(`M${bx+x1} ${by+y1} L${bx+x2} ${by+y2}`, { stroke: P.green, width: 1.7, arrow: true, rough: false }));
  s.path(`M${bx-64} ${by-30} L${bx-36} ${by-24}`, { stroke: 'rgba(154,161,185,.8)', width: 1.4, arrow: true, rough: false });
  s.label(bx, 205, '散度: 数小盒的净流出', { size: 15, color: P.deep });
  kx(svg, bx, 20, '\\nabla\\cdot\\mathbf{F}>0', { fs: 15, color: P.green });
  s.label(bx, 44, '— 源', { size: 13, color: P.green });
  /* 右: 旋度水车 — 环流 */
  const cx = 465, cy = 120, R = 62;
  let circ = '';
  for (let a = 0; a <= 6.45; a += .12) circ += (circ ? ' L' : 'M') + (cx + R*Math.cos(a)) + ' ' + (cy - R*Math.sin(a));
  s.path(circ + ' Z', { stroke: 'rgba(58,74,168,.3)', width: 1.2, rough: false });
  for (let i = 0; i < 8; i++) {
    const a = i/8*2*Math.PI, x = cx + R*Math.cos(a), y = cy - R*Math.sin(a);
    const tx = -Math.sin(a), ty = -Math.cos(a);
    s.path(`M${x - tx*18} ${y - ty*18} L${x + tx*18} ${y + ty*18}`, { stroke: P.green, width: 1.7, arrow: true, rough: false });
  }
  s.dot(cx, cy, P.amber, 6);
  s.label(cx, 205, '旋度: 数小水车的净推转', { size: 15, color: P.deep });
  kx(svg, cx, 20, '\\nabla\\times\\mathbf{F}\\neq 0', { fs: 15, color: P.green });
  s.label(cx, 44, '— 涡', { size: 13, color: P.green });
});
