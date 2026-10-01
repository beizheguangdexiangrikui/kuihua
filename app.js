'use strict';

/** 公开介绍页轻交互：进度环动画 + 导航高亮 */

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
    if (sec) map.set(sec, a);
  }
  if (!map.size || !('IntersectionObserver' in window)) return;
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        links.forEach((l) => l.classList.remove('is-on'));
        map.get(e.target)?.classList.add('is-on');
      }
    },
    { rootMargin: '-40% 0px -50% 0px' },
  );
  map.forEach((_a, sec) => io.observe(sec));
})();

/** 购买链接：可在页面顶部配置，也可用 ?buy= 覆盖 */
(function wireBuyLink() {
  // ↓↓↓ 把这里换成你的付费页 / 发卡平台链接 ↓↓↓
  // 本地联调：指向付费站（8766）；上线后改成你的付费页公网地址
  const BUY_URL = 'http://127.0.0.1:8766/';
  const params = new URLSearchParams(location.search);
  const override = params.get('buy');
  const url = override || BUY_URL;
  const btn = document.getElementById('btn-get');
  if (btn) {
    btn.href = url;
    if (/^https?:\/\//i.test(url)) {
      btn.target = '_blank';
      btn.rel = 'noopener';
    }
  }
})();
