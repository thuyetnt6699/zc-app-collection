/* =========================================================
   MAIN — màn khởi động, đồng hồ HUD, dòng phụ tự gõ chữ,
   và lưới an toàn ghi lỗi ra console.
   ========================================================= */
(function () {
  'use strict';

  var mq = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  var prefersReduced = !!(mq && mq.matches);

  /* ---------- 1. MÀN KHỞI ĐỘNG ---------- */
  var boot = document.getElementById('boot');
  var fill = document.getElementById('boot-fill');
  var log = document.getElementById('boot-log');
  var skip = document.getElementById('boot-skip');

  var bootDone = false;
  var timers = [];
  function later(fn, ms) { timers.push(setTimeout(fn, ms)); }
  function clearTimers() { timers.forEach(clearTimeout); timers = []; }

  function hideBoot() {
    if (bootDone) return;
    bootDone = true;
    clearTimers();
    if (!boot) return;
    boot.setAttribute('aria-hidden', 'true');
    var hide = function () { boot.classList.add('gone'); };
    if (prefersReduced) hide();
    else {
      boot.addEventListener('transitionend', hide, { once: true });
      setTimeout(hide, 900);   // lưới an toàn nếu transitionend không bắn
    }
    // cho bàn phím vào thẳng nội dung
    var firstNav = document.querySelector('.nav-links a') || document.querySelector('.brand');
    if (firstNav && typeof firstNav.focus === 'function') {
      try { firstNav.focus({ preventScroll: true }); } catch (e) { /* ok */ }
    }
  }

  function runBoot() {
    if (!boot) return;
    if (prefersReduced) { hideBoot(); return; }

    // chỉ diễn màn khởi động ở lần vào đầu tiên trong phiên
    var seen = false;
    try { seen = sessionStorage.getItem('hub.booted') === '1'; } catch (e) { seen = false; }
    if (seen) { hideBoot(); return; }
    try { sessionStorage.setItem('hub.booted', '1'); } catch (e) { /* chế độ riêng tư → bỏ qua */ }

    var total = (window.HUB_CARDS && window.HUB_CARDS.projects ? window.HUB_CARDS.projects.length : 4);
    var steps = [
      ['KHỞI ĐỘNG LÕI ĐIỀU KHIỂN', 'CORE//INIT', 180],
      ['QUÉT KHO DỮ LIỆU', 'SCAN//BAY=' + total, 320],
      ['NẠP DANH MỤC DỰ ÁN', 'INDEX//OK', 300],
      ['ĐỒNG BỘ NỀN VŨ TRỤ', 'FIELD//3D', 340],
      ['TRẠM SẴN SÀNG', 'READY//GO', 320]
    ];
    var acc = 0;
    steps.forEach(function (s, i) {
      later(function () {
        if (bootDone) return;
        var line = '> ' + s[0] + '  <b>[' + s[1] + ']</b>';
        if (i === steps.length - 1) line += '  <em>✓</em>';
        log.innerHTML += line + '\n';
        if (fill) fill.style.width = Math.round(((i + 1) / steps.length) * 100) + '%';
      }, acc);
      acc += s[2];
    });
    later(hideBoot, acc + 340);
    later(hideBoot, 3200);   // lưới an toàn tuyệt đối
  }

  if (skip) {
    skip.addEventListener('click', hideBoot);
    setTimeout(function () { try { skip.focus(); } catch (e) { /* ok */ } }, 60);
  }
  window.addEventListener('keydown', function (e) {
    if (!bootDone && (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ')) hideBoot();
  });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', runBoot);
  else runBoot();

  /* ---------- 2. ĐỒNG HỒ + TELEMETRY ---------- */
  var navClock = document.getElementById('nav-clock');
  var hudTime = document.getElementById('hud-time');
  var hudFps = document.getElementById('hud-fps');
  var hudDpr = document.getElementById('hud-dpr');

  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function tick() {
    var d = new Date();
    var s = pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds());
    if (navClock) navClock.textContent = s;
    if (hudTime) hudTime.textContent = pad(d.getHours()) + ':' + pad(d.getMinutes());
  }
  tick();
  setInterval(tick, 1000);

  if (hudDpr) hudDpr.textContent = (Math.min(window.devicePixelRatio || 1, 2)).toFixed(1) + '×';

  /* FPS đo nhẹ: đếm khung rồi cập nhật 2 lần/giây */
  var frames = 0;
  var mark = performance.now();
  function fpsLoop(now) {
    requestAnimationFrame(fpsLoop);
    frames++;
    var span = now - mark;
    if (span >= 500) {
      var fps = Math.round((frames * 1000) / span);
      if (hudFps) hudFps.textContent = String(fps);
      frames = 0;
      mark = now;
    }
  }
  if (!prefersReduced) requestAnimationFrame(fpsLoop);
  else if (hudFps) hudFps.textContent = '—';

  /* ---------- 3. DÒNG PHỤ TỰ GÕ CHỮ ---------- */
  var typed = document.getElementById('hero-typed');
  if (typed) {
    var projects = (window.HUB_CARDS && window.HUB_CARDS.projects) || window.HUB_PROJECTS || [];
    var names = projects.map(function (p) { return p.nameEn || p.name; });
    var lines = ['// ' + names.join('  ·  '), '// MỘT KHUNG — MỌI DỰ ÁN — THÊM MỚI KHÔNG CẦN SỬA GIAO DIỆN'];

    if (prefersReduced) {
      typed.textContent = lines[0];
    } else {
      var li = 0, ci = 0, deleting = false;
      (function type() {
        var text = lines[li];
        if (!deleting) {
          ci++;
          typed.textContent = text.slice(0, ci);
          if (ci >= text.length) { deleting = true; setTimeout(type, 2600); return; }
          setTimeout(type, 34);
        } else {
          ci -= 3;
          if (ci <= 0) {
            ci = 0;
            deleting = false;
            li = (li + 1) % lines.length;
          }
          typed.textContent = text.slice(0, Math.max(0, ci));
          setTimeout(type, deleting ? 16 : 380);
        }
      })();
    }
  }

  /* ---------- 4. NEO MƯỢT (bù trừ chiều cao thanh điều hướng) ---------- */
  document.addEventListener('click', function (e) {
    var a = e.target.closest ? e.target.closest('a[href^="#"]') : null;
    if (!a) return;
    var id = a.getAttribute('href');
    if (!id || id === '#') return;
    var target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    var nav = document.querySelector('.nav');
    var offset = nav ? nav.getBoundingClientRect().height + 10 : 0;
    var y = target.getBoundingClientRect().top + window.pageYOffset - offset;
    window.scrollTo({ top: y, behavior: prefersReduced ? 'auto' : 'smooth' });
    if (history.replaceState) history.replaceState(null, '', id);
  });

  /* ---------- 5. LƯỚI AN TOÀN: ghi lỗi ra console cho dễ sửa ---------- */
  window.addEventListener('error', function (ev) {
    console.error('[TRẠM ĐIỀU KHIỂN] lỗi:', ev.message, ev.filename, ev.lineno);
  });
  window.addEventListener('unhandledrejection', function (ev) {
    console.error('[TRẠM ĐIỀU KHIỂN] promise bị từ chối:', ev.reason);
  });

  /* ---------- 6. NHẤN "K" VỀ ĐẦU TRANG ---------- */
  window.addEventListener('keydown', function (e) {
    if (e.target && /^(INPUT|TEXTAREA)$/.test(e.target.tagName)) return;
    if (window.HUB_OVERLAY && window.HUB_OVERLAY.isOpen && window.HUB_OVERLAY.isOpen()) return;
    if (e.key === '/' && document.getElementById('search-input')) {
      e.preventDefault();
      document.getElementById('search-input').focus();
      return;
    }
    if (e.key === 'k' || e.key === 'K') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: prefersReduced ? 'auto' : 'smooth' });
    }
  });
})();
