/* =========================================================
   TEST — Kiểm tra tính đúng đắn của toàn bộ câu hỏi
   Chạy: node test/generator-test.js
   ========================================================= */
'use strict';

const path = require('path');
const dir = path.join(__dirname, '..', 'js');
require(path.join(dir, 'audio.js'));
require(path.join(dir, 'generator.js'));
require(path.join(dir, 'bank.js'));
require(path.join(dir, 'storage.js'));
require(path.join(dir, 'quiz.js'));

const PS = globalThis.PS;

let failures = 0;
let checked = 0;
function fail(msg) { failures++; console.error('  ✗ FAIL: ' + msg); }
function ok() { checked++; }

/* Giá trị số của một đáp án (dùng để kiểm tra đáp án đúng) */
function optVal(o) {
  if (o.t === 'f') return o.a / o.b;
  if (o.t === 'm') return o.q + o.a / o.b;
  if (o.t === 'n') return o.v;
  return NaN;
}

/* Kiểm tra cấu trúc chung của mọi câu hỏi */
function checkStruct(q, label) {
  if (!q || typeof q !== 'object') return fail(label + ': câu hỏi rỗng');
  if (!Array.isArray(q.options) || q.options.length !== 4) {
    return fail(label + ': số đáp án != 4 (' + (q.options || []).length + ')');
  }
  if (q.correct < 0 || q.correct >= q.options.length) return fail(label + ': chỉ số đáp án đúng sai');
  const keys = q.options.map(PS.optKey);
  if (new Set(keys).size !== 4) return fail(label + ': có đáp án trùng: ' + keys.join(' | '));
  // đáp án không hợp lệ
  // (phân số cho phép 0/b và a/1 — vẫn là phân số hợp lệ;
  //  hỗn số bắt buộc 1 <= phần phân số < mẫu số)
  q.options.forEach((o, i) => {
    if (o.t === 'f' && (o.b < 1 || o.a < 0)) fail(label + ': đáp án phân số không hợp lệ ' + keys[i]);
    if (o.t === 'm' && (o.q < 0 || o.b < 2 || o.a < 1 || o.a >= o.b)) fail(label + ': hỗn số không hợp lệ ' + keys[i]);
  });
  if (!q.question || q.question.length < 4) return fail(label + ': thiếu câu hỏi');
  if (!q.explanation || q.explanation.length < 30) return fail(label + ': lời giải quá ngắn/thiếu');
  if (!q.hint) return fail(label + ': thiếu gợi ý');
  if (!q.topic) return fail(label + ': thiếu topic');
  // Tối đa 1 bẫy "chủ đích" được trùng giá trị với đáp án đúng
  // (ví dụ phân số chưa rút gọn). Nhiều hơn nghĩa là có lỗi.
  const cv = optVal(q.options[q.correct]);
  if (!isNaN(cv)) {
    let same = 0;
    q.options.forEach((o, i) => { if (i !== q.correct && optVal(o) === cv) same++; });
    if (same > 1) fail(label + ': ' + same + ' bẫy trùng giá trị đáp án đúng (' + cv + ')');
  }
  ok();
}

/* Kiểm tra ĐÚNG SAI toán học của câu sinh (theo meta) */
function checkMath(q, label) {
  const m = q.meta;
  if (!m) return; // câu bộ đề: kiểm tra cấu trúc đã đủ
  let expected = null;
  if (m.kind === 'simplify') expected = m.a / m.b;
  else if (m.kind === 'add') expected = m.a / m.b + m.c / m.d;
  else if (m.kind === 'sub') expected = m.a / m.b - m.c / m.d;
  else if (m.kind === 'mul') expected = (m.a / m.b) * (m.c / m.d);
  else if (m.kind === 'div') expected = (m.a / m.b) / (m.c / m.d);
  else if (m.kind === 'tomixed') expected = m.a / m.b;
  else if (m.kind === 'frommixed') expected = m.q + m.a / m.b;
  else if (m.kind === 'mixedadd') expected = (m.q1 + m.a1 / m.b1) + (m.q2 + m.a2 / m.b2);
  else if (m.kind === 'mixedsub') expected = (m.q1 + m.a1 / m.b1) - (m.q2 + m.a2 / m.b2);
  else if (m.kind === 'eq1') {
    const c = q.options[q.correct];
    if (c.t !== 'f' || c.a !== c.b) fail(label + ': đáp án "bằng 1" sai: ' + JSON.stringify(c));
    ok();
    return;
  }
  else if (m.kind === 'compare') {
    const l = m.a / m.b, r = m.c / m.d;
    const sym = l > r ? '>' : l < r ? '<' : '=';
    const c = q.options[q.correct];
    if (c.t !== 's' || c.v !== sym) fail(label + ': so sánh sai: ' + JSON.stringify(c) + ' kỳ vọng ' + sym);
    ok();
    return;
  }
  else if (m.kind === 'read') return ok(); // câu đọc: kiểm tra cấu trúc đã đủ

  const got = optVal(q.options[q.correct]);
  if (expected !== null && Math.abs(got - expected) > 1e-9) {
    fail(label + ': đáp án đúng = ' + got + ', kỳ vọng = ' + expected + ' (meta ' + JSON.stringify(m) + ')');
  } else ok();
}

/* ---------------- Chạy test ---------------- */
console.log('== Kiểm tra máy sinh câu hỏi ==');
const ROUNDS = 600;
Object.keys(PS.QUESTION_GENERATORS).forEach((topic) => {
  const gens = PS.QUESTION_GENERATORS[topic];
  gens.forEach((gen, gi) => {
    let localFail = 0;
    for (let r = 0; r < ROUNDS; r++) {
      const before = failures;
      const q = gen();
      const label = `gen[${topic}#${gi}]#${r}`;
      checkStruct(q, label);
      checkMath(q, label);
      if (failures > localFail) { localFail = failures; }
    }
    console.log(`  · ${topic} / ${gens[gi].name}: ${ROUNDS} câu OK${failures ? '' : ''}`);
  });
});

console.log('\n== Kiểm tra bộ câu hỏi khái niệm (bank) ==');
if (!PS.bank.length) fail('bank rỗng');
PS.bank.forEach((q, i) => {
  const label = `bank#${i} (${q.topic})`;
  checkStruct(q, label);
  // đáp án đúng phải tồn tại và nằm trong danh sách
  if (!q.options[q.correct]) fail(label + ': options[correct] undefined');
});
console.log(`  · ${PS.bank.length} câu trong bank`);

console.log('\n== Kiểm tra buildQuiz (ghép bài) ==');
[10, 15, 20].forEach((n) => {
  PS.TOPICS.forEach((t) => {
    const quiz = PS.buildQuiz(t.key, n);
    if (quiz.length !== n) fail(`buildQuiz(${t.key}, ${n}): nhận ${quiz.length} câu`);
    const keys = quiz.map((q) => q.id);
    if (new Set(keys).size !== n) fail(`buildQuiz(${t.key}, ${n}): có id trùng`);
    quiz.forEach((q, i) => {
      checkStruct(q, `buildQuiz(${t.key})#${i}`);
      checkMath(q, `buildQuiz(${t.key})#${i}`);
    });
    ok();
  });
});
console.log('  · mọi chủ đề × 10/15/20 câu OK');

/* ---------------- Kết quả ---------------- */
console.log('\n==================================================');
if (failures === 0) {
  console.log(`✅ PASS: ${checked} kiểm tra, 0 lỗi. Mọi câu hỏi đều đúng toán học & đủ lời giải.`);
  process.exit(0);
} else {
  console.log(`❌ FAIL: ${failures} lỗi trong ${checked} kiểm tra.`);
  process.exit(1);
}
