// figs/ftc.js — 图 ftc 的画图脚本 (普通 JS 文件, 不经 Pandoc 处理)
window.addEventListener('load', function () {
  if (typeof Sketch === 'undefined') return;
  const svg = document.getElementById('ftcsvg');
  const P = { ink: '#3a4aa8', deep: '#2c3a8c', amber: '#bf8700', green: '#1a7f37', dim: '#9aa1b9' };
  const f = t => 0.6 + 0.45*t + 0.55*Math.sin(1.6*t);          // 分布 f
  const X0 = 20, X1 = 300, YB = 235, YT = 30;                   // 左面板像素域
  const px = t => X0 + t/5*(X1-X0), py = v => YB - v/3.2*(YB-YT); // 世界: t∈[0,5], v∈[0,3.2]
  function F(t) {                                               // 累积 F=∫₀ᵗf, 细梯形
    let s = 0, h = 0.001;
    for (let u = 0; u < t; u += h) s += (f(u)+f(u+h))*h/2;
    return s;
  }
  window.rmSet = function (N) {
    ['4','8','16','64'].forEach(n => { const b = document.getElementById('rmb'+n); if (b) b.className = N==n ? 'on' : ''; });
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    const s = Sketch(svg);
    /* ---- 左面板: 黎曼和 ---- */
    s.path(`M${X0} ${YB} L${X1} ${YB}`, { width: 1.4 });  s.path(`M${X0} ${YB} L${X0} ${YT}`, { width: 1.4 });
    let d = `M${px(0)} ${py(f(0))}`;
    for (let t = 0.02; t <= 5.001; t += 0.02) d += ` L${px(t)} ${py(f(t))}`;
    s.path(d, { stroke: P.deep, width: 2 });
    const dt = 5/N;
    for (let i = 0; i < N; i++) {                               // 中点矩形
      const tm = (i + .5)*dt, hpx = dt/5*(X1-X0);
      s.path(`M${px(i*dt)} ${YB} L${px(i*dt)} ${py(f(tm))} L${px(i*dt)+hpx} ${py(f(tm))} L${px(i*dt)+hpx} ${YB} Z`,
             { stroke: 'rgba(191,135,0,.55)', width: 1, fill: 'rgba(191,135,0,.10)', rough: false });
    }
    s.label(100, 262, '分布', { size: 14, color: P.deep });
    kx(svg, 168, 257, '\\sum f\\,\\Delta t', { fs: 13.5, color: P.deep });
    /* ---- 右面板: 累积函数 ---- */
    const RX0 = 360, RX1 = 640;
    const q = t => RX0 + t/5*(RX1-RX0);
    const Fmax = F(5);
    const w = v => YB - v/Fmax*(YB-YT);
    s.path(`M${RX0} ${YB} L${RX1} ${YB}`, { width: 1.4 });  s.path(`M${RX0} ${YB} L${RX0} ${YT}`, { width: 1.4 });
    let dF = `M${q(0)} ${w(0)}`;
    for (let t = 0.04; t <= 5.001; t += 0.04) dF += ` L${q(t)} ${w(F(t))}`;
    s.path(dF, { stroke: P.green, width: 2 });
    /* 同一时刻 t*: 左边的高度 = 右边的切线斜率 (桥) */
    const tstar = 2.6, fs = f(tstar);
    s.dot(px(tstar), py(fs), P.amber, 5);
    s.path(`M${q(tstar)} ${w(F(tstar))} L${q(tstar)} ${YB}`, { stroke: 'rgba(26,127,55,.4)', width: 1, rough: false });
    const k = fs * ( (YB-YT)/Fmax ) / ( (RX1-RX0)/5 );          // 像素斜率换算
    s.path(`M${q(tstar)-46} ${w(F(tstar))+46*k} L${q(tstar)+46} ${w(F(tstar))-46*k}`,
           { stroke: P.amber, width: 1.8, rough: false });
    s.dot(q(tstar), w(F(tstar)), P.amber, 5);
    s.pulse(`M${q(0)} ${w(F(0))} ` + dF.replace(/^[^L]+/, ''), { t0: 0.4, travel: 3.6, period: 8, color: P.green });
    s.label(398, 262, '累积', { size: 14, color: P.green });
    kx(svg, 474, 257, 'F(t)=\\int_0^{t} f', { fs: 13.5, color: P.green });
    s.label(577, 262, '— 斜率即高度', { size: 12.5, color: P.green });
    /* ---- 桥 ---- */
    s.path(`M${X1+8} ${135} L${RX0-8} ${135}`, { stroke: P.dim, width: 1.3, arrow: true });
    s.label((X1+RX0)/2, 122, 'FTC', { size: 16, color: P.dim, mono: true });
    s.label((X1+RX0)/2, 152, '斜率即高度', { size: 13, color: P.dim });
  };
  rmSet(64);
});
