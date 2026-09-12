/* =========================================================
   BANK — Bộ câu hỏi khái niệm & bài toán thực tế
   (phân số & hỗn số, lớp 5) — biên soạn bởi Qwen3.8-27B
   Mỗi câu có: gợi ý (hint) + hướng dẫn giải từng bước.
   ========================================================= */
(function (global) {
  'use strict';
  var PS = global.PS = global.PS || {};

  // Tiện ích tạo đáp án
  var F = function (a, b) { return { t: 'f', a: a, b: b }; };
  var M = function (q, a, b) { return { t: 'm', q: q, a: a, b: b }; };
  var N = function (v) { return { t: 'n', v: v }; };
  var S = function (s) { return { t: 's', v: s }; };
  var f = PS.fracHTML;

  var ID = 0;
  function B(topic, question, options, correct, hint, explanation) {
    ID++;
    return {
      id: 'bank_' + ID,
      topic: topic,
      type: 'concept',
      question: question,
      options: options,
      correct: correct,
      hint: hint,
      explanation: explanation
    };
  }

  PS.bank = [
    /* ================= KHÁI NIỆM PHÂN SỐ ================= */
    B('khai-niem',
      'Phân số ' + f(3, 7) + ' được tạo thành từ các thành phần nào?',
      [S('Tử số 3, mẫu số 7'), S('Tử số 7, mẫu số 3'), S('Tử số 3, mẫu số 10'), S('Tử số 10, mẫu số 3')],
      0,
      'Số đứng TRÊN vạch ngang là tử số, số đứng DƯỚI là mẫu số.',
      'Trong một phân số: số ở <b>trên</b> vạch ngang gọi là <b>tử số</b>, số ở <b>dưới</b> gọi là <b>mẫu số</b>.<br>' +
      'Phân số ' + f(3, 7) + ' có tử số 3 và mẫu số 7. ✅'),

    B('khai-niem',
      'Mẫu số của một phân số phải là:',
      [S('Một số khác 0'), S('Bất kỳ số nào cũng được'), S('Phải là số 0'), S('Một số âm')],
      0,
      'Mẫu số cho biết đơn vị được chia thành bao nhiêu phần bằng nhau — có thể chia thành 0 phần không?',
      'Mẫu số cho biết một đơn vị được chia thành bao nhiêu phần <b>bằng nhau</b>.<br>' +
      'Chia thành 0 phần thì không có ý nghĩa, nên mẫu số <b>phải là số khác 0</b>. ✅'),

    B('khai-niem',
      'Phân số nào dưới đây <b>bằng 1</b>?',
      [F(2, 5), F(3, 3), F(7, 2), F(0, 4)],
      1,
      'Phân số bằng 1 khi tử số bằng mẫu số.',
      'Phân số bằng 1 khi <b>tử số bằng mẫu số</b>: ' + f(3, 3) + ' = 1.<br>' +
      'Còn ' + f(2, 5) + ' < 1, ' + f(7, 2) + ' > 1, ' + f(0, 4) + ' = 0. ✅'),

    B('khai-niem',
      'Giá trị của phân số ' + f(0, 5) + ' là:',
      [S('5'), S('1'), S('0'), S('Không xác định')],
      2,
      'Tử số 0 nghĩa là... không lấy phần nào cả!',
      'Tử số 0 nghĩa là ta <b>không lấy phần nào</b> cả, nên ' + f(0, 5) + ' = 0.<br>' +
      'Mọi phân số có tử số 0 (mẫu khác 0) đều bằng 0. ✅'),

    B('khai-niem',
      'Một hình tròn được chia thành 8 phần bằng nhau, tô màu 3 phần. Phân số biểu diễn phần tô màu là:',
      [F(8, 3), F(5, 8), F(3, 8), F(3, 5)],
      2,
      'Toàn bộ hình chia thành 8 phần → số đó đứng ở đâu?',
      'Toàn bộ hình được chia thành <b>8 phần bằng nhau</b> → mẫu số là 8.<br>' +
      'Tô màu được 3 phần → tử số là 3. Vậy phần tô màu là ' + f(3, 8) + '. ✅'),

    B('khai-niem',
      'Đọc phân số ' + f(5, 12) + ' như thế nào?',
      [S('Mười hai phần năm'), S('Năm phần mười hai'), S('Năm phẩy mười hai'), S('Năm và mười hai')],
      1,
      'Đọc tử số trước, rồi chữ "phần", rồi mẫu số.',
      'Quy tắc đọc: đọc <b>tử số</b> → chữ "phần" → đọc <b>mẫu số</b>.<br>' +
      'Vậy ' + f(5, 12) + ' đọc là "<b>năm phần mười hai</b>". ✅'),

    B('khai-niem',
      'Theo tính chất cơ bản của phân số, ' + f(2, 5) + ' bằng phân số nào?',
      [F(2, 10), F(4, 5), F(4, 10), F(3, 10)],
      2,
      'Nhân CẢ TỬ VÀ MẪU với cùng một số khác 0.',
      'Tính chất cơ bản: nhân (hoặc chia) <b>cả tử và mẫu</b> với cùng một số khác 0, phân số không đổi.<br>' +
      f(2, 5) + ' = (' + '2 × 2' + ') / (' + '5 × 2' + ') = ' + f(4, 10) + '. ✅'),

    B('khai-niem',
      'Phân số nào dưới đây là <b>phân số tối giản</b>?',
      [F(4, 6), F(8, 12), F(3, 7), F(10, 15)],
      2,
      'Phân số tối giản: tử và mẫu KHÔNG có ước chung nào lớn hơn 1.',
      'Phân số tối giản là phân số mà tử số và mẫu số <b>không có ước chung nào lớn hơn 1</b>.<br>' +
      f(4, 6) + ' cùng chia hết cho 2; ' + f(8, 12) + ' cùng chia hết cho 4; ' + f(10, 15) + ' cùng chia hết cho 5.<br>' +
      'Chỉ còn ' + f(3, 7) + ' là tối giản (3 và 7 chỉ cùng chia hết cho 1). ✅'),

    B('khai-niem',
      'Phân số ' + f(7, 3) + ' được gọi là:',
      [S('Phân số bé hơn 1'), S('Phân số bằng 1'), S('Phân số lớn hơn 1'), S('Không phải phân số')],
      2,
      'So sánh tử số 7 với mẫu số 3.',
      'Tử số 7 <b>lớn hơn</b> mẫu số 3, nên ' + f(7, 3) + ' là <b>phân số lớn hơn 1</b>.<br>' +
      '(Ta có thể viết ' + f(7, 3) + ' = 2' + f(1, 3) + ' — đó là một hỗn số.) ✅'),

    B('khai-niem',
      'Phân số nào dưới đây <b>bé hơn 1</b>?',
      [F(5, 4), F(3, 3), F(9, 5), F(6, 7)],
      3,
      'Phân số bé hơn 1 khi tử số bé hơn mẫu số.',
      'Phân số bé hơn 1 khi <b>tử số bé hơn mẫu số</b>.<br>' +
      f(5, 4) + ' > 1; ' + f(3, 3) + ' = 1; ' + f(9, 5) + ' > 1; còn ' + f(6, 7) + ' < 1. ✅'),

    B('khai-niem',
      'Phân số ' + f(6, 8) + ' bằng phân số nào?',
      [F(6, 4), F(2, 4), F(3, 4), F(3, 8)],
      2,
      '6 và 8 cùng chia hết cho số nào?',
      'Tử số 6 và mẫu số 8 cùng chia hết cho <b>2</b>.<br>' +
      f(6, 8) + ' = (' + '6 ÷ 2' + ') / (' + '8 ÷ 2' + ') = ' + f(3, 4) + '. ✅'),

    B('khai-niem',
      'Sắp xếp các phân số ' + f(2, 5) + ' ; ' + f(4, 5) + ' ; ' + f(3, 5) + ' theo thứ tự từ bé đến lớn:',
      [S(f(4, 5) + ' < ' + f(3, 5) + ' < ' + f(2, 5)), S(f(2, 5) + ' < ' + f(3, 5) + ' < ' + f(4, 5)), S(f(2, 5) + ' < ' + f(4, 5) + ' < ' + f(3, 5)), S(f(3, 5) + ' < ' + f(2, 5) + ' < ' + f(4, 5))],
      1,
      'Cùng mẫu số 5 → chỉ cần so sánh tử số.',
      'Ba phân số cùng mẫu số 5, ta chỉ cần so sánh tử số: 2 < 3 < 4.<br>' +
      'Vậy ' + f(2, 5) + ' < ' + f(3, 5) + ' < ' + f(4, 5) + '. ✅'),

    /* ================= SO SÁNH PHÂN SỐ ================= */
    B('so-sanh',
      'Trong các phân số ' + f(2, 5) + ' ; ' + f(3, 5) + ' ; ' + f(1, 5) + ' ; ' + f(4, 5) + ', phân số nào <b>lớn nhất</b>?',
      [F(4, 5), F(1, 5), F(2, 5), F(3, 5)],
      0,
      'Cùng mẫu số → phân số nào có tử số lớn nhất?',
      'Cùng mẫu số 5, ta chỉ cần so sánh tử số: 4 > 3 > 2 > 1.<br>' +
      'Vậy ' + f(4, 5) + ' là phân số lớn nhất. ✅'),

    B('so-sanh',
      'Chọn dấu thích hợp cho <span class="circle"></span>: ' + f(5, 7) + ' <span class="circle"></span> ' + f(5, 9),
      [S('<'), S('>'), S('='), S('Không thể so sánh')],
      1,
      'Cùng tử số 5: mẫu số nào nhỏ hơn thì phần to hơn?',
      'Hai phân số cùng tử số 5: mẫu số càng <b>nhỏ</b> thì phân số càng <b>lớn</b> (vì chia ít phần hơn, mỗi phần to hơn).<br>' +
      '7 < 9, nên ' + f(5, 7) + ' > ' + f(5, 9) + '. ✅'),

    B('so-sanh',
      'Chọn dấu thích hợp cho <span class="circle"></span>: ' + f(3, 4) + ' <span class="circle"></span> ' + f(5, 8),
      [S('>'), S('<'), S('='), S('Không thể so sánh')],
      0,
      'Quy đồng mẫu: BCNN(4, 8) là mấy?',
      'Bước 1: BCNN(4, 8) = 8.<br>' +
      'Bước 2: ' + f(3, 4) + ' = ' + f(6, 8) + '.<br>' +
      'Bước 3: 6 > 5, nên ' + f(6, 8) + ' > ' + f(5, 8) + ', tức là ' + f(3, 4) + ' > ' + f(5, 8) + '. ✅'),

    B('so-sanh',
      'Phân số nào <b>nhỏ nhất</b> trong các phân số ' + f(1, 9) + ' ; ' + f(1, 5) + ' ; ' + f(1, 3) + ' ; ' + f(1, 2) + '?',
      [F(1, 5), F(1, 3), F(1, 9), F(1, 2)],
      2,
      'Cùng tử số 1: mẫu số càng lớn thì phần càng bé.',
      'Cùng tử số 1: mẫu số càng <b>lớn</b> thì phân số càng <b>bé</b> (một bánh chia nhiều phần hơn, mỗi phần nhỏ hơn).<br>' +
      '9 là mẫu lớn nhất, nên ' + f(1, 9) + ' nhỏ nhất. ✅'),

    B('so-sanh',
      'Có <b>bao nhiêu</b> phân số lớn hơn 1 trong các phân số: ' + f(7, 2) + ' ; ' + f(9, 9) + ' ; ' + f(5, 6) + ' ; ' + f(4, 3) + '?',
      [S('3 phân số'), S('2 phân số'), S('1 phân số'), S('4 phân số')],
      1,
      'Phân số lớn hơn 1 khi tử số lớn hơn mẫu số. "Bằng 1" có tính không?',
      'Phân số lớn hơn 1 khi <b>tử số lớn hơn mẫu số</b>:<br>' +
      '• ' + f(7, 2) + ': 7 > 2 ✅<br>• ' + f(9, 9) + ': 9 = 9 → bằng 1, KHÔNG lớn hơn 1 ❌<br>' +
      '• ' + f(5, 6) + ': 5 < 6 → bé hơn 1 ❌<br>• ' + f(4, 3) + ': 4 > 3 ✅<br>' +
      'Vậy có <b>2</b> phân số lớn hơn 1. ✅'),

    /* ================= CỘNG, TRỪ PHÂN SỐ ================= */
    B('cong-tru',
      f(1, 5) + ' + ' + f(2, 5) + ' = ?',
      [F(3, 10), F(2, 10), F(3, 5), F(1, 5)],
      2,
      'Cùng mẫu 5: cộng tử số, giữ nguyên mẫu số.',
      'Hai phân số <b>cùng mẫu 5</b>, ta chỉ cộng tử số: ' + f(1, 5) + ' + ' + f(2, 5) + ' = (1 + 2) / 5 = ' + f(3, 5) + '. ✅'),

    B('cong-tru',
      f(7, 8) + ' − ' + f(3, 8) + ' = ?',
      [F(4, 8), F(1, 4), F(1, 2), F(3, 8)],
      2,
      'Cùng mẫu 8. Nhớ rút gọn kết quả nhé!',
      'Cùng mẫu 8: (7 − 3) / 8 = ' + f(4, 8) + '.<br>' +
      'Rút gọn: 4 và 8 cùng chia hết cho 4 → ' + f(4, 8) + ' = ' + f(1, 2) + '. ✅'),

    B('cong-tru',
      f(1, 2) + ' + ' + f(1, 3) + ' = ?',
      [F(2, 5), F(2, 6), F(1, 6), F(5, 6)],
      3,
      'Khác mẫu → tìm BCNN(2, 3) rồi quy đồng.',
      'Bước 1: BCNN(2, 3) = 6.<br>' +
      'Bước 2: ' + f(1, 2) + ' = ' + f(3, 6) + ' và ' + f(1, 3) + ' = ' + f(2, 6) + '.<br>' +
      'Bước 3: ' + f(3, 6) + ' + ' + f(2, 6) + ' = (3 + 2) / 6 = ' + f(5, 6) + '. ✅'),

    B('cong-tru',
      f(2, 3) + ' − ' + f(1, 6) + ' = ?',
      [F(1, 3), F(1, 6), F(1, 2), F(3, 2)],
      2,
      'Quy đồng mẫu 6: 2/3 = ?/6',
      'Bước 1: ' + f(2, 3) + ' = ' + f(4, 6) + '.<br>' +
      'Bước 2: ' + f(4, 6) + ' − ' + f(1, 6) + ' = (4 − 1) / 6 = ' + f(3, 6) + '.<br>' +
      'Bước 3: Rút gọn ' + f(3, 6) + ' = ' + f(1, 2) + '. ✅'),

    B('cong-tru',
      'An ăn ' + f(1, 4) + ' cái bánh, Bình ăn ' + f(1, 2) + ' cái bánh. Hai bạn ăn tất cả bao nhiêu phần cái bánh?',
      [F(1, 8), F(3, 8), F(3, 4), F(2, 4)],
      2,
      'Lấy 1/4 + 1/2. Nhớ quy đồng mẫu!',
      f(1, 4) + ' + ' + f(1, 2) + ' = ' + f(1, 4) + ' + ' + f(2, 4) + ' = (1 + 2) / 4 = ' + f(3, 4) + '.<br>' +
      'Hai bạn ăn được ' + f(3, 4) + ' cái bánh. ✅'),

    B('cong-tru',
      'Tiếp tục câu trên: còn lại bao nhiêu phần cái bánh?',
      [F(1, 2), F(3, 4), F(1, 4), F(2, 4)],
      2,
      'Cả cái bánh là 1 = 4/4. Lấy 4/4 − 3/4.',
      'Cả cái bánh là 1 = ' + f(4, 4) + '.<br>' +
      'Phần còn lại: ' + f(4, 4) + ' − ' + f(3, 4) + ' = (4 − 3) / 4 = ' + f(1, 4) + ' cái bánh. ✅'),

    B('cong-tru',
      'Mẹ có 1 bó hoa. Mẹ cho chị ' + f(1, 3) + ' bó và cho em ' + f(1, 6) + ' bó. Mẹ cho tất cả bao nhiêu phần bó hoa?',
      [F(2, 9), F(1, 2), F(1, 9), F(1, 3)],
      1,
      'Quy đồng mẫu 6: 1/3 = ?/6',
      f(1, 3) + ' = ' + f(2, 6) + ', nên ' + f(1, 3) + ' + ' + f(1, 6) + ' = ' + f(2, 6) + ' + ' + f(1, 6) + ' = ' + f(3, 6) + '.<br>' +
      'Rút gọn ' + f(3, 6) + ' = ' + f(1, 2) + ' bó hoa. ✅'),

    /* ================= NHÂN, CHIA PHÂN SỐ ================= */
    B('nhan-chia',
      f(1, 2) + ' × ' + f(1, 3) + ' = ?',
      [F(2, 5), F(1, 5), F(1, 6), F(2, 6)],
      2,
      'Nhân: tử × tử, mẫu × mẫu.',
      'Nhân tử với tử, mẫu với mẫu: (1 × 1) / (2 × 3) = ' + f(1, 6) + '. ✅'),

    B('nhan-chia',
      f(2, 3) + ' × ' + f(3, 4) + ' = ?',
      [F(1, 2), F(6, 7), F(5, 12), F(2, 12)],
      0,
      'Nhân tử × tử, mẫu × mẫu, rồi rút gọn.',
      f(2, 3) + ' × ' + f(3, 4) + ' = (2 × 3) / (3 × 4) = ' + f(6, 12) + '.<br>' +
      'Rút gọn: 6 và 12 cùng chia hết cho 6 → ' + f(6, 12) + ' = ' + f(1, 2) + '. ✅<br>' +
      '<span class="tip">💡 Mẹo: có thể rút gọn chéo 3 (tử) với 3 (mẫu) trước khi nhân!</span>'),

    B('nhan-chia',
      f(1, 2) + ' ÷ ' + f(1, 4) + ' = ?',
      [N(4), F(1, 8), N(2), F(1, 4)],
      2,
      'Chia phân số = nhân với phân số đảo ngược.',
      f(1, 2) + ' ÷ ' + f(1, 4) + ' = ' + f(1, 2) + ' × ' + f(4, 1) + ' = ' + f(4, 2) + ' = 2.<br>' +
      'Nghĩa là: trong nửa phần (' + f(1, 2) + ') có <b>2 phần</b> bằng ' + f(1, 4) + '. ✅'),

    B('nhan-chia',
      f(3, 4) + ' ÷ ' + f(1, 2) + ' = ?',
      [F(3, 8), M(1, 1, 2), N(2), F(3, 4)],
      1,
      'Đảo 1/2 thành 2/1 rồi nhân.',
      f(3, 4) + ' ÷ ' + f(1, 2) + ' = ' + f(3, 4) + ' × ' + f(2, 1) + ' = ' + f(6, 4) + '.<br>' +
      'Rút gọn: ' + f(6, 4) + ' = ' + f(3, 2) + ' = 1' + f(1, 2) + '. ✅'),

    B('nhan-chia',
      'Một hình chữ nhật có chiều dài ' + f(4, 5) + ' m, chiều rộng ' + f(1, 2) + ' m. Diện tích hình chữ nhật là:',
      [S('4/5 m²'), S('2/5 m²'), S('1/4 m²'), S('2/10 m²')],
      1,
      'Diện tích = chiều dài × chiều rộng. Nhớ rút gọn!',
      'Diện tích = chiều dài × chiều rộng = ' + f(4, 5) + ' × ' + f(1, 2) + ' = ' + f(4, 10) + '.<br>' +
      'Rút gọn: ' + f(4, 10) + ' = ' + f(2, 5) + ' (m²). ✅'),

    /* ================= HỖN SỐ ================= */
    B('hau-so',
      'Hỗn số 2' + f(1, 3) + ' được đọc như thế nào?',
      [S('Hai phẩy một phần ba'), S('Hai và một phần ba'), S('Hai phần ba và một'), S('Hai mươi và một phần ba')],
      1,
      'Hỗn số đọc: phần nguyên, chữ "và", rồi phần phân số.',
      'Hỗn số gồm phần nguyên (2) và phần phân số (' + f(1, 3) + ').<br>' +
      'Ta đọc: "<b>hai và một phần ba</b>". ✅'),

    B('hau-so',
      'Hỗn số 3' + f(1, 4) + ' viết thành phân số là:',
      [F(13, 3), F(12, 4), F(13, 4), F(3, 4)],
      2,
      '3 × 4 = ? rồi cộng thêm 1.',
      'Bước 1: 3 × 4 = 12.<br>' +
      'Bước 2: 12 + 1 = 13.<br>' +
      'Bước 3: Mẫu số giữ nguyên 4 → được ' + f(13, 4) + '. ✅'),

    B('hau-so',
      'Phân số ' + f(17, 5) + ' viết thành hỗn số là:',
      [M(2, 2, 5), M(3, 1, 5), M(3, 2, 5), M(3, 2, 3)],
      2,
      'Chia 17 cho 5: thương mấy, dư mấy?',
      'Bước 1: 17 ÷ 5 = 3 (dư 2).<br>' +
      'Bước 2: Thương 3 làm phần nguyên, số dư 2 làm tử số, mẫu giữ nguyên 5.<br>' +
      'Vậy ' + f(17, 5) + ' = 3' + f(2, 5) + '. ✅'),

    B('hau-so',
      '1' + f(1, 2) + ' + 2' + f(1, 4) + ' = ?',
      [M(3, 2, 4), M(4, 1, 4), M(3, 3, 4), M(3, 1, 4)],
      2,
      'Chuyển thành phân số: 3/2 và 9/4, rồi quy đồng.',
      'Bước 1: 1' + f(1, 2) + ' = ' + f(3, 2) + ' = ' + f(6, 4) + '; 2' + f(1, 4) + ' = ' + f(9, 4) + '.<br>' +
      'Bước 2: ' + f(6, 4) + ' + ' + f(9, 4) + ' = ' + f(15, 4) + '.<br>' +
      'Bước 3: 15 ÷ 4 = 3 dư 3 → hỗn số 3' + f(3, 4) + '. ✅'),

    B('hau-so',
      '2' + f(3, 4) + ' − 1' + f(1, 2) + ' = ?',
      [M(1, 3, 4), M(2, 1, 4), M(1, 1, 4), F(5, 2)],
      2,
      'Chuyển thành phân số: 11/4 và 3/2.',
      'Bước 1: 2' + f(3, 4) + ' = ' + f(11, 4) + '; 1' + f(1, 2) + ' = ' + f(3, 2) + ' = ' + f(6, 4) + '.<br>' +
      'Bước 2: ' + f(11, 4) + ' − ' + f(6, 4) + ' = ' + f(5, 4) + '.<br>' +
      'Bước 3: 5 ÷ 4 = 1 dư 1 → hỗn số 1' + f(1, 4) + '. ✅'),

    B('hau-so',
      'Hỗn số 4' + f(1, 1) + ' bằng bao nhiêu?',
      [N(4), N(6), N(5), F(1, 1)],
      2,
      '1/1 bằng mấy?',
      f(1, 1) + ' = 1, nên 4' + f(1, 1) + ' = 4 + 1 = <b>5</b>. ✅'),

    B('hau-so',
      'Trong hỗn số 5' + f(2, 7) + ', <b>phần phân số</b> là:',
      [F(5, 7), N(5), F(7, 2), F(2, 7)],
      3,
      'Hỗn số gồm phần nguyên và phần phân số.',
      'Hỗn số 5' + f(2, 7) + ' gồm: phần nguyên là 5, phần phân số là ' + f(2, 7) + '. ✅'),

    B('hau-so',
      '3' + f(1, 3) + ' − 2 = ?',
      [M(2, 1, 3), F(1, 3), M(1, 2, 3), M(1, 1, 3)],
      3,
      'Chỉ trừ phần nguyên: 3 − 2 = ?',
      'Trừ phần nguyên: 3 − 2 = 1, phần phân số ' + f(1, 3) + ' giữ nguyên.<br>' +
      'Vậy 3' + f(1, 3) + ' − 2 = 1' + f(1, 3) + '. ✅'),

    B('hau-so',
      'Con thằn lằn bò được 1' + f(2, 3) + ' m, rồi lại bò thêm 1' + f(1, 3) + ' m. Tổng cộng thằn lằn bò được bao nhiêu mét?',
      [M(2, 1, 3), N(3), M(3, 1, 3), M(2, 2, 3)],
      1,
      '1 2/3 = 5/3 và 1 1/3 = 4/3. Cộng đi!',
      'Bước 1: 1' + f(2, 3) + ' = ' + f(5, 3) + '; 1' + f(1, 3) + ' = ' + f(4, 3) + '.<br>' +
      'Bước 2: ' + f(5, 3) + ' + ' + f(4, 3) + ' = ' + f(9, 3) + '.<br>' +
      'Bước 3: ' + f(9, 3) + ' = 3 (m). ✅')
  ];
})(typeof window !== 'undefined' ? window : globalThis);
