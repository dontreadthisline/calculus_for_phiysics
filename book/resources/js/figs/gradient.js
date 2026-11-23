// figs/gradient.js — 图 gradient 的画图脚本 (普通 JS 文件, 不经 Pandoc 处理)
window.addEventListener('load', function () {
  if (typeof Sketch === 'undefined') return;
  const svg = document.getElementById('gradsvg');
  const P = { ink: '#3a4aa8', deep: '#2c3a8c', amber: '#bf8700', green: '#1a7f37', dim: '#9aa1b9' };
  const W = 2.4, px = x => 180 + x/W*150, py = y => 185 - y/W*150;  /* 世界 [-2.4,2.4] */
  const FIELDS = [
    { name: 'f = x²+y²',  f: (x,y)=>x*x+y*y,   g: (x,y)=>[2*x, 2*y],
      levels: [0.5, 1.2, 2.2, 3.5, 5],   /* 圆 */
      iso(s) { const r = s; let d = '';
        for (let a = 0; a <= 6.4; a += .12) { const X = px(r*Math.cos(a)), Y = py(r*Math.sin(a));
          d += (d ? ' L' : 'M') + X + ' ' + Y; } return d; } },
    { name: 'f = x+0.7y', f: (x,y)=>x+0.7*y,   g: (x,y)=>[1, 0.7],
      levels: [-2, -1, 0, 1, 2],         /* 平行线 */
      iso(c) { return `M${px(-2.4)} ${py((c+2.4)/0.7)} L${px(5.4)} ${py((c-2.4)/0.7)}`; } },
    { name: 'f = x²−y²',  f: (x,y)=>x*x-y*y,   g: (x,y)=>[2*x, -2*y],
      levels: [-3, -1.2, 1.2, 3],        /* 双曲线两支 */
      iso(c) { let d1 = '', d2 = '';
        for (let y = -2.2; y <= 2.21; y += .12) {
          const x2 = y*y + c; if (x2 < 0.02) continue; const x = Math.sqrt(x2);
          d1 += (d1 ? ' L' : 'M') + px(x) + ' ' + py(y);
          d2 += (d2 ? ' L' : 'M') + px(-x) + ' ' + py(y); }
        return d1 + ' ' + d2; } },
  ];
  window.gSet = function (k) {
    [0,1,2].forEach(i => { const b = document.getElementById('gb'+i); if (b) b.className = i==k ? 'on' : ''; });
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    const s = Sketch(svg), F = FIELDS[k];
    s.path(`M${px(-2.4)} ${py(-2.4)} L${px(5.4)} ${py(-2.4)} L${px(5.4)} ${py(5.4)} L${px(-2.4)} ${py(5.4)} Z`,
           { stroke: 'rgba(154,161,185,.6)', width: 1.2 });
    F.levels.forEach(c => s.path(F.iso(c), { stroke: 'rgba(58,74,168,.75)', width: 1.6 }));
    /* 梯度箭头场: 长度∝|∇f|, 上限 26px */
    for (let gx = -2; gx <= 2; gx += 1) for (let gy = -2; gy <= 2; gy += 1) {
      if (Math.abs(gx) < .01 && Math.abs(gy) < .01 && k == 0) continue;
      const [gxv, gyv] = F.g(gx, gy), L = Math.hypot(gxv, gyv);
      if (L < 0.05) continue;
      const ux = gxv/L, uy = gyv/L, len = Math.min(6 + 9*L, 26);
      const x0 = px(gx) - ux*len/2, y0 = py(gy) + uy*len/2;      /* 屏幕y向下 */
      s.path(`M${x0} ${y0} L${x0 + ux*len} ${y0 - uy*len}`,
             { stroke: P.amber, width: 2, arrow: true, rough: false });
    }
    s.label(180, 330, FIELDS[k].name + '   蓝线: 等值线   琥珀: ∇f（⊥等值线, 指上升）', { size: 14, color: P.deep });
    s.label(180, 346, '等值线越密 ⇒ 箭头越长（坡越陡）', { size: 13, color: P.dim });
  };
  gSet(0);
});
