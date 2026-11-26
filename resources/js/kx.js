/* kx.js — 图内公式: KaTeX 渲染进 SVG 坐标系 (测量式放置)
 * 用法: kx(svg, x, y, tex, {fs, color, anchor})  — (x,y) 为视觉中心, anchor: middle|start|end
 * 渲染后实测内容尺寸, foreignObject 收紧为紧贴内容的紧凑盒 (布局可度量, 不遮挡);
 * 字体加载完成后自动重定位 (document.fonts.ready)。
 * 重绘兼容: fo 挂在 svg 根上, while(svg.firstChild) 清空时一并移除。
 */
(function () {
  var REGISTRY = [];   // 本文档内所有 kx 标签 (供字体就绪后统一重定位)

  window.kx = function (svg, x, y, tex, opts) {
    opts = opts || {};
    var fs = opts.fs || 14;
    var anchor = opts.anchor || 'middle';
    var NS = 'http://www.w3.org/2000/svg';
    var fo = document.createElementNS(NS, 'foreignObject');
    fo.style.overflow = 'visible';
    fo.setAttribute('pointer-events', 'none');
    var div = document.createElement('div');
    div.setAttribute('style',
      'display:inline-block;line-height:1.1;white-space:nowrap;width:max-content;' +
      'font-size:' + fs + 'px;' + (opts.color ? 'color:' + opts.color + ';' : ''));
    fo.appendChild(div);
    svg.appendChild(fo);
    if (window.katex) {
      katex.render(tex, div, { throwOnError: false, displayMode: false });
    } else {
      div.textContent = tex;
    }
    var item = { fo: fo, div: div, x: x, y: y, anchor: anchor };
    REGISTRY.push(item);
    place(item);
    return fo;
  };

  function place(item) {
    var w = 0, h = 0;
    try {
      var r = item.div.getBoundingClientRect();
      w = r.width; h = r.height;
    } catch (e) { return; }
    if (!w || !h) return;
    var W = Math.ceil(w) + 2, H = Math.ceil(h) + 2;
    item.fo.setAttribute('width', W);
    item.fo.setAttribute('height', H);
    var x = item.anchor === 'start' ? item.x : (item.anchor === 'end' ? item.x - W : item.x - W / 2);
    item.fo.setAttribute('x', x);
    item.fo.setAttribute('y', item.y - H / 2);
  }

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () {
      REGISTRY.forEach(place);
    });
  }
  /* KaTeX 字体异步加载会改变内容宽度: 监听尺寸变化, 自动重定位 (防截断) */
  if (window.ResizeObserver) {
    REGISTRY.push = function (it) {
      var orig = Array.prototype.push.call(this, it);
      try {
        new ResizeObserver(function () { place(it); }).observe(it.div);
      } catch (e) {}
      return orig;
    };
  }
})();
