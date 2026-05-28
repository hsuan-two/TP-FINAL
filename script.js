(function () {
  'use strict';

  let lang  = 'zh';
  let theme = 'light';
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

  /* ══ LANGUAGE ══ */
  function setLang(l) {
    lang = l;
    langBtn.textContent = lang === 'zh' ? 'EN' : '中';
    document.querySelectorAll('[data-zh][data-en]').forEach(el => {
      el.textContent = el.dataset[lang];
    });
  }
  langBtn.addEventListener('click', () => setLang(lang === 'zh' ? 'en' : 'zh'));

  /* ══ THEME ══ */
  function setTheme(t) {
    theme = t;
    root.setAttribute('data-theme', theme);
    themeBtn.textContent = theme === 'dark' ? '☀' : '☾';
    drawTimeline();
  }
  themeBtn.addEventListener('click', () => setTheme(theme === 'light' ? 'dark' : 'light'));
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) setTheme('dark');

  /* ══ SIDEMENU ══ */
  const openMenu  = () => { sidemenu.classList.add('open'); overlay.classList.add('show'); hamburger.classList.add('open'); };
  const closeMenu = () => { sidemenu.classList.remove('open'); overlay.classList.remove('show'); hamburger.classList.remove('open'); };
  hamburger.addEventListener('click', openMenu);
  sidemenuClose.addEventListener('click', closeMenu);
  overlay.addEventListener('click', closeMenu);
  sidemenu.querySelectorAll('a.smlink').forEach(a => a.addEventListener('click', closeMenu));

  /* 所有 smgroup：hover 展開，mouseleave 收起 */
  document.querySelectorAll('.smgroup').forEach(group => {
    let leaveTimer = null;
    group.addEventListener('mouseenter', () => {
      clearTimeout(leaveTimer);
      group.classList.add('open');
    });
    group.addEventListener('mouseleave', () => {
      leaveTimer = setTimeout(() => group.classList.remove('open'), 180);
    });
  });

  /* ══ CAROUSEL — 5-card coverflow, no clones ══ */
  // Five cards sit in a fixed container; we move them with transform.
  // Positions relative to center: -2, -1, 0, +1, +2
  // When center advances by 1, each card's "slot" shifts left by 1 (mod 5).

  const N = cards.length; // 5

  // Slot offsets from center (in px) and scale
  const SLOT = [
    { x: -480, scale: 0.62, z: 0, opacity: 0.55 }, // far left
    { x: -250, scale: 0.80, z: 1, opacity: 0.78 }, // near left
    { x:    0, scale: 1.00, z: 2, opacity: 1.00 }, // center
    { x:  250, scale: 0.80, z: 1, opacity: 0.78 }, // near right
    { x:  480, scale: 0.62, z: 0, opacity: 0.55 }, // far right
  ];

  function applyPositions() {
    cards.forEach((card, cardIdx) => {
      // Which slot does this card occupy?
      // slot = (cardIdx - centerIndex + N) % N, mapped to -2..+2
      let slot = (cardIdx - centerIndex + N) % N;
      // slot: 0=center,1=+1,2=+2,3=-2,4=-1  → remap to 0..4 array index
      // We want: centerIndex→slot2, centerIndex+1→slot3, centerIndex+2→slot4, centerIndex-1→slot1, centerIndex-2→slot0
      const slotMap = [2, 3, 4, 0, 1]; // index 0..4 → SLOT array index
      const s = SLOT[slotMap[slot]];

      card.style.transform   = `translateX(${s.x}px) scale(${s.scale})`;
      card.style.zIndex      = s.z;
      card.style.opacity     = s.opacity;
      card.classList.toggle('is-center', slot === 0);
    });
    dots.forEach((dot, i) => dot.classList.toggle('active', i === centerIndex));
  }

  function advance(dir) {
    centerIndex = (centerIndex + dir + N) % N;
    applyPositions();
  }

  function startAuto() {
    stopAuto();
    autoTimer = setInterval(() => advance(1), 2500);
  }
  function stopAuto() { if (autoTimer) { clearInterval(autoTimer); autoTimer = null; } }

  dots.forEach((dot, i) => dot.addEventListener('click', () => {
    stopAuto(); centerIndex = i; applyPositions(); setTimeout(startAuto, 3000);
  }));

  // Touch swipe
  let touchStartX = 0;
  if (track) {
    track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; stopAuto(); }, { passive: true });
    track.addEventListener('touchend',   e => {
      const dx = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(dx) > 40) advance(dx < 0 ? 1 : -1);
      setTimeout(startAuto, 3000);
    }, { passive: true });
  }

  applyPositions();
  startAuto();

  // 點擊卡片 → 跳到對應 section
  cards.forEach(card => {
    card.addEventListener('click', () => {
      const targetId = card.dataset.target;
      if (!targetId) return;
      const section = document.getElementById(targetId);
      if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
  const TL_DATA = [
    { year: '1980',    zh: '聯電正式成立，自工研院相關資源分出，成為台灣首家民營積體電路公司。',            en: "UMC founded as Taiwan's first private IC company, spun out from ITRI." },
    { year: '1985',    zh: '股票公開上市。',                                                                 en: 'Listed on the Taiwan Stock Exchange.' },
    { year: '1995.07', zh: '轉型為純晶圓代工公司，營運模式正式從產品導向轉向代工服務。',                    en: 'Converted to a pure-play foundry model.' },
    { year: '1995.09', zh: '與美、加11家IC設計公司合資成立聯誠、聯瑞、聯嘉，並開始8吋晶圓廠生產。',       en: 'Joint-ventured with 11 North American IC firms; launched 8" fab production.' },
    { year: '1996',    zh: '陸續推進0.35μm、0.25μm、0.18μm等製程，提升技術能力。',                         en: 'Advanced process nodes from 0.35μm to 0.18μm.' },
    { year: '1998',    zh: '取得合泰半導體晶圓廠及日本新日鐵半導體晶圓廠，擴大生產據點。',                  en: 'Acquired fabs from HMC and Nippon Steel Semiconductor.' },
    { year: '1999',    zh: '南科12吋晶圓廠正式建廠。',                                                      en: 'Broke ground on 12" fab at Southern Taiwan Science Park.' },
    { year: '2000',    zh: '成為第一家在紐交所上市的台灣半導體公司。',                                      en: 'First Taiwanese semiconductor company listed on NYSE.' },
    { year: '2015',    zh: '中國廈門12吋晶圓廠正式建廠。',                                                  en: 'Established 12" fab in Xiamen, China.' },
    { year: '2019',    zh: '收購日本MIFS廠，更名為USJC。',                                                  en: "Acquired Japan's MIFS fab, renamed USJC." },
    { year: '2021',    zh: '加入RE100，宣示2050年達成淨零碳排。',                                           en: 'Joined RE100; pledged net-zero carbon by 2050.' },
    { year: '2024',    zh: '宣布與英特爾合作開發12nm製程。',                                                en: 'Announced collaboration with Intel on 12nm process.' },
  ];

  function getCSSVar(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || undefined;
  }

  function drawTimeline() {
    const svg = document.getElementById('timelineSvg');
    if (!svg) return;
    svg.innerHTML = '';

    // Layout: 3 rows × 4 cols, S-shape (row0: L→R, row1: R→L, row2: L→R)
    const W = 900, ROW_H = 200, PAD_TOP = 60, PAD_X = 90;
    const COLS = 4, ROWS = 3;
    const colW = (W - PAD_X * 2) / (COLS - 1);
    const totalH = PAD_TOP + ROW_H * (ROWS - 1) + PAD_TOP;
    svg.setAttribute('viewBox', `0 0 ${W} ${totalH}`);

    const navyFill  = getCSSVar('--navy')  || '#0b2545';
    const navy2     = getCSSVar('--navy2') || '#134074';
    const whiteFill = getCSSVar('--white') || '#ffffff';

    // Generate all 12 points in S order
    const pts = [];
    for (let row = 0; row < ROWS; row++) {
      const y = PAD_TOP + row * ROW_H;
      for (let col = 0; col < COLS; col++) {
        const c = (row % 2 === 0) ? col : (COLS - 1 - col); // reverse on odd rows
        const x = PAD_X + c * colW;
        pts.push({ x, y });
      }
    }

    // Draw solid S-path (cubic bezier through all pts)
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 1; i < pts.length; i++) {
      const p = pts[i - 1], c = pts[i];
      const mx = (p.x + c.x) / 2, my = (p.y + c.y) / 2;
      // Simple smooth curve
      if (p.y === c.y) {
        // same row → horizontal bezier
        d += ` C ${p.x + (c.x - p.x) * 0.4} ${p.y}, ${c.x - (c.x - p.x) * 0.4} ${c.y}, ${c.x} ${c.y}`;
      } else {
        // row transition → S-curve
        d += ` C ${p.x} ${p.y + ROW_H * 0.55}, ${c.x} ${c.y - ROW_H * 0.55}, ${c.x} ${c.y}`;
      }
    }

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', d);
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', navy2);
    path.setAttribute('stroke-width', '3');
    path.setAttribute('opacity', '0.45');
    svg.appendChild(path);

    // Circles + labels
    const R = 30; // circle radius — big enough to wrap text
    pts.forEach((pt, i) => {
      const item = TL_DATA[i];

      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', pt.x);
      circle.setAttribute('cy', pt.y);
      circle.setAttribute('r', R);
      circle.setAttribute('fill', navyFill);
      circle.setAttribute('stroke', whiteFill);
      circle.setAttribute('stroke-width', '3');
      circle.style.cursor = 'pointer';
      circle.style.transition = 'r .2s, fill .2s';

      // Year text — split into two lines if has dot (1995.07)
      const parts = item.year.split('.');
      if (parts.length === 2) {
        const t1 = makeSvgText(pt.x, pt.y - 7, parts[0], '11', '#fff');
        const t2 = makeSvgText(pt.x, pt.y + 9, '.' + parts[1], '10', 'rgba(255,255,255,0.75)');
        circle.addEventListener('mouseenter', e => { circle.setAttribute('r', R + 5); circle.setAttribute('fill', '#1e88e5'); showTooltip(e, item); });
        circle.addEventListener('mousemove', moveTooltip);
        circle.addEventListener('mouseleave', () => { circle.setAttribute('r', R); circle.setAttribute('fill', navyFill); hideTooltip(); });
        svg.appendChild(circle); svg.appendChild(t1); svg.appendChild(t2);
      } else {
        const t1 = makeSvgText(pt.x, pt.y + 4, item.year, '12', '#fff');
        circle.addEventListener('mouseenter', e => { circle.setAttribute('r', R + 5); circle.setAttribute('fill', '#1e88e5'); showTooltip(e, item); });
        circle.addEventListener('mousemove', moveTooltip);
        circle.addEventListener('mouseleave', () => { circle.setAttribute('r', R); circle.setAttribute('fill', navyFill); hideTooltip(); });
        svg.appendChild(circle); svg.appendChild(t1);
      }
    });
  }

  function makeSvgText(x, y, text, size, fill) {
    const t = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    t.setAttribute('x', x);
    t.setAttribute('y', y);
    t.setAttribute('text-anchor', 'middle');
    t.setAttribute('fill', fill);
    t.setAttribute('font-size', size);
    t.setAttribute('font-family', 'DM Mono, monospace');
    t.setAttribute('font-weight', '600');
    t.setAttribute('pointer-events', 'none');
    t.textContent = text;
    return t;
  }

  const tooltip = document.getElementById('tlTooltip');
  function showTooltip(e, item) {
    if (!tooltip) return;
    tooltip.querySelector('.tl-tooltip-year').textContent = item.year;
    tooltip.querySelector('.tl-tooltip-text').textContent = lang === 'zh' ? item.zh : item.en;
    tooltip.classList.add('show');
    moveTooltip(e);
  }
  function moveTooltip(e) {
    if (!tooltip) return;
    const wrap = document.querySelector('.timeline-wrap');
    const wr   = wrap.getBoundingClientRect();
    let x = e.clientX - wr.left + 24;
    let y = e.clientY - wr.top  - 20;
    const tw = tooltip.offsetWidth || 220;
    const th = tooltip.offsetHeight || 80;
    if (x + tw > wr.width - 8)  x = e.clientX - wr.left - tw - 24;
    if (y + th > wr.height - 8) y = wr.height - th - 8;
    if (y < 0) y = 4;
    tooltip.style.left = x + 'px';
    tooltip.style.top  = y + 'px';
  }
  function hideTooltip() { tooltip && tooltip.classList.remove('show'); }

  /* ══ INIT ══ */
  setLang('zh');
  requestAnimationFrame(() => drawTimeline());

})();

/* ══ ORG CHART ══ */
(function () {
  const ORG_TEXT = {
    gov: {
      zh: '聯電的治理層主要由董事會及相關委員會組成，負責監督公司整體經營方向、公司治理與風險控管，確保企業決策符合長期發展與利害關係人的期待。對聯電而言，治理層不只是管理制度的核心，也是在半導體產業中維持企業穩定與永續發展的重要基礎。',
      en: 'UMC\'s governance layer consists primarily of the Board of Directors and related committees, responsible for overseeing the company\'s overall business direction, corporate governance, and risk management to ensure decisions align with long-term development and stakeholder expectations.'
    },
    mgmt: {
      zh: '聯電的經營層由高階管理團隊負責，主要任務是將公司策略轉化為具體行動，並帶領各部門推動日常營運。由於聯電屬於晶圓代工產業，經營層除了要掌握市場變化與客戶需求，也必須同時兼顧產能安排、技術發展與全球布局，才能維持企業競爭力。',
      en: 'UMC\'s management layer is led by the senior management team, whose primary mission is to translate corporate strategy into concrete actions and drive daily operations across departments, balancing market dynamics, customer needs, capacity planning, technology development, and global positioning.'
    },
    func: {
      zh: '聯電的功能部門涵蓋研發、技術服務、業務、製造品管、管理與財務等單位，分別負責技術創新、客戶支援、生產管理與後勤運作。這些部門共同支撐聯電的晶圓代工本業，讓公司能在技術、品質與營運效率上保持穩定表現。',
      en: 'UMC\'s functional departments span R&D, technical services, sales, manufacturing quality, administration, and finance — collectively supporting UMC\'s foundry business and enabling stable performance in technology, quality, and operational efficiency.'
    }
  };

  let currentKey = 'gov';
  let currentLang = 'zh';

  const descText = document.getElementById('orgDescText');
  const btns = Array.from(document.querySelectorAll('.org-btn'));

  function renderDesc() {
    if (!descText) return;
    descText.textContent = ORG_TEXT[currentKey][currentLang];
  }

  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentKey = btn.dataset.key;
      renderDesc();
    });
  });

  // Sync with lang toggle
  const langBtn = document.getElementById('langBtn');
  if (langBtn) {
    langBtn.addEventListener('click', () => {
      setTimeout(() => {
        const s = document.querySelector('[data-zh][data-en]');
        if (s) currentLang = (s.textContent.trim() === s.dataset.zh) ? 'zh' : 'en';
        renderDesc();
      }, 60);
    });
  }

  // Animate bars on scroll into view
  const bars = document.querySelectorAll('.process-bar-fill');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const pct = e.target.dataset.pct || '0';
        e.target.style.width = pct + '%';
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.3 });
  bars.forEach(b => {
    b.style.width = '0%';
    observer.observe(b);
  });

  renderDesc();
})();


/* ══ WORLD MAP — Leaflet.js ══ */
(function () {
  const SITES = [
    { id:'tw', lat:23.7,  lng:120.9, nameZh:'台灣總部',        nameEn:'Taiwan HQ',
      textZh:'核心研發中心與產能支柱，主攻最先進的成熟製程工藝。',
      textEn:'Core R&D center and production pillar, focusing on the most advanced mature process technologies.',
      type:'fab' },
    { id:'cn', lat:24.5,  lng:118.1, nameZh:'中國廠（廈門）',  nameEn:'China Fab (Xiamen)',
      textZh:'聯電的中國廠主要是位在福建廈門的12吋晶圓廠聯芯，屬於聯電在中國的重要製造據點。',
      textEn:"UMC's China fab is the 12\" wafer fab HLMC in Xiamen — a key manufacturing base in China.",
      type:'fab' },
    { id:'sg', lat:1.35,  lng:103.8, nameZh:'新加坡廠',        nameEn:'Singapore Fab',
      textZh:'東南亞晶圓製造與交付核心基地，擴大全球佈局的領頭羊。',
      textEn:"Core hub for wafer manufacturing in Southeast Asia, spearheading UMC's global expansion.",
      type:'fab' },
    { id:'jp', lat:34.7,  lng:136.5, nameZh:'日本廠 (USJC)',   nameEn:'Japan Fab (USJC)',
      textZh:'深耕車載供應鏈；2019年收購MIFS廠更名USJC，強化日本在地服務能力。',
      textEn:'Deepening automotive supply chain; acquired MIFS in 2019, renamed USJC.',
      type:'fab' },
    { id:'us', lat:37.4,  lng:-122.0,nameZh:'Sunnyvale（美國）',nameEn:'Sunnyvale, USA',
      textZh:'深耕車載供應鏈；與 Intel 展開 12nm 輕資產共同研發合作。',
      textEn:'Deepening automotive supply chain; collaborating with Intel on 12nm co-development.',
      type:'fab' },
    { id:'nl', lat:52.1,  lng:5.3,   nameZh:'荷蘭辦公據點',    nameEn:'Netherlands Office',
      textZh:'歐洲辦公據點，服務歐洲客戶需求。',
      textEn:'European office serving regional customer needs.',
      type:'office' },
    { id:'kr', lat:37.5,  lng:127.0, nameZh:'韓國辦公據點',    nameEn:'Korea Office',
      textZh:'韓國辦公據點，服務東北亞客戶需求。',
      textEn:'Korea office serving Northeast Asian customer needs.',
      type:'office' },
  ];

  let currentLang = 'zh';
  let mapMarkers = [];

  function makeIcon(type) {
    const color = type === 'fab' ? '#0b2545' : '#1e88e5';
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="28" viewBox="0 0 22 28">
      <circle cx="11" cy="11" r="9" fill="${color}" stroke="#fff" stroke-width="2"/>
      <line x1="11" y1="20" x2="11" y2="27" stroke="${color}" stroke-width="2"/>
    </svg>`;
    return L.divIcon({
      html: svg, className: '', iconSize: [22,28], iconAnchor: [11,28], popupAnchor: [0,-28]
    });
  }

  function initMap() {
    const el = document.getElementById('worldMap');
    if (!el || !window.L) return;

    const map = L.map('worldMap', {
      center: [22, 30],
      zoom: 2,
      zoomControl: false,
      scrollWheelZoom: false,
      dragging: false,
      touchZoom: false,
      doubleClickZoom: false,
      boxZoom: false,
      keyboard: false,
      attributionControl: false
    });

    // Use CartoDB Positron — clean, grey, no distracting labels
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '© OpenStreetMap © CARTO',
      subdomains: 'abcd', maxZoom: 19
    }).addTo(map);

    SITES.forEach(s => {
      // Tooltip direction: NL and US point downward to avoid edge clipping
      const ttDir = (s.id === 'nl' || s.id === 'us') ? 'bottom' : 'top';
      const ttOffset = ttDir === 'bottom' ? [0, 10] : [0, -28];

      const marker = L.marker([s.lat, s.lng], { icon: makeIcon(s.type) }).addTo(map);

      // Use tooltip instead of popup — avoids flicker caused by popup covering the marker
      const isEdge = (s.id === 'nl' || s.id === 'us');
      marker.bindTooltip(
        `<div class="lf-tip-name">${s.nameZh}</div>
         <div class="lf-tip-name-en">${s.nameEn}</div>
         <div class="lf-tip-text">${currentLang==='zh'?s.textZh:s.textEn}</div>`,
        {
          permanent: false,
          sticky: false,
          direction: isEdge ? 'bottom' : 'top',
          offset: isEdge ? [0, 14] : [0, -14],
          className: 'lf-tooltip',
          opacity: 1
        }
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

    // Invalidate size after section becomes visible
    setTimeout(() => map.invalidateSize(), 400);
  }

  // Wait for Leaflet to load
  if (window.L) { initMap(); }
  else { window.addEventListener('load', initMap); }
})();

/* ══ BMC FLIP ══ */
document.querySelectorAll('.bmc-cell').forEach(cell => {
  cell.addEventListener('click', () => cell.classList.add('flipped'));
  cell.addEventListener('mouseleave', () => cell.classList.remove('flipped'));
});
