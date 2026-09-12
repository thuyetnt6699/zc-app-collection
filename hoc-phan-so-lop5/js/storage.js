/* =========================================================
   STORAGE — Lưu / tải bài tập & thống kê
   Ưu tiên localStorage; nếu trình duyệt chặn (ví dụ mở
   trực tiếp file:// ở chế độ hạn chế) → tự chuyển sang bộ
   nhớ trong phiên + hiển thị cảnh báo rõ ràng.
   ========================================================= */
(function (global) {
  'use strict';
  var PS = global.PS = global.PS || {};

  var SKEY = 'ps5_saves_v1';   // danh sách bài đã lưu
  var TKEY = 'ps5_stats_v1';   // thống kê: điểm, huy hiệu, cấp bậc
  var AKEY = 'ps5_sound_v1';   // bật/tắt âm thanh

  /* ---------- Kiểm tra localStorage có thực sự khả dụng ---------- */
  function testLocalStorage() {
    try {
      var t = '__ps5_probe__';
      global.localStorage.setItem(t, '1');
      var ok = global.localStorage.getItem(t) === '1';
      global.localStorage.removeItem(t);
      return ok;
    } catch (e) { return false; }
  }
  var backend = testLocalStorage() ? 'localStorage' : 'memory';
  var memStore = {}; // dự phòng khi localStorage bị chặn

  function read(key, fallback) {
    try {
      if (backend === 'localStorage') {
        var raw = global.localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
      }
      return memStore[key] ? JSON.parse(memStore[key]) : fallback;
    } catch (e) { return fallback; }
  }
  function write(key, val) {
    try {
      var s = JSON.stringify(val);
      if (backend === 'localStorage') global.localStorage.setItem(key, s);
      else memStore[key] = s;
    } catch (e) { /* bộ nhớ đầy — bỏ qua */ }
  }

  PS.storage = {
    /* backend đang dùng: 'localStorage' (ghi nhớ giữa các phiên)
       hoặc 'memory' (chỉ tồn tại trong phiên hiện tại) */
    backend: backend,
    isAvailable: function () { return backend === 'localStorage'; },

    /* ---------- Âm thanh ---------- */
    soundEnabled: function () { return read(AKEY, true); },
    setSoundEnabled: function (v) { write(AKEY, !!v); },

    /* ---------- Bài đã lưu ---------- */
    loadSaves: function () {
      var list = read(SKEY, []);
      return Array.isArray(list) ? list : [];
    },
    saveSaves: function (list) { write(SKEY, list); },

    // Thêm mới hoặc cập nhật (theo id) — dùng cho auto-save
    addOrUpdate: function (id, obj) {
      var list = this.loadSaves();
      for (var i = 0; i < list.length; i++) {
        if (list[i].id === id) { list[i] = obj; this.saveSaves(list); return obj; }
      }
      list.unshift(obj);
      if (list.length > 30) list = list.slice(0, 30); // giữ tối đa 30 bài
      this.saveSaves(list);
      return obj;
    },

    findSave: function (id) {
      var list = this.loadSaves();
      for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
      return null;
    },

    deleteSave: function (id) {
      this.saveSaves(this.loadSaves().filter(function (s) { return s.id !== id; }));
    },

    /* ---------- Thống kê ---------- */
    defaultStats: function () {
      return { totalPoints: 0, correct: 0, answered: 0, bestStreak: 0, quizzes: 0, badges: [] };
    },
    loadStats: function () {
      var st = read(TKEY, this.defaultStats());
      // bảo toàn cấu trúc (trường hợp dữ liệu cũ thiếu trường)
      var def = this.defaultStats();
      for (var k in def) {
        if (st[k] === undefined) st[k] = Array.isArray(def[k]) ? [] : 0;
      }
      if (!Array.isArray(st.badges)) st.badges = [];
      return st;
    },
    saveStats: function (s) { write(TKEY, s); },
    resetStats: function () { write(TKEY, this.defaultStats()); }
  };
})(typeof window !== 'undefined' ? window : globalThis);
