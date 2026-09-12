/* =========================================================
   AUDIO — Âm thanh vui nhộn, tự tổng hợp bằng Web Audio API
   (không cần file âm thanh ngoài — chạy offline hoàn toàn)
   ========================================================= */
(function (global) {
  'use strict';
  var PS = global.PS = global.PS || {};

  var ctx = null;
  var enabled = true;

  function ensure() {
    if (!ctx) {
      var AC = global.AudioContext || global.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === 'suspended') { ctx.resume(); }
    return ctx;
  }

  // Phát 1 nốt: tần số, thời điểm bắt đầu (giây), độ dài, loại sóng, âm lượng
  function tone(freq, t0, dur, type, vol, slideTo) {
    if (!enabled) return;
    if (!ensure()) return;
    var t = ctx.currentTime + t0;
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();
    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(freq, t);
    if (slideTo) { osc.frequency.exponentialRampToValueAtTime(Math.max(30, slideTo), t + dur); }
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(vol || 0.2, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + dur + 0.05);
  }

  PS.audio = {
    setEnabled: function (v) { enabled = !!v; },
    isEnabled: function () { return enabled; },
    // Gọi khi người dùng chạm lần đầu (trình duyệt yêu cầu)
    unlock: function () { ensure(); },

    // Tiếng "bíp" khi bấm nút
    click: function () { tone(620, 0, 0.07, 'triangle', 0.12); },

    // Trả lời ĐÚNG: hợp âm vui C5-E5-G5-C6
    correct: function () {
      tone(523.25, 0.00, 0.16, 'triangle', 0.25);
      tone(659.25, 0.12, 0.16, 'triangle', 0.25);
      tone(783.99, 0.24, 0.16, 'triangle', 0.25);
      tone(1046.5, 0.36, 0.32, 'triangle', 0.3);
    },

    // Trả lời SAI: "bông" nhẹ nhàng, không gây sợ
    wrong: function () {
      tone(233, 0.00, 0.22, 'square', 0.08, 116);
      tone(164, 0.20, 0.28, 'square', 0.07, 82);
    },

    // Ăn mừng cuối bài (nhiều sao)
    fanfare: function () {
      var notes = [523.25, 659.25, 783.99, 1046.5, 783.99, 1046.5];
      var t = 0;
      for (var i = 0; i < notes.length; i++) {
        tone(notes[i], t, 0.18, 'triangle', 0.28);
        t += (i % 2 === 0) ? 0.17 : 0.11;
      }
      tone(1318.5, t + 0.05, 0.55, 'triangle', 0.3);
      tone(659.25, t + 0.05, 0.55, 'sine', 0.15);
    },

    // Tiếng "ting" khi đạt sao / huy hiệu
    star: function () {
      tone(1567.98, 0.00, 0.10, 'sine', 0.22);
      tone(2093.0, 0.09, 0.22, 'sine', 0.22);
    },

    // Lên cấp
    levelup: function () {
      var notes = [523.25, 659.25, 783.99, 1046.5, 1318.5];
      for (var i = 0; i < notes.length; i++) {
        tone(notes[i], i * 0.09, 0.14, 'sawtooth', 0.1);
        tone(notes[i] / 2, i * 0.09, 0.14, 'sine', 0.12);
      }
    }
  };
})(typeof window !== 'undefined' ? window : globalThis);
