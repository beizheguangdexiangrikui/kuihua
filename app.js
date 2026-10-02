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
 * 页面上有**三处**会把人引向获取流程，必须全接上，否则只接中间那个的后果是：
 * 用户点了首屏大按钮「获取软件」或导航里的「下载」，那俩还指着页内锚点 #get，
 * 点了只是页面往下滚一点，看起来就是「没反应」。（这就是踩过的坑。）
 *   · 导航「获取」是纯导航链接（没有 .btn 类），保留页内滚动，不改。
 *   · 「下载」「获取软件」「前往获取」都带 .btn，全部改指真实地址。
 *
 * 地址优先从 version.json 的 getUrl 读 —— 付费站是本地服务 + 临时隧道，
 * 地址会变。放进数据文件里，换地址时只改一处，不用动这里的代码。
 * 也支持在网址后加 ?buy=xxx 临时覆盖（方便自己测试）。
 */
(async function wireGetButtons() {
  const btns = Array.from(document.querySelectorAll('#btn-get, a.btn[href="#get"]'));
  if (!btns.length) return;

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
      /* 取不到就什么都不做，按钮维持原来的页内锚点，不至于点坏 */
    }
  }

  if (!url) return;

  for (const b of btns) {
    b.href = url;
    if (/^https?:\/\//i.test(url)) {
      b.target = '_blank';
      b.rel = 'noopener';
    }
  }
})();
