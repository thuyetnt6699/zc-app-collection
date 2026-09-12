/* =========================================================
   CONFETTI — Pháo giấy vui nhộn (canvas, không cần thư viện)
   ========================================================= */
(function (global) {
  'use strict';
  var PS = global.PS = global.PS || {};

  var canvas = null, c = null;
  var parts = [];
  var running = false;
  var COLORS = ['#ff5252', '#ffb300', '#ffd54f', '#4caf50', '#2196f3', '#9c27b0', '#ff4081', '#43d9c0'];

  function ensure() {
    if (!canvas) {
      canvas = global.document ? global.document.getElementById('confetti') : null;
      if (!canvas) return;
      c = canvas.getContext('2d');
      resize();
      global.addEventListener('resize', resize);
    }
  }
  function resize() {
    if (!canvas) return;
    canvas.width = global.innerWidth;
    canvas.height = global.innerHeight;
  }

  function mk(x, y, vx, vy, g) {
    return {
      x: x, y: y, vx: vx, vy: vy, g: g,
      size: 6 + Math.random() * 7,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      rot: Math.random() * 6.28,
      vr: (Math.random() - 0.5) * 0.35,
      life: 140 + Math.random() * 80,
      shape: Math.random() < 0.5 ? 'rect' : 'circle'
    };
  }

  // Bắn pháo giấy tại một điểm (khi trả lời đúng)
  function burst(x, y, n) {
    ensure(); if (!canvas) return;
    for (var i = 0; i < n; i++) {
      var ang = Math.random() * Math.PI * 2;
      var sp = 3 + Math.random() * 8;
      parts.push(mk(x, y, Math.cos(ang) * sp, Math.sin(ang) * sp - 3, 0.28));
    }
    kick();
  }

  // Mưa pháo giấy toàn màn hình (kết thúc bài - nhiều sao)
  function rain(n) {
    ensure(); if (!canvas) return;
    for (var i = 0; i < n; i++) {
      parts.push(mk(
        Math.random() * canvas.width,
        -20 - Math.random() * canvas.height * 0.6,
        (Math.random() - 0.5) * 2,
        2 + Math.random() * 3,
        0.05
      ));
    }
    kick();
  }

  function kick() {
    if (!running) { running = true; requestAnimationFrame(tick); }
  }

  function tick() {
    if (!c) { running = false; return; }
    c.clearRect(0, 0, canvas.width, canvas.height);
    parts = parts.filter(function (p) { return p.life > 0 && p.y < canvas.height + 40; });
    for (var i = 0; i < parts.length; i++) {
      var p = parts[i];
      p.x += p.vx; p.y += p.vy; p.vy += p.g; p.rot += p.vr; p.life--;
      c.save();
      c.translate(p.x, p.y);
      c.rotate(p.rot);
      c.fillStyle = p.color;
      if (p.shape === 'rect') {
        c.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      } else {
        c.beginPath();
        c.arc(0, 0, p.size / 2.4, 0, 6.29);
        c.fill();
      }
      c.restore();
    }
    if (parts.length) requestAnimationFrame(tick);
    else { running = false; c.clearRect(0, 0, canvas.width, canvas.height); }
  }

  PS.confetti = {
    burst: burst,
    rain: rain,
    centerBurst: function () {
      burst(global.innerWidth / 2, global.innerHeight / 3, 90);
    }
  };
})(typeof window !== 'undefined' ? window : globalThis);
