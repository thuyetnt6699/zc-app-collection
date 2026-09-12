/* =========================================================
   QUIZ — Động cơ làm bài, chủ đề, sao, huy hiệu, cấp bậc
   ========================================================= */
(function (global) {
  'use strict';
  var PS = global.PS = global.PS || {};

  /* ---------- Danh sách chủ đề ---------- */
  PS.TOPICS = [
    { key: 'khai-niem', icon: '🔍', name: 'Khái niệm phân số', color: '#4f8cff',
      desc: 'Tử số, mẫu số, đọc phân số, phân số bằng 1, tính chất cơ bản…' },
    { key: 'rut-gon', icon: '✂️', name: 'Rút gọn phân số', color: '#ff7043',
      desc: 'Tìm ước chung lớn nhất, rút gọn thành phân số tối giản.' },
    { key: 'so-sanh', icon: '⚖️', name: 'So sánh phân số', color: '#ab47bc',
      desc: 'Dấu >, <, = — cùng mẫu và khác mẫu (quy đồng mẫu số).' },
    { key: 'cong-tru', icon: '➕', name: 'Cộng, trừ phân số', color: '#26a69a',
      desc: 'Cùng mẫu số và khác mẫu số, kèm bài toán thực tế.' },
    { key: 'nhan-chia', icon: '✖️', name: 'Nhân, chia phân số', color: '#ef5350',
      desc: 'Nhân: tử × tử, mẫu × mẫu. Chia: nhân với phân số đảo.' },
    { key: 'hau-so', icon: '🥞', name: 'Hỗn số', color: '#ffa726',
      desc: 'Chuyển đổi hỗn số ↔ phân số, cộng, trừ hỗn số.' },
    { key: 'random', icon: '🎲', name: 'Ôn tập tổng hợp', color: '#ec407a',
      desc: 'Trộn tất cả các chủ đề — thử thách lớn nhất! Thử thách!' }
  ];
  PS.topicByKey = function (key) {
    for (var i = 0; i < PS.TOPICS.length; i++) if (PS.TOPICS[i].key === key) return PS.TOPICS[i];
    return null;
  };

  /* ---------- Ghép bài quiz: câu sinh ngẫu nhiên + câu trong bộ đề ---------- */
  PS.buildQuiz = function (topicKey, count) {
    var gens = topicKey === 'random' ? PS.allGenerators() : (PS.QUESTION_GENERATORS[topicKey] || []);
    var bankQ = PS.bank.filter(function (q) {
      return topicKey === 'random' || q.topic === topicKey;
    });
    var out = [];
    // ~45% câu khái niệm trong bộ đề (nếu có)
    var nBank = Math.min(Math.floor(count * 0.45), bankQ.length);
    var shuffledBank = PS.util.shuffle(bankQ);
    for (var i = 0; i < nBank; i++) {
      var q = shuffledBank[i];
      out.push({
        id: q.id + '_r' + i, topic: q.topic, type: q.type,
        question: q.question, options: q.options, correct: q.correct,
        hint: q.hint, explanation: q.explanation, meta: null
      });
    }
    // Phần còn lại: sinh ngẫu nhiên
    var nProc = count - out.length;
    if (gens.length === 0) {
      for (var k = 0; k < nProc; k++) {
        var q2 = bankQ[Math.floor(Math.random() * bankQ.length)];
        out.push({
          id: q2.id + '_x' + k, topic: q2.topic, type: q2.type,
          question: q2.question, options: q2.options, correct: q2.correct,
          hint: q2.hint, explanation: q2.explanation, meta: null
        });
      }
    } else {
      for (var j = 0; j < nProc; j++) {
        out.push(gens[Math.floor(Math.random() * gens.length)]());
      }
    }
    return PS.util.shuffle(out);
  };

  /* ---------- Động cơ quiz ---------- */
  function QuizEngine(questions, topicKey, topicName) {
    this.questions = questions;
    this.topic = topicKey;
    this.topicName = topicName;
    this.index = 0;
    this.score = 0;
    this.streak = 0;
    this.maxStreak = 0;
    this.correct = 0;
    this.finished = false;
  }

  QuizEngine.prototype.current = function () { return this.questions[this.index]; };
  QuizEngine.prototype.isLast = function () { return this.index === this.questions.length - 1; };
  QuizEngine.prototype.accuracy = function () {
    return Math.round(100 * this.correct / this.questions.length);
  };
  QuizEngine.prototype.stars = function () {
    var a = this.accuracy();
    return a >= 90 ? 3 : a >= 70 ? 2 : a >= 50 ? 1 : 0;
  };

  // Trả lời: i = chỉ số đáp án học sinh chọn
  QuizEngine.prototype.answer = function (i) {
    var q = this.current();
    var ok = (i === q.correct);
    var pts = 0;
    if (ok) {
      this.streak++;
      if (this.streak > this.maxStreak) this.maxStreak = this.streak;
      pts = 10 + (this.streak >= 5 ? 10 : this.streak >= 3 ? 5 : 0);
      this.score += pts;
      this.correct++;
    } else {
      this.streak = 0;
    }
    // Cập nhật thống kê toàn cục
    var st = PS.storage.loadStats();
    st.totalPoints += pts;
    st.answered += 1;
    if (ok) st.correct += 1;
    if (this.maxStreak > st.bestStreak) st.bestStreak = this.maxStreak;
    PS.storage.saveStats(st);
    return { ok: ok, points: pts, question: q, streakNow: this.streak };
  };

  QuizEngine.prototype.next = function () {
    if (!this.isLast()) { this.index++; return true; }
    this.finished = true;
    return false;
  };

  PS.QuizEngine = QuizEngine;

  /* ---------- Huy hiệu (badges) ---------- */
  PS.BADGES = [
    { id: 'first', icon: '🐣', name: 'Khởi đầu', desc: 'Hoàn thành bài học đầu tiên',
      check: function (s, r) { return s.quizzes >= 1; } },
    { id: 'gold', icon: '🌟', name: 'Sao vàng', desc: 'Đạt 3 sao trong một bài',
      check: function (s, r) { return r && r.stars === 3; } },
    { id: 'streak5', icon: '🔥', name: 'Lửa nhiệt huyết', desc: 'Trúng 5 câu liên tiếp',
      check: function (s, r) { return (r && r.streak >= 5) || s.bestStreak >= 5; } },
    { id: 'streak10', icon: '⚡', name: 'Sát thủ phân số', desc: 'Trúng 10 câu liên tiếp',
      check: function (s, r) { return (r && r.streak >= 10) || s.bestStreak >= 10; } },
    { id: 'p100', icon: '💯', name: 'Tổ hợp điểm', desc: 'Tích lũy 100 điểm',
      check: function (s) { return s.totalPoints >= 100; } },
    { id: 'p300', icon: '💎', name: 'Kho báu', desc: 'Tích lũy 300 điểm',
      check: function (s) { return s.totalPoints >= 300; } },
    { id: 'c100', icon: '🧠', name: 'Bộ não thạc sĩ', desc: 'Trả lời đúng 100 câu',
      check: function (s) { return s.correct >= 100; } },
    { id: 'mixed', icon: '🥞', name: 'Bậc thầy hỗn số', desc: 'Đạt ≥ 90% ở chủ đề Hỗn số',
      check: function (s, r) { return r && r.topic === 'hau-so' && r.accuracy >= 90; } },
    { id: 'collector', icon: '🗂️', name: 'Nhà sưu tầm', desc: 'Lưu lại 1 bài tập',
      check: function (s) { return (s.savesCount || 0) >= 1; } },
    { id: 'owl', icon: '🦉', name: 'Cú Mập thân thiết', desc: 'Hoàn thành 5 bài',
      check: function (s) { return s.quizzes >= 5; } }
  ];

  // Gọi khi hoàn thành bài — trả về danh sách huy hiệu mới mở khóa
  PS.unlockBadges = function (result) {
    var st = PS.storage.loadStats();
    st.savesCount = PS.storage.loadSaves().length;
    var newly = [];
    for (var i = 0; i < PS.BADGES.length; i++) {
      var b = PS.BADGES[i];
      if (st.badges.indexOf(b.id) === -1 && b.check(st, result)) {
        st.badges.push(b.id);
        newly.push(b);
      }
    }
    PS.storage.saveStats(st);
    return newly;
  };

  /* ---------- Cấp bậc theo tổng điểm ---------- */
  PS.LEVELS = [
    { min: 0, icon: '🌱', name: 'Mầm non phân số' },
    { min: 50, icon: '✏️', name: 'Học sinh chăm chỉ' },
    { min: 150, icon: '⭐', name: 'Thủ lĩnh phân số' },
    { min: 300, icon: '🧠', name: 'Chuyên gia số học' },
    { min: 600, icon: '🏆', name: 'Thần đồng toán học' }
  ];
  PS.levelFor = function (pts) {
    var level = PS.LEVELS[0], next = null;
    for (var i = 0; i < PS.LEVELS.length; i++) {
      if (pts >= PS.LEVELS[i].min) { level = PS.LEVELS[i]; next = PS.LEVELS[i + 1] || null; }
    }
    return { level: level, next: next };
  };
})(typeof window !== 'undefined' ? window : globalThis);
