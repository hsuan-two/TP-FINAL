/* ═══════════════════════════════════════
   UMC — script.js
   ═══════════════════════════════════════ */
(function () {
  'use strict';

  // ── State ──
  let lang  = 'zh';
  let theme = 'light';
  let centerIndex = 2; // 公司介紹預設在正中間

  // ── DOM ──
  const root         = document.documentElement;
  const langBtn      = document.getElementById('langBtn');
  const themeBtn     = document.getElementById('themeBtn');
  const hamburger    = document.getElementById('hamburger');
  const sidemenu     = document.getElementById('sidemenu');
  const sidemenuClose= document.getElementById('sidemenuClose');
  const overlay      = document.getElementById('overlay');
  const track        = document.getElementById('carouselTrack');
  const cards        = Array.from(track.querySelectorAll('.card'));
  const arrowLeft    = document.getElementById('arrowLeft');
  const arrowRight   = document.getElementById('arrowRight');
  const dots         = Array.from(document.querySelectorAll('.dot'));

  // ══ LANGUAGE ══
  function setLang(l) {
    lang = l;
    langBtn.textContent = lang === 'zh' ? 'EN' : '中';
    document.querySelectorAll('[data-zh][data-en]').forEach(el => {
      el.textContent = el.dataset[lang];
    });
  }
  langBtn.addEventListener('click', () => setLang(lang === 'zh' ? 'en' : 'zh'));

  // ══ THEME ══
  function setTheme(t) {
    theme = t;
    root.setAttribute('data-theme', theme);
    themeBtn.textContent = theme === 'dark' ? '☀' : '☾';
  }
  themeBtn.addEventListener('click', () => setTheme(theme === 'light' ? 'dark' : 'light'));
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) setTheme('dark');

  // ══ SIDEMENU ══
  function openMenu() {
    sidemenu.classList.add('open');
    overlay.classList.add('show');
    hamburger.classList.add('open');
  }
  function closeMenu() {
    sidemenu.classList.remove('open');
    overlay.classList.remove('show');
    hamburger.classList.remove('open');
  }
  hamburger.addEventListener('click', openMenu);
  sidemenuClose.addEventListener('click', closeMenu);
  overlay.addEventListener('click', closeMenu);

  // ══ CAROUSEL ══
  // 卡片順序：0=市場分析, 1=資源評價, 2=公司介紹(center), 3=成長策略, 4=人力職缺
  function updateCards() {
    cards.forEach((card, i) => {
      card.classList.remove('is-center');
      // 相對距離
      const diff = i - centerIndex;
      if (diff === 0) {
        card.classList.add('is-center');
      }
    });

    // 更新 dots
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === centerIndex);
    });
  }

  function moveTo(idx) {
    // 循環
    centerIndex = (idx + cards.length) % cards.length;
    updateCards();
  }

  arrowLeft.addEventListener('click',  () => moveTo(centerIndex - 1));
  arrowRight.addEventListener('click', () => moveTo(centerIndex + 1));

  dots.forEach(dot => {
    dot.addEventListener('click', () => moveTo(parseInt(dot.dataset.i)));
  });

  // 滑鼠滾輪 scroll → 移動中心
  let scrollLock = false;
  document.querySelector('.carousel-section').addEventListener('wheel', (e) => {
    if (scrollLock) return;
    e.preventDefault();
    scrollLock = true;
    if (e.deltaY > 0 || e.deltaX > 0) moveTo(centerIndex + 1);
    else moveTo(centerIndex - 1);
    setTimeout(() => scrollLock = false, 500);
  }, { passive: false });

  // 觸控滑動支援
  let touchStartX = 0;
  track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; });
  track.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 40) moveTo(centerIndex + (dx < 0 ? 1 : -1));
  });

  // ── Init ──
  setLang('zh');
  updateCards();
})();
