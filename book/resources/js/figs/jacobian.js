// figs/jacobian.js — 图 jacobian 的画图脚本 (普通 JS 文件, 不经 Pandoc 处理)
window.addEventListener('load', function () {
  if (typeof Sketch === 'undefined') return;
  const svg = document.getElementById('jacsvg');
  const P = { ink: '#3a4aa8', deep: '#2c3a8c', amber: '#bf8700', green: '#1a7f37', dim: '#9aa1b9' };
  const RS = [0.7, 1.5, 2.3], FIS = 0.55;
  const DR = 0.45, DFI = 0.32;
  const lx = r => 30 + (r-0.2)/2.6*280, ly = p => 265 - p/Math.PI*230;
  const rx = x => 380 + x/3.1*140, ry = y => 250 - y/2.9*220;
  window.jSet = function (k) {
    [0,1,2].forEach(i => { const b = document.getElementById('jb'+i); if (b) b.className = i==k ? 'on' : ''; });
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    const s = Sketch(svg), r0 = RS[k];
    s.path(`M30 35 L310 35 L310 265 L30 265 Z`, { stroke: 'rgba(154,161,185,.5)', width: 1.1 });
    for (let r = 0.65; r < 2.8; r += 0.65) s.path(`M${lx(r)} 35 L${lx(r)} 265`, { stroke: 'rgba(154,161,185,.35)', width: 1 });
    for (let p = Math.PI/4; p < Math.PI; p += Math.PI/4) s.path(`M30 ${ly(p)} L310 ${ly(p)}`, { stroke: 'rgba(154,161,185,.35)', width: 1 });
    s.label(170, 288, '(r, φ) 平面 — 均匀格子', { size: 15, color: P.dim });
    s.path(`M${lx(r0)} ${ly(FIS)} L${lx(r0+DR)} ${ly(FIS)} L${lx(r0+DR)} ${ly(FIS+DFI)} L${lx(r0)} ${ly(FIS+DFI)} Z`,
           { stroke: P.amber, width: 2, fill: 'rgba(191,135,0,.15)', rough: false });
    kx(svg, lx(r0+DR)+52, ly(FIS+DFI/2)-3, '\\mathrm{d}r\\,\\mathrm{d}\\varphi', { fs: 13, color: P.amber });
    for (let r = 0.65; r < 2.9; r += 0.65) {
      let d = '';
      for (let p = 0; p <= Math.PI + .01; p += .1) {
        d += (d ? ' L' : 'M') + rx(r*Math.cos(p)) + ' ' + ry(r*Math.sin(p)); }
      s.path(d, { stroke: 'rgba(58,74,168,.5)', width: 1.1 });
    }
    for (let p = 0; p <= Math.PI + .01; p += Math.PI/4)
      s.path(`M${rx(0)} ${ry(0)} L${rx(2.8*Math.cos(p))} ${ry(2.8*Math.sin(p))}`, { stroke: 'rgba(58,74,168,.5)', width: 1.1 });
    s.dot(rx(0), ry(0), P.deep, 3.5);
    const cell = (rr, pp) => [rx(rr*Math.cos(pp)), ry(rr*Math.sin(pp))];
    let d = '';
    for (let p = FIS; p <= FIS+DFI+.001; p += .05) { const q = cell(r0, p); d += (d ? ' L' : 'M') + q[0] + ' ' + q[1]; }
    for (let r = r0; r <= r0+DR+.001; r += .05)     { const q = cell(r, FIS+DFI); d += ' L' + q[0] + ' ' + q[1]; }
    for (let p = FIS+DFI; p >= FIS-.001; p -= .05)  { const q = cell(r0+DR, p); d += ' L' + q[0] + ' ' + q[1]; }
    for (let r = r0+DR; r >= r0-.001; r -= .05)     { const q = cell(r, FIS); d += ' L' + q[0] + ' ' + q[1]; }
    s.path(d + ' Z', { stroke: P.amber, width: 2, fill: 'rgba(191,135,0,.2)', rough: false });
    s.label((rx(0)+rx(2.6))/2 + 10, 288, '(x, y) 平面 — 格子随 r 变宽,  面积比 = r', { size: 15, color: P.deep });
    s.label(rx(1.9), ry(1.9)-44, '汇率', { size: 13, color: P.amber });
    kx(svg, rx(1.9), ry(1.9)-26, '|\\det J| = ' + r0.toFixed(1), { fs: 15, color: P.amber });
    s.path(`M315 150 L365 150`, { stroke: P.green, width: 1.6, arrow: true });
    s.label(340, 136, '(r,φ)→(x,y)', { size: 12.5, color: P.green });
  };
  jSet(0);
});
