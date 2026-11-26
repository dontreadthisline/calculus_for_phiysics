// figs/volume-element.js — 图 volume-element: 球坐标体积元的三条边 (等距投影)
window.addEventListener('load', function () {
  if (typeof Sketch === 'undefined') return;
  const svg = document.getElementById('volsvg');
  const P = { ink: '#3a4aa8', deep: '#2c3a8c', amber: '#bf8700', green: '#1a7f37', dim: '#9aa1b9' };
  const s = Sketch(svg);

  /* ---------- 左: 球坐标体积元 (平行六面体的等距投影) ---------- */
  /* 三条边的投影方向: r^ (右上), θ^ (左上), φ^ (水平右) */
  const ur = [0.62, -0.78], ut = [-0.72, -0.34], uf = [1, 0.06];
  const ax = 96, ay = 214;                                 // 体积元起点 (后下角)
  const ar = 74, at = 58, af = 108;                        // 三条边的像素长度 (正比于 dr, r dθ, r sinθ dφ)
  const E = (o, d, l) => [o[0] + d[0] * l, o[1] + d[1] * l];
  const p0 = [ax, ay];
  const p1 = E(p0, ur, ar), p2 = E(p0, ut, at), p3 = E(p0, uf, af);
  const p12 = E(p1, ut, at), p13 = E(p1, uf, af), p23 = E(p2, uf, af);
  const p123 = E(p12, uf, af);
  /* 隐藏边 (后沿, 淡) */
  const back = [[p0, p2], [p2, p23], [p0, p3]];
  back.forEach(function (e) { s.path(`M${e[0][0]} ${e[0][1]} L${e[1][0]} ${e[1][1]}`, { stroke: 'rgba(154,161,185,.5)', width: 1.1, rough: false }); });
  /* 可见棱: dr (径向, 绿), r dθ (经线, 琥珀), r sinθ dφ (纬线, 蓝) */
  s.path(`M${p0[0]} ${p0[1]} L${p1[0]} ${p1[1]}`, { stroke: P.green, width: 2.6, arrow: true });
  s.path(`M${p1[0]} ${p1[1]} L${p12[0]} ${p12[1]}`, { stroke: P.amber, width: 2.6 });
  s.path(`M${p1[0]} ${p1[1]} L${p13[0]} ${p13[1]}`, { stroke: P.ink, width: 2.6 });
  /* 其余可见边 (细) */
  [[p2, p12], [p3, p13], [p12, p123], [p13, p123]].forEach(function (e) {
    s.path(`M${e[0][0]} ${e[0][1]} L${e[1][0]} ${e[1][1]}`, { stroke: 'rgba(58,74,168,.6)', width: 1.5 });
  });
  s.dot(p0[0], p0[1], P.dim, 3.5);
  s.dot(p1[0], p1[1], P.deep, 4);
  /* 三个边的标注 */
  kx(svg, (p0[0] + p1[0]) / 2 - 14, (p0[1] + p1[1]) / 2 + 16, '\\mathrm{d}r', { fs: 14, color: P.green });
  kx(svg, (p1[0] + p12[0]) / 2 - 30, (p1[1] + p12[1]) / 2 - 12, 'r\\,\\mathrm{d}\\theta', { fs: 14, color: P.amber });
  kx(svg, (p1[0] + p13[0]) / 2 + 4, (p1[1] + p13[1]) / 2 + 18, 'r\\sin\\theta\\,\\mathrm{d}\\varphi', { fs: 14, color: P.ink });
  /* 原点与径向示意 */
  s.path(`M28 258 L${p0[0] - 4} ${p0[1] + 4}`, { stroke: 'rgba(154,161,185,.55)', width: 1.1, rough: false });
  s.dot(28, 258, P.dim, 3.5);
  s.label(22, 276, '原点', { size: 12, color: P.dim });
  kx(svg, 74, 244, 'r', { fs: 13, color: P.dim });
  /* 沿 r 方向的流动光点: 体积元随 r 增大 */
  s.flow(`M28 258 L${p0[0] - 6} ${p0[1] + 6}`, { color: P.dim, size: 3, dur: 2.6 });
  /* 说明 (左下) */
  s.label(190, 300, '三条边相乘得体积元 (局部近似为长方体)', { size: 13, color: P.dim });

  /* ---------- 右: 纬圈半径 = r sinθ ---------- */
  const cx = 500, cy = 150, R = 74;
  /* 球的大圆 (截面) + 轴 */
  let dC = `M${cx} ${cy - R}`;
  for (let a = 0; a <= 6.30; a += .07) dC += ` L${cx + R * Math.sin(a)} ${cy - R * Math.cos(a)}`;
  s.path(dC, { stroke: 'rgba(58,74,168,.35)', width: 1.4 });
  s.path(`M${cx} ${cy - R - 16} L${cx} ${cy + R + 16}`, { stroke: 'rgba(154,161,185,.5)', width: 1.1, rough: false });
  s.label(cx + 5, cy - R - 20, 'z 轴', { size: 11.5, color: P.dim });
  /* P 点与 r, θ */
  const th = 0.72, Pr = R;
  const Ppx = cx + Pr * Math.sin(th), Ppy = cy - Pr * Math.cos(th);
  s.path(`M${cx} ${cy} L${Ppx} ${Ppy}`, { stroke: P.green, width: 2 });
  s.dot(Ppx, Ppy, P.deep, 4);
  let dArc = `M${cx + 26 * Math.sin(th / 2)} ${cy - 26 * Math.cos(th / 2)}`;
  for (let a = th / 2; a <= th; a += th / 16) dArc += ` L${cx + 26 * Math.sin(a)} ${cy - 26 * Math.cos(a)}`;
  s.path(dArc, { stroke: P.amber, width: 1.6, rough: false });
  s.label(cx + 18, cy - 30, 'θ', { size: 13, color: P.amber });
  kx(svg, (cx + Ppx) / 2 + 18, (cy + Ppy) / 2 + 16, 'r', { fs: 13, color: P.green });
  /* 纬圈 (过 P 点的水平圆的投影: 椭圆) */
  const rw = Pr * Math.sin(th) * 1.0, rh = rw * 0.26;
  let dLat = '';
  for (let a = 0; a <= 6.30; a += .1) {
    const xx = Ppx + rw * Math.cos(a), yy = Ppy + rh * Math.sin(a) * (Math.cos(a) > 0 ? 1 : 1);
    dLat += (dLat ? ' L' : 'M') + xx + ' ' + yy;
  }
  s.path(dLat, { stroke: P.ink, width: 1.8 });
  /* 纬圈半径标注 */
  s.path(`M${Ppx} ${Ppy} L${Ppx + rw} ${Ppy}`, { stroke: 'rgba(58,74,168,.55)', width: 1.2, rough: false });
  kx(svg, Ppx + rw / 2, Ppy - 10, 'r\\sin\\theta', { fs: 12.5, color: P.ink });
  s.label(cx - 10, cy + R + 38, 'P 所在纬圈是小圆：半径 = r sinθ', { size: 12.5, color: P.dim });
  s.label(cx - 10, cy + R + 58, '北极处 sinθ → 0，纬圈缩成一点', { size: 12.5, color: P.dim });
  /* 公式 */
  kx(svg, 500, 300, '\\mathrm{d}v = r^2\\sin\\theta\\;\\mathrm{d}r\\,\\mathrm{d}\\theta\\,\\mathrm{d}\\varphi', { fs: 15.5, color: P.deep });
});
