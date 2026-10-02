'use strict';

/** 公开介绍页轻交互：进度环动画 + 导航高亮 + 获取按钮跳转 */

(function animateRing() {
  const ring = document.getElementById('ring-fg');
  if (!ring) return;
  const pct = 0.75;
  const C = 2 * Math.PI * 52;
  ring.style.strokeDasharray = String(C);
  ring.style.strokeDashoffset = String(C);
  requestAnimationFrame(() => {
    setTimeout(() => {
      ring.style.strokeDashoffset = String(C * (1 - pct));
    }, 120);
  });
})();

(function navHighlight() {
  const links = Array.from(document.querySelectorAll('.nav-links a'));
  const map = new Map();
  for (const a of links) {
    const id = (a.getAttribute('href') || '').replace('#', '');
    const sec = document.getElementById(id);
    if (sec) map.set(id, a);
  }
  if (!map.size || !('IntersectionObserver' in window)) return;
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        links.forEach((l) => l.classList.remove('is-on'));
        map.get(e.target.id)?.classList.add('is-on');
      }
    },
    { rootMargin: '-40% 0px -50% 0px' },
  );
  map.forEach((_a, id) => {
    const sec = document.getElementById(id);
    if (sec) io.observe(sec);
  });
})();

/**
 * 获取按钮跳转。
 *
 * 地址优先从 version.json 的 getUrl 读 —— 付费站是本地服务 + 临时隧道，
 * 地址会变。放进数据文件里，换地址时只改一处，不用动这里的代码。
 * 也支持在网址后加 ?buy=xxx 临时覆盖（方便自己测试）。
 *
 * 注意：这个函数会在运行时写 btn.href，所以 index.html 里那个 href 只算
 * 兜底值 —— 曾经因为这里写死 '#get'，把 HTML 里配好的地址顶掉了，点了没反应。
 */
(async function wireGetButton() {
  const btn = document.getElementById('btn-get');
  if (!btn) return;

  const params = new URLSearchParams(location.search);
  let url = params.get('buy') || '';

  if (!url) {
    try {
      // no-store：换地址后立刻生效，别让浏览器缓存住旧地址
      const r = await fetch('version.json', { cache: 'no-store' });
      if (r.ok) {
        const j = await r.json();
        if (j && typeof j.getUrl === 'string' && /^https?:\/\//i.test(j.getUrl)) url = j.getUrl;
      }
    } catch {
      /* 取不到就维持 HTML 里的兜底值 */
    }
  }

  if (!url) return; // 保持 index.html 里写好的 href，不做任何覆盖

  btn.href = url;
  if (/^https?:\/\//i.test(url)) {
    btn.target = '_blank';
    btn.rel = 'noopener';
  }
})();
