// figs/curvature.js — 图 curvature 的画图脚本 (普通 JS 文件, 不经 Pandoc 处理)
window.addEventListener('load', function () {
  if (typeof Sketch === 'undefined') return;
  const svg = document.getElementById('curvsvg');
  const P = { ink: '#3a4aa8', deep: '#2c3a8c', amber: '#bf8700', green: '#1a7f37', dim: '#9aa1b9' };
  const CURVES = [
    { zh: '椭圆 · 匀参数 ≠ 匀速率（近轴处更快）', tex: '\\mathbf{r}(t)=(a\\cos t,\\; b\\sin t)',
      r: t => [2.9*Math.cos(t), 1.7*Math.sin(t)], t0: 0, t1: 2*Math.PI, n: 10 },
    { zh: '螺线 · 曲率随位置变化（越外越“直”）', tex: '\\mathbf{r}(t)=(t\\cos 3t,\\; t\\sin 3t)',
      r: t => [(t/2.35)*Math.cos(3*t), (t/2.35)*Math.sin(3*t)], t0: 0.45, t1: 2.25, n: 9 },
  ];
  const px = x => 320 + x/3.6*290, py = y => 160 - y/2.4*115;
  const deriv = (f, t, h) => { const a = f(t-h), b = f(t+h);
    return [(b[0]-a[0])/(2*h), (b[1]-a[1])/(2*h)]; };
  const deriv2 = (f, t, h) => { const c = f(t), d1 = deriv(f, t-h, h), d2 = deriv(f, t+h, h);
    return [(d2[0] + d1[0] - 2*c[0])/(h*h), (d2[1] + d1[1] - 2*c[1])/(h*h)]; };
  window.cvSet = function (k) {
    [0,1].forEach(i => { const b = document.getElementById('cvb'+i); if (b) b.className = i==k ? 'on' : ''; });
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    const s = Sketch(svg), C = CURVES[k], h = 0.001;
    let d = '';
    for (let t = C.t0; t <= C.t1 + .001; t += (C.t1-C.t0)/240) {
      const [x, y] = C.r(t); d += (d ? ' L' : 'M') + px(x) + ' ' + py(y); }
    s.path(d, { stroke: P.deep, width: 2 });
    for (let i = 0; i < C.n; i++) {
      const t = C.t0 + (i + .5) * (C.t1 - C.t0) / C.n;
      const v = deriv(C.r, t, h), a = deriv2(C.r, t, h);
      const [x, y] = C.r(t);
      const [Tx, Ty] = [v[0]/Math.hypot(...v), v[1]/Math.hypot(...v)];
      const dTt = [ (deriv(C.r, t+h, h)[0]/Math.hypot(...deriv(C.r, t+h, h)) - Tx)/h,
                    (deriv(C.r, t+h, h)[1]/Math.hypot(...deriv(C.r, t+h, h)) - Ty)/h ];
      const [Nx, Ny] = [ dTt[0]/Math.hypot(...dTt), dTt[1]/Math.hypot(...dTt) ];
      s.path(`M${px(x)} ${py(y)} L${px(x)+Tx*30} ${py(y)-Ty*30}`, { stroke: P.green, width: 2, arrow: true, rough: false });
      s.path(`M${px(x)} ${py(y)} L${px(x)+Nx*22} ${py(y)-Ny*22}`, { stroke: P.amber, width: 1.8, arrow: true, rough: false });
      const ascale = 30 / Math.max(Math.hypot(a[0], a[1]), 1e-9) * Math.min(Math.hypot(a[0], a[1]), 1.6);
      s.path(`M${px(x)} ${py(y)} L${px(x)+a[0]*ascale} ${py(y)-a[1]*ascale}`,
             { stroke: 'rgba(107,114,128,.8)', width: 1.5, arrow: true, rough: false });
      s.dot(px(x), py(y), P.deep, 3);
    }
    kx(svg, 320, 262, C.tex, { fs: 14, color: P.deep });
    s.label(320, 287, C.zh, { size: 13.5, color: P.deep });
    s.label(320, 30, '绿: 切向   琥珀: 凹侧   灰: 加速度', { size: 13, color: P.dim });
    kx(svg, 320, 58, '\\mathbf{a}=\\dot{v}\\,\\hat{\\mathbf{T}}+(v^2/\\rho)\\,\\hat{\\mathbf{N}}', { fs: 13.5, color: P.dim });
    s.pulse(d, { t0: 0.4, travel: 3.4, period: 8, color: P.deep });
  };
  cvSet(0);
});
