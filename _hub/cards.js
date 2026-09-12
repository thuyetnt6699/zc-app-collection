/* =========================================================
   CARDS — dựng toàn bộ giao diện kho dự án từ dữ liệu:
   thẻ, hình vẽ thủ tục, huy hiệu, bộ lọc theo lĩnh vực,
   ô tìm kiếm, dải chỉ số, trạng thái rỗng.
   Không có tên dự án nào bị viết cứng ở đây.
   ========================================================= */
(function () {
  'use strict';

  var PROJECTS = (window.HUB_PROJECTS || []).slice();
  var CATEGORIES = window.HUB_CATEGORIES || [];
  var prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* sắp xếp theo `order`, dự án không khai báo thì giữ nguyên thứ tự */
  PROJECTS.forEach(function (p, i) { if (typeof p.order !== 'number') p.order = 1000 + i; });
  PROJECTS.sort(function (a, b) { return a.order - b.order; });

  var STATUS_LABEL = { online: 'ĐANG CHẠY', beta: 'THỬ NGHIỆM', archived: 'LƯU TRỮ' };

  /* =========================================================
     PHẦN 1 — HÌNH VẼ THỦ TỤC (mỗi dự án một kiểu, tự vẽ bằng canvas)
     ========================================================= */
  var TAU = Math.PI * 2;
  function rgba(hex, a) {
    var h = String(hex || '#7df9ff').replace('#', '');
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    var n = parseInt(h, 16);
    if (isNaN(n)) n = 0x7df9ff;
    return 'rgba(' + ((n >> 16) & 255) + ',' + ((n >> 8) & 255) + ',' + (n & 255) + ',' + a + ')';
  }
  function starfieldMini(c, w, h, seed) {
    var i, x = seed || 1;
    for (i = 0; i < 26; i++) {
      x = (x * 9301 + 49297) % 233280;
      var rx = (x / 233280) * w;
      x = (x * 9301 + 49297) % 233280;
      var ry = (x / 233280) * h;
      c.fillStyle = 'rgba(220,240,255,' + (0.15 + (i % 5) * 0.06) + ')';
      c.fillRect(rx, ry, i % 7 === 0 ? 1.6 : 1, i % 7 === 0 ? 1.6 : 1);
    }
  }
  function glowDot(c, x, y, r, color, alpha) {
    var g = c.createRadialGradient(x, y, 0, x, y, r * 4.2);
    g.addColorStop(0, rgba(color, alpha));
    g.addColorStop(0.35, rgba(color, alpha * 0.35));
    g.addColorStop(1, rgba(color, 0));
    c.fillStyle = g;
    c.beginPath(); c.arc(x, y, r * 4.2, 0, TAU); c.fill();
    c.fillStyle = color;
    c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill();
  }

  var ART = {
    /* Hệ Mặt Trời: mặt trời + quỹ đạo ellipse + hành tinh quay */
    orbit: function (c, w, h, acc, t, seed) {
      starfieldMini(c, w, h, seed);
      var cx = w / 2, cy = h / 2;
      var tiltY = 0.36, tiltR = -0.28;
      c.save(); c.translate(cx, cy); c.rotate(tiltR);
      var orbits = [0.24, 0.36, 0.5];
      orbits.forEach(function (k) {
        c.strokeStyle = rgba(acc, 0.2);
        c.lineWidth = 1;
        c.beginPath(); c.ellipse(0, 0, w * k, h * k * tiltY, 0, 0, TAU); c.stroke();
      });
      var planets = [
        { k: 0.24, sp: 1.9, r: 2.4, col: acc },
        { k: 0.36, sp: -1.3, r: 3.1, col: '#ffd27d' },
        { k: 0.5, sp: 0.85, r: 3.8, col: '#8affc1' }
      ];
      planets.forEach(function (p) {
        var a = t * p.sp + p.k * 7;
        c.save();
        c.translate(Math.cos(a) * w * p.k, Math.sin(a) * h * p.k * tiltY);
        c.scale(1, 1 / (tiltY + 0.3));
        glowDot(c, 0, 0, p.r, p.col, 0.35);
        c.restore();
      });
      c.restore();
      glowDot(c, cx, cy, 6.5, acc, 0.5);
    },

    /* Flappy: ống nước chạy ngang + chim nhấp cánh */
    bird: function (c, w, h, acc, t, seed) {
      starfieldMini(c, w, h, seed);
      c.fillStyle = 'rgba(8,26,42,0.75)';
      c.fillRect(0, h * 0.82, w, h * 0.18);
      c.strokeStyle = rgba(acc, 0.35); c.lineWidth = 1;
      c.beginPath(); c.moveTo(0, h * 0.82); c.lineTo(w, h * 0.82); c.stroke();

      var span = w + 26;
      for (var i = 0; i < 3; i++) {
        var px = (((t * 34 + i * (span / 3)) % span)) - 13;
        var gapY = h * (0.42 + Math.sin(i * 2.1) * 0.06);
        var gapH = h * 0.28;
        c.fillStyle = rgba(acc, 0.28);
        c.strokeStyle = rgba(acc, 0.75);
        c.lineWidth = 1;
        [[0, gapY - gapH / 2], [gapY + gapH / 2, h * 0.82]].forEach(function (seg) {
          c.fillRect(px, seg[0], 11, seg[1] - seg[0]);
          c.strokeRect(px + 0.5, seg[0] + 0.5, 10, seg[1] - seg[0] - 1);
        });
      }

      var by = h * (0.45 + Math.sin(t * 2.6) * 0.1);
      var bx = w * 0.34;
      var flap = Math.sin(t * 7.5);
      c.save();
      c.translate(bx, by);
      c.fillStyle = acc;
      c.beginPath(); c.ellipse(0, 0, 6.5, 5, 0, 0, TAU); c.fill();
      c.fillStyle = rgba(acc, 0.9);
      c.beginPath();
      c.moveTo(-1, -1);
      c.quadraticCurveTo(-8, -4 - flap * 5, -10, 1);
      c.quadraticCurveTo(-6, 2, -1, 1);
      c.fill();
      c.fillStyle = '#ffb347';
      c.beginPath(); c.moveTo(5.4, -0.6); c.lineTo(10, 0.6); c.lineTo(5.4, 1.9); c.fill();
      c.fillStyle = '#0b1a28';
      c.beginPath(); c.arc(3.1, -1.4, 1.25, 0, TAU); c.fill();
      c.restore();
    },

    /* Whack-a-mole: lưới ô đất + chuột đội lên khỏi hang */
    mole: function (c, w, h, acc, t, seed) {
      c.fillStyle = 'rgba(24,10,26,0.5)';
      c.fillRect(0, 0, w, h);
      var rows = 3, cols = 3, pad = w * 0.06;
      var cw = (w - pad * 2) / cols, ch = (h - pad * 2) / rows;
      for (var r = 0; r < rows; r++) {
        for (var q = 0; q < cols; q++) {
          var x = pad + q * cw, y = pad + r * ch;
          c.strokeStyle = rgba(acc, 0.18);
          c.lineWidth = 1;
          c.strokeRect(x + 0.5, y + 0.5, cw - 1, ch - 1);
          c.fillStyle = 'rgba(0,0,0,0.35)';
          c.beginPath();
          c.ellipse(x + cw / 2, y + ch * 0.74, cw * 0.28, ch * 0.13, 0, 0, TAU);
          c.fill();
        }
      }
      /* con chuột: đội lên rồi hạ xuống theo nhịp */
      var cyc = (t * 0.9) % 3;
      var rise = cyc < 1 ? Math.sin(cyc * Math.PI) : 0;
      var hole = { x: pad + cw * 1.5, y: pad + ch * 1.5 };
      if (rise > 0.02) {
        var headY = hole.y + ch * 0.5 - rise * ch * 0.72;
        c.save();
        c.fillStyle = '#c98bff';
        c.beginPath(); c.arc(hole.x, headY, cw * 0.24, 0, TAU); c.fill();
        c.fillStyle = '#e0b6ff';
        c.beginPath(); c.ellipse(hole.x, headY + cw * 0.05, cw * 0.13, cw * 0.1, 0, 0, TAU); c.fill();
        c.fillStyle = '#2a1030';
        c.beginPath(); c.arc(hole.x - cw * 0.09, headY - cw * 0.06, 1.7, 0, TAU); c.fill();
        c.beginPath(); c.arc(hole.x + cw * 0.09, headY - cw * 0.06, 1.7, 0, TAU); c.fill();
        c.restore();
        glowDot(c, hole.x, hole.y, 3.2, acc, 0.3);
      }
      /* mục tiêu nhấp nháy */
      c.strokeStyle = rgba(acc, 0.5);
      c.beginPath();
      c.arc(hole.x, hole.y + ch * 0.5, cw * 0.3 + Math.abs(Math.sin(t * 3)) * 4, 0, TAU);
      c.stroke();
    },

    /* Phân số: hai phân số nổi, có gạch ngang và thanh trượt */
    fraction: function (c, w, h, acc, t, seed) {
      var g = c.createLinearGradient(0, 0, w, h);
      g.addColorStop(0, 'rgba(6,26,22,0.85)');
      g.addColorStop(1, 'rgba(4,12,20,0.85)');
      c.fillStyle = g;
      c.fillRect(0, 0, w, h);
      for (var i = 0; i < 6; i++) {
        var x = (w / 6) * i;
        c.fillStyle = rgba(acc, i % 2 ? 0.05 : 0.09);
        c.fillRect(x, 0, w / 6, h);
      }

      function drawFraction(fx, fy, num, den, s, color) {
        c.save();
        c.translate(fx, fy);
        c.fillStyle = color;
        c.textAlign = 'center';
        c.textBaseline = 'middle';
        c.font = '700 ' + (13 * s) + 'px Orbitron, Rajdhani, sans-serif';
        c.fillText(num, 0, -9 * s);
        c.fillText(den, 0, 10 * s);
        c.fillRect(-11 * s, 0, 22 * s, 1.6 * s);
        c.restore();
      }
      drawFraction(w * 0.32, h * 0.42, '1', '2', 1, acc);
      drawFraction(w * 0.68, h * 0.42, '3', '4', 1, '#ffd27d');

      c.strokeStyle = rgba(acc, 0.35);
      c.lineWidth = 1;
      c.beginPath();
      c.moveTo(w * 0.14, h * 0.72); c.lineTo(w * 0.86, h * 0.72);
      c.stroke();

      var pos = w * (0.14 + (0.72 * (0.5 + Math.sin(t * 1.1) * 0.5)));
      glowDot(c, pos, h * 0.72, 2.6, acc, 0.45);
      c.fillStyle = rgba(acc, 0.6);
      c.font = '600 8px Orbitron, sans-serif';
      c.textAlign = 'center';
      c.fillText('QUY ĐỒNG', w * 0.5, h * 0.88);
    },

    /* Mặc định: mạng lưới nút + tín hiệu chạy */
    generic: function (c, w, h, acc, t, seed) {
      starfieldMini(c, w, h, seed);
      var cx = w / 2, cy = h / 2;
      [0.34, 0.26, 0.18].forEach(function (k, i) {
        c.strokeStyle = rgba(acc, 0.22 - i * 0.05);
        c.lineWidth = 1;
        c.beginPath();
        c.arc(cx, cy, Math.min(w, h) * k, 0, TAU);
        c.stroke();
      });
      for (var i = 0; i < 6; i++) {
        var a = (i / 6) * TAU + t * 0.4;
        var x = cx + Math.cos(a) * Math.min(w, h) * 0.26;
        var y = cy + Math.sin(a) * Math.min(w, h) * 0.26;
        c.fillStyle = rgba(acc, 0.7);
        c.beginPath(); c.arc(x, y, 1.8, 0, TAU); c.fill();
      }
      glowDot(c, cx, cy, 4, acc, 0.45);
    }
  };

  function drawArt(canvas, project, t, quality, forcedW, forcedH) {
    var c = canvas.getContext('2d');
    if (!c) return;
    var dpr = Math.min(window.devicePixelRatio || 1, quality === 'high' ? 2 : 1.75);
    var w = forcedW || canvas.clientWidth || 84;
    var h = forcedH || canvas.clientHeight || 84;
    var pw = Math.max(1, Math.round(w * dpr));
    var ph = Math.max(1, Math.round(h * dpr));
    if (canvas.width !== pw || canvas.height !== ph) {
      canvas.width = pw;
      canvas.height = ph;
    }
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    c.clearRect(0, 0, w, h);
    var fn = ART[(project && project.icon) || 'generic'] || ART.generic;
    var seed = 0;
    var id = String((project && project.id) || 'x');
    for (var i = 0; i < id.length; i++) seed = (seed * 31 + id.charCodeAt(i)) % 233280;
    fn(c, w, h, (project && project.accent) || '#7df9ff', t, seed || 7);
  }

  /* =========================================================
     PHẦN 2 — DỰNG THẺ
     ========================================================= */
  var badgeText = function (p) {
    var out = '<span class="badge ' + (p.status || 'online') + '">' + (STATUS_LABEL[p.status] || 'ĐANG CHẠY') + '</span>';
    if (p.needsNetwork) out += '<span class="badge net">CẦN MẠNG</span>';
    if (p.demo && !p.demoDisabled) out += '<span class="badge demo">▶ DEMO</span>';
    return out;
  };

  function buildCard(p, index) {
    var el = document.createElement('article');
    el.className = 'card';
    el.setAttribute('role', 'listitem');
    el.setAttribute('data-id', p.id);
    el.setAttribute('data-category', p.category || '');
    el.setAttribute('data-status', p.status || 'online');
    el.style.setProperty('--card-accent', p.accent || '#7df9ff');
    el.style.setProperty('--card-accent-soft', rgba(p.accent, 0.16));
    el.style.setProperty('--card-accent-dim', rgba(p.accent, 0.3));
    el.style.setProperty('--float-delay', ((index % 7) * 0.55).toFixed(2) + 's');

    var tech = (p.tech || []).map(function (x) { return '<span class="chip">' + x + '</span>'; }).join('');

    el.innerHTML =
      '<button class="card-hit" type="button" aria-label="Xem chi tiết dự án ' + p.name + '"></button>' +
      '<div class="card-inner">' +
        '<div class="card-top">' +
          '<div class="card-art"><canvas></canvas></div>' +
          '<div class="card-badges">' + badgeText(p) + '</div>' +
        '</div>' +
        '<div class="card-heading">' +
          '<span class="card-idx">DỰ ÁN ' + String(index + 1).padStart(2, '0') + ' / ' + (p.year || '—') + '</span>' +
          '<h3 class="card-name">' + p.name + '</h3>' +
          (p.nameEn ? '<span class="card-en">' + p.nameEn + '</span>' : '') +
          (p.tagline ? '<span class="card-tagline">' + p.tagline + '</span>' : '') +
        '</div>' +
        '<p class="card-desc">' + (p.description || '') + '</p>' +
        (tech ? '<div class="card-chips">' + tech + '</div>' : '') +
        '<div class="card-foot">' +
          '<span class="card-cat">' + String(p.category || '').toUpperCase() + '</span>' +
          '<span class="card-go">CHI TIẾT <i>▸</i></span>' +
        '</div>' +
      '</div>' +
      /* nút vào thẳng dự án, luôn nằm trên vùng bấm mở bảng chi tiết */
      '<a class="card-cta" href="' + p.href + '" title="Mở dự án: ' + p.name + '">MỞ NGAY ▸</a>' +
      '<div class="card-corners" aria-hidden="true"><span></span><span></span><span></span><span></span></div>';

    return el;
  }

  /* =========================================================
     PHẦN 3 — TRẠNG THÁI LỌC
     ========================================================= */
  var state = { category: 'all', query: '' };
  var allCards = [];
  var visible = [];
  var visibleCanvas = new Map();

  var gridEl = document.getElementById('project-grid');
  var filtersEl = document.getElementById('filters');
  var searchEl = document.getElementById('search-input');
  var clearEl = document.getElementById('search-clear');
  var emptyEl = document.getElementById('empty-state');
  var bayCountEl = document.getElementById('bay-count');

  var esc = function (s) { return String(s).replace(/[&<>"']/g, function (ch) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]; }); };

  /* ---- bộ lọc ---- */
  function buildFilters() {
    if (!filtersEl) return;
    var counts = {};
    PROJECTS.forEach(function (p) { counts[p.category] = (counts[p.category] || 0) + 1; });

    var html = '<button class="pill" type="button" data-cat="all" aria-pressed="true">TẤT CẢ <span class="n">' + PROJECTS.length + '</span></button>';
    CATEGORIES.forEach(function (c) {
      var n = counts[c.id] || 0;
      if (!n) return;
      html += '<button class="pill" type="button" data-cat="' + esc(c.id) + '" aria-pressed="false" title="' + esc(c.en || c.name) + '">' +
              esc(c.name) + ' <span class="n">' + n + '</span></button>';
    });
    filtersEl.innerHTML = html;

    filtersEl.addEventListener('click', function (e) {
      var btn = e.target.closest ? e.target.closest('.pill') : null;
      if (!btn) return;
      state.category = btn.getAttribute('data-cat') || 'all';
      Array.prototype.forEach.call(filtersEl.querySelectorAll('.pill'), function (b) {
        b.setAttribute('aria-pressed', b === btn ? 'true' : 'false');
      });
      apply();
    });
  }

  /* ---- lọc + cập nhật ---- */
  function matches(p) {
    if (state.category !== 'all' && p.category !== state.category) return false;
    if (!state.query) return true;
    var hay = [p.name, p.nameEn, p.tagline, p.description, p.category, (p.tech || []).join(' '), p.id]
      .join(' ').toLowerCase();
    return hay.indexOf(state.query) >= 0;
  }

  function apply() {
    visible = [];
    allCards.forEach(function (card, i) {
      var p = PROJECTS[i];
      var ok = matches(p);
      card.classList.toggle('hidden', !ok);
      if (ok) { visible.push({ project: p, el: card }); }
    });

    if (emptyEl) emptyEl.hidden = visible.length > 0;
    if (bayCountEl) bayCountEl.textContent = 'BAY ' + visible.length + '/' + PROJECTS.length;

    // sắp xếp lại DOM theo thứ tự ban đầu (đã đúng), chỉ cần đảm bảo thẻ hiện đúng vị trí
    visible.forEach(function (v, i) { v.el.style.order = String(i); });
    allCards.forEach(function (card) { if (card.classList.contains('hidden')) card.style.order = ''; });

    if (clearEl) clearEl.classList.toggle('show', !!state.query);
    if (window.HUB_OVERLAY && window.HUB_OVERLAY.onListChanged) window.HUB_OVERLAY.onListChanged(getList(), getPosition);
  }

  function getList() { return visible.map(function (v) { return v.project; }); }

  function getPosition() {
    var list = getList();
    var i = list.indexOf(currentProject());
    return i < 0 ? 0 : i;
  }

  var activeProject = null;
  function currentProject() { return activeProject; }
  function setActiveProject(p) {
    activeProject = p;
    allCards.forEach(function (card) {
      card.classList.toggle('active', !!p && card.getAttribute('data-id') === p.id);
    });
  }

  /* ---- tìm kiếm ---- */
  if (searchEl) {
    var st = 0;
    searchEl.addEventListener('input', function () {
      clearTimeout(st);
      st = setTimeout(function () {
        state.query = searchEl.value.trim().toLowerCase();
        apply();
      }, 90);
    });
    searchEl.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && searchEl.value) {
        e.stopPropagation();
        searchEl.value = '';
        state.query = '';
        apply();
      }
    });
  }
  if (clearEl) {
    clearEl.addEventListener('click', function () {
      if (searchEl) searchEl.value = '';
      state.query = '';
      apply();
      if (searchEl) searchEl.focus();
    });
  }

  /* =========================================================
     PHẦN 4 — HIỆN DẦN KHI CUỘN TỚI
     ========================================================= */
  var io = null;
  function setupReveal() {
    if (!('IntersectionObserver' in window)) {
      allCards.forEach(function (c) { c.classList.add('in'); });
      scheduleLoop();
      return;
    }
    var stagger = 0;
    io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var card = en.target;
        // thẻ nào đã nằm sẵn trong khung nhìn thì hiện ngay, còn lại so le
        var delay = en.intersectionRatio > 0.6 ? 0 : Math.min(stagger * 60, 360);
        setTimeout(function () { card.classList.add('in'); }, delay);
        stagger++;
        io.unobserve(card);
      });
    }, { rootMargin: '0px 0px 120px 0px', threshold: 0.01 });

    allCards.forEach(function (c) { io.observe(c); });
    scheduleLoop();

    // lưới an toàn: sau 1,6 giây mọi thẻ chưa lộ diện đều được hiện
    setTimeout(function () {
      allCards.forEach(function (c) {
        if (!c.classList.contains('in')) {
          c.classList.add('in');
          if (io) io.unobserve(c);
        }
      });
    }, 1600);
  }

  function observeArt(card, canvas, project) {
    var entry = { el: card, canvas: canvas, project: project };
    if (!('IntersectionObserver' in window)) { visibleCanvas.set(card, entry); return; }
    var ob = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { visibleCanvas.set(card, entry); scheduleLoop(); }
        else visibleCanvas.delete(card);
      });
    }, { rootMargin: '80px' });
    ob.observe(canvas);
  }

  /* =========================================================
     PHẦN 5 — VÒNG LẶP VẼ HÌNH (chỉ vẽ canvas đang hiển thị)
     ========================================================= */
  var raf = 0;
  var running = false;
  var t0 = 0;
  var FPS_CAP = 26;

  function loop(now) {
    if (!running) return;
    if (visibleCanvas.size === 0) { running = false; raf = 0; return; }
    raf = requestAnimationFrame(loop);
    if (!t0) t0 = now;
    var el = (now - t0) / 1000;
    if (now - (loop._last || 0) < 1000 / FPS_CAP) return;
    loop._last = now;

    visibleCanvas.forEach(function (entry) {
      if (entry.el.classList.contains('hidden')) return;
      drawArt(entry.canvas, entry.project, el, 'low');
    });
  }

  function scheduleLoop() {
    if (prefersReduced || running || visibleCanvas.size === 0) return;
    running = true;
    t0 = 0;
    raf = requestAnimationFrame(loop);
  }
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
      running = false;
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    } else {
      scheduleLoop();
    }
  });

  /* =========================================================
     PHẦN 6 — DẢI CHỈ SỐ + ĐẾM TĂNG DẦN
     ========================================================= */
  /* Ghi thẳng giá trị thật vào DOM rồi để CSS lo phần "nảy số".
     Nhờ vậy dù khung hình bị dừng (tab ẩn, máy yếu) con số vẫn luôn đúng. */
  function countUp(el, target) {
    if (!el) return;
    el.textContent = String(target);
    if (prefersReduced) return;
    el.classList.remove('counting');
    // buộc trình duyệt tính lại để animation chạy lại được
    void el.offsetWidth;
    el.classList.add('counting');
  }

  function fillMetrics() {
    var cats = {};
    var tech = {};
    var online = 0;
    PROJECTS.forEach(function (p) {
      cats[p.category] = 1;
      (p.tech || []).forEach(function (x) { tech[x] = 1; });
      if ((p.status || 'online') === 'online') online++;
    });
    countUp(document.getElementById('m-total'), PROJECTS.length);
    countUp(document.getElementById('m-cats'), Object.keys(cats).length);
    countUp(document.getElementById('m-online'), online);
    countUp(document.getElementById('m-tech'), Object.keys(tech).length);
    var ft = document.getElementById('foot-total');
    if (ft) ft.textContent = String(PROJECTS.length);
  }

  /* =========================================================
     PHẦN 7 — KHỞI ĐỘNG
     ========================================================= */
  function render() {
    if (!gridEl) return;
    var frag = document.createDocumentFragment();
    allCards = [];

    PROJECTS.forEach(function (p, i) {
      var card = buildCard(p, i);
      var canvas = card.querySelector('.card-art canvas');
      allCards.push(card);
      frag.appendChild(card);
      if (canvas) {
        drawArt(canvas, p, 0, 'low');       // vẽ ngay khung đầu để không thấy ô trống
        observeArt(card, canvas, p);
      }
      var hit = card.querySelector('.card-hit');
      if (hit) {
        hit.addEventListener('click', function () {
          setActiveProject(p);
          if (window.HUB_OVERLAY) window.HUB_OVERLAY.open(p, getList());
        });
      }
    });

    gridEl.appendChild(frag);
    buildFilters();
    apply();
    fillMetrics();
    setupReveal();
    if (window.HUB_SCENE3D) window.HUB_SCENE3D.refresh();
  }

  window.HUB_CARDS = {
    projects: PROJECTS,
    categories: CATEGORIES,
    setActiveProject: setActiveProject,
    getList: getList,
    getPosition: getPosition,
    apply: apply,
    drawArt: drawArt,
    accentSoft: rgba
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', render);
  else render();
})();
