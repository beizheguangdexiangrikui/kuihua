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
 * 下载按钮接线。
 *
 * 页面上有**两处**会把人引向下载：首屏大按钮「免费下载」和获取区里的「下载安装包」。
 * 两处都带 .btn，全部改指真实安装包地址；导航里那个「下载」是纯导航（.nav-cta），
 * 保留页内滚动，落到获取区再点大按钮 —— 免得一进站就闷头下 96MB。
 *
 * 地址优先从 version.json 的 downloadUrl 读（发版脚本上传安装包后会自动写进去）；
 * 读不到就维持 HTML 里写死的 Releases 页兜底，不至于点坏。
 * 也支持在网址后加 ?dl=xxx 临时覆盖（方便自己测试）。
 */
(async function wireDownloadButtons() {
  const btns = Array.from(
    document.querySelectorAll('#btn-get, a.btn[href="#get"]:not(.nav-cta)'),
  );
  if (!btns.length) return;

  const params = new URLSearchParams(location.search);
  let url = params.get('dl') || '';

  if (!url) {
    try {
      // no-store：换了安装包地址后立刻生效，别让浏览器缓存住旧地址
      const r = await fetch('version.json', { cache: 'no-store' });
      if (r.ok) {
        const j = await r.json();
        if (j && typeof j.downloadUrl === 'string' && /^https?:\/\//i.test(j.downloadUrl)) {
          url = j.downloadUrl;
        }
      }
    } catch {
      /* 取不到就什么都不做，按钮维持 HTML 里的兜底地址，不至于点坏 */
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
