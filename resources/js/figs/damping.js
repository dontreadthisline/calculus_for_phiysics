// figs/damping.js — 图 damping 的画图脚本 (普通 JS 文件, 不经 Pandoc 处理)
window.addEventListener('load', function () {
  if (typeof Sketch === 'undefined') return;
  const svg = document.getElementById('dampsvg');
  const P = { ink: '#3a4aa8', deep: '#2c3a8c', amber: '#bf8700', green: '#1a7f37', dim: '#9aa1b9' };
  const CASES = [
    { g: 0.15, name: '欠阻尼 γ=0.15 — 振荡衰减', pre: '复根 · 包络', tex: 'e^{-\\gamma t/2}', post: '× 振荡', color: P.ink },
    { g: 1.0,  name: '临界阻尼 γ=1.0 — 最快无振荡归位', pre: '重根', tex: '(1+t)\\,e^{-t}', post: '', color: P.green },
    { g: 1.8,  name: '过阻尼 γ=1.8 — 缓慢爬回', pre: '两负实根', tex: 'C_1 e^{r_1 t} + C_2 e^{r_2 t}', post: '慢根拖尾', color: P.amber },
  ];
  const px = t => 40 + t/20*580, py = x => 140 - x*95;
  window.dSet = function (k) {
    [0,1,2].forEach(i => { const b = document.getElementById('db'+i); if (b) b.className = i==k ? 'on' : ''; });
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    const s = Sketch(svg), C = CASES[k], g = C.g;
    s.path(`M40 ${py(0)} L620 ${py(0)}`, { stroke: 'rgba(154,161,185,.5)', width: 1.2 });
    s.path(`M40 ${py(1)} L620 ${py(1)}`, { stroke: 'rgba(154,161,185,.25)', width: 1, rough: false });
    s.path(`M40 ${py(-1)} L620 ${py(-1)}`, { stroke: 'rgba(154,161,185,.25)', width: 1, rough: false });
    s.label(624, py(1)+4, 'x₀', { size: 12, color: P.dim, anchor: 'end' });
    let x, d = '';
    for (let t = 0; t <= 20.001; t += 0.08) {
      if (C.g === 1.0) x = (1 + t)*Math.exp(-t);
      else if (C.g < 1) { const w = Math.sqrt(1 - g*g/4);
        x = Math.exp(-g*t/2)*(Math.cos(w*t) + (g/(2*w))*Math.sin(w*t)); }
      else { const q = Math.sqrt(g*g/4 - 1), r1 = -g/2 + q, r2 = -g/2 - q;
        const C1 = r2/(r2 - r1), C2 = 1 - C1; x = C1*Math.exp(r1*t) + C2*Math.exp(r2*t); }
      d += (d ? ' L' : 'M') + px(t) + ' ' + py(x);
    }
    s.path(d, { stroke: C.color, width: 2.2 });
    if (C.g < 1) {                                   /* 包络 ±e^{−γt/2} */
      let up = '', dn = '';
      for (let t = 0; t <= 20.001; t += 0.2) {
        const e = Math.exp(-g*t/2);
        up += (up ? ' L' : 'M') + px(t) + ' ' + py(e);
        dn += (dn ? ' L' : 'M') + px(t) + ' ' + py(-e); }
      s.path(up, { stroke: 'rgba(58,74,168,.35)', width: 1.1, rough: false });
      s.path(dn, { stroke: 'rgba(58,74,168,.35)', width: 1.1, rough: false });
    }
    s.label(330, 34, C.name, { size: 16, color: C.color });
    s.label(150, 266, C.pre, { size: 13.5, color: P.dim });
    kx(svg, 300, 262, C.tex, { fs: 13.5, color: P.dim });
    s.label(445, 266, C.post, { size: 13.5, color: P.dim });
    kx(svg, 190, 284, 'x(0)=1,\;\\dot{x}(0)=0', { fs: 12.5, color: P.dim });
    s.label(388, 285, '— 两个初值锁定两个常数', { size: 12.5, color: P.dim });
    s.pulse(d, { t0: 0.4, travel: 3.4, period: 8, color: C.color });
  };
  dSet(0);
});
