/* =========================================================
   STARFIELD — nền vũ trụ 3 chiều bằng Canvas 2D.
   Sao được chiếu theo phối cảnh thật: scale = fov / (fov + z)
   → sao gần to hơn, nhanh hơn, để lại vệt dài (hiệu ứng
   "bay xuyên không gian" khi bật chế độ warp).
   Có tinh vân trôi, sao băng, sao nhấp nháy; tự giảm tải trên
   máy yếu và tôn trọng prefers-reduced-motion.
   ========================================================= */
(function () {
  'use strict';

  var canvas = document.getElementById('space-canvas');
  if (!canvas) return;

  var mq = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  var prefersReduced = !!(mq && mq.matches);
  var lowPower = (navigator.deviceMemory && navigator.deviceMemory <= 4) ||
                 (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4);

  var ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) { canvas.style.display = 'none'; return; }

  var W = 0, H = 0, DPR = 1;
  var stars = [];
  var shootingStars = [];
  var STAR_CAP = lowPower ? 380 : 760;
  var FOV = 720;          // tiêu cự ảo
  var Z_MAX = 1600;       // độ sâu tối đa của trường sao
  var WARP_AFTER = 6.0;   // giây không thao tác thì bắt đầu warp
  var WARP_LEN = 4.0;     // độ dài một đợt warp
  var CX = 0, CY = 0;     // tâm chiếu

  var raf = 0;
  var last = 0;
  var idle = 0;
  var warp = 0;
  var running = false;

  /* ---------- nền tĩnh: vẽ một lần, chỉ vẽ lại khi đổi kích thước ---------- */
  function paintBackdrop() {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = '#04060d';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    var blobs = [
      { x: 0.24, y: 0.26, r: 0.62, c: 'rgba(40,74,178,0.20)' },
      { x: 0.78, y: 0.20, r: 0.52, c: 'rgba(126,48,168,0.16)' },
      { x: 0.62, y: 0.80, r: 0.58, c: 'rgba(0,128,168,0.15)' },
      { x: 0.10, y: 0.82, r: 0.44, c: 'rgba(190,60,140,0.10)' }
    ];
    var maxDim = Math.max(canvas.width, canvas.height);
    for (var i = 0; i < blobs.length; i++) {
      var b = blobs[i];
      var g = ctx.createRadialGradient(
        b.x * canvas.width, b.y * canvas.height, 0,
        b.x * canvas.width, b.y * canvas.height, b.r * maxDim
      );
      g.addColorStop(0, b.c);
      g.addColorStop(1, 'rgba(4,6,13,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }

  /* ---------- sao ---------- */
  function makeStar(atFarEdge, keepQuiet) {
    var z = atFarEdge ? Z_MAX * (0.72 + Math.random() * 0.28) : Math.random() * Z_MAX;
    var depth = 1 - z / Z_MAX;                       // 1 = gần, 0 = xa
    return {
      x: (Math.random() - 0.5) * 2,
      y: (Math.random() - 0.5) * 2,
      z: z,
      speed: 44 + Math.random() * 140 + depth * 125,
      size: (keepQuiet ? 0.32 : 0.38) + depth * 1.85 + Math.random() * 0.5,
      hue: Math.random(),
      tw: Math.random() * 6.2832,
      tws: 0.5 + Math.random() * 1.6
    };
  }

  function seedStars() {
    stars = [];
    var budget = Math.round((W * H) / (lowPower ? 3600 : 2300));
    var n = Math.max(170, Math.min(STAR_CAP, budget));
    for (var i = 0; i < n; i++) stars.push(makeStar(false, true));
    // lớp gần: ít nhưng sáng và to, tạo cảm giác chiều sâu rõ
    var near = Math.round(n * 0.12);
    for (var j = 0; j < near; j++) {
      var s = makeStar(false, false);
      s.z *= 0.42;
      s.size += 1.05;
      s.speed *= 1.5;
      stars.push(s);
    }
  }

  function resize() {
    W = window.innerWidth;
    H = window.innerHeight;
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.round(W * DPR));
    canvas.height = Math.max(1, Math.round(H * DPR));
    CX = W / 2;
    CY = H * 0.46;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    paintBackdrop();
    seedStars();
  }

  /* ---------- sao băng ---------- */
  function spawnShootingStar() {
    var fromLeft = Math.random() < 0.5;
    shootingStars.push({
      x: fromLeft ? -60 : W + 60,
      y: Math.random() * H * 0.55,
      vx: (fromLeft ? 1 : -1) * (520 + Math.random() * 420),
      vy: 170 + Math.random() * 200,
      life: 0,
      max: 0.7 + Math.random() * 0.6,
      len: 120 + Math.random() * 180
    });
  }

  function drawShootingStars(dt) {
    var maxAlive = lowPower ? 1 : 3;
    if (Math.random() < dt * 0.16 && shootingStars.length < maxAlive) spawnShootingStar();

    for (var i = shootingStars.length - 1; i >= 0; i--) {
      var m = shootingStars[i];
      m.life += dt;
      m.x += m.vx * dt;
      m.y += m.vy * dt;
      if (m.life > m.max || m.y > H + 80 || m.x < -240 || m.x > W + 240) {
        shootingStars.splice(i, 1);
        continue;
      }

      var mag = Math.hypot(m.vx, m.vy) || 1;
      var p = m.life / m.max;
      var a = Math.sin(Math.PI * p) * 0.85;
      var tailX = m.x - (m.vx / mag) * m.len;
      var tailY = m.y - (m.vy / mag) * m.len;

      var grad = ctx.createLinearGradient(tailX, tailY, m.x, m.y);
      grad.addColorStop(0, 'rgba(125,249,255,0)');
      grad.addColorStop(0.7, 'rgba(160,250,255,' + (a * 0.45).toFixed(3) + ')');
      grad.addColorStop(1, 'rgba(255,255,255,' + a.toFixed(3) + ')');
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.9;
      ctx.beginPath();
      ctx.moveTo(tailX, tailY);
      ctx.lineTo(m.x, m.y);
      ctx.stroke();
    }
  }

  /* ---------- một khung hình ---------- */
  var runningFrame = false;
  function frame(now) {
    if (!runningFrame) return;
    raf = requestAnimationFrame(frame);

    if (!last) last = now;
    var dt = Math.min((now - last) / 1000, 0.05);
    last = now;

    // nhịp warp: sau một khoảng không thao tác thì tăng tốc rồi trả về
    idle += dt;
    var wantBoost = (idle % (WARP_AFTER + WARP_LEN + 3)) > WARP_AFTER;
    warp += ((wantBoost ? 1 : 0) - warp) * Math.min(1, dt * (wantBoost ? 1.7 : 1.1));

    var speedMul = 1 + warp * 7.5;

    // làm mờ khung trước → vệt sáng khi warp, sạch sẽ khi bay chậm
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = 'rgba(4,6,13,' + (0.2 + warp * 0.34).toFixed(3) + ')';
    ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'lighter';

    var intense = warp > 0.08;
    for (var i = 0; i < stars.length; i++) {
      var s = stars[i];
      var prevZ = s.z;
      s.z -= s.speed * speedMul * dt;

      if (s.z <= 6) { stars[i] = makeStar(true, false); continue; }

      var sc1 = FOV / (FOV + prevZ);
      var sc2 = FOV / (FOV + s.z);
      var x1 = CX + s.x * CX * sc1;
      var y1 = CY + s.y * CY * sc1;
      var x2 = CX + s.x * CX * sc2;
      var y2 = CY + s.y * CY * sc2;

      if (x2 < -90 || x2 > W + 90 || y2 < -90 || y2 > H + 90) continue;

      s.tw += s.tws * dt * 2.2;
      var depth = 1 - s.z / Z_MAX;
      var alpha = Math.min(1, (0.2 + depth * 0.85) * (0.72 + Math.sin(s.tw) * 0.28));
      var size = s.size * sc2;

      var col = s.hue < 0.14 ? '190,240,255'
              : s.hue < 0.30 ? '255,236,196'
              : s.hue < 0.44 ? '255,198,220'
              : '226,240,255';

      if (intense) {
        ctx.strokeStyle = 'rgba(' + col + ',' + alpha.toFixed(3) + ')';
        ctx.lineWidth = Math.max(0.5, size * 0.8);
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      } else {
        ctx.fillStyle = 'rgba(' + col + ',' + alpha.toFixed(3) + ')';
        ctx.beginPath();
        ctx.arc(x2, y2, Math.max(0.4, size * 0.55), 0, 6.2832);
        ctx.fill();
      }
    }

    drawShootingStars(dt);
    ctx.globalCompositeOperation = 'source-over';
  }

  /* ---------- vòng đời ---------- */
  function start() {
    if (running) return;
    running = true;
    runningFrame = true;
    last = 0;
    raf = requestAnimationFrame(frame);
  }

  function stop() {
    running = false;
    runningFrame = false;
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    // vẽ lại nền tĩnh để màn hình không bị đóng băng giữa vệt mờ
    ctx.globalCompositeOperation = 'source-over';
    paintBackdrop();
  }

  var rt = 0;
  window.addEventListener('resize', function () {
    clearTimeout(rt);
    rt = setTimeout(resize, 180);
  });

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) stop();
    else if (!prefersReduced) start();
  });

  document.addEventListener('pointermove', function () { idle = 0; }, { passive: true });
  document.addEventListener('scroll', function () { idle = 0; }, { passive: true });

  if (mq && mq.addEventListener) {
    mq.addEventListener('change', function (e) {
      prefersReduced = e.matches;
      if (prefersReduced) stop(); else start();
    });
  }

  resize();
  if (prefersReduced) {
    // chế độ giảm chuyển động: vẽ sao một lần, không chạy vòng lặp
    warp = 0;
    runningFrame = true;
    frame(performance.now());
    runningFrame = false;
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
  } else {
    start();
  }

  window.HUB_STARFIELD = { start: start, stop: stop, resize: resize };
})();
