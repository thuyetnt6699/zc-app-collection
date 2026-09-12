/* =========================================================
   APP — Điều khiển giao diện: điều hướng, làm bài,
   lưu/tải, phần thưởng, âm thanh, pháo giấy
   ========================================================= */
(function (global) {
  'use strict';
  var PS = global.PS = global.PS || {};

  /* ---------- Tiện ích DOM ---------- */
  function $(id) { return global.document.getElementById(id); }
  function el(tag, cls, html) {
    var e = global.document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (ch) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch];
    });
  }
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  var PRAISE = ['Tuyệt vời! 🌟', 'Chính xác! 🎯', 'Báo giỏi quá! 🦁', 'Không thể tin được! 😍',
    'Xuất sắc! 🚀', 'Chuẩn bài! 💯', 'Giỏi ghê! 👏', 'Tuyệt đỉnh! 🤩'];
  var CHEER = ['Không sao, sai mà! Đọc lời giải rồi mình làm tiếp nhé 💪',
    'Gần đúng rồi! Xem lời giải để hiểu cách làm đúng nhé 📖',
    'Lần sau sẽ giỏi hơn! Mình cùng đọc lời giải thôi 🦉'];

  /* ---------- Trạng thái ---------- */
  var state = {
    quiz: null,          // QuizEngine
    topicKey: null,
    activeSaveId: null,
    answered: false
  };

  /* =========================================================
     ĐIỀU HƯỚNG MÀN HÌNH
     ========================================================= */
  function showScreen(name) {
    var screens = ['home', 'topics', 'quiz', 'results', 'saves', 'rewards'];
    for (var i = 0; i < screens.length; i++) {
      var id = 'screen-' + screens[i];
      var on = (screens[i] === name);
      var node = $(id);
      if (node) node.classList.toggle('hidden', !on);
    }
    if (name === 'saves') renderSaves();
    if (name === 'rewards') renderRewards();
    if (name === 'home') updateTopPoints();
  }

  function updateTopPoints() {
    $('total-points').textContent = PS.storage.loadStats().totalPoints;
  }

  function setQuizSpeech(msg) {
    var node = $('quiz-speech');
    if (node) node.textContent = msg;
  }

  /* ---------- Thông báo nhỏ ---------- */
  var toastTimer = null;
  function toast(msg) {
    var t = $('toast');
    t.textContent = msg;
    t.classList.remove('hidden');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.add('hidden'); }, 2600);
  }

  /* ---------- Hộp thoại ---------- */
  function openModal(opts) {
    var overlay = $('modal-overlay');
    var box = $('modal-box');
    box.innerHTML = '<h3>' + opts.title + '</h3>' + (opts.body || '');
    var actions = el('div', 'modal-actions');
    (opts.buttons || []).forEach(function (b) {
      var btn = el('button', 'btn' + (b.cls ? ' ' + b.cls : ''), b.label);
      btn.addEventListener('click', function () {
        PS.audio.click();
        overlay.classList.add('hidden');
        if (b.cb) b.cb();
      });
      actions.appendChild(btn);
    });
    box.appendChild(actions);
    overlay.classList.remove('hidden');
    var input = box.querySelector('input');
    if (input) setTimeout(function () { input.focus(); input.select(); }, 60);
  }
  function closeModal() { $('modal-overlay').classList.add('hidden'); }

  /* =========================================================
     TRANG CHÍNH
     ========================================================= */
  var SPEECHES = [
    'Chào bạn! Mình là Cú Mập 🦉 — người chỉ đường trong thế giới phân số. Sẵn sàng chưa?',
    'Mẹo nhỏ: mẫu số cho biết hình được chia thành bao nhiêu phần bằng nhau nhé!',
    'Cứ làm từ từ, sai không sao — quan trọng là hiểu tại sao. 💪',
    'Trúng liên tiếp 3 câu trở lên sẽ có điểm thưởng thêm đó! 🔥',
    'Học phân số hay như ăn bánh vậy! 🍰'
  ];
  function rotateSpeech() {
    var i = 0;
    setInterval(function () {
      var node = $('mascot-speech');
      if (node && !$('screen-home').classList.contains('hidden')) {
        i = (i + 1) % SPEECHES.length;
        node.textContent = SPEECHES[i];
      }
    }, 9000);
  }

  /* =========================================================
     CHỌN CHỦ ĐỀ
     ========================================================= */
  function buildTopicGrid() {
    var grid = $('topic-grid');
    grid.innerHTML = '';
    PS.TOPICS.forEach(function (t) {
      var card = el('button', 'topic-card');
      card.style.setProperty('--tc', t.color);
      card.innerHTML = '<div class="topic-icon">' + t.icon + '</div><h3>' + t.name + '</h3><p>' + t.desc + '</p>';
      card.addEventListener('click', function () {
        PS.audio.click();
        startQuiz(t.key);
      });
      grid.appendChild(card);
    });
  }

  /* =========================================================
     LÀM BÀI
     ========================================================= */
  function startQuiz(topicKey) {
    var len = parseInt($('quiz-length').value, 10) || 10;
    var topic = PS.topicByKey(topicKey);
    var questions = PS.buildQuiz(topicKey, len);
    var eng = new PS.QuizEngine(questions, topicKey, topic.name);
    state.quiz = eng;
    state.topicKey = topicKey;
    state.activeSaveId = 'q_' + Date.now().toString(36) + '_' + Math.floor(Math.random() * 1e5).toString(36);
    state.answered = false;
    autoSave();
    renderQuiz();
    setQuizSpeech(pick(['Cố lên nhé! 💪', 'Bắt đầu thôi nào! 🚀', 'Mình cùng làm bài! ✏️']));
    showScreen('quiz');
  }

  function autoName(topicName) {
    var d = new Date();
    return topicName + ' — ' + d.toLocaleDateString('vi-VN') + ' ' +
      d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  }

  // Tự động lưu tiến độ (kết hợp với nút "Bài đã lưu")
  function autoSave() {
    var eng = state.quiz;
    if (!eng) return;
    var existing = PS.storage.findSave(state.activeSaveId);
    // Nếu câu hiện tại đã trả lời rồi thì lưu chỉ số CÂU SAU (tránh làm lại câu cũ)
    var idx = (state.answered && !eng.finished) ? eng.index + 1 : eng.index;
    PS.storage.addOrUpdate(state.activeSaveId, {
      id: state.activeSaveId,
      name: existing ? existing.name : autoName(eng.topicName),
      topic: eng.topic,
      topicName: eng.topicName,
      createdAt: existing ? existing.createdAt : new Date().toISOString(),
      finished: eng.finished,
      questions: eng.questions,
      index: idx,
      score: eng.score,
      correct: eng.correct,
      streak: eng.streak,
      maxStreak: eng.maxStreak,
      stars: eng.stars(),
      accuracy: eng.accuracy()
    });
  }

  function topicIcon(key) {
    var t = PS.topicByKey(key);
    return t ? t.icon : '📚';
  }

  function renderQuiz() {
    var eng = state.quiz;
    var q = eng.current();
    $('quiz-counter').textContent = (eng.index + 1) + '/' + eng.questions.length;
    $('progress-bar').style.width = (100 * eng.index / eng.questions.length) + '%';
    $('q-score').textContent = '⭐ ' + eng.score;
    $('q-streak').textContent = eng.streak >= 2 ? '🔥 ' + eng.streak : '';
    $('q-topic').textContent = topicIcon(eng.topic) + ' ' + eng.topicName;
    $('q-text').innerHTML = q.question;

    var box = $('q-options');
    box.innerHTML = '';
    var letters = ['A', 'B', 'C', 'D'];
    q.options.forEach(function (o, i) {
      var b = el('button', 'option-btn');
      b.innerHTML = '<span class="opt-letter">' + letters[i] + '</span><span>' + PS.renderOption(o) + '</span>';
      b.addEventListener('click', function () { answerQuestion(i, b); });
      box.appendChild(b);
    });

    $('feedback').className = 'feedback hidden';
    $('feedback').innerHTML = '';
    $('hint-box').className = 'hint-box hidden';
    $('hint-box').innerHTML = '';
    var next = $('btn-next');
    next.classList.add('hidden');
    $('btn-hint').disabled = false;
    state.answered = false;
  }

  function answerQuestion(i, btn) {
    if (state.answered) return;
    state.answered = true;
    var eng = state.quiz;
    var q = eng.current();
    var res = eng.answer(i);

    var btns = global.document.querySelectorAll('#q-options .option-btn');
    btns.forEach(function (b) { b.disabled = true; });

    if (res.ok) {
      btn.classList.add('correct');
      PS.audio.correct();
      var r = btn.getBoundingClientRect();
      PS.confetti.burst(r.left + r.width / 2, r.top + r.height / 2, 45);
      setQuizSpeech(pick(PRAISE));
    } else {
      btn.classList.add('wrong');
      btns.forEach(function (b, idx) {
        if (idx !== i) b.classList.add('dimmed');
      });
      btns[q.correct].classList.remove('dimmed');
      btns[q.correct].classList.add('correct');
      PS.audio.wrong();
      setQuizSpeech(pick(CHEER));
    }

    showFeedback(res, q);
    $('btn-hint').disabled = true;

    var next = $('btn-next');
    next.classList.remove('hidden');
    next.textContent = eng.isLast() ? 'Xem kết quả 🏁' : 'Câu tiếp →';

    $('q-score').textContent = '⭐ ' + eng.score;
    $('q-streak').textContent = eng.streak >= 2 ? '🔥 ' + eng.streak : '';
    $('progress-bar').style.width = (100 * (eng.index + 1) / eng.questions.length) + '%';
    updateTopPoints();
  }

  function starsHTML(n) {
    var s = '';
    for (var i = 0; i < 3; i++) s += '<span>' + (i < n ? '⭐' : '☆') + '</span>';
    return s;
  }

  function showFeedback(res, q) {
    var fb = $('feedback');
    if (res.ok) {
      fb.className = 'feedback ok';
      var streakLine = res.streakNow >= 3
        ? '<div class="fb-head">🔥 Chuỗi ' + res.streakNow + ' câu đúng! +5 điểm thưởng</div>' : '';
      fb.innerHTML =
        '<div class="fb-head">🎉 ' + pick(PRAISE) + ' +' + res.points + ' điểm</div>' +
        streakLine +
        '<div class="fb-explain"><b>📖 Cách làm (để nhớ lâu hơn):</b><br>' + q.explanation + '</div>';
    } else {
      fb.className = 'feedback no';
      fb.innerHTML =
        '<div class="fb-head">😅 Chưa đúng rồi! Đáp án đúng là: <span>' + PS.renderOption(q.options[q.correct]) + '</span></div>' +
        '<div class="fb-explain"><b>📖 Hướng dẫn giải chi tiết:</b><br>' + q.explanation + '</div>';
    }
    fb.classList.remove('hidden');
    fb.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  /* =========================================================
     KẾT QUẢ
     ========================================================= */
  function finishQuiz() {
    var eng = state.quiz;
    eng.finished = true;
    autoSave();

    var st = PS.storage.loadStats();
    st.quizzes = (st.quizzes || 0) + 1;
    PS.storage.saveStats(st);

    var result = { topic: eng.topic, accuracy: eng.accuracy(), stars: eng.stars(), streak: eng.maxStreak };
    var newly = PS.unlockBadges(result);

    // Hiển thị màn kết quả
    var stars = eng.stars();
    $('result-stars').innerHTML = starsHTML(stars);
    $('result-title').textContent =
      stars === 3 ? 'Xuất sắc! 🤩' :
      stars === 2 ? 'Giỏi lắm! 😄' :
      stars === 1 ? 'Khá tốt! 🙂' : 'Cố lên! 💪';
    $('result-msg').textContent =
      'Bạn trả lời đúng ' + eng.correct + '/' + eng.questions.length + ' câu (' +
      eng.accuracy() + '%) — đạt ' + eng.score + ' điểm. Bài đã được tự động lưu!';
    $('result-stats').innerHTML =
      '<span class="pill">⭐ ' + eng.score + ' điểm</span>' +
      '<span class="pill">✅ ' + eng.correct + '/' + eng.questions.length + ' đúng</span>' +
      '<span class="pill">🔥 Chuỗi tốt nhất ' + eng.maxStreak + '</span>' +
      '<span class="pill">🎯 ' + eng.accuracy() + '%</span>';
    $('result-note').textContent = '💾 Bài này đã được lưu vào "Bài đã lưu" — bạn có thể vào đó để làm lại hoặc đổi tên.';

    showScreen('results');

    if (stars >= 2) { PS.audio.fanfare(); PS.confetti.rain(130); }
    else { PS.audio.star(); PS.confetti.centerBurst(); }

    newly.forEach(function (b, i) {
      setTimeout(function () {
        toast(b.icon + ' Huy hiệu mới: "' + b.name + '"!');
        PS.audio.star();
      }, 1600 + i * 1400);
    });
  }

  /* =========================================================
     BÀI ĐÃ LƯU
     ========================================================= */
  function renderSaves() {
    var list = PS.storage.loadSaves();
    var wrap = $('saves-list');
    wrap.innerHTML = '';
    if (!list.length) {
      var extra = PS.storage.isAvailable() ? '' :
        '<br><br>⚠️ Lưu ý: trình duyệt đang chặn lưu dữ liệu cục bộ, bài chỉ được nhớ tạm trong phiên này.';
      wrap.innerHTML = '<p class="empty">Chưa có bài nào được lưu. 🌱<br>Bắt đầu một bài học — khi thoát giữa bài, tiến độ sẽ được tự động lưu ở đây!' + extra + '</p>';
      return;
    }
    list.forEach(function (s) {
      var card = el('div', 'save-card');
      var pct = s.finished ? 100 : Math.round(100 * (s.index || 0) / s.questions.length);
      var meta1 = topicIcon(s.topic) + ' ' + esc(s.topicName || '') + ' · ' + s.questions.length + ' câu · ' + fmtDate(s.createdAt);
      var meta2 = s.finished
        ? 'Đã hoàn thành · ' + (s.accuracy || 0) + '% · ' + starsMini(s.stars || 0)
        : 'Đã làm ' + (s.index || 0) + '/' + s.questions.length + ' · ⭐ ' + (s.score || 0) + ' điểm';
      card.innerHTML =
        '<div class="save-info">' +
          '<div class="save-name">' + esc(s.name || 'Bài tập') + '</div>' +
          '<div class="save-meta">' + meta1 + '</div>' +
          '<div class="save-bar"><div style="width:' + pct + '%"></div></div>' +
          '<div class="save-meta">' + meta2 + '</div>' +
        '</div>' +
        '<div class="save-actions">' +
          '<button class="btn small primary" data-act="continue">▶ ' + (s.finished ? 'Làm lại' : 'Tiếp tục') + '</button>' +
          '<button class="btn small" data-act="delete">🗑️ Xóa</button>' +
        '</div>';
      var btns = card.querySelectorAll('button');
      btns[0].addEventListener('click', function () {
        PS.audio.click();
        // Bài đã hoàn thành → "Làm lại" từ đầu; chưa xong → "Tiếp tục"
        loadQuizFromSave(s, !!s.finished);
      });
      btns[1].addEventListener('click', function () {
        openModal({
          title: 'Xóa bài này?',
          body: '<p>"' + esc(s.name || 'Bài tập') + '" sẽ bị xóa vĩnh viễn.</p>',
          buttons: [
            { label: 'Giữ lại' },
            { label: 'Xóa', cls: 'primary', cb: function () {
              PS.storage.deleteSave(s.id);
              renderSaves();
              toast('Đã xóa bài. 🗑️');
            } }
          ]
        });
      });
      wrap.appendChild(card);
    });
  }

  function starsMini(n) {
    var s = '';
    for (var i = 0; i < 3; i++) s += i < n ? '⭐' : '☆';
    return s;
  }

  function fmtDate(iso) {
    try {
      var d = new Date(iso);
      return d.toLocaleDateString('vi-VN') + ' ' + d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    } catch (e) { return ''; }
  }

  // Nạp lại một bài đã lưu
  // retry = true: làm lại từ đầu cùng bộ câu hỏi (nút "Làm lại" trên bài đã hoàn thành)
  function loadQuizFromSave(s, retry) {
    var eng = new PS.QuizEngine(s.questions, s.topic, s.topicName || s.topic);
    state.quiz = eng;
    state.topicKey = s.topic;
    state.activeSaveId = s.id;
    state.answered = false;

    if (retry) {
      eng.index = 0; eng.score = 0; eng.correct = 0; eng.streak = 0; eng.maxStreak = 0;
      autoSave();
      renderQuiz();
      setQuizSpeech('Làm lại bài cũ nhé! 🔄');
      showScreen('quiz');
      return;
    }

    // Bài đã làm hết (hoặc đã trả lời cả câu cuối mà chưa xem kết quả)
    if (s.finished || (s.index || 0) >= s.questions.length) {
      eng.finished = true;
      eng.score = s.score || 0;
      eng.correct = s.correct || 0;
      eng.maxStreak = s.maxStreak || 0;
      finishQuiz();
      return;
    }

    eng.index = Math.min(s.index || 0, s.questions.length - 1);
    eng.score = s.score || 0;
    eng.correct = s.correct || 0;
    eng.streak = s.streak || 0;
    eng.maxStreak = s.maxStreak || 0;
    autoSave();
    renderQuiz();
    setQuizSpeech('Chào mừng trở lại! Tiếp tục nào! 💪');
    showScreen('quiz');
  }

  /* =========================================================
     PHÂN THƯỞNG
     ========================================================= */
  function renderRewards() {
    var st = PS.storage.loadStats();
    var lv = PS.levelFor(st.totalPoints);
    var pct = lv.next ? Math.min(100, Math.round(100 * st.totalPoints / lv.next.min)) : 100;
    $('level-card').innerHTML =
      '<div class="level-icon">' + lv.level.icon + '</div>' +
      '<div style="flex:1">' +
        '<h3>Cấp bậc: ' + lv.level.name + '</h3>' +
        '<p>' + st.totalPoints + ' điểm' +
        (lv.next ? ' · Còn ' + (lv.next.min - st.totalPoints) + ' điểm nữa để lên "' + lv.next.name + '" (' + lv.next.icon + ')' : ' · Bạn đã đạt cấp cao nhất! 🎉') +
        '</p>' +
        '<div class="save-bar"><div style="width:' + pct + '%"></div></div>' +
      '</div>';

    var grid = $('badges-grid');
    grid.innerHTML = '';
    PS.BADGES.forEach(function (b) {
      var has = st.badges.indexOf(b.id) !== -1;
      var card = el('div', 'badge' + (has ? '' : ' locked'));
      card.innerHTML =
        '<div class="badge-icon">' + b.icon + '</div>' +
        '<h4>' + b.name + '</h4>' +
        '<p>' + b.desc + '</p>' +
        (has ? '<span class="badge-check">Đã mở khóa ✓</span>' : '<span class="badge-lock">🔒 Chưa mở khóa</span>');
      grid.appendChild(card);
    });

    $('rewards-stats').textContent =
      'Thống kê của bạn: hoàn thành ' + (st.quizzes || 0) + ' bài · trả lời đúng ' +
      (st.correct || 0) + '/' + (st.answered || 0) + ' câu · chuỗi dài nhất ' + (st.bestStreak || 0) + ' câu.';

    var note = $('rewards-storage');
    if (PS.storage.isAvailable()) {
      note.className = 'storage-note';
      note.textContent = '💾 Lưu trữ: hoạt động bình thường — điểm, huy hiệu và bài tập được ghi nhớ ngay cả khi bạn đóng trang.';
    } else {
      note.className = 'storage-note bad';
      note.textContent = '⚠️ Lưu trữ: trình duyệt đang chặn dữ liệu cục bộ, thành tích chỉ được nhớ tạm trong phiên này. ' +
        'Hãy mở website qua server cục bộ (npx serve .) hoặc kiểm tra cài đặt quyền riêng tư của trình duyệt.';
    }
  }

  /* =========================================================
     XUẤT / NHẬP FILE
     ========================================================= */
  function exportSaves() {
    var data = {
      app: 'hoc-phan-so-lop5',
      version: 1,
      savedAt: new Date().toISOString(),
      saves: PS.storage.loadSaves(),
      stats: PS.storage.loadStats()
    };
    var blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    var a = global.document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'bai-tap-phan-so.json';
    global.document.body.appendChild(a);
    a.click();
    global.document.body.removeChild(a);
    URL.revokeObjectURL(a.href);
    toast('Đã xuất file! 📦');
  }

  function importSaves(file) {
    var reader = new FileReader();
    reader.onload = function () {
      try {
        var data = JSON.parse(reader.result);
        var saves = data.saves || (Array.isArray(data) ? data : []);
        var count = 0;
        saves.forEach(function (s) {
          if (s && s.id && Array.isArray(s.questions) && s.questions.length) {
            PS.storage.addOrUpdate(s.id, s);
            count++;
          }
        });
        // Khôi phục cả phần thưởng (điểm, huy hiệu) từ bản sao lưu
        if (data.stats && typeof data.stats === 'object') {
          var cur = PS.storage.loadStats();
          var imp = data.stats;
          var merged = PS.storage.defaultStats();
          merged.totalPoints = Math.max(cur.totalPoints, imp.totalPoints || 0);
          merged.correct = Math.max(cur.correct, imp.correct || 0);
          merged.answered = Math.max(cur.answered, imp.answered || 0);
          merged.bestStreak = Math.max(cur.bestStreak, imp.bestStreak || 0);
          merged.quizzes = Math.max(cur.quizzes, imp.quizzes || 0);
          (imp.badges || []).forEach(function (id) {
            if (merged.badges.indexOf(id) === -1) merged.badges.push(id);
          });
          PS.storage.saveStats(merged);
          updateTopPoints();
        }
        renderSaves();
        toast(count ? 'Đã nhập ' + count + ' bài tập! 📥' : 'File không có bài tập hợp lệ! ⚠️');
      } catch (e) {
        toast('File không hợp lệ! ⚠️');
      }
    };
    reader.readAsText(file);
  }

  /* =========================================================
     KHỞI TẠO
     ========================================================= */
  function init() {
    // Âm thanh
    var sndOn = PS.storage.soundEnabled();
    PS.audio.setEnabled(sndOn);
    $('btn-sound').textContent = sndOn ? '🔊' : '🔇';
    $('btn-sound').addEventListener('click', function () {
      var v = !PS.audio.isEnabled();
      PS.audio.setEnabled(v);
      PS.storage.setSoundEnabled(v);
      this.textContent = v ? '🔊' : '🔇';
      if (v) { PS.audio.unlock(); PS.audio.click(); toast('Âm thanh: BẬT 🔊'); }
      else toast('Âm thanh: TẮT 🔇');
    });
    // Trình duyệt chỉ cho phát âm sau khi người dùng chạm lần đầu
    global.document.addEventListener('click', function () { PS.audio.unlock(); }, { once: true });

    updateTopPoints();
    buildTopicGrid();
    rotateSpeech();

    // Điều hướng chung
    global.document.querySelectorAll('[data-action]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        PS.audio.click();
        var act = btn.getAttribute('data-action');
        if (act === 'start') showScreen('topics');
        else if (act === 'saves') showScreen('saves');
        else if (act === 'rewards') showScreen('rewards');
        else if (act === 'home') showScreen('home');
      });
    });
    $('btn-home').addEventListener('click', function () {
      PS.audio.click();
      showScreen('home');
    });

    // Thoát giữa bài
    $('btn-quit-quiz').addEventListener('click', function () {
      openModal({
        title: 'Thoát bài học?',
        body: '<p>Đừng lo — tiến độ của bạn sẽ được <b>tự động lưu</b>.<br>Bạn có thể tiếp tục bất cứ lúc nào từ "Bài đã lưu". 🌱</p>',
        buttons: [
          { label: 'Tiếp tục làm', cls: 'primary' },
          { label: 'Thoát', cb: function () {
            autoSave();
            showScreen('saves');
            toast('💾 Đã lưu tiến độ!');
          } }
        ]
      });
    });

    // Nút "Câu tiếp"
    $('btn-next').addEventListener('click', function () {
      PS.audio.click();
      var eng = state.quiz;
      var cont = eng.next();
      state.answered = false; // câu mới chưa được trả lời (tránh lưu trùng câu cũ)
      autoSave();
      if (cont) {
        renderQuiz();
        setQuizSpeech(pick(['Làm tiếp nào! ✏️', 'Cố lên! 💪', 'Mình đang làm rất tốt! 🌟']));
      } else {
        finishQuiz();
      }
    });

    // Nút gợi ý
    $('btn-hint').addEventListener('click', function () {
      if (state.answered) return;
      var q = state.quiz.current();
      PS.audio.click();
      var hb = $('hint-box');
      hb.innerHTML = '💡 <b>Gợi ý:</b> ' + (q.hint || '');
      hb.classList.remove('hidden');
    });

    // Màn kết quả
    $('btn-retry').addEventListener('click', function () {
      PS.audio.click();
      startQuiz(state.topicKey);
    });
    $('btn-save-result').addEventListener('click', function () {
      PS.audio.click();
      openModal({
        title: '💾 Lưu bài tập',
        body: '<p>Bài đã được lưu tự động. Bạn có thể đổi tên cho dễ nhớ:</p>' +
          '<input type="text" id="save-name-input" maxlength="60" placeholder="Tên bài tập">',
        buttons: [
          { label: 'Bỏ qua' },
          { label: 'Lưu', cls: 'primary', cb: function () {
            var inp = global.document.getElementById('save-name-input');
            var name = inp && inp.value.trim() ? inp.value.trim() : null;
            var s = PS.storage.findSave(state.activeSaveId);
            if (s && name) {
              s.name = name;
              PS.storage.addOrUpdate(s.id, s);
            }
            toast('💾 Đã lưu bài tập!');
          } }
        ]
      });
    });
    $('btn-home-result').addEventListener('click', function () {
      PS.audio.click();
      showScreen('home');
    });

    // Xem bài đã lưu từ màn kết quả
    $('btn-view-saves').addEventListener('click', function () {
      PS.audio.click();
      showScreen('saves');
    });

    // Xóa thống kê (màn phần thưởng)
    $('btn-reset-stats').addEventListener('click', function () {
      PS.audio.click();
      openModal({
        title: 'Xóa thống kê & huy hiệu?',
        body: '<p>Tổng điểm, huy hiệu và cấp bậc sẽ về 0.<br><b>Các bài đã lưu không bị ảnh hưởng.</b></p>',
        buttons: [
          { label: 'Hủy' },
          { label: 'Xóa', cls: 'primary', cb: function () {
            PS.storage.resetStats();
            updateTopPoints();
            renderRewards();
            toast('Đã xóa thống kê. 🧹');
          } }
        ]
      });
    });

    // Xuất / nhập
    $('btn-export').addEventListener('click', function () {
      PS.audio.click();
      exportSaves();
    });
    $('file-import').addEventListener('change', function (e) {
      var f = e.target.files && e.target.files[0];
      if (f) importSaves(f);
      e.target.value = '';
    });

    // Cảnh báo nếu trình duyệt chặn lưu trữ cục bộ
    if (!PS.storage.isAvailable()) {
      $('storage-warning').classList.remove('hidden');
    }

    showScreen('home');
  }

  if (global.document && global.document.readyState === 'loading') {
    global.document.addEventListener('DOMContentLoaded', init);
  } else if (global.document) {
    init();
  }
})(typeof window !== 'undefined' ? window : globalThis);
