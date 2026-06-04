/* ══════════════════════════════════════════
   UMC — script.js  (clean rebuild)
   ══════════════════════════════════════════ */

/* ══ 1. MAIN UI: lang / theme / sidemenu / carousel ══ */
(function () {
  'use strict';

  let lang        = 'zh';
  let theme       = 'light';
  let centerIndex = 2;
  let autoTimer   = null;

  const root          = document.documentElement;
  const langBtn       = document.getElementById('langBtn');
  const themeBtn      = document.getElementById('themeBtn');
  const hamburger     = document.getElementById('hamburger');
  const sidemenu      = document.getElementById('sidemenu');
  const sidemenuClose = document.getElementById('sidemenuClose');
  const overlay       = document.getElementById('overlay');
  const track         = document.getElementById('carouselTrack');
  const cards         = track ? Array.from(track.querySelectorAll('.card')) : [];
  const dots          = Array.from(document.querySelectorAll('.dot'));

  /* ── Language ── */
  function setLang(l) {
    lang = l;
    langBtn.textContent = lang === 'zh' ? 'EN' : '中';
    document.querySelectorAll('[data-zh][data-en]').forEach(el => {
      el.textContent = el.dataset[lang];
    });
  }
  langBtn.addEventListener('click', () => setLang(lang === 'zh' ? 'en' : 'zh'));

  /* ── Theme ── */
  function setTheme(t) {
    theme = t;
    root.setAttribute('data-theme', theme);
    themeBtn.textContent = theme === 'dark' ? '☀' : '☾';
    if (typeof drawTimeline === 'function') drawTimeline();
  }
  themeBtn.addEventListener('click', () => setTheme(theme === 'light' ? 'dark' : 'light'));
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) setTheme('dark');

  /* ── Sidemenu ── */
  const openMenu  = () => { sidemenu.classList.add('open'); overlay.classList.add('show'); hamburger.classList.add('open'); };
  const closeMenu = () => { sidemenu.classList.remove('open'); overlay.classList.remove('show'); hamburger.classList.remove('open'); };
  hamburger.addEventListener('click', openMenu);
  sidemenuClose.addEventListener('click', closeMenu);
  overlay.addEventListener('click', closeMenu);
  sidemenu.querySelectorAll('a.smlink').forEach(a => a.addEventListener('click', closeMenu));

  document.querySelectorAll('.smgroup').forEach(group => {
    let leaveTimer = null;
    group.addEventListener('mouseenter', () => { clearTimeout(leaveTimer); group.classList.add('open'); });
    group.addEventListener('mouseleave', () => { leaveTimer = setTimeout(() => group.classList.remove('open'), 180); });

    // 點大標題 → 跳轉
    const title = group.querySelector('.smgroup-title');
    if (title && title.dataset.href) {
      title.style.cursor = 'pointer';
      title.addEventListener('click', () => {
        const target = document.querySelector(title.dataset.href);
        if (target) {
          closeMenu();
          setTimeout(() => target.scrollIntoView({ behavior: 'smooth', block: 'start' }), 300);
        }
      });
    }
  });

  /* ── Carousel ── */
  const N = cards.length;
  const SLOT = [
    { x: -480, scale: 0.62, z: 0, opacity: 0.55 },
    { x: -250, scale: 0.80, z: 1, opacity: 0.78 },
    { x:    0, scale: 1.00, z: 2, opacity: 1.00 },
    { x:  250, scale: 0.80, z: 1, opacity: 0.78 },
    { x:  480, scale: 0.62, z: 0, opacity: 0.55 },
  ];
  const slotMap = [2, 3, 4, 0, 1];

  function applyPositions() {
    if (!N) return;
    cards.forEach((card, i) => {
      const slot = (i - centerIndex + N) % N;
      const s    = SLOT[slotMap[slot]];
      card.style.transform = `translateX(${s.x}px) scale(${s.scale})`;
      card.style.zIndex    = s.z;
      card.style.opacity   = s.opacity;
      card.classList.toggle('is-center', slot === 0);
    });
    dots.forEach((dot, i) => dot.classList.toggle('active', i === centerIndex));
  }

  function advance(dir) {
    centerIndex = (centerIndex + dir + N) % N;
    applyPositions();
  }

  function startAuto() { stopAuto(); autoTimer = setInterval(() => advance(1), 2500); }
  function stopAuto()  { if (autoTimer) { clearInterval(autoTimer); autoTimer = null; } }

  dots.forEach((dot, i) => dot.addEventListener('click', () => {
    stopAuto(); centerIndex = i; applyPositions(); setTimeout(startAuto, 3000);
  }));

  if (track) {
    let touchStartX = 0;
    track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; stopAuto(); }, { passive: true });
    track.addEventListener('touchend',   e => {
      const dx = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(dx) > 40) advance(dx < 0 ? 1 : -1);
      setTimeout(startAuto, 3000);
    }, { passive: true });
  }

  cards.forEach(card => {
    card.addEventListener('click', () => {
      const section = document.getElementById(card.dataset.target);
      if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  /* ── Init ── */
  setLang('zh');
  if (N) { applyPositions(); startAuto(); }

})();

/* ══ 2. TIMELINE ══ */
(function () {
  'use strict';

  const TL_DATA = [
    { year: '1980',    zh: '聯電正式成立，自工研院相關資源分出，成為台灣首家民營積體電路公司。',           en: "UMC founded as Taiwan's first private IC company, spun out from ITRI." },
    { year: '1985',    zh: '股票公開上市。',                                                                en: 'Listed on the Taiwan Stock Exchange.' },
    { year: '1995.07', zh: '轉型為純晶圓代工公司，營運模式正式從產品導向轉向代工服務。',                   en: 'Converted to a pure-play foundry model.' },
    { year: '1995.09', zh: '與美、加11家IC設計公司合資成立聯誠、聯瑞、聯嘉，並開始8吋晶圓廠生產。',      en: 'Joint-ventured with 11 North American IC firms; launched 8" fab production.' },
    { year: '1996',    zh: '陸續推進0.35μm、0.25μm、0.18μm等製程，提升技術能力。',                        en: 'Advanced process nodes from 0.35μm to 0.18μm.' },
    { year: '1998',    zh: '取得合泰半導體晶圓廠及日本新日鐵半導體晶圓廠，擴大生產據點。',                 en: 'Acquired fabs from HMC and Nippon Steel Semiconductor.' },
    { year: '1999',    zh: '南科12吋晶圓廠正式建廠。',                                                     en: 'Broke ground on 12" fab at Southern Taiwan Science Park.' },
    { year: '2000',    zh: '成為第一家在紐交所上市的台灣半導體公司。',                                     en: 'First Taiwanese semiconductor company listed on NYSE.' },
    { year: '2015',    zh: '中國廈門12吋晶圓廠正式建廠。',                                                 en: 'Established 12" fab in Xiamen, China.' },
    { year: '2019',    zh: '收購日本MIFS廠，更名為USJC。',                                                 en: "Acquired Japan's MIFS fab, renamed USJC." },
    { year: '2021',    zh: '加入RE100，宣示2050年達成淨零碳排。',                                          en: 'Joined RE100; pledged net-zero carbon by 2050.' },
    { year: '2024',    zh: '宣布與英特爾合作開發12nm製程。',                                               en: 'Announced collaboration with Intel on 12nm process.' },
  ];

  let lang = 'zh';
  document.getElementById('langBtn')?.addEventListener('click', () => {
    setTimeout(() => {
      const s = document.querySelector('[data-zh][data-en]');
      if (s) lang = s.textContent.trim() === s.dataset.zh ? 'zh' : 'en';
    }, 60);
  });

  function getCSSVar(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || '';
  }

  function makeSvgText(x, y, text, size, fill) {
    const t = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    t.setAttribute('x', x); t.setAttribute('y', y);
    t.setAttribute('text-anchor', 'middle');
    t.setAttribute('fill', fill); t.setAttribute('font-size', size);
    t.setAttribute('font-family', 'DM Mono, monospace');
    t.setAttribute('font-weight', '600'); t.setAttribute('pointer-events', 'none');
    t.textContent = text;
    return t;
  }

  function drawTimeline() {
    const svg = document.getElementById('timelineSvg');
    if (!svg) return;
    svg.innerHTML = '';

    const W = 900, ROW_H = 200, PAD_TOP = 60, PAD_X = 90;
    const COLS = 4, ROWS = 3;
    const colW   = (W - PAD_X * 2) / (COLS - 1);
    const totalH = PAD_TOP + ROW_H * (ROWS - 1) + PAD_TOP;
    svg.setAttribute('viewBox', `0 0 ${W} ${totalH}`);

    const navyFill = getCSSVar('--navy')  || '#0b2545';
    const navy2    = getCSSVar('--navy2') || '#134074';
    const white    = getCSSVar('--white') || '#ffffff';

    // Build grid points in S order
    const pts = [];
    for (let row = 0; row < ROWS; row++) {
      const y = PAD_TOP + row * ROW_H;
      for (let col = 0; col < COLS; col++) {
        const c = (row % 2 === 0) ? col : (COLS - 1 - col);
        pts.push({ x: PAD_X + c * colW, y });
      }
    }

    // S-curve path
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 1; i < pts.length; i++) {
      const p = pts[i-1], c = pts[i];
      if (p.y === c.y) {
        d += ` C ${p.x+(c.x-p.x)*0.4} ${p.y}, ${c.x-(c.x-p.x)*0.4} ${c.y}, ${c.x} ${c.y}`;
      } else {
        d += ` C ${p.x} ${p.y+ROW_H*0.55}, ${c.x} ${c.y-ROW_H*0.55}, ${c.x} ${c.y}`;
      }
    }
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', d); path.setAttribute('fill', 'none');
    path.setAttribute('stroke', navy2); path.setAttribute('stroke-width', '3');
    path.setAttribute('opacity', '0.45');
    svg.appendChild(path);

    // Tooltip
    const tooltip = document.getElementById('tlTooltip');
    const wrap    = document.querySelector('.timeline-wrap');

    function showTip(e, item) {
      if (!tooltip || !wrap) return;
      tooltip.querySelector('.tl-tooltip-year').textContent = item.year;
      tooltip.querySelector('.tl-tooltip-text').textContent = lang === 'zh' ? item.zh : item.en;
      tooltip.classList.add('show'); moveTip(e);
    }
    function moveTip(e) {
      if (!tooltip || !wrap) return;
      const wr = wrap.getBoundingClientRect();
      let x = e.clientX - wr.left + 24, y = e.clientY - wr.top - 20;
      const tw = tooltip.offsetWidth || 220, th = tooltip.offsetHeight || 80;
      if (x + tw > wr.width - 8)  x = e.clientX - wr.left - tw - 24;
      if (y + th > wr.height - 8) y = wr.height - th - 8;
      if (y < 0) y = 4;
      tooltip.style.left = x + 'px'; tooltip.style.top = y + 'px';
    }
    function hideTip() { tooltip && tooltip.classList.remove('show'); }

    const R = 30;
    pts.forEach((pt, i) => {
      const item   = TL_DATA[i];
      const parts  = item.year.split('.');

      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', pt.x); circle.setAttribute('cy', pt.y);
      circle.setAttribute('r', R); circle.setAttribute('fill', navyFill);
      circle.setAttribute('stroke', white); circle.setAttribute('stroke-width', '3');
      circle.style.cursor = 'pointer'; circle.style.transition = 'r .2s, fill .2s';

      circle.addEventListener('mouseenter', e => {
        circle.setAttribute('r', R + 5); circle.setAttribute('fill', '#1e88e5'); showTip(e, item);
      });
      circle.addEventListener('mousemove', moveTip);
      circle.addEventListener('mouseleave', () => {
        circle.setAttribute('r', R); circle.setAttribute('fill', navyFill); hideTip();
      });

      // Touch: highlight on tap, reset on tap elsewhere
      circle.addEventListener('touchstart', e => {
        // Reset any previously highlighted circle
        svg.querySelectorAll('circle[data-active="1"]').forEach(c => {
          c.setAttribute('r', R);
          c.setAttribute('fill', navyFill);
          c.removeAttribute('data-active');
        });
        circle.setAttribute('r', R + 5);
        circle.setAttribute('fill', '#1e88e5');
        circle.setAttribute('data-active', '1');
        showTip(e.touches[0], item);
        e.stopPropagation();
      }, { passive: true });


      svg.appendChild(circle);
      if (parts.length === 2) {
        svg.appendChild(makeSvgText(pt.x, pt.y - 7, parts[0], '11', '#fff'));
        svg.appendChild(makeSvgText(pt.x, pt.y + 9, '.' + parts[1], '10', 'rgba(255,255,255,0.75)'));
      } else {
        svg.appendChild(makeSvgText(pt.x, pt.y + 4, item.year, '12', '#fff'));
      }
    });
  }

  // Expose for theme toggle
  window.drawTimeline = drawTimeline;

  requestAnimationFrame(drawTimeline);

  // Redraw on theme change
  document.getElementById('themeBtn')?.addEventListener('click', () => {
    setTimeout(drawTimeline, 50);
  });

  // Mobile: reset highlighted circle when tapping outside the SVG
  document.addEventListener('touchstart', e => {
    const svg = document.getElementById('timelineSvg');
    if (!svg) return;
    if (!svg.contains(e.target)) {
      const navyFill = getCSSVar('--navy') || '#0b2545';
      svg.querySelectorAll('circle[data-active="1"]').forEach(c => {
        c.setAttribute('r', '30');
        c.setAttribute('fill', navyFill);
        c.removeAttribute('data-active');
      });
      document.getElementById('tlTooltip')?.classList.remove('show');
    }
  }, { passive: true });

})();

/* ══ 3. ORG CHART ══ */
(function () {
  'use strict';

  const ORG_TEXT = {
    gov: {
      zh: '聯電的治理層主要由董事會及相關委員會組成，負責監督公司整體經營方向、公司治理與風險控管，確保企業決策符合長期發展與利害關係人的期待。對聯電而言，治理層不只是管理制度的核心，也是在半導體產業中維持企業穩定與永續發展的重要基礎。',
      en: "UMC's governance layer consists primarily of the Board of Directors and related committees, responsible for overseeing the company's overall business direction, corporate governance, and risk management."
    },
    mgmt: {
      zh: '聯電的經營層由高階管理團隊負責，主要任務是將公司策略轉化為具體行動，並帶領各部門推動日常營運。由於聯電屬於晶圓代工產業，經營層除了要掌握市場變化與客戶需求，也必須同時兼顧產能安排、技術發展與全球布局，才能維持企業競爭力。',
      en: "UMC's management layer is led by the senior management team, whose primary mission is to translate corporate strategy into concrete actions and drive daily operations across departments."
    },
    func: {
      zh: '聯電的功能部門涵蓋研發、技術服務、業務、製造品管、管理與財務等單位，分別負責技術創新、客戶支援、生產管理與後勤運作。這些部門共同支撐聯電的晶圓代工本業，讓公司能在技術、品質與營運效率上保持穩定表現。',
      en: "UMC's functional departments span R&D, technical services, sales, manufacturing quality, administration, and finance — collectively supporting UMC's foundry business."
    }
  };

  let currentKey  = 'gov';
  let currentLang = 'zh';

  const descText = document.getElementById('orgDescText');
  const btns     = Array.from(document.querySelectorAll('.org-btn'));

  function renderDesc() {
    if (descText) descText.textContent = ORG_TEXT[currentKey][currentLang];
  }

  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentKey = btn.dataset.key;
      renderDesc();
    });
  });

  document.getElementById('langBtn')?.addEventListener('click', () => {
    setTimeout(() => {
      const s = document.querySelector('[data-zh][data-en]');
      if (s) currentLang = s.textContent.trim() === s.dataset.zh ? 'zh' : 'en';
      renderDesc();
    }, 60);
  });

  // Bar animation
  const bars     = document.querySelectorAll('.process-bar-fill');
  const barObs   = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.style.width = (e.target.dataset.pct || '0') + '%';
        barObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.3 });
  bars.forEach(b => { b.style.width = '0%'; barObs.observe(b); });

  renderDesc();

})();

/* ══ 4. WORLD MAP ══ */
(function () {
  'use strict';

  const SITES = [
    { id:'tw', lat:23.7,  lng:120.9, nameZh:'台灣總部',         nameEn:'Taiwan HQ',
      textZh:'核心研發中心與產能支柱，主攻最先進的成熟製程工藝。',
      textEn:'Core R&D center and production pillar, focusing on the most advanced mature process technologies.',
      type:'fab' },
    { id:'cn', lat:24.5,  lng:118.1, nameZh:'中國廠（廈門）',   nameEn:'China Fab (Xiamen)',
      textZh:'聯電的中國廠主要是位在福建廈門的12吋晶圓廠聯芯，屬於聯電在中國的重要製造據點。',
      textEn:"UMC's China fab is the 12\" wafer fab HLMC in Xiamen — a key manufacturing base in China.",
      type:'fab' },
    { id:'sg', lat:1.35,  lng:103.8, nameZh:'新加坡廠',         nameEn:'Singapore Fab',
      textZh:'東南亞晶圓製造與交付核心基地，擴大全球佈局的領頭羊。',
      textEn:"Core hub for wafer manufacturing in Southeast Asia, spearheading UMC's global expansion.",
      type:'fab' },
    { id:'jp', lat:34.7,  lng:136.5, nameZh:'日本廠 (USJC)',    nameEn:'Japan Fab (USJC)',
      textZh:'深耕車載供應鏈；2019年收購MIFS廠更名USJC，強化日本在地服務能力。',
      textEn:'Deepening automotive supply chain; acquired MIFS in 2019, renamed USJC.',
      type:'fab' },
    { id:'us', lat:37.4,  lng:-122.0, nameZh:'Sunnyvale（美國）', nameEn:'Sunnyvale, USA',
      textZh:'深耕車載供應鏈；與 Intel 展開 12nm 輕資產共同研發合作。',
      textEn:'Deepening automotive supply chain; collaborating with Intel on 12nm co-development.',
      type:'fab' },
    { id:'nl', lat:52.1,  lng:5.3,   nameZh:'荷蘭辦公據點',     nameEn:'Netherlands Office',
      textZh:'歐洲辦公據點，服務歐洲客戶需求。',
      textEn:'European office serving regional customer needs.',
      type:'office' },
    { id:'kr', lat:37.5,  lng:127.0, nameZh:'韓國辦公據點',     nameEn:'Korea Office',
      textZh:'韓國辦公據點，服務東北亞客戶需求。',
      textEn:'Korea office serving Northeast Asian customer needs.',
      type:'office' },
  ];

  let currentLang = 'zh';
  let mapMarkers  = [];

  function makeIcon(type) {
    const color = type === 'fab' ? '#0b2545' : '#1e88e5';
    const svg   = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="28" viewBox="0 0 22 28">
      <circle cx="11" cy="11" r="9" fill="${color}" stroke="#fff" stroke-width="2"/>
      <line x1="11" y1="20" x2="11" y2="27" stroke="${color}" stroke-width="2"/>
    </svg>`;
    return L.divIcon({ html: svg, className: '', iconSize:[22,28], iconAnchor:[11,28] });
  }

  function getDir(id) {
    if (id === 'us') return { dir: 'right',  offset: [8, 0]   };
    if (id === 'nl') return { dir: 'bottom', offset: [0, 14]  };
    return                  { dir: 'top',    offset: [0, -14] };
  }

  function initMap() {
    const el = document.getElementById('worldMap');
    if (!el || !window.L) return;

    const isMobile = window.innerWidth <= 768;

    const map = L.map('worldMap', {
      center:[22, 30], zoom: 2,
      zoomControl: isMobile, scrollWheelZoom:false,
      dragging: isMobile, touchZoom: isMobile, doubleClickZoom:false,
      boxZoom:false, keyboard:false, attributionControl:false,
      worldCopyJump: false
    });

    if (isMobile) {
      map.setMaxBounds([[-90, -180], [90, 180]]);
    }

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      subdomains:'abcd', maxZoom:19, noWrap: true
    }).addTo(map);

    SITES.forEach(s => {
      const { dir, offset } = getDir(s.id);
      const marker = L.marker([s.lat, s.lng], { icon: makeIcon(s.type) }).addTo(map);
      marker.bindTooltip(
        `<div class="lf-tip-name">${s.nameZh}</div>
         <div class="lf-tip-name-en">${s.nameEn}</div>
         <div class="lf-tip-text">${currentLang==='zh'?s.textZh:s.textEn}</div>`,
        { permanent:false, sticky:false, direction:dir, offset, className:'lf-tooltip', opacity:1 }
      );
      marker._siteData = s;
      mapMarkers.push(marker);
    });

    document.getElementById('langBtn')?.addEventListener('click', () => {
      setTimeout(() => {
        const sample = document.querySelector('[data-zh][data-en]');
        if (sample) currentLang = sample.textContent.trim()===sample.dataset.zh?'zh':'en';
        mapMarkers.forEach(m => {
          const s = m._siteData;
          m.setTooltipContent(
            `<div class="lf-tip-name">${s.nameZh}</div>
             <div class="lf-tip-name-en">${s.nameEn}</div>
             <div class="lf-tip-text">${currentLang==='zh'?s.textZh:s.textEn}</div>`
          );
        });
      }, 60);
    });

    setTimeout(() => {
      // Fit map to show all markers with padding
      const bounds = L.latLngBounds(SITES.map(s => [s.lat, s.lng]));
      map.fitBounds(bounds, { padding: [40, 60], maxZoom: isMobile ? 3 : 4 });
      setTimeout(() => map.invalidateSize(), 200);
      setTimeout(() => map.invalidateSize(), 600);
      setTimeout(() => map.invalidateSize(), 1200);
    }, 100);

    // Use ResizeObserver for most reliable size fix
    if (window.ResizeObserver) {
      const ro = new ResizeObserver(() => map.invalidateSize());
      ro.observe(el);
    }
    window.addEventListener('resize', () => map.invalidateSize());
  }

  if (window.L) initMap();
  else window.addEventListener('load', initMap);

})();

/* ══ 5. BMC FLIP ══ */
document.querySelectorAll('.bmc-cell').forEach(cell => {
  cell.addEventListener('click',      () => cell.classList.add('flipped'));
  cell.addEventListener('mouseleave', () => cell.classList.remove('flipped'));
});

/* ══ 6. KPI COUNTER ══ */
(function () {
  'use strict';

  const kpiEls = document.querySelectorAll('.kpi-value[data-count]');

  function animateCount(el) {
    const target   = parseFloat(el.dataset.count);
    const decimals = parseInt(el.dataset.decimals) || 0;
    const numEl    = el.querySelector('.kpi-num');
    if (!numEl) return;

    const duration = 1400;
    const start    = performance.now();

    function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

    function step(now) {
      const progress = Math.min((now - start) / duration, 1);
      numEl.textContent = (easeOut(progress) * target).toFixed(decimals);
      if (progress < 1) requestAnimationFrame(step);
      else numEl.textContent = target.toFixed(decimals);
    }
    requestAnimationFrame(step);
  }

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { animateCount(e.target); obs.unobserve(e.target); }
    });
  }, { threshold: 0.5 });

  kpiEls.forEach(el => {
    const numEl = el.querySelector('.kpi-num');
    if (numEl) numEl.textContent = '0';
    obs.observe(el);
  });

})();

/* ══ 7. COMP CARD CAROUSEL ══ */
(function () {
  'use strict';

  const track = document.getElementById('compCardsTrack');
  if (!track) return;

  const cards  = Array.from(track.querySelectorAll('.comp-card:not(.comp-card-clone)'));
  const dots   = Array.from(document.querySelectorAll('.comp-dot'));
  const N      = cards.length;
  let current  = 0;
  let timer    = null;
  let paused   = false;

  function goTo(idx) {
    cards[current].classList.remove('comp-card-active');
    current = ((idx % N) + N) % N;
    cards[current].classList.add('comp-card-active');
    dots.forEach((d, i) => d.classList.toggle('active', i === current));
  }

  function startAuto() {
    stopAuto();
    timer = setInterval(() => { if (!paused) goTo(current + 1); }, 3000);
  }
  function stopAuto() { if (timer) { clearInterval(timer); timer = null; } }

  const wrap = document.getElementById('compCardsWrap');
  if (wrap) {
    wrap.addEventListener('mouseenter', () => { paused = true; });
    wrap.addEventListener('mouseleave', () => { paused = false; });
  }

  dots.forEach((dot, i) => dot.addEventListener('click', () => { goTo(i); startAuto(); }));

  let tx = 0;
  track.addEventListener('touchstart', e => { tx = e.touches[0].clientX; stopAuto(); }, { passive: true });
  track.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - tx;
    if (Math.abs(dx) > 40) goTo(current + (dx < 0 ? 1 : -1));
    startAuto();
  }, { passive: true });

  goTo(0);
  startAuto();
})();

/* ══ 8. CORE COMPETENCE (Canvas) ══ */
(function () {
  'use strict';

  const SEGS = [
    { zh:'成熟製程',           en:'Mature Process',
      color:'#0b2545',
      dZh:'聯電在 22 奈米、28 奈米與其他成熟節點具備穩定量產能力，能支撐大量且長生命週期的客戶需求。',
      dEn:'UMC has stable mass-production at 22nm, 28nm and other mature nodes, supporting high-volume, long-lifecycle customer needs.' },
    { zh:'特殊製程',           en:'Specialty Process',
      color:'#1a5276',
      dZh:'聯電在邏輯、混合訊號、射頻、嵌入式高壓、RFSOI 等領域有長期累積，能提供差異化解決方案。',
      dEn:'UMC has long-term expertise in logic, mixed-signal, RF, embedded HV, and RFSOI, delivering differentiated solutions.' },
    { zh:'全球產能配置',       en:'Global Capacity',
      color:'#1f6799',
      dZh:'聯電透過台灣、新加坡、日本與中國等多地據點，提升供應鏈彈性與風險分散能力。',
      dEn:'UMC enhances supply chain flexibility and risk diversification through sites in Taiwan, Singapore, Japan, and China.' },
    { zh:'客戶合作與服務能力', en:'Customer Service',
      color:'#2980b9',
      dZh:'聯電重視與客戶共同開發、製程導入與技術支援，讓代工不只是製造，而是共同解決問題的夥伴關係。',
      dEn:'UMC emphasizes co-development, process ramp, and technical support — making foundry a true partnership.' },
    { zh:'永續與製造效率',     en:'Sustainability & Efficiency',
      color:'#5dade2',
      dZh:'聯電把節能減碳、資源回收與製程效率納入營運核心，有助於強化長期競爭力與國際客戶信任。',
      dEn:'UMC integrates energy saving, carbon reduction, and process efficiency into its core operations.' },
  ];

  const N     = SEGS.length;
  const SLICE = (Math.PI * 2) / N;
  const GAP   = 0.04;
  let lang    = 'zh';
  let hovered = -1;

  const canvas = document.getElementById('coreCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  // HiDPI fix: scale canvas by devicePixelRatio for sharp rendering
  const DPR = window.devicePixelRatio || 1;
  const SIZE = 520;
  canvas.width  = SIZE * DPR;
  canvas.height = SIZE * DPR;
  canvas.style.width  = SIZE + 'px';
  canvas.style.height = SIZE + 'px';
  ctx.scale(DPR, DPR);

  const W = SIZE, H = SIZE;
  const CX = W / 2, CY = H / 2;
  const R_OUT = 210, R_IN = 115;

  function draw() {
    ctx.clearRect(0, 0, W, H);
    const offset = -Math.PI / 2;

    SEGS.forEach((seg, i) => {
      const a0   = offset + i * SLICE + GAP;
      const a1   = offset + (i + 1) * SLICE - GAP;
      const aMid = (a0 + a1) / 2;
      const isHov = (i === hovered);

      ctx.save();
      if (isHov) {
        const dx = Math.cos(aMid) * 18;
        const dy = Math.sin(aMid) * 18;
        ctx.translate(dx, dy);
        ctx.shadowColor = seg.color;
        ctx.shadowBlur  = 18;
      }

      // Arc
      ctx.beginPath();
      ctx.moveTo(CX + Math.cos(a0) * R_IN, CY + Math.sin(a0) * R_IN);
      ctx.arc(CX, CY, R_OUT, a0, a1);
      ctx.arc(CX, CY, R_IN,  a1, a0, true);
      ctx.closePath();
      ctx.fillStyle = isHov ? lighten(seg.color, 30) : seg.color;
      ctx.fill();
      ctx.restore();

      // Label
      ctx.save();
      if (isHov) {
        ctx.translate(Math.cos(aMid) * 18, Math.sin(aMid) * 18);
      }
      const RL = (R_OUT + R_IN) / 2;
      const lx = CX + Math.cos(aMid) * RL;
      const ly = CY + Math.sin(aMid) * RL;
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 15px "Noto Sans TC", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const label = lang === 'zh' ? seg.zh : seg.en;
      const lines = splitLabel(label);
      const lh = 19;
      lines.forEach((line, li) => {
        ctx.fillText(line, lx, ly + (li - (lines.length-1)/2) * lh);
      });
      ctx.restore();
    });

    // Centre hole
    ctx.save();
    ctx.beginPath();
    ctx.arc(CX, CY, R_IN - 2, 0, Math.PI * 2);
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    ctx.fillStyle = isDark ? '#0d1b2a' : '#ffffff';
    ctx.fill();
    ctx.restore();

    const isDk = document.documentElement.getAttribute('data-theme') === 'dark';

    if (hovered >= 0) {
      const seg = SEGS[hovered];
      const desc = lang === 'zh' ? seg.dZh : seg.dEn;

      // Split desc into lines of ~10 chars
      const words = desc.split('');
      const lineMax = 10;
      const descLines = [];
      for (let i = 0; i < words.length; i += lineMax) {
        descLines.push(words.slice(i, i + lineMax).join(''));
      }

      const titleFontSize = 14;
      const descFontSize  = 11;
      const titleH = titleFontSize + 6;
      const dividerH = 12;
      const descLH = 15;
      const totalH = titleH + dividerH + descLines.length * descLH;
      let y = CY - totalH / 2;

      // Title
      ctx.save();
      ctx.fillStyle = seg.color;
      ctx.font = `bold ${titleFontSize}px "Noto Sans TC", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(lang === 'zh' ? seg.zh : seg.en, CX, y);
      y += titleH;
      ctx.restore();

      // Divider
      ctx.save();
      ctx.strokeStyle = seg.color;
      ctx.lineWidth = 1.2;
      ctx.globalAlpha = 0.35;
      ctx.beginPath();
      ctx.moveTo(CX - 48, y + 3);
      ctx.lineTo(CX + 48, y + 3);
      ctx.stroke();
      ctx.restore();
      y += dividerH;

      // Description
      ctx.save();
      ctx.fillStyle = isDk ? '#b0c8e0' : '#3a4f65';
      ctx.font = `${descFontSize}px "Noto Sans TC", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      descLines.forEach((line, li) => {
        ctx.fillText(line, CX, y + li * descLH);
      });
      ctx.restore();

    } else {
      // Default: UMC + 核心能耐
      ctx.fillStyle = isDk ? '#dce8f5' : '#0b2545';
      ctx.font = 'bold 24px "Playfair Display", serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('UMC', CX, CY - 12);
      ctx.font = '12px "Noto Sans TC", sans-serif';
      ctx.fillStyle = '#7a9bb8';
      ctx.fillText(lang === 'zh' ? '核心能耐' : 'Core Competence', CX, CY + 12);
      ctx.font = '10px "Noto Sans TC", sans-serif';
      ctx.fillStyle = '#aab8c8';
      ctx.fillText(lang === 'zh' ? '← hover 查看說明' : '← hover for details', CX, CY + 32);
    }
  }

  function splitLabel(text) {
    const lines = [];
    for (let i = 0; i < text.length; i += 5) lines.push(text.slice(i, i + 5));
    return lines;
  }

  function lighten(hex, amt) {
    const n = parseInt(hex.slice(1), 16);
    const r = Math.min(255, (n >> 16) + amt);
    const g = Math.min(255, ((n >> 8) & 0xff) + amt);
    const b = Math.min(255, (n & 0xff) + amt);
    return `rgb(${r},${g},${b})`;
  }

  function getSegAt(mx, my) {
    const dx = mx - CX, dy = my - CY;
    const dist = Math.sqrt(dx*dx + dy*dy);
    if (dist < R_IN || dist > R_OUT + 20) return -1;
    let angle = Math.atan2(dy, dx) + Math.PI / 2;
    if (angle < 0) angle += Math.PI * 2;
    const idx = Math.floor(angle / SLICE) % N;
    return idx;
  }

  function getCoordsFromEvent(e) {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    // Scale from CSS display size to canvas internal size
    const scaleX = canvas.width  / DPR / rect.width;
    const scaleY = canvas.height / DPR / rect.height;
    return {
      mx: (clientX - rect.left) * scaleX,
      my: (clientY - rect.top)  * scaleY,
    };
  }

  canvas.addEventListener('mousemove', e => {
    const { mx, my } = getCoordsFromEvent(e);
    const idx = getSegAt(mx, my);
    if (idx !== hovered) { hovered = idx; draw(); }
  });

  canvas.addEventListener('touchstart', e => {
    const { mx, my } = getCoordsFromEvent(e);
    const idx = getSegAt(mx, my);
    hovered = idx;
    draw();
    e.preventDefault();
  }, { passive: false });

  canvas.addEventListener('touchend', () => {
    // Keep segment highlighted until next tap
  }, { passive: true });

  canvas.addEventListener('mouseleave', () => {
    hovered = -1; draw();
  });

  // Lang sync
  document.getElementById('langBtn')?.addEventListener('click', () => {
    setTimeout(() => {
      const s = document.querySelector('[data-zh][data-en]');
      if (s) lang = s.textContent.trim() === s.dataset.zh ? 'zh' : 'en';
      draw();
    }, 60);
  });

  // Theme sync
  document.getElementById('themeBtn')?.addEventListener('click', () => setTimeout(draw, 50));

  draw();
})();

/* ══ 9. GLOBAL CAPACITY HOVER ══ */
(function () {
  const DATA = {
    tw: {
      zh: { title: '台灣', text: '為研發與主要製造中心，保有技術與人才優勢。' },
      en: { title: 'Taiwan', text: 'R&D and primary manufacturing center, maintaining technological and talent advantages.' }
    },
    us: {
      zh: { title: '美國布局', text: '與英特爾合作在亞利桑那州推進 12 奈米平台，有助聯電進入北美供應鏈並降低地緣風險。' },
      en: { title: 'US Presence', text: 'Collaborating with Intel on 12nm in Arizona, helping UMC enter North American supply chains and reduce geopolitical risk.' }
    },
    jp: {
      zh: { title: '日本', text: '透過日本廠區，聯電可切入當地汽車與工業供應鏈，提升客戶黏著度。' },
      en: { title: 'Japan', text: 'Through Japan fabs, UMC can penetrate local automotive and industrial supply chains, boosting customer stickiness.' }
    },
    sg: {
      zh: { title: '新加坡', text: '新加坡 Fab 12i 持續擴建，承接成熟製程與部分先進封裝布局，成為重要海外產能據點。' },
      en: { title: 'Singapore', text: 'Fab 12i continues to expand, handling mature processes and some advanced packaging, becoming a key overseas capacity hub.' }
    }
  };

  let lang = 'zh';
  document.getElementById('langBtn')?.addEventListener('click', () => {
    setTimeout(() => {
      const s = document.querySelector('[data-zh][data-en]');
      if (s) lang = s.textContent.trim() === s.dataset.zh ? 'zh' : 'en';
    }, 60);
  });

  const tt    = document.getElementById('gcapTooltip');
  const ttTitle = document.getElementById('gcapTtTitle');
  const ttText  = document.getElementById('gcapTtText');
  const wrap  = document.querySelector('.gcap-container');

  document.querySelectorAll('.gcap-node').forEach(node => {
    const id = node.dataset.id;

    node.addEventListener('mouseenter', e => {
      if (!tt || !DATA[id]) return;
      const d = DATA[id][lang];
      ttTitle.textContent = d.title;
      ttText.textContent  = d.text;
      tt.classList.add('show');
      posTooltip(e, id);
    });
    node.addEventListener('mousemove', e => posTooltip(e, id));
    node.addEventListener('mouseleave', () => tt?.classList.remove('show'));
  });

  function posTooltip(e, id) {
    if (!tt) return;
    const TW = 260;
    const TH = tt.offsetHeight || 90;
    const vw = window.innerWidth, vh = window.innerHeight;
    let x, y;

    if (id === 'tw') {
      // Taiwan: below cursor, centred
      x = e.clientX - TW / 2;
      y = e.clientY + 16;
    } else if (id === 'us') {
      // US: left of cursor
      x = e.clientX - TW - 16;
      y = e.clientY - 20;
    } else if (id === 'jp') {
      // Japan: right of cursor
      x = e.clientX + 16;
      y = e.clientY - 20;
    } else {
      // Singapore: LEFT of circle — calculate circle's actual screen position
      const svgEl = document.querySelector('#growth-global .gcap-svg');
      if (svgEl) {
        const sr = svgEl.getBoundingClientRect();
        const scale = sr.width / 500;                    // viewBox width = 500
        const circleLeftEdge = sr.left + (116 - 55) * scale;
        const circleCenterY  = sr.top  + 318 * scale * (420 / 500);
        x = circleLeftEdge - TW - 12;
        y = circleCenterY - TH / 2;
      } else {
        x = e.clientX - TW - 16;
        y = e.clientY - TH / 2;
      }
    }

    // Clamp to viewport
    x = Math.max(8, Math.min(x, vw - TW - 8));
    y = Math.max(8, Math.min(y, vh - TH - 8));

    tt.style.left = x + 'px';
    tt.style.top  = y + 'px';
  }
})();

/* ══ 10. QUIZ ══ */
(function () {
  'use strict';

  const QUESTIONS = [
    {
      zh: { q: '聯電目前最專注的製程節點範圍是？',
            opts: ['3nm 以下先進製程', '28nm 以上成熟製程', '10nm 到 20nm 之間', '7nm FinFET'],
            correct: 1,
            explain: '聯電策略性地聚焦在 28nm 以上的成熟製程，強調穩定供應與成本效率，而非追求最先進節點。' },
      en: { q: 'What process node range does UMC currently focus on?',
            opts: ['Sub-3nm advanced nodes', '28nm and above mature nodes', '10nm to 20nm range', '7nm FinFET'],
            correct: 1,
            explain: 'UMC strategically focuses on mature processes at 28nm and above, emphasizing stable supply and cost efficiency rather than the most advanced nodes.' }
    },
    {
      zh: { q: '聯電與哪家公司合作開發 12nm FinFET 製程？',
            opts: ['三星', 'AMD', '英特爾', '台積電'],
            correct: 2,
            explain: '聯電宣布與英特爾合作在亞利桑那州共同開發 12nm 平台，有助進入北美供應鏈。' },
      en: { q: 'Which company is UMC collaborating with to develop 12nm FinFET?',
            opts: ['Samsung', 'AMD', 'Intel', 'TSMC'],
            correct: 2,
            explain: 'UMC announced collaboration with Intel to develop a 12nm platform in Arizona, helping enter the North American supply chain.' }
    },
    {
      zh: { q: '聯電在哪一年加入 RE100，宣示 2050 年達成淨零碳排？',
            opts: ['2015', '2019', '2021', '2024'],
            correct: 2,
            explain: '聯電於 2021 年加入 RE100 再生能源倡議，承諾在 2050 年前達成 100% 使用再生電力與淨零碳排目標。' },
      en: { q: 'In which year did UMC join RE100 and pledge net-zero carbon by 2050?',
            opts: ['2015', '2019', '2021', '2024'],
            correct: 2,
            explain: 'UMC joined the RE100 renewable energy initiative in 2021, committing to 100% renewable electricity and net-zero carbon emissions by 2050.' }
    },
    {
      zh: { q: '聯電六力分析中，哪一項顯示其競爭壓力最來自同業而非新進者？',
            opts: ['替代品威脅高', '顧客議價力強', '現有競爭者激烈', '新進者威脅低'],
            correct: 2,
            explain: '聯電主要面對中芯國際、華虹半導體、格羅方德與世界先進等成熟製程同業的競爭，來自現有競爭者的壓力最直接。' },
      en: { q: 'In UMC\'s Six Forces analysis, which force most directly drives competitive pressure from existing players rather than new entrants?',
            opts: ['High threat of substitutes', 'Strong buyer bargaining power', 'Intense rivalry among existing competitors', 'Low threat of new entrants'],
            correct: 2,
            explain: 'UMC faces competition primarily from mature-node peers like SMIC, Hua Hong, GlobalFoundries, and Vanguard — making rivalry among existing competitors the most direct pressure.' }
    },
    {
      zh: { q: 'UMC 的英文全名是？',
            opts: ['Universal Microchip Corporation', 'United Microelectronics Corp.', 'Unified Memory Company', 'Ultra Manufacturing Center'],
            correct: 1,
            explain: 'UMC 代表 United Microelectronics Corp.（聯華電子股份有限公司），1980 年成立，是台灣首家民營積體電路公司。' },
      en: { q: 'What does UMC stand for?',
            opts: ['Universal Microchip Corporation', 'United Microelectronics Corp.', 'Unified Memory Company', 'Ultra Manufacturing Center'],
            correct: 1,
            explain: 'UMC stands for United Microelectronics Corp., founded in 1980 as Taiwan\'s first private integrated circuit company.' }
    },
    {
      zh: { q: '聯電在新加坡的哪個廠區持續擴建中？',
            opts: ['Fab 10', 'Fab 11', 'Fab 12i', 'Fab 8'],
            correct: 2,
            explain: '聯電新加坡 Fab 12i 持續擴建，承接成熟製程與部分先進封裝布局，是重要的海外產能據點。' },
      en: { q: 'Which Singapore fab is UMC continuously expanding?',
            opts: ['Fab 10', 'Fab 11', 'Fab 12i', 'Fab 8'],
            correct: 2,
            explain: 'UMC\'s Singapore Fab 12i is continuously expanding, handling mature processes and some advanced packaging as a key overseas capacity hub.' }
    },
  ];

  let lang = 'zh';
  let submitted = false;

  function getLang() {
    const s = document.querySelector('[data-zh][data-en]');
    if (s) return s.textContent.trim() === s.dataset.zh ? 'zh' : 'en';
    return 'zh';
  }

  function render() {
    const wrap = document.getElementById('quizWrap');
    if (!wrap) return;
    lang = getLang();
    submitted = false;
    wrap.innerHTML = '';

    QUESTIONS.forEach((q, qi) => {
      const d = q[lang];
      const div = document.createElement('div');
      div.className = 'quiz-question';
      div.innerHTML = `
        <p class="quiz-q-text"><span class="quiz-q-num">Q${qi+1}.</span>${d.q}</p>
        <div class="quiz-options">
          ${d.opts.map((opt, oi) => `
            <label class="quiz-option" data-qi="${qi}" data-oi="${oi}">
              <input type="radio" name="q${qi}" value="${oi}">
              <span class="quiz-option-dot"></span>
              <span>${opt}</span>
            </label>
          `).join('')}
        </div>
        <div class="quiz-explain" id="explain-${qi}">${d.explain}</div>
      `;
      wrap.appendChild(div);
    });

    // Click options
    wrap.querySelectorAll('.quiz-option').forEach(opt => {
      opt.addEventListener('click', () => {
        if (submitted) return;
        const qi = opt.dataset.qi;
        wrap.querySelectorAll(`.quiz-option[data-qi="${qi}"]`).forEach(o => o.classList.remove('selected'));
        opt.classList.add('selected');
        opt.querySelector('input').checked = true;
      });
    });

    // Submit button
    const submitWrap = document.createElement('div');
    submitWrap.className = 'quiz-submit-wrap';
    submitWrap.innerHTML = `
      <button class="quiz-submit" id="quizSubmit" data-zh="提交答案" data-en="Submit Answers">提交答案</button>
      <div class="quiz-score" id="quizScore"></div>
      <button class="quiz-retry" id="quizRetry" data-zh="重新作答" data-en="Try Again">重新作答</button>
    `;
    wrap.appendChild(submitWrap);

    document.getElementById('quizSubmit').addEventListener('click', () => {
      let score = 0;
      QUESTIONS.forEach((q, qi) => {
        const d = q[lang];
        const selected = wrap.querySelector(`.quiz-option[data-qi="${qi}"].selected`);
        const opts = wrap.querySelectorAll(`.quiz-option[data-qi="${qi}"]`);
        opts.forEach(o => {
          o.classList.add('disabled');
          const oi = parseInt(o.dataset.oi);
          if (oi === d.correct) o.classList.add('show-correct');
        });
        if (selected) {
          const selectedOi = parseInt(selected.dataset.oi);
          if (selectedOi === d.correct) { selected.classList.add('correct'); score++; }
          else selected.classList.add('wrong');
        }
        document.getElementById(`explain-${qi}`).classList.add('show');
      });
      submitted = true;
      const scoreEl = document.getElementById('quizScore');
      const total = QUESTIONS.length;
      scoreEl.textContent = lang === 'zh'
        ? `你答對了 ${score} / ${total} 題 ${score === total ? '🎉 滿分！' : score >= total*0.6 ? '👍 不錯！' : '💪 再試一次！'}`
        : `You got ${score} / ${total} correct ${score === total ? '🎉 Perfect!' : score >= total*0.6 ? '👍 Good job!' : '💪 Try again!'}`;
      scoreEl.classList.add('show');
      document.getElementById('quizSubmit').disabled = true;
      document.getElementById('quizRetry').classList.add('show');
    });

    document.getElementById('quizRetry').addEventListener('click', render);
  }

  document.getElementById('langBtn')?.addEventListener('click', () => {
    setTimeout(render, 80);
  });

  render();
})();

/* ══ 11. PROFILE CARD ══ */
(function () {
  const pill    = document.getElementById('studentPill');
  const overlay = document.getElementById('profileOverlay');
  const closeBtn= document.getElementById('profileClose');

  pill?.addEventListener('click', () => overlay?.classList.add('show'));
  closeBtn?.addEventListener('click', () => overlay?.classList.remove('show'));
  overlay?.addEventListener('click', e => {
    if (e.target === overlay) overlay.classList.remove('show');
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') overlay?.classList.remove('show');
  });
})();

/* ══ MOBILE: dismiss tooltips on tap outside ══ */
(function () {
  if (window.innerWidth > 768) return;

  function resetTimelineCircles() {
    const svg = document.getElementById('timelineSvg');
    if (!svg) return;
    const navyFill = getComputedStyle(document.documentElement).getPropertyValue('--navy').trim() || '#0b2545';
    svg.querySelectorAll('circle[data-active="1"]').forEach(c => {
      c.setAttribute('r', '30');
      c.setAttribute('fill', navyFill);
      c.removeAttribute('data-active');
    });
  }

  document.addEventListener('touchstart', e => {
    // gcap-tooltip: dismiss only if tapping outside both tooltip AND its trigger nodes
    const gcap = document.getElementById('gcapTooltip');
    if (gcap && gcap.classList.contains('show')) {
      const onNode    = !!e.target.closest('.gcap-node');
      const onTooltip = gcap.contains(e.target);
      if (!onNode && !onTooltip) gcap.classList.remove('show');
    }

    // timeline tooltip + circle reset
    const tl  = document.getElementById('tlTooltip');
    const svg = document.getElementById('timelineSvg');
    if (tl && tl.classList.contains('show') && !tl.contains(e.target)) {
      if (!svg || !svg.contains(e.target)) {
        tl.classList.remove('show');
        resetTimelineCircles();
      }
    }

    // Leaflet map tooltips
    document.querySelectorAll('.leaflet-tooltip').forEach(lt => {
      if (!lt.contains(e.target) && !e.target.closest('.leaflet-marker-icon')) {
        lt.style.opacity = '0';
        setTimeout(() => lt.style.opacity = '', 200);
      }
    });
  }, { passive: true });
})();
