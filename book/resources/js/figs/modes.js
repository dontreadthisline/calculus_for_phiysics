// figs/modes.js — 图 modes 的画图脚本 (普通 JS 文件, 不经 Pandoc 处理)
window.addEventListener('load', function () {
  if (typeof Sketch === 'undefined') return;
  const svg = document.getElementById('modesvg');
  const P = { ink: '#3a4aa8', deep: '#2c3a8c', amber: '#bf8700', green: '#1a7f37', dim: '#9aa1b9' };
  const px = x => 45 + x/(2*Math.PI)*550, py = v => 135 - v*88;
  const sq = x => (x < Math.PI ? 1 : -1) * 0.82;          /* 方波目标 */
  window.mSet = function (N) {
    [1,3,7,15,41].forEach(n => { const b = document.getElementById('mb'+n); if (b) b.className = n==N ? 'on' : ''; });
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    const s = Sketch(svg);
    /* 边框: 两端固定的弦 */
    s.path(`M${px(0)} ${py(0)} L${px(2*Math.PI)} ${py(0)}`, { stroke: 'rgba(154,161,185,.5)', width: 1.2 });
    s.dot(px(0), py(0), P.dim, 4); s.dot(px(2*Math.PI), py(0), P.dim, 4);
    /* 方波 (虚线参考) */
    let dref = `M${px(0)} ${py(sq(0.01))}`;
    for (let x = 0.02; x <= Math.PI - .02; x += .04) dref += ` L${px(x)} ${py(sq(x))}`;
    dref += ` L${px(Math.PI+.02)} ${py(sq(Math.PI+.02))}`;
    for (let x = Math.PI + .04; x <= 2*Math.PI; x += .04) dref += ` L${px(x)} ${py(sq(x))}`;
    s.path(dref, { stroke: 'rgba(191,135,0,.55)', width: 1.3, rough: false });
    /* 各模式 (淡) + 累加 (浓) */
    let shown = 0, n = 1;
    while (shown < N) {                                     /* 只画前 5 条模式线避免糊 */
      if (shown < 5) {
        let dm = '';
        for (let x = 0; x <= 2*Math.PI + .01; x += .05)
          dm += (dm ? ' L' : 'M') + px(x) + ' ' + py(4/(n*Math.PI)*Math.sin(n*x)*0.82);
        s.path(dm, { stroke: 'rgba(26,127,55,.3)', width: 1, rough: false });
      }
      shown++; n += 2;
    }
    let d = '';
    n = 1; let acc = 0;
    for (let x = 0; x <= 2*Math.PI + .01; x += .02) {
      let sum = 0; n = 1; let cnt = 0;
      while (cnt < N) { sum += 4/(n*Math.PI)*Math.sin(n*x); n += 2; cnt++; }
      d += (d ? ' L' : 'M') + px(x) + ' ' + py(sum*0.82);
    }
    s.path(d, { stroke: P.deep, width: 2.2 });
    s.pulse(d, { t0: 0.4, travel: 3.2, period: 8, color: P.deep });
    s.label(320, 30, '驻波模式叠出方波初始形状', { size: 16, color: P.deep });
    s.label(320, 252, '深蓝: 前 ' + N + ' 项之和     淡绿: 各模式 sin(nx)     琥珀虚线: 目标方波', { size: 13.5, color: P.dim });
    kx(svg, 245, 232, '\\lambda_n=(n\\pi/L)^2', { fs: 13.5, color: P.green });
    s.label(390, 236, '— 边界条件筛出离散本征值', { size: 13.5, color: P.green });
  };
  mSet(1);
});
