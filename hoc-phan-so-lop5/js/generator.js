/* =========================================================
   GENERATOR — Máy sinh câu hỏi trắc nghiệm ngẫu nhiên
   (toán phân số & hỗn số cho học sinh lớp 5)
   Mỗi câu được sinh mới kèm HƯỚNG DẪN GIẢI từng bước.
   Câu hỏi trong file này được biên soạn bởi Qwen3.8-27B.
   ========================================================= */
(function (global) {
  'use strict';
  var PS = global.PS = global.PS || {};

  /* ---------- Số ngẫu nhiên (mulberry32 — mỗi phiên một seed) ---------- */
  function mulberry32(seed) {
    var a = seed >>> 0;
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  var rng = mulberry32((Date.now() ^ 0x9E3779B9) >>> 0);
  function randInt(a, b) { return a + Math.floor(rng() * (b - a + 1)); }
  function pick(arr) { return arr[Math.floor(rng() * arr.length)]; }
  function chance(p) { return rng() < p; }
  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(rng() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  /* ---------- Toán cơ bản ---------- */
  function gcd(a, b) {
    a = Math.abs(a); b = Math.abs(b);
    while (b) { var t = a % b; a = b; b = t; }
    return a;
  }
  function lcm(a, b) { return Math.abs(a * b) / gcd(a, b); }
  function simplify(a, b) { var g = gcd(a, b) || 1; return [a / g, b / g]; }

  PS.util = { randInt: randInt, pick: pick, shuffle: shuffle, chance: chance, gcd: gcd, lcm: lcm, simplify: simplify };

  /* ---------- Đọc số bằng chữ (dùng cho câu "đọc phân số") ---------- */
  var VN_NUM = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín', 'mười',
    'mười một', 'mười hai', 'mười ba', 'mười bốn', 'mười lăm', 'mười sáu', 'mười bảy',
    'mười tám', 'mười chín', 'hai mươi', 'hai mươi mốt', 'hai mươi hai', 'hai mươi ba',
    'hai mươi tư', 'hai mươi lăm', 'hai mươi sáu', 'hai mươi bảy', 'hai mươi tám', 'hai mươi chín', 'ba mươi'];
  function readNum(n) { return (n >= 0 && n < VN_NUM.length) ? VN_NUM[n] : String(n); }

  /* ---------- Hiển thị phân số / hỗn số (HTML) ---------- */
  function fracHTML(a, b) {
    if (b === 1) return '<span class="int">' + a + '</span>';
    return '<span class="frac"><span class="num">' + a + '</span><span class="den">' + b + '</span></span>';
  }
  function mixedHTML(q, a, b) {
    return '<span class="mixed"><span class="intpart">' + q + '</span>' + fracHTML(a, b) + '</span>';
  }
  PS.fracHTML = fracHTML;
  PS.mixedHTML = mixedHTML;

  /* ---------- Các kiểu đáp án (dữ liệu thuần, dễ lưu & render) ---------- */
  function optFrac(a, b) { return { t: 'f', a: a, b: b }; }
  function optMixed(q, a, b) { return { t: 'm', q: q, a: a, b: b }; }
  function optNum(v) { return { t: 'n', v: v }; }
  function optStr(s) { return { t: 's', v: s }; }

  function optKey(o) {
    if (o.t === 'f') return 'f' + o.a + '/' + o.b;
    if (o.t === 'm') return 'm' + o.q + ' ' + o.a + '/' + o.b;
    if (o.t === 'n') return 'n' + o.v;
    return 's' + o.v;
  }
  function optVal(o) {
    if (o.t === 'f') return o.a / o.b;
    if (o.t === 'm') return o.q + o.a / o.b;
    if (o.t === 'n') return o.v;
    return NaN;
  }
  // Hai đáp án có cùng GIÁ TRỊ số? (dùng để loại bẫy vô tình trùng đáp án đúng)
  function isSameValue(t, c) {
    var a = optVal(t), b = optVal(c);
    return !isNaN(a) && !isNaN(b) && a === b;
  }
  function optHTML(o) {
    if (o.t === 'f') return fracHTML(o.a, o.b);
    if (o.t === 'm') return mixedHTML(o.q, o.a, o.b);
    if (o.t === 'n') return '<span class="int">' + o.v + '</span>';
    return o.v;
  }
  PS.renderOption = optHTML;
  PS.optKey = optKey;

  /* ---------- Ghép câu hỏi: 4 đáp án khác nhau + xáo trộn ----------
     strictValue: loại các bẫy có GIÁ TRỊ bằng đáp án đúng
     (tránh hai đáp án cùng giá trị nhưng khác hình thức) */
  var SEQ = 0;
  function buildQ(prefix, topic, qtext, correctOpt, trapOpts, hint, explanation, meta, strictValue) {
    var opts = [correctOpt];
    var seen = {};
    seen[optKey(correctOpt)] = true;
    var correctVal = optVal(correctOpt);
    for (var i = 0; i < trapOpts.length && opts.length < 4; i++) {
      var t = trapOpts[i];
      var k = optKey(t);
      if (seen[k]) continue;
      if (strictValue && !isNaN(correctVal) && optVal(t) === correctVal) continue;
      seen[k] = true; opts.push(t);
    }
    var filler = 101;
    while (opts.length < 4) {
      var fo = optNum(filler);
      if (!seen[optKey(fo)]) { seen[optKey(fo)] = true; opts.push(fo); }
      filler += 37;
    }
    var order = shuffle([0, 1, 2, 3]);
    var newOpts = order.map(function (i) { return opts[i]; });
    SEQ++;
    return {
      id: prefix + '_' + SEQ,
      topic: topic,
      type: 'compute',
      question: qtext,
      options: newOpts,
      correct: newOpts.indexOf(correctOpt),
      hint: hint,
      explanation: explanation,
      meta: meta || null
    };
  }

  /* Kết quả dạng HTML (phân số / hỗn số / số nguyên) */
  function resultHTML(o) {
    if (o.t === 'm') return mixedHTML(o.q, o.a, o.b);
    if (o.t === 'f') return fracHTML(o.a, o.b);
    if (o.t === 'n') return '<span class="int">' + o.v + '</span>';
    return o.v;
  }

  /* =====================================================
     1) KHÁI NIỆM PHÂN SỐ
     ===================================================== */

  // "Đọc phân số này?"
  function genRead() {
    var b = randInt(2, 9), a = randInt(1, b - 1);
    var correct = optStr(readNum(a) + ' phần ' + readNum(b));
    var traps = [
      optStr(readNum(b) + ' phần ' + readNum(a)),
      optStr(readNum(a) + ' phẩy ' + readNum(b)),
      optStr(readNum(a + b) + ' phần ' + readNum(b))
    ];
    var exp = 'Phân số ' + fracHTML(a, b) + ' được đọc là: "<b>' + readNum(a) + ' phần ' + readNum(b) + '</b>".<br>' +
      'Quy tắc: đọc <b>tử số</b> trước, rồi chữ "phần", rồi đọc <b>mẫu số</b>. ✅';
    return buildQ('read', 'khai-niem',
      'Đọc phân số ' + fracHTML(a, b) + ' ra thành lời như thế nào?',
      correct, traps,
      'Đọc tử số trước, rồi chữ "phần", rồi đọc mẫu số.',
      exp, { kind: 'read', a: a, b: b });
  }

  // "Phân số nào bằng 1?"
  function genEqualOne() {
    var n = randInt(2, 9);
    var correct = optFrac(n, n);
    var traps = [optFrac(n, n + 1), optFrac(n + 1, n), optFrac(1, n)];
    var exp = 'Phân số bằng 1 khi <b>tử số bằng mẫu số</b>.<br>' +
      'Ở đây ' + fracHTML(n, n) + ' có tử số ' + n + ' bằng mẫu số ' + n + ', nên ' + fracHTML(n, n) + ' = 1. ✅';
    return buildQ('eq1', 'khai-niem',
      'Phân số nào dưới đây <b>bằng 1</b>?',
      correct, traps,
      'Phân số bằng 1 khi tử số bằng mẫu số.',
      exp, { kind: 'eq1', n: n });
  }

  /* =====================================================
     2) RÚT GỌN PHÂN SỐ
     ===================================================== */
  function genSimplify() {
    var k = randInt(2, 6);
    var d = randInt(2, 8), e;
    do { e = randInt(d + 1, 9); } while (gcd(d, e) !== 1);
    var a = d * k, b = e * k; // gcd(a, b) = k
    var correct = optFrac(d, e);
    var traps = [
      optFrac(a, b),          // chưa rút gọn
      optFrac(a - k, b - k),  // trừ chung (sai)
      optFrac(a, b - k),      // chỉ chia mẫu
      optFrac(a - k, b)       // chỉ chia tử
    ];
    var exp = 'Bước 1: Tìm số mà <b>cả tử số ' + a + ' và mẫu số ' + b + '</b> cùng chia hết.<br>' +
      'Nhận thấy: ' + a + ' = ' + d + ' × ' + k + ' và ' + b + ' = ' + e + ' × ' + k + ', vậy cả hai cùng chia hết cho <b>' + k + '</b>.<br><br>' +
      'Bước 2: Chia cả tử và mẫu cho ' + k + ': ' + fracHTML(a, b) + ' = ' + fracHTML(d, e) + '.<br><br>' +
      'Bước 3: Kiểm tra: ' + d + ' và ' + e + ' không có ước chung nào lớn hơn 1, nên ' + fracHTML(d, e) +
      ' <b>đã là phân số tối giản</b>. ✅';
    return buildQ('simp', 'rut-gon',
      'Rút gọn phân số ' + fracHTML(a, b) + ' thành phân số tối giản.',
      correct, traps,
      'Tìm ước chung lớn nhất của ' + a + ' và ' + b + ', rồi chia cả tử và mẫu cho nó.',
      exp, { kind: 'simplify', a: a, b: b });
  }

  /* =====================================================
     3) SO SÁNH PHÂN SỐ
     ===================================================== */
  function genCompare() {
    var b, d, a, c, guard = 0;
    // Chọn lại BỘ BỐN SỐ khi hai phân số bằng nhau
    // (chỉ đổi c là không đủ khi mẫu nhỏ — ví dụ d = 2 thì c chỉ có thể là 1)
    do {
      b = randInt(2, 9); d = randInt(2, 9);
      a = randInt(1, b - 1); c = randInt(1, d - 1);
    } while (a * d === c * b && guard++ < 400);
    var L = lcm(b, d);
    var A = a * (L / b), C = c * (L / d);
    var sym = A > C ? '>' : '<';
    var correct = optStr(sym);
    var traps = [optStr(sym === '>' ? '<' : '>'), optStr('='), optStr('Không thể so sánh được')];
    var exp;
    if (b === d) {
      exp = 'Hai phân số có <b>cùng mẫu số ' + b + '</b>, nên ta chỉ cần so sánh tử số:<br>' +
        a + ' ' + sym + ' ' + c + ', vậy ' + fracHTML(a, b) + ' <b>' + sym + '</b> ' + fracHTML(c, d) + '. ✅';
    } else {
      exp = 'Bước 1: Tìm mẫu số chung. BCNN(' + b + ', ' + d + ') = ' + L + '.<br>' +
        'Bước 2: Quy đồng mẫu số: ' + fracHTML(a, b) + ' = ' + fracHTML(A, L) + ' và ' + fracHTML(c, d) + ' = ' + fracHTML(C, L) + '.<br>' +
        'Bước 3: So sánh tử số: ' + A + ' ' + sym + ' ' + C + ', nên ' + fracHTML(a, b) + ' <b>' + sym + '</b> ' + fracHTML(c, d) + '. ✅';
    }
    return buildQ('cmp', 'so-sanh',
      'Chọn dấu thích hợp cho <span class="circle"></span>:<br>' + fracHTML(a, b) + ' <span class="circle"></span> ' + fracHTML(c, d),
      correct, traps,
      'Cùng mẫu: so trực tiếp tử số. Khác mẫu: tìm BCNN, quy đồng rồi so.',
      exp, { kind: 'compare', a: a, b: b, c: c, d: d });
  }

  /* =====================================================
     4) CỘNG, TRỪ PHÂN SỐ
     ===================================================== */
  function genAddSame() {
    var b = randInt(3, 12);
    var a, c, s;
    if (chance(0.5)) {
      // Chọn kết quả rút gọn được
      var ts = [];
      for (var t = 2; t < b; t++) if (gcd(t, b) > 1) ts.push(t);
      s = ts.length ? pick(ts) : randInt(2, b - 1);
      a = randInt(1, s - 1); c = s - a;
    } else {
      a = randInt(1, b - 1); c = randInt(1, b - 1); s = a + c;
    }
    var pair = simplify(s, b), num = pair[0], den = pair[1];
    var correct = den === 1 ? optNum(num) : optFrac(num, den);
    var traps = [];
    if (num !== s) traps.push(optFrac(s, b));
    traps.push(optFrac(s, b * b));
    traps.push(optFrac(s + 1, b));
    traps.push(optFrac(Math.max(1, s - 1), b));
    var g = gcd(s, b);
    var resHTML = resultHTML(correct);
    var exp = 'Hai phân số <b>cùng mẫu số ' + b + '</b>, nên ta chỉ cần cộng tử số, giữ nguyên mẫu số:<br>' +
      fracHTML(a, b) + ' + ' + fracHTML(c, b) + ' = (' + a + ' + ' + c + ') / ' + b + ' = ' + fracHTML(s, b);
    if (g > 1) {
      exp += '<br><br>Bước tiếp theo: <b>rút gọn</b>! ' + s + ' và ' + b + ' cùng chia hết cho ' + g + ', nên ' +
        fracHTML(s, b) + ' = ' + resHTML + '. ✅';
    } else {
      exp += '<br><br>Đáp án: ' + resHTML + ' ✅';
    }
    return buildQ('adssame', 'cong-tru',
      fracHTML(a, b) + ' + ' + fracHTML(c, b) + ' = ?',
      correct, traps,
      'Cùng mẫu: cộng tử số, giữ nguyên mẫu số. Nhớ rút gọn nếu được nhé!',
      exp, { kind: 'add', a: a, b: b, c: c, d: b });
  }

  function genSubSame() {
    var b = randInt(3, 12);
    var a = randInt(2, b - 1), c = randInt(1, a - 1), s = a - c;
    var pair = simplify(s, b), num = pair[0], den = pair[1];
    var correct = den === 1 ? optNum(num) : optFrac(num, den);
    var traps = [];
    if (num !== s) traps.push(optFrac(s, b));
    traps.push(optFrac(s + 1, b));
    traps.push(optFrac(Math.max(1, s - 1), b));
    traps.push(optFrac(s, b + 1));
    var g = gcd(s, b);
    var resHTML = resultHTML(correct);
    var exp = 'Hai phân số <b>cùng mẫu số ' + b + '</b>, nên ta chỉ cần trừ tử số, giữ nguyên mẫu số:<br>' +
      fracHTML(a, b) + ' − ' + fracHTML(c, b) + ' = (' + a + ' − ' + c + ') / ' + b + ' = ' + fracHTML(s, b);
    if (g > 1) {
      exp += '<br><br>Bước tiếp theo: <b>rút gọn</b>! ' + s + ' và ' + b + ' cùng chia hết cho ' + g + ', nên ' +
        fracHTML(s, b) + ' = ' + resHTML + '. ✅';
    } else {
      exp += '<br><br>Đáp án: ' + resHTML + ' ✅';
    }
    return buildQ('subsame', 'cong-tru',
      fracHTML(a, b) + ' − ' + fracHTML(c, b) + ' = ?',
      correct, traps,
      'Cùng mẫu: trừ tử số, giữ nguyên mẫu số. Nhớ rút gọn nếu được nhé!',
      exp, { kind: 'sub', a: a, b: b, c: c, d: b });
  }

  function genAddDiff() {
    var b, d, a, c, L, A, C, s, guard = 0;
    do {
      b = randInt(2, 9); d = randInt(2, 9);
      if (b === d) continue;
      a = randInt(1, b - 1); c = randInt(1, d - 1);
      L = lcm(b, d);
      A = a * (L / b); C = c * (L / d); s = A + C;
    } while (s >= L && guard++ < 80);
    var pair = simplify(s, L), num = pair[0], den = pair[1];
    var correct = den === 1 ? optNum(num) : optFrac(num, den);
    var g = gcd(s, L);
    var traps = [];
    if (g > 1) traps.push(optFrac(s, L));    // chưa rút gọn (bẫy chủ đích)
    traps.push(optFrac(a + c, b + d));       // cộng tử với tử, mẫu với mẫu (sai kinh điển)
    traps.push(optFrac(a + c, b * d));
    traps.push(optFrac(a * c, b * d));
    traps.push(optFrac(s + 1, L));
    var resHTML = resultHTML(correct);
    var exp = 'Bước 1: Tìm mẫu số chung. BCNN(' + b + ', ' + d + ') = ' + L + '.<br>' +
      'Bước 2: Quy đồng mẫu số: ' + fracHTML(a, b) + ' = ' + fracHTML(A, L) + ' và ' + fracHTML(c, d) + ' = ' + fracHTML(C, L) + '.<br>' +
      'Bước 3: Cộng tử số, giữ nguyên mẫu số: ' + fracHTML(A, L) + ' + ' + fracHTML(C, L) + ' = ' + fracHTML(s, L);
    if (g > 1) exp += '<br><br>Bước 4: Rút gọn: ' + fracHTML(s, L) + ' = ' + resHTML + '. ✅';
    else exp += '<br><br>Đáp án: ' + resHTML + ' ✅';
    return buildQ('addiff', 'cong-tru',
      fracHTML(a, b) + ' + ' + fracHTML(c, d) + ' = ?',
      correct, traps,
      'Khác mẫu: tìm BCNN, quy đồng rồi mới cộng tử số. KHÔNG được cộng mẫu số với nhau nhé!',
      exp, { kind: 'add', a: a, b: b, c: c, d: d });
  }

  function genSubDiff() {
    var b, d, a, c, guard = 0;
    do {
      b = randInt(2, 9); d = randInt(2, 9);
      a = randInt(1, b - 1); c = randInt(1, d - 1);
    } while ((b === d || a * d <= c * b) && guard++ < 300);
    var L = lcm(b, d);
    var A = a * (L / b), C = c * (L / d), s = A - C;
    var pair = simplify(s, L), num = pair[0], den = pair[1];
    var correct = den === 1 ? optNum(num) : optFrac(num, den);
    var g = gcd(s, L);
    var traps = [];
    if (g > 1) traps.push(optFrac(s, L));    // chưa rút gọn (bẫy chủ đích)
    if (b - d > 1 && a - c > 0) traps.push(optFrac(a - c, b - d));
    traps.push(optFrac(s + 1, L));
    traps.push(optFrac(s, L + 1));
    traps.push(optFrac(Math.max(1, s - 1), L));
    // Bẫy "đổi chỗ mẫu số" — chỉ thêm khi giá trị khác đáp án đúng
    if (!isSameValue(optFrac(a, d), correct)) traps.push(optFrac(a, d));
    if (!isSameValue(optFrac(c, b), correct)) traps.push(optFrac(c, b));
    var resHTML = resultHTML(correct);
    var exp = 'Bước 1: Tìm mẫu số chung. BCNN(' + b + ', ' + d + ') = ' + L + '.<br>' +
      'Bước 2: Quy đồng mẫu số: ' + fracHTML(a, b) + ' = ' + fracHTML(A, L) + ' và ' + fracHTML(c, d) + ' = ' + fracHTML(C, L) + '.<br>' +
      'Bước 3: Trừ tử số, giữ nguyên mẫu số: ' + fracHTML(A, L) + ' − ' + fracHTML(C, L) + ' = ' + fracHTML(s, L);
    if (g > 1) exp += '<br><br>Bước 4: Rút gọn: ' + fracHTML(s, L) + ' = ' + resHTML + '. ✅';
    else exp += '<br><br>Đáp án: ' + resHTML + ' ✅';
    return buildQ('subdiff', 'cong-tru',
      fracHTML(a, b) + ' − ' + fracHTML(c, d) + ' = ?',
      correct, traps,
      'Khác mẫu: quy đồng trước, rồi trừ tử số. Mẫu số không được trừ với nhau!',
      exp, { kind: 'sub', a: a, b: b, c: c, d: d });
  }

  /* =====================================================
     5) NHÂN, CHIA PHÂN SỐ
     ===================================================== */
  function genMul() {
    var b = randInt(2, 9), d = randInt(2, 9);
    var a = randInt(1, b - 1), c = randInt(1, d - 1);
    var s = a * c, L = b * d;
    var pair = simplify(s, L), num = pair[0], den = pair[1];
    var correct = den === 1 ? optNum(num) : optFrac(num, den);
    var g = gcd(s, L);
    var traps = [];
    if (g > 1) traps.push(optFrac(s, L));    // chưa rút gọn (bẫy chủ đích)
    traps.push(optFrac(a + c, b + d));
    traps.push(optFrac(a * c, b + d));
    traps.push(optFrac(a * d, b * c));
    traps.push(optFrac(s + 1, L));
    var resHTML = resultHTML(correct);
    var exp = 'Muốn nhân hai phân số, ta <b>nhanh nhẹn: nhân tử với tử, mẫu với mẫu</b>:<br>' +
      fracHTML(a, b) + ' × ' + fracHTML(c, d) + ' = (' + a + ' × ' + c + ') / (' + b + ' × ' + d + ') = ' + fracHTML(s, L);
    if (g > 1) exp += '<br><br>Rút gọn: ' + fracHTML(s, L) + ' = ' + resHTML + '. ✅';
    else exp += '<br><br>Đáp án: ' + resHTML + ' ✅';
    exp += '<br><span class="tip">💡 Mẹo: có thể rút gọn chéo (chia chéo tử với mẫu) trước để các số nhỏ hơn!</span>';
    return buildQ('mul', 'nhan-chia',
      fracHTML(a, b) + ' × ' + fracHTML(c, d) + ' = ?',
      correct, traps,
      'Nhân: tử × tử, mẫu × mẫu. Không cần quy đồng!',
      exp, { kind: 'mul', a: a, b: b, c: c, d: d });
  }

  function genDiv() {
    var b = randInt(2, 9), d = randInt(2, 9);
    var a = randInt(1, b - 1), c = randInt(1, d - 1);
    var s = a * d, L = b * c;
    var pair = simplify(s, L), num = pair[0], den = pair[1];
    var correct = den === 1 ? optNum(num) : optFrac(num, den);
    var g = gcd(s, L);
    var traps = [];
    if (g > 1) traps.push(optFrac(s, L));    // chưa rút gọn (bẫy chủ đích)
    traps.push(optFrac(a * c, b * d));       // nhân thẳng (sai)
    // Bẫy "đảo ngược" — chỉ thêm khi giá trị khác đáp án đúng (trường hợp b*c === a*d)
    if (b * c !== a * d) traps.push(optFrac(b * c, a * d));
    traps.push(optFrac(s, L + 1));
    traps.push(optFrac(Math.max(1, s - 1), L));
    var resHTML = resultHTML(correct);
    var exp = 'Muốn chia phân số, ta lấy phân số thứ nhất <b>nhân với phân số thứ hai đảo ngược</b>:<br>' +
      fracHTML(a, b) + ' ÷ ' + fracHTML(c, d) + ' = ' + fracHTML(a, b) + ' × ' + fracHTML(d, c) +
      ' = (' + a + ' × ' + d + ') / (' + b + ' × ' + c + ') = ' + fracHTML(s, L);
    if (g > 1) exp += '<br><br>Rút gọn: ' + fracHTML(s, L) + ' = ' + resHTML + '. ✅';
    else exp += '<br><br>Đáp án: ' + resHTML + ' ✅';
    return buildQ('div', 'nhan-chia',
      fracHTML(a, b) + ' ÷ ' + fracHTML(c, d) + ' = ?',
      correct, traps,
      'Chia phân số = nhân với phân số đảo ngược (đổi chỗ tử và mẫu của số chia).',
      exp, { kind: 'div', a: a, b: b, c: c, d: d });
  }

  /* =====================================================
     6) HỖN SỐ
     ===================================================== */
  function genToMixed() {
    var q = randInt(1, 4);
    var b = randInt(q + 1, 9);
    var r, guard = 0;
    do { r = randInt(1, b - 1); } while (gcd(r, b) !== 1 && guard++ < 40);
    var a = q * b + r;
    var correct = optMixed(q, r, b);
    var traps = [optMixed(r, q, b)]; // tráo chỗ phần nguyên & phần phân số
    var rTrap = (r + 1 < b) ? r + 1 : (r - 1 >= 1 ? r - 1 : null);
    if (rTrap !== null) traps.push(optMixed(q, rTrap, b)); // sai phần dư
    traps.push(optMixed(q, r, b + 1)); // sai mẫu số
    traps.push(optFrac(a, b)); // giữ nguyên phân số (chưa chuyển)
    var exp = 'Bước 1: Ta chia tử số cho mẫu số: <b>' + a + ' ÷ ' + b + ' = ' + q + ' (dư ' + r + ')</b>.<br>' +
      'Bước 2: Thương ' + q + ' là <b>phần nguyên</b>, số dư ' + r + ' là <b>tử số</b>, mẫu số giữ nguyên ' + b + '.<br>' +
      'Bước 3: Viết hỗn số: ' + fracHTML(a, b) + ' → ' + mixedHTML(q, r, b) +
      ' (đọc: "' + readNum(q) + ' và ' + readNum(r) + ' phần ' + readNum(b) + '"). ✅';
    return buildQ('tomix', 'hau-so',
      'Viết phân số ' + fracHTML(a, b) + ' thành hỗn số.',
      correct, traps,
      'Chia tử số cho mẫu số: thương là phần nguyên, số dư làm tử số, mẫu giữ nguyên.',
      exp, { kind: 'tomixed', a: a, b: b });
  }

  function genFromMixed() {
    var q = randInt(1, 4), b = randInt(2, 9), r = randInt(1, b - 1);
    var a = q * b + r;
    var correct = optFrac(a, b);
    var traps = [
      optFrac(q + r, b),
      optFrac(q * r, b),
      optNum(q),
      optFrac(a + 1, b)
    ];
    var exp = 'Bước 1: Lấy <b>phần nguyên nhân với mẫu số</b>: ' + q + ' × ' + b + ' = ' + (q * b) + '.<br>' +
      'Bước 2: <b>Cộng thêm tử số</b> của phần phân số: ' + (q * b) + ' + ' + r + ' = ' + a + '.<br>' +
      'Bước 3: Giữ nguyên mẫu số ' + b + ', ta được phân số ' + fracHTML(a, b) + '. ✅';
    return buildQ('frommix', 'hau-so',
      'Viết hỗn số ' + mixedHTML(q, r, b) + ' thành phân số.',
      correct, traps,
      'Phần nguyên × mẫu số, rồi cộng thêm tử số. Mẫu số giữ nguyên.',
      exp, { kind: 'frommixed', q: q, a: r, b: b });
  }

  function genMixedAdd() {
    var q1 = randInt(1, 3), q2 = randInt(1, 3);
    var b = randInt(2, 9), d = randInt(2, 9);
    var r1 = randInt(1, b - 1), r2 = randInt(1, d - 1);
    var a1 = q1 * b + r1, a2 = q2 * d + r2;
    var L = lcm(b, d);
    var A = a1 * (L / b) + a2 * (L / d);
    var pair = simplify(A, L), num = pair[0], den = pair[1];
    var qR = Math.floor(num / den), rR = num % den;
    var correct = qR === 0 ? optFrac(num, den) : (rR === 0 ? optNum(qR) : optMixed(qR, rR, den));
    var traps = [
      optMixed(q1 + q2, r1 + r2, b + d), // cộng cả tử lẫn mẫu
      optMixed(q1 + q2, r1, b),          // bỏ quên phần phân số thứ hai
      optNum(q1 + q2),                   // chỉ cộng phần nguyên
      optMixed(q1 + q2, r2, d),          // bỏ quên phần phân số thứ nhất
      optMixed(q1 + q2 + 1, r1, b)       // cộng thừa phần nguyên
    ];
    var rTrap = (r1 + 1 < b) ? r1 + 1 : (r1 - 1 >= 1 ? r1 - 1 : null);
    if (rTrap !== null) traps.push(optMixed(q1 + q2, rTrap, b));
    var step2;
    if (b === d) {
      step2 = 'Bước 2: Hai phân số <b>cùng mẫu ' + b + '</b>, chỉ cần cộng tử số: ' +
        fracHTML(a1, b) + ' + ' + fracHTML(a2, b) + ' = (' + a1 + ' + ' + a2 + ') / ' + b + ' = ' + fracHTML(A, L);
    } else {
      step2 = 'Bước 2: Quy đồng mẫu số ' + L + ': ' +
        fracHTML(a1, b) + ' = ' + fracHTML(a1 * (L / b), L) + ' và ' + fracHTML(a2, d) + ' = ' + fracHTML(a2 * (L / d), L) + '.<br>' +
        'Cộng tử số, giữ nguyên mẫu: ' + fracHTML(a1 * (L / b), L) + ' + ' + fracHTML(a2 * (L / d), L) + ' = ' + fracHTML(A, L);
    }
    var exp = 'Bước 1: Chuyển hỗn số thành phân số: ' + mixedHTML(q1, r1, b) + ' = ' + fracHTML(a1, b) +
      ' và ' + mixedHTML(q2, r2, d) + ' = ' + fracHTML(a2, d) + '.<br>' + step2;
    if (gcd(A, L) > 1) exp += '<br>' + fracHTML(A, L) + ' = ' + fracHTML(num, den) + ' (rút gọn).';
    if (correct.t === 'm') {
      exp += '<br>Bước 3: ' + num + ' ÷ ' + den + ' = ' + correct.q + ' dư ' + correct.a +
        ', vậy kết quả là hỗn số ' + mixedHTML(correct.q, correct.a, correct.b) + ' ✅';
    } else if (correct.t === 'f') {
      exp += '<br>Bước 3: Kết quả: ' + fracHTML(num, den) + ' ✅';
    } else {
      exp += '<br>Bước 3: Kết quả: ' + correct.v + ' ✅';
    }
    return buildQ('mixadd', 'hau-so',
      mixedHTML(q1, r1, b) + ' + ' + mixedHTML(q2, r2, d) + ' = ?',
      correct, traps,
      'Cách chắc chắn: chuyển từng hỗn số thành phân số, cộng như bình thường, rồi chuyển kết quả về hỗn số.',
      exp, { kind: 'mixedadd', q1: q1, a1: r1, b1: b, q2: q2, a2: r2, b2: d }, true);
  }

  function genMixedSub() {
    var q1, q2, b, d, r1, r2, a1, a2, guard = 0;
    do {
      q1 = randInt(1, 3); q2 = randInt(1, 2);
      b = randInt(2, 9); d = randInt(2, 9);
      r1 = randInt(1, b - 1); r2 = randInt(1, d - 1);
      a1 = q1 * b + r1; a2 = q2 * d + r2;
    } while (a1 * d <= a2 * b && guard++ < 400);
    if (guard >= 400) return genMixedAdd();
    var L = lcm(b, d);
    var A = a1 * (L / b) - a2 * (L / d);
    var pair = simplify(A, L), num = pair[0], den = pair[1];
    var qR = Math.floor(num / den), rR = num % den;
    var correct = qR === 0 ? optFrac(num, den) : (rR === 0 ? optNum(qR) : optMixed(qR, rR, den));
    // Lưu ý: a1/b > a2/d nên luôn có q1 - q2 >= 0
    var dq = q1 - q2;
    // Hỗn số cần phần phân số trong [1, b-1]; nếu phần nguyên bằng 0 thì viết dạng phân số
    var wrap = function (qq, rr, bb) {
      return qq === 0 ? optFrac(rr, bb) : optMixed(qq, rr, bb);
    };
    var traps = [];
    if (b === d && r1 > r2) traps.push(wrap(dq, r1 - r2, b));        // trừ trực tiếp (thường sai khi khác mẫu)
    traps.push(wrap(dq, r1, b));                                       // chỉ trừ phần nguyên
    if (dq > 0) traps.push(optNum(dq));                                // bỏ luôn phần phân số
    traps.push(wrap(dq, r1 + r2, b + d));                              // cộng phần phân số (sai)
    if (r1 - 1 >= 1) traps.push(wrap(dq, r1 - 1, b));                  // sai phần dư
    traps.push(wrap(dq, r2, d));                                       // giữ nhầm phần phân số bên dưới
    traps.push(wrap(dq + 1, r1, b));                                   // trừ thiếu phần nguyên
    var step2;
    if (b === d) {
      step2 = 'Bước 2: Cùng mẫu ' + b + ', trừ tử số: (' + a1 + ' − ' + a2 + ') / ' + b + ' = ' + fracHTML(A, L);
    } else {
      step2 = 'Bước 2: Quy đồng mẫu số ' + L + ': ' +
        fracHTML(a1, b) + ' = ' + fracHTML(a1 * (L / b), L) + ' và ' + fracHTML(a2, d) + ' = ' + fracHTML(a2 * (L / d), L) + '.<br>' +
        'Trừ: (' + a1 * (L / b) + ' − ' + a2 * (L / d) + ') / ' + L + ' = ' + fracHTML(A, L);
    }
    var exp = 'Bước 1: Chuyển hỗn số thành phân số: ' + mixedHTML(q1, r1, b) + ' = ' + fracHTML(a1, b) +
      ' và ' + mixedHTML(q2, r2, d) + ' = ' + fracHTML(a2, d) + '.<br>' + step2;
    if (gcd(A, L) > 1) exp += '<br>' + fracHTML(A, L) + ' = ' + fracHTML(num, den) + ' (rút gọn).';
    if (correct.t === 'm') {
      exp += '<br>Bước 3: ' + num + ' ÷ ' + den + ' = ' + correct.q + ' dư ' + correct.a +
        ', vậy kết quả là hỗn số ' + mixedHTML(correct.q, correct.a, correct.b) + ' ✅';
    } else if (correct.t === 'f') {
      exp += '<br>Bước 3: Kết quả: ' + fracHTML(num, den) + ' ✅';
    } else {
      exp += '<br>Bước 3: Kết quả: ' + correct.v + ' ✅';
    }
    return buildQ('mixsub', 'hau-so',
      mixedHTML(q1, r1, b) + ' − ' + mixedHTML(q2, r2, d) + ' = ?',
      correct, traps,
      'Chuyển từng hỗn số thành phân số rồi trừ. Nhớ: số bị trừ phải lớn hơn số trừ nhé!',
      exp, { kind: 'mixedsub', q1: q1, a1: r1, b1: b, q2: q2, a2: r2, b2: d }, true);
  }

  /* ---------- Bảng sinh viên theo chủ đề ---------- */
  PS.QUESTION_GENERATORS = {
    'khai-niem': [genRead, genEqualOne],
    'rut-gon': [genSimplify],
    'so-sanh': [genCompare],
    'cong-tru': [genAddSame, genSubSame, genAddDiff, genSubDiff],
    'nhan-chia': [genMul, genDiv],
    'hau-so': [genToMixed, genFromMixed, genMixedAdd, genMixedSub]
  };

  PS.allGenerators = function () {
    var all = [];
    Object.keys(PS.QUESTION_GENERATORS).forEach(function (k) {
      all = all.concat(PS.QUESTION_GENERATORS[k]);
    });
    return all;
  };
})(typeof window !== 'undefined' ? window : globalThis);
