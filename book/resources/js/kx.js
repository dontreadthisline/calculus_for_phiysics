/* kx.js — 图内公式: KaTeX 渲染进 SVG 坐标系
 * 用法: kx(svg, x, y, tex, {fs, color})  — (x,y) 为视觉中心, 随 viewBox 缩放
 * 重绘兼容: fo 挂在 svg 根上, while(svg.firstChild) 清空时一并移除 */
window.kx = function (svg, x, y, tex, opts) {
  opts = opts || {};
  var fs = opts.fs || 14;
  var NS = 'http://www.w3.org/2000/svg';
  var fo = document.createElementNS(NS, 'foreignObject');
  fo.setAttribute('x', x - 250);
  fo.setAttribute('y', y - 40);
  fo.setAttribute('width', 500);
  fo.setAttribute('height', 80);
  fo.style.overflow = 'visible';
  var div = document.createElement('div');
  div.setAttribute('style',
    'width:100%;height:100%;display:flex;align-items:center;justify-content:center;' +
    'font-size:' + fs + 'px;pointer-events:none;' +
    (opts.color ? 'color:' + opts.color + ';' : ''));
  fo.appendChild(div);
  svg.appendChild(fo);
  if (window.katex) {
    katex.render(tex, div, { throwOnError: false, displayMode: false });
  } else {
    div.textContent = tex;
  }
  return fo;
};
