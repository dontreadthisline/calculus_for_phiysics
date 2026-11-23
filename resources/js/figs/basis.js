// figs/basis.js — 图 basis 的画图脚本 (普通 JS 文件, 不经 Pandoc 处理)
window.addEventListener('load', function () {
  if (typeof Sketch === 'undefined') return;
  const svg = document.getElementById('basissvg');
  const P = { ink: '#3a4aa8', deep: '#2c3a8c', amber: '#bf8700', green: '#1a7f37', dim: '#9aa1b9' };
  const s = Sketch(svg);
  const O = [140, 150], R = 95;
  let circ = '';
  for (let a = 0; a <= 6.45; a += .15) circ += (circ ? ' L' : 'M') + (O[0] + R*Math.cos(a)) + ' ' + (O[1] - R*Math.sin(a));
  s.path(circ + ' Z', { stroke: 'rgba(154,161,185,.55)', width: 1.2 });
  s.dot(O[0], O[1], P.dim, 3.5);
  s.label(O[0], O[1] + 20, '原点', { size: 13, color: P.dim });
  function basis(phi, tag) {
    const x = O[0] + R*Math.cos(phi), y = O[1] - R*Math.sin(phi);
    s.path(`M${x} ${y} L${x + 62*Math.cos(phi)} ${y - 62*Math.sin(phi)}`,
           { stroke: P.green, width: 2.2, arrow: true, rough: false });
    s.path(`M${x} ${y} L${x + 48*Math.sin(phi)} ${y + 48*Math.cos(phi)}`,
           { stroke: P.amber, width: 2, arrow: true, rough: false });
    s.dot(x, y, P.deep, 4.5);
    s.label(x + 78*Math.cos(phi), y - 78*Math.sin(phi) - 4, 'r̂', { size: 17, color: P.green, mono: true });
    s.label(x + 60*Math.sin(phi), y + 62*Math.cos(phi), 'φ̂', { size: 17, color: P.amber, mono: true });
    s.label(x + 14*Math.cos(phi + 1.9), y - 14*Math.sin(phi + 1.9), tag, { size: 13, color: P.deep });
  }
  basis(0.72, 'P₁');
  basis(2.22, 'P₂');
  /* 弧上脉冲: P1 -> P2 展示基向量随位置转动 */
  let arc = '';
  for (let a = 0.72; a <= 2.22; a += .05) arc += (arc ? ' L' : 'M') + (O[0] + R*Math.cos(a)) + ' ' + (O[1] - R*Math.sin(a));
  s.pulse(arc, { t0: 0.5, travel: 2.2, period: 6, color: P.deep });
  s.label(430, 60, '同一套基向量定义,', { size: 15, color: P.deep, anchor: 'start' });
  s.label(430, 84, '随位置整体旋转 —', { size: 15, color: P.deep, anchor: 'start' });
  s.label(430, 108, '「活」的基向量:', { size: 15, color: P.deep, anchor: 'start' });
  s.label(445, 122, '「活」的基向量:', { size: 15, color: P.deep, anchor: 'start' });
  kx(svg, 480, 150, '\\mathrm{d}\\hat{\\mathbf{r}}/\\mathrm{d}t \\;=\\; \\dot{\\varphi}\\,\\hat{\\boldsymbol{\\varphi}}', { fs: 15, color: P.green });
  s.label(430, 168, '求导不再为零', { size: 14, color: P.dim, anchor: 'start' });
});
