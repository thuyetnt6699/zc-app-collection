/* =========================================================
   DOM SMOKE TEST — mô phỏng trình duyệt tối thiểu, chạy
   cả phiên học: chọn chủ đề → làm đủ bài → kết quả →
   lưu bài → mở lại → xóa. Bắt lỗi runtime trong app.js.
   Chạy: node test/dom-smoke.js
   ========================================================= */
'use strict';
const path = require('path');
const fs = require('fs');
const dir = path.join(__dirname, '..', 'js');

let failures = 0;
function fail(msg) { failures++; console.error('  ✗ FAIL: ' + msg); }
function pass(msg) { console.log('  ✓ ' + msg); }

/* ---------- Đọc index.html để dựng sẵn các element ---------- */
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const htmlIds = [...html.matchAll(/id="([^"]+)"/g)].map((m) => m[1]);
function tagOf(id) {
  const i = html.indexOf('id="' + id + '"');
  if (i < 0) return null;
  const start = html.lastIndexOf('<', i);
  const end = html.indexOf('>', i);
  return html.slice(start, end + 1);
}

/* ---------- Element stub ---------- */
function makeEl(id) {
  const e = {
    id: id || '',
    tag: 'div',
    className: '',
    children: [],
    listeners: {},
    data: {},
    attrs: {},
    style: { setProperty() {} },
    _html: '',
    textContent: '',
    disabled: false,
    value: '10',
    files: [],
    _cls: new Set(),
    addEventListener(ev, cb) { (e.listeners[ev] = e.listeners[ev] || []).push(cb); },
    removeEventListener() {},
    fire(ev, arg) { (e.listeners[ev] || []).slice().forEach((cb) => cb.call(e, arg)); },
    appendChild(c) { e.children.push(c); return c; },
    removeChild(c) { const i = e.children.indexOf(c); if (i >= 0) e.children.splice(i, 1); },
    querySelector(sel) {
      const walk = (n) => {
        for (const c of n.children) {
          if (c.id && ('#' + c.id) === sel) return c;
          const r = walk(c);
          if (r) return r;
        }
        return null;
      };
      return walk(e);
    },
    querySelectorAll(sel) {
      if (sel === 'button') return e.children.filter((c) => c.tag === 'button');
      return [];
    },
    getAttribute(n) { return e.attrs[n]; },
    setAttribute(n, v) { e.attrs[n] = v; },
    getBoundingClientRect() { return { left: 10, top: 10, width: 100, height: 40 }; },
    scrollIntoView() {},
    focus() {},
    select() {},
    click() { e.fire('click'); },
    getContext() { return null; },
    width: 0,
    height: 0
  };
  Object.defineProperty(e, 'classList', {
    get() {
      return {
        add: (c) => e._cls.add(c),
        remove: (c) => e._cls.delete(c),
        toggle: (c, force) => {
          if (force === undefined) { e._cls.has(c) ? e._cls.delete(c) : e._cls.add(c); }
          else if (force) e._cls.add(c); else e._cls.delete(c);
          return e._cls.has(c);
        },
        contains: (c) => e._cls.has(c)
      };
    }
  });
  Object.defineProperty(e, 'innerHTML', {
    get() { return e._html; },
    set(v) {
      e._html = v || '';
      e.children = [];
      if (e._html.includes('<button')) {
        const re = /<button([^>]*)>([\s\S]*?)<\/button>/g;
        let m;
        while ((m = re.exec(e._html))) {
          const b = makeEl('dyn');
          b.tag = 'button';
          b._html = m[2];
          const cls = (m[1].match(/class="([^"]*)"/) || [])[1] || '';
          b.className = cls;
          e.children.push(b);
        }
      }
    }
  });
  return e;
}

const els = {};
htmlIds.forEach((id) => {
  const e = makeEl(id);
  const tag = tagOf(id);
  if (tag) {
    const da = tag.match(/data-action="([^"]+)"/);
    if (da) { e.data.action = da[1]; e.attrs['data-action'] = da[1]; }
    // các class ban đầu trong HTML (ví dụ "hidden")
    const cls = tag.match(/class="([^"]*)"/);
    if (cls) cls[1].split(/\s+/).filter(Boolean).forEach((c) => e._cls.add(c));
  }
  els[id] = e;
});
// Các nút có data-action nhưng KHÔNG có id (ví dụ nút trang chính)
[...html.matchAll(/<button[^>]*data-action="([^"]+)"[^>]*>/g)].forEach((m, i) => {
  const e = makeEl('da_' + i);
  e.tag = 'button';
  e.data.action = m[1];
  e.attrs['data-action'] = m[1];
  els['__da_' + i] = e;
});

global.document = {
  readyState: 'complete',
  _all: [],
  getElementById(id) {
    if (!els[id]) throw new Error('MISSING ELEMENT ID: ' + id);
    return els[id];
  },
  createElement(tag) { const e = makeEl(); e.tag = tag; global.document._all.push(e); return e; },
  querySelectorAll(sel) {
    if (sel === '[data-action]') {
      return Object.values(els).filter((e) => e.data && e.data.action);
    }
    if (sel === '#q-options .option-btn') {
      return els['q-options'].children.filter((c) => c.tag === 'button');
    }
    return [];
  },
  addEventListener() {},
  body: makeEl('body')
};

global.localStorage = {
  _d: {},
  getItem(k) { return Object.prototype.hasOwnProperty.call(this._d, k) ? this._d[k] : null; },
  setItem(k, v) { this._d[k] = String(v); },
  removeItem(k) { delete this._d[k]; }
};
global.window = global;
global.addEventListener = function () {};
global.innerWidth = 1280;
global.innerHeight = 720;
global.requestAnimationFrame = function () { return 0; };
global.Blob = class { constructor(parts) { this.parts = parts; } };
global.FileReader = class { readAsText() {} };
global.URL = { createObjectURL() { return 'blob:x'; }, revokeObjectURL() {} };

/* ---------- Nạp module theo đúng thứ tự index.html ---------- */
require(path.join(dir, 'audio.js'));
require(path.join(dir, 'generator.js'));
require(path.join(dir, 'bank.js'));
require(path.join(dir, 'storage.js'));
require(path.join(dir, 'confetti.js'));
require(path.join(dir, 'quiz.js'));
require(path.join(dir, 'app.js'));

const PS = globalThis.PS;

/* ---------- Bắt đầu kiểm tra ---------- */
console.log('== DOM smoke test ==');

// 1. app.js tự chạy init() (readyState = 'complete')
pass('app.js khởi tạo không lỗi runtime');

// 2. Mọi id được dùng trong app.js đều có trong index.html
const appSrc = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
const usedIds = new Set([...appSrc.matchAll(/\$\('([^']+)'\)/g)].map((m) => m[1]));
for (const id of usedIds) {
  if (!htmlIds.includes(id)) fail(`app.js dùng #${id} nhưng index.html không có`);
}
pass('mọi id DOM trong app.js đều tồn tại trong index.html');

// 3. Lưới chủ đề
const grid = els['topic-grid'];
if (grid.children.length !== PS.TOPICS.length) {
  fail('topic-grid có ' + grid.children.length + ' thẻ, kỳ vọng ' + PS.TOPICS.length);
} else pass('topic-grid có ' + grid.children.length + ' chủ đề');

// 4. Chọn chủ đề Hỗn số → làm đủ bài
const target = grid.children.find((c) => c._html.includes('Hỗn số')) || grid.children[5];
target.fire('click');
if (els['screen-quiz'].classList.contains('hidden')) fail('màn quiz không hiện sau khi chọn chủ đề');
else pass('chọn chủ đề Hỗn số → vào màn làm bài');

const len = parseInt(els['quiz-length'].value, 10) || 10;
for (let i = 0; i < len; i++) {
  const opts = els['q-options'].children;
  if (opts.length !== 4) { fail('câu ' + (i + 1) + ': có ' + opts.length + ' đáp án'); break; }
  const choice = i % 2 === 0 ? 0 : 1; // xen kẽ đáp án A/B → thử cả đúng lẫn sai
  opts[choice].fire('click');
  if (els['feedback'].classList.contains('hidden')) { fail('câu ' + (i + 1) + ': feedback không hiện'); break; }
  els['btn-next'].fire('click');
  if (i < len - 1 && els['screen-quiz'].classList.contains('hidden')) { fail('mất màn quiz giữa chừng'); break; }
}
pass('làm đủ ' + len + ' câu không lỗi');

// 5. Màn kết quả
if (els['screen-results'].classList.contains('hidden')) fail('màn kết quả không hiện');
else pass('màn kết quả hiện: ' + els['result-title'].textContent);

// 5b. Thanh cảnh báo lưu trữ phải ẨN (stub localStorage đang hoạt động)
if (!els['storage-warning'].classList.contains('hidden')) fail('thanh cảnh báo phải ẩn khi lưu trữ hoạt động');
else pass('thanh cảnh báo lưu trữ ẩn đúng khi lưu trữ khả dụng');

// 5c. Nút "Xem bài đã lưu" từ màn kết quả
els['btn-view-saves'].fire('click');
if (els['screen-saves'].classList.contains('hidden')) fail('nút Xem bài đã lưu không chuyển màn');
else if (!els['saves-list'].children.length) fail('bài vừa làm không xuất hiện trong Bài đã lưu');
else pass('nút "Xem bài đã lưu" hiện đúng ' + els['saves-list'].children.length + ' bài');

// 6. Tự động lưu
const saves = PS.storage.loadSaves();
if (!saves.length) fail('không có bài nào được tự động lưu');
else pass('tự động lưu được ' + saves.length + ' bài');

// 7. Nút "Bài mới"
els['btn-retry'].fire('click');
if (els['screen-quiz'].classList.contains('hidden')) fail('nút retry không đưa về màn quiz');
else pass('nút "Bài mới" hoạt động');

// 8. Thoát giữa bài → modal → Thoát → màn bài đã lưu
els['btn-quit-quiz'].fire('click');
const modalBox = els['modal-box'];
const actions = modalBox.children[modalBox.children.length - 1];
if (!actions || !actions.children.length) fail('modal không có nút');
else {
  actions.children[actions.children.length - 1].fire('click');
  if (els['screen-saves'].classList.contains('hidden')) fail('không chuyển sang màn bài đã lưu');
  else pass('thoát giữa bài → lưu tự động → màn "Bài đã lưu"');
}

// 9. Tiếp tục bài đã lưu
const saveCards = els['saves-list'].children;
if (!saveCards.length) fail('danh sách bài đã lưu rỗng');
else {
  const contBtn = saveCards[0].children.find((c) => c.tag === 'button' && c._html.includes('▶'));
  if (!contBtn) fail('không tìm được nút Tiếp tục/Làm lại');
  else {
    contBtn.fire('click');
    if (els['screen-quiz'].classList.contains('hidden')) fail('nút Tiếp tục không đưa về màn quiz');
    else pass('nút "Tiếp tục" khôi phục bài đã lưu');
  }
}

// 10. Xóa bài
els['btn-home'].fire('click');
const daEls = global.document.querySelectorAll('[data-action]');
const savesBtn = daEls.find((e) => e.data.action === 'saves');
if (!savesBtn) fail('không tìm được nút data-action=saves');
else {
  savesBtn.fire('click');
  const cards2 = els['saves-list'].children;
  if (!cards2.length) fail('saves rỗng khi xóa');
  else {
    const delBtn = cards2[0].children.find((c) => c.tag === 'button' && c._html.includes('Xóa'));
    delBtn.fire('click');
    const mb = els['modal-box'];
    const mbActions = mb.children[mb.children.length - 1];
    mbActions.children[mbActions.children.length - 1].fire('click');
    pass('xóa bài hoạt động, còn ' + PS.storage.loadSaves().length + ' bài');
  }
}

// 11. Nút xuất file
els['btn-export'].fire('click');
pass('nút xuất file không crash');

// 12. Màn phần thưởng: hiển thị + trạng thái lưu trữ
const rewardsBtn = global.document.querySelectorAll('[data-action]').find((e) => e.data.action === 'rewards');
if (!rewardsBtn) fail('không tìm được nút data-action=rewards');
else {
  rewardsBtn.fire('click');
  if (els['screen-rewards'].classList.contains('hidden')) fail('màn phần thưởng không hiện');
  else if (els['level-card'].innerHTML.indexOf('Cấp bậc') === -1) fail('level-card trống');
  else if (els['badges-grid'].children.length !== PS.BADGES.length) fail('badges-grid có ' + els['badges-grid'].children.length + ' huy hiệu');
  else if (!els['rewards-storage'].textContent) fail('thiếu dòng trạng thái lưu trữ');
  else pass('màn phần thưởng hiển thị ' + els['badges-grid'].children.length + ' huy hiệu + trạng thái lưu trữ');
}

// 13. Nút xóa thống kê
const ptsBefore = PS.storage.loadStats().totalPoints;
els['btn-reset-stats'].fire('click');
const mb = els['modal-box'];
const mbActions = mb.children[mb.children.length - 1];
mbActions.children[mbActions.children.length - 1].fire('click'); // "Xóa"
const stAfter = PS.storage.loadStats();
if (stAfter.totalPoints !== 0) fail('xóa thống kê không về 0 (trước: ' + ptsBefore + ', sau: ' + stAfter.totalPoints + ')');
else pass('nút xóa thống kê hoạt động (' + ptsBefore + ' → 0)');

/* ---------- Kết quả ---------- */
console.log('\n==================================================');
if (failures === 0) {
  console.log('✅ PASS: DOM smoke test — cả phiên học chạy không lỗi runtime.');
  process.exit(0);
} else {
  console.log('❌ FAIL: ' + failures + ' lỗi.');
  process.exit(1);
}
