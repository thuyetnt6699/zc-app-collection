/* =========================================================
   SCENE 3D — chiều sâu cho hub.
   1) Parallax theo con trỏ / cảm biến nghiêng: ghi vào CSS var
      (--mx, --my) đúng một lần mỗi khung hình.
   2) Cuộn trang → grid tiến lại gần (translateZ) và ngửa lên,
      tạo cảm giác "tàu tiến vào trạm".
   3) Nghiêng thẻ theo con trỏ + đèn sáng đi theo (dùng uỷ quyền
      sự kiện nên thẻ sinh động sau này vẫn có hiệu ứng).
   ========================================================= */
(function () {
  'use strict';

  var root = document.documentElement;
  var prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;

  var coarse = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;

  var api = {};

  /* ============ 1. PARALLAX ============ */
  var px = 0, py = 0;          // mục tiêu (-1..1)
  var cx = 0, cy = 0;          // giá trị đang chạy
  var pointerActive = false;
  var raf1 = 0;

  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }

  function loop() {
    raf1 = 0;
    cx += (px - cx) * 0.09;
    cy += (py - cy) * 0.09;

    root.style.setProperty('--mx', cx.toFixed(4) + 'px');
    root.style.setProperty('--my', cy.toFixed(4) + 'px');

    if (Math.abs(px - cx) > 0.0015 || Math.abs(py - cy) > 0.0015) raf1 = requestAnimationFrame(loop);
  }

  function kick() { if (!raf1) raf1 = requestAnimationFrame(loop); }

  window.addEventListener('pointermove', function (e) {
    if (e.pointerType === 'touch') return;
    pointerActive = true;
    px = (e.clientX / window.innerWidth - 0.5) * 2;
    py = (e.clientY / window.innerHeight - 0.5) * 2;
    kick();
  }, { passive: true });

  window.addEventListener('pointerleave', function () {
    pointerActive = false;
    px = 0; py = 0; kick();
  }, { passive: true });

  window.addEventListener('blur', function () { pointerActive = false; px = 0; py = 0; kick(); });

  /* Cảm biến nghiêng (điện thoại/tablet) — chỉ khi không có con trỏ chính xác */
  if (coarse) {
    var needPerm = typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function';
    var oAttached = false;

    function onOrient(e) {
      if (pointerActive) return;
      var gamma = clamp((e.gamma || 0) / 40, -1, 1);   // trái/phải
      var beta = clamp(((e.beta || 0) - 45) / 40, -1, 1); // trước/sau
      px = gamma; py = beta;
      kick();
    }

    function attach() { if (!oAttached) { window.addEventListener('deviceorientation', onOrient, true); oAttached = true; } }

    if (needPerm) {
      // chỉ xin quyền ở lần chạm đầu tiên, để không chặn trang
      var ask = function () {
        window.removeEventListener('pointerdown', ask);
        try {
          DeviceOrientationEvent.requestPermission().then(function (r) { if (r === 'granted') attach(); }).catch(function () {});
        } catch (err) { /* trình duyệt không hỗ trợ → bỏ qua */ }
      };
      window.addEventListener('pointerdown', ask, { once: true });
    } else {
      attach();
    }
  }

  /* ============ 2. CUỘN TRANG → ĐỘ SÂU ============ */
  var grid = document.getElementById('project-grid');
  var gridTopDoc = null;
  var lastZ = -999;
  var raf2 = 0;

  function measure() {
    if (!grid) return;
    var r = grid.getBoundingClientRect();
    gridTopDoc = r.top + window.pageYOffset;
  }

  function applyDepth() {
    raf2 = 0;
    if (gridTopDoc === null) measure();
    if (gridTopDoc === null) return;

    var vh = window.innerHeight;
    var viewportTop = gridTopDoc - window.pageYOffset;
    // 0 khi grid còn ở dưới màn hình, 1 khi grid đã ngang tầm mắt
    var rel = (vh * 0.92 - viewportTop) / (vh * 0.9);
    var t = clamp(rel, 0, 1);
    var ease = t * t * (3 - 2 * t);

    var z = -150 + ease * 150;            // từ xa (âm) tiến tới 0 khi vào tầm
    var rx = 10 - ease * 10;              // còn xa thì ngửa nhiều, tới gần thì phẳng

    if (Math.abs(z - lastZ) < 0.4) { root.style.setProperty('--scroll-rx', rx.toFixed(2) + 'deg'); return; }
    lastZ = z;
    root.style.setProperty('--scroll-z', z.toFixed(1) + 'px');
    root.style.setProperty('--scroll-rx', rx.toFixed(2) + 'deg');
  }

  function onScroll() { if (!raf2) raf2 = requestAnimationFrame(applyDepth); }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', function () { measure(); lastZ = -999; onScroll(); }, { passive: true });

  /* ============ 3. NGHIÊNG THẺ ============ */
  var MAX_TILT = 7.5;
  var MAX_LIFT = 22;

  function cardOf(e) { return e.target && e.target.closest ? e.target.closest('.card') : null; }

  function onCardMove(e) {
    var card = cardOf(e);
    if (!card) return;
    var r = card.getBoundingClientRect();
    if (!r.width || !r.height) return;
    var nx = (e.clientX - r.left) / r.width;
    var ny = (e.clientY - r.top) / r.height;

    card.style.transform =
      'perspective(900px) rotateX(' + ((0.5 - ny) * MAX_TILT).toFixed(2) + 'deg) ' +
      'rotateY(' + ((nx - 0.5) * MAX_TILT).toFixed(2) + 'deg) ' +
      'translateZ(' + MAX_LIFT + 'px)';
    card.style.setProperty('--gx', (nx * 100).toFixed(1) + '%');
    card.style.setProperty('--gy', (ny * 100).toFixed(1) + '%');
  }

  function onCardOut(e) {
    var card = cardOf(e);
    if (!card) return;
    // chỉ hạ thẻ khi con trỏ thật sự rời khỏi nó (không phải đổi sang phần tử con)
    if (e.relatedTarget && card.contains(e.relatedTarget)) return;
    card.style.transform = '';
    card.style.removeProperty('--gx');
    card.style.removeProperty('--gy');
  }

  if (!coarse) {
    document.addEventListener('pointermove', onCardMove, { passive: true });
    document.addEventListener('pointerout', onCardOut, { passive: true });
  }

  /* ============ khởi động ============ */
  function refresh() { measure(); lastZ = -999; onScroll(); }
  api.refresh = refresh;
  api.measure = measure;

  window.addEventListener('load', refresh);
  document.addEventListener('visibilitychange', function () { if (!document.hidden) refresh(); });

  measure();
  applyDepth();

  window.HUB_SCENE3D = api;
})();
