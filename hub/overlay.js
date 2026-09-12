/* =========================================================
   OVERLAY — bảng chi tiết dự án.
   Chỉ có MỘT bảng duy nhất cho mọi dự án: nội dung được đổ từ
   dữ liệu, nên thêm dự án mới không phải viết thêm markup.
   Bàn phím: Esc đóng · ←/→ chuyển dự án · Tab kẹp trong bảng.
   ========================================================= */
(function () {
  'use strict';

  var el = {
    root: document.getElementById('detail'),
    backdrop: document.querySelector('#detail [data-close]'),
    panel: document.querySelector('#detail .detail-panel'),
    close: document.getElementById('detail-close'),
    artWrap: document.getElementById('detail-art'),
    art: document.querySelector('#detail-art canvas'),
    cat: document.getElementById('detail-cat'),
    cat2: document.getElementById('detail-cat2'),
    name: document.getElementById('detail-name'),
    en: document.getElementById('detail-en'),
    tagline: document.getElementById('detail-tagline'),
    desc: document.getElementById('detail-desc'),
    status: document.getElementById('detail-status'),
    year: document.getElementById('detail-year'),
    net: document.getElementById('detail-net'),
    techWrap: document.getElementById('detail-tech-wrap'),
    tech: document.getElementById('detail-tech'),
    open: document.getElementById('detail-open'),
    demo: document.getElementById('detail-demo'),
    prev: document.getElementById('detail-prev'),
    next: document.getElementById('detail-next'),
    pos: document.getElementById('detail-pos'),
    tip: document.getElementById('detail-tip')
  };

  if (!el.root || !el.panel) return;

  var prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var STATUS_LABEL = { online: 'ĐANG CHẠY', beta: 'THỬ NGHIỆM', archived: 'LƯU TRỮ' };
  var CAT_EN = {};
  (window.HUB_CATEGORIES || []).forEach(function (c) { CAT_EN[c.id] = c.en || ''; });

  var list = [];            // danh sách đang hiển thị (đã lọc)
  var index = -1;
  var lastFocus = null;
  var isOpen = false;
  var raf = 0;
  var t0 = 0;

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (ch) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch];
    });
  }
  function label(id) {
    var arr = window.HUB_CATEGORIES || [];
    for (var i = 0; i < arr.length; i++) if (arr[i].id === id) return arr[i].name;
    return String(id || '—').toUpperCase();
  }

  /* ---------- vẽ hình cho bảng chi tiết ---------- */
  function sizeArt() {
    if (!el.art || !el.artWrap) return;
    var w = el.artWrap.clientWidth || 300;
    var h = el.artWrap.clientHeight || 360;
    if (el.art.width !== Math.round(w * Math.min(window.devicePixelRatio || 1, 2)) ||
        el.art.height !== Math.round(h * Math.min(window.devicePixelRatio || 1, 2))) {
      el.art.width = Math.round(w * Math.min(window.devicePixelRatio || 1, 2));
      el.art.height = Math.round(h * Math.min(window.devicePixelRatio || 1, 2));
    }
  }

  function paintArt(project, t) {
    if (!el.art || !window.HUB_CARDS) return;
    var w = el.artWrap.clientWidth || 300;
    var h = el.artWrap.clientHeight || 360;
    window.HUB_CARDS.drawArt(el.art, project, t, 'high', w, h);
  }

  function artLoop(now) {
    if (!isOpen) return;
    raf = requestAnimationFrame(artLoop);
    if (!t0) t0 = now;
    if (now - (artLoop._last || 0) < 1000 / 30) return;
    artLoop._last = now;
    paintArt(list[index], (now - t0) / 1000);
  }

  function startArt() {
    if (prefersReduced || !el.art) return;
    if (raf) return;
    t0 = 0;
    raf = requestAnimationFrame(artLoop);
  }

  function stopArt() {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
  }

  /* ---------- đổ nội dung ---------- */
  function fill(p) {
    if (!p) return;
    var accent = p.accent || '#7df9ff';
    el.panel.style.setProperty('--card-accent', accent);
    el.panel.style.setProperty('--card-accent-soft',
      window.HUB_CARDS ? window.HUB_CARDS.accentSoft(accent, 0.18) : 'rgba(125,249,255,0.18)');

    el.cat.textContent = String(p.category || '').toUpperCase() +
      (CAT_EN[p.category] ? '  //  ' + CAT_EN[p.category] : '');
    el.name.textContent = p.name || '';
    el.en.textContent = p.nameEn || '';
    el.tagline.textContent = p.tagline || '';
    el.desc.textContent = p.description || '';

    el.cat2.textContent = label(p.category);
    el.status.textContent = STATUS_LABEL[p.status] || 'ĐANG CHẠY';
    el.year.textContent = p.year ? String(p.year) : '—';
    el.net.textContent = p.needsNetwork ? 'CẦN MẠNG' : 'NGOẠI TUYẾN';
    el.net.style.color = p.needsNetwork ? 'var(--gold)' : 'var(--ok)';

    var chips = (p.tech || []).map(function (x) { return '<span class="chip">' + esc(x) + '</span>'; }).join('');
    el.tech.innerHTML = chips;
    el.techWrap.hidden = !chips;

    el.open.setAttribute('href', p.href || '#');
    // mở ngay trong tab hiện tại: mở tab nền khiến người dùng tưởng nút không chạy
    el.open.removeAttribute('target');
    el.open.setAttribute('rel', 'noopener');

    // nói rõ vì sao có dự án cần mạng, tránh hiểu nhầm là lỗi
    if (el.tip) {
      if (p.needsNetwork) {
        el.tip.hidden = false;
        el.tip.textContent = '⚠ Dự án này nạp thư viện 3D từ internet. Hãy mở trạm bằng địa chỉ http://localhost (đừng dùng file://) và giữ kết nối mạng.';
      } else {
        el.tip.hidden = true;
        el.tip.textContent = '';
      }
    }

    if (p.demo && !p.demoDisabled) {
      el.demo.hidden = false;
      el.demo.setAttribute('href', p.demo);
      el.demo.setAttribute('download', '');
    } else {
      el.demo.hidden = true;
      el.demo.removeAttribute('href');
    }

    el.pos.textContent = String(index + 1).padStart(2, '0') + ' / ' + String(list.length).padStart(2, '0');
    el.prev.disabled = list.length < 2;
    el.next.disabled = list.length < 2;

    sizeArt();
    paintArt(p, 0);
    startArt();
  }

  /* ---------- mở / đóng ---------- */
  function open(p, visibleList) {
    if (!p) return;
    list = (visibleList && visibleList.length ? visibleList : [p]).slice();
    index = list.indexOf(p);
    if (index < 0) { list.unshift(p); index = 0; }

    lastFocus = document.activeElement;
    isOpen = true;
    el.root.hidden = false;
    el.root.classList.remove('closing');
    document.body.classList.add('locked');
    fill(p);

    if (window.HUB_CARDS) window.HUB_CARDS.setActiveProject(p);

    // đưa tiêu điểm vào bảng để bàn phím dùng được ngay
    setTimeout(function () {
      if (el.close) el.close.focus();
      else el.panel.focus();
    }, 30);
  }

  function close() {
    if (!isOpen) return;
    isOpen = false;
    stopArt();
    el.root.classList.add('closing');
    var done = function () {
      el.root.hidden = true;
      el.root.classList.remove('closing');
      if (window.HUB_CARDS) window.HUB_CARDS.setActiveProject(null);
    };
    if (prefersReduced) done();
    else setTimeout(done, 210);

    document.body.classList.remove('locked');
    if (lastFocus && lastFocus.focus) {
      try { lastFocus.focus(); } catch (e) { /* phần tử đã bị gỡ */ }
    }
  }

  function go(delta) {
    if (list.length < 2) return;
    index = (index + delta + list.length) % list.length;
    fill(list[index]);
  }

  /* ---------- khớp lại danh sách khi bộ lọc đổi ---------- */
  function onListChanged(newList, getPos) {
    if (!isOpen) return;
    var cur = list[index];
    if (!cur) return;
    if (newList.indexOf(cur) < 0) {
      list = newList.slice();
      index = 0;
      if (typeof getPos === 'function') index = getPos();
      fill(list[index]);
    } else {
      list = newList.slice();
      index = list.indexOf(cur);
      if (index < 0) index = 0;
      el.pos.textContent = String(index + 1).padStart(2, '0') + ' / ' + String(list.length).padStart(2, '0');
    }
  }

  /* ---------- sự kiện ---------- */
  if (el.close) el.close.addEventListener('click', close);
  if (el.backdrop) el.backdrop.addEventListener('click', close);
  if (el.prev) el.prev.addEventListener('click', function () { go(-1); });
  if (el.next) el.next.addEventListener('click', function () { go(1); });

  document.addEventListener('keydown', function (e) {
    if (!isOpen) return;
    if (e.key === 'Escape') { e.preventDefault(); close(); return; }
    if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); return; }
    if (e.key === 'ArrowRight') { e.preventDefault(); go(1); return; }
    if (e.key === 'Tab') {
      // kẹp tiêu điểm trong bảng chi tiết
      var f = el.panel.querySelectorAll('a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])');
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  var rt = 0;
  window.addEventListener('resize', function () {
    clearTimeout(rt);
    rt = setTimeout(function () { if (isOpen) { sizeArt(); paintArt(list[index], 0); } }, 150);
  });

  /* nhấn phím ở thẻ dự án (điều hướng bằng bàn phím) */
  document.addEventListener('keydown', function (e) {
    if (isOpen) return;
    var card = document.activeElement && document.activeElement.closest ? document.activeElement.closest('.card') : null;
    if (!card) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      var hit = card.querySelector('.card-hit');
      if (hit) hit.click();
    }
  });

  window.HUB_OVERLAY = { open: open, close: close, go: go, onListChanged: onListChanged, isOpen: function () { return isOpen; } };
})();
