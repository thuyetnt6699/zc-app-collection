/* =========================================================
   HUB SMOKE TEST — chạy trọn trạm điều khiển trong Node bằng
   DOM giả: dựng thẻ, lọc, tìm kiếm, mở/đóng bảng chi tiết,
   chuyển dự án bằng bàn phím, chạy màn khởi động, lớp 3D.
   Chạy: node _hub/test/hub-smoke.js
   ========================================================= */
'use strict';

const path = require('path');
const fs = require('fs');
const vm = require('vm');
const { install } = require('./dom-shim.js');

const ROOT = path.join(__dirname, '..', '..');
const HUB = path.join(__dirname, '..');

let failures = 0;
let checks = 0;
function fail(msg) { failures++; console.error('  \u2717 FAIL: ' + msg); }
function ok(msg) { checks++; console.log('  \u2713 ' + msg); }
function eq(actual, expected, msg) {
  if (actual === expected) ok(msg + ' (' + actual + ')');
  else fail(msg + ' — mong đợi ' + expected + ', nhận được ' + actual);
}
function section(t) { console.log('\n  -- ' + t + ' --'); }

console.log('\n=== HUB SMOKE TEST — chạy trạm điều khiển không cần trình duyệt ===');

/* ---------- chuẩn bị DOM từ index.html thật ---------- */
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const { doc, win } = install(html);

const errors = [];
process.on('uncaughtException', (e) => errors.push(e));

const origError = console.error;
console.error = function (...args) { errors.push(new Error(args.join(' '))); origError.apply(console, args); };

/* ---------- nạp các script thật (đúng thứ tự trong index.html) ----------
   Giống trình duyệt thật: `globalThis` CHÍNH LÀ `window`, nên các script
   gắn dữ liệu lên window và mọi biến toàn cục nhìn thấy nhau.
   Không có `module` → file dữ liệu đi theo nhánh trình duyệt. */
Object.assign(win, {
  document: doc,
  navigator: win.navigator,
  location: win.location,
  history: win.history,
  console: console,
  setTimeout: setTimeout, clearTimeout: clearTimeout,
  setInterval: setInterval, clearInterval: clearInterval,
  performance: global.performance,
  IntersectionObserver: win.IntersectionObserver,
  matchMedia: win.matchMedia,
  getComputedStyle: win.getComputedStyle
});
win.requestAnimationFrame = (cb) => setTimeout(() => cb(global.performance.now()), 0);
win.cancelAnimationFrame = (id) => clearTimeout(id);
win.self = win;

const sb = vm.createContext(win);
vm.runInContext('var window = globalThis; var self = globalThis; var global = globalThis;', sb);

const files = ['projects.data.js', 'starfield.js', 'scene3d.js', 'cards.js', 'overlay.js', 'main.js'];
files.forEach((f) => {
  const code = fs.readFileSync(path.join(HUB, f), 'utf8');
  try {
    vm.runInContext(code, sb, { filename: '_hub/' + f });
  } catch (e) {
    fail('nạp ' + f + ' lỗi: ' + e.message);
  }
});
if (!failures) ok('Nạp 6 script không lỗi cú pháp/runtime: ' + files.join(', '));

const window = win;

/* =========================================================
   1. DOM SAU KHI DỰNG
   ========================================================= */
section('DỰNG GIAO DIỆN TỪ DỮ LIỆU');
const projects = window.HUB_PROJECTS;
const cards = doc.querySelectorAll('.card');
eq(cards.length, projects.length, 'Số thẻ bằng số dự án');

const pills = doc.querySelectorAll('.pill');
eq(pills.length, (window.HUB_CATEGORIES || []).length + 1, 'Số pill = số danh mục + "TẤT CẢ"');

const cardNames = cards.map((c) => (c.querySelector('.card-name') || {}).textContent);
if (projects.every((p) => cardNames.includes(p.name))) {
  ok('Mọi dự án đều có thẻ: ' + cardNames.join(' | '));
} else {
  projects.filter((p) => !cardNames.includes(p.name)).forEach((p) => fail('Thiếu thẻ cho "' + p.name + '"'));
}

eq(cards.filter((c) => c.querySelector('.card-art canvas')).length, cards.length, 'Mỗi thẻ có canvas hình vẽ thủ tục');

/* nút vào thẳng dự án — đường đi một cú bấm từ thẻ tới dự án */
const ctas = cards.map((c) => c.querySelector('.card-cta'));
eq(ctas.filter(Boolean).length, cards.length, 'Mỗi thẻ có nút "MỞ NGAY" vào thẳng dự án');
const ctaOk = projects.every((p, i) => ctas[i] && ctas[i].getAttribute('href') === p.href);
if (ctaOk) ok('Nút "MỞ NGAY" của từng thẻ trỏ đúng href dự án');
else fail('Nút "MỞ NGAY" trỏ sai href: ' + projects.map((p, i) => p.id + '=' + (ctas[i] ? ctas[i].getAttribute('href') : 'thiếu')).join(', '));

const firstCard = cards[0];
if (firstCard.querySelector('.badge')) ok('Thẻ có huy hiệu trạng thái');
else fail('Thẻ thiếu huy hiệu trạng thái');

if (projects[0].tech && firstCard.querySelectorAll('.chip').length === projects[0].tech.length) {
  ok('Thẻ có đủ chip công nghệ của dự án đầu (' + projects[0].tech.length + ')');
} else {
  fail('Chip công nghệ không khớp dữ liệu dự án đầu');
}
if (doc.getElementById('bay-count').textContent === 'BAY ' + projects.length + '/' + projects.length) {
  ok('Nhãn đếm kho dự án khởi tạo đúng');
} else {
  fail('Nhãn đếm sai: ' + doc.getElementById('bay-count').textContent);
}

/* =========================================================
   2. LỌC THEO LĨNH VỰC
   ========================================================= */
section('LỌC THEO LĨNH VỰC');
const catPill = pills.find((p) => p.getAttribute('data-cat') === 'giáo dục');
if (!catPill) {
  fail('Không tìm thấy pill "giáo dục"');
} else {
  catPill.click();
  const shown = doc.querySelectorAll('.card').filter((c) => !c.classList.contains('hidden'));
  const want = projects.filter((p) => p.category === 'giáo dục').length;
  eq(shown.length, want, 'Lọc "giáo dục" hiện đúng số dự án');
  if (doc.getElementById('bay-count').textContent === 'BAY ' + want + '/' + projects.length) {
    ok('Nhãn đếm cập nhật theo bộ lọc');
  } else {
    fail('Nhãn đếm sai sau khi lọc: ' + doc.getElementById('bay-count').textContent);
  }
  pills.find((p) => p.getAttribute('data-cat') === 'all').click();
  eq(doc.querySelectorAll('.card').filter((c) => !c.classList.contains('hidden')).length, projects.length,
    'Bỏ lọc → hiện lại toàn bộ');
}

/* =========================================================
   3. TÌM KIẾM
   ========================================================= */
const search = doc.getElementById('search-input');
search.value = 'phân số';
search.dispatch('input');

setTimeout(() => {
  section('TÌM KIẾM');
  const hit = doc.querySelectorAll('.card').filter((c) => !c.classList.contains('hidden'));
  if (hit.length >= 1 && hit.length < projects.length) ok('Tìm "phân số" thu hẹp kết quả còn ' + hit.length);
  else fail('Tìm kiếm không thu hẹp kết quả (nhận ' + hit.length + ')');

  search.value = 'zzz-không-tồn-tại';
  search.dispatch('input');

  setTimeout(() => {
    eq(doc.querySelectorAll('.card').filter((c) => !c.classList.contains('hidden')).length, 0, 'Từ khóa rác → 0 kết quả');
    if (doc.getElementById('empty-state').hidden === false) ok('Hiện trạng thái "KHÔNG CÓ TÍN HIỆU"');
    else fail('Không hiện trạng thái rỗng khi không có kết quả');

    search.value = '';
    search.dispatch('input');

    setTimeout(() => {
      /* =========================================================
         4. BẢNG CHI TIẾT
         ========================================================= */
      section('BẢNG CHI TIẾT DỰ ÁN');
      const cardList = doc.querySelectorAll('.card');
      cardList[0].querySelector('.card-hit').click();

      const detail = doc.getElementById('detail');
      if (detail.hidden === false) ok('Bảng chi tiết mở sau khi bấm thẻ');
      else fail('Bảng chi tiết không mở');

      eq(doc.getElementById('detail-name').textContent, projects[0].name, 'Tên dự án trong bảng đúng');
      eq(doc.getElementById('detail-open').getAttribute('href'), projects[0].href, 'Nút "MỞ DỰ ÁN" trỏ đúng href');
      /* phải mở trong tab hiện tại: target="_blank" làm tab nền nên trông như nút không chạy */
      if (doc.getElementById('detail-open').getAttribute('target') === null) ok('Nút "MỞ DỰ ÁN" mở trong tab hiện tại (không target="_blank")');
      else fail('Nút "MỞ DỰ ÁN" vẫn còn target="' + doc.getElementById('detail-open').getAttribute('target') + '"');
      /* dự án cần mạng phải có dòng nhắc rõ lý do */
      if (projects[0].needsNetwork) {
        if (doc.getElementById('detail-tip').hidden === false && doc.getElementById('detail-tip').textContent.length > 10) {
          ok('Dự án cần mạng có dòng nhắc giải thích');
        } else {
          fail('Dự án cần mạng nhưng không hiện dòng nhắc');
        }
      }
      /* video demo bị .gitignore loại khỏi git: dự án khai báo demoDisabled phải ẩn nút */
      const demoBtn = doc.getElementById('detail-demo');
      if (projects[0].demo && !projects[0].demoDisabled) {
        if (demoBtn.hidden === false) ok('Nút DEMO hiện khi dự án có video dùng được');
        else fail('Nút DEMO không hiện dù dự án có demo');
      } else if (demoBtn.hidden === true) {
        ok('Nút DEMO ẩn đúng cho dự án đang tắt demo (demoDisabled)');
      } else {
        fail('Nút DEMO vẫn hiện dù dự án đặt demoDisabled');
      }
      const firstBadges = cards[0].querySelectorAll('.badge').length;
      const wantBadges = 1 + (projects[0].needsNetwork ? 1 : 0) +
        (projects[0].demo && !projects[0].demoDisabled ? 1 : 0);
      eq(firstBadges, wantBadges, 'Số huy hiệu trên thẻ khớp dữ liệu dự án đầu');
      eq(doc.getElementById('detail-tech').querySelectorAll('.chip').length, projects[0].tech.length,
        'Số chip công nghệ trong bảng khớp dữ liệu');
      eq(doc.getElementById('detail-pos').textContent, '01 / ' + String(projects.length).padStart(2, '0'),
        'Vị trí dự án hiển thị đúng');

      doc.getElementById('detail-next').click();
      eq(doc.getElementById('detail-name').textContent, projects[1].name, 'Nút SAU chuyển sang dự án kế tiếp');
      doc.getElementById('detail-prev').click();
      eq(doc.getElementById('detail-name').textContent, projects[0].name, 'Nút TRƯỚC quay lại dự án đầu');

      win.dispatch('keydown', { key: 'ArrowRight' });
      eq(doc.getElementById('detail-name').textContent, projects[1].name, 'Phím → chuyển dự án');
      win.dispatch('keydown', { key: 'ArrowLeft' });
      eq(doc.getElementById('detail-name').textContent, projects[0].name, 'Phím ← quay lại');
      win.dispatch('keydown', { key: 'ArrowLeft' });
      eq(doc.getElementById('detail-name').textContent, projects[projects.length - 1].name,
        'Phím ← ở dự án đầu thì vòng về cuối');

      eq(doc.querySelectorAll('.card').filter((c) => c.classList.contains('active')).length, 1,
        'Chỉ một thẻ được đánh dấu đang mở');

      win.dispatch('keydown', { key: 'Escape' });

      setTimeout(() => {
        if (doc.body.classList.contains('locked') === false) ok('Đóng bảng → bỏ khoá cuộn trang');
        else fail('Đóng bảng nhưng trang vẫn bị khoá cuộn');

        /* =========================================================
           5. MÀN KHỞI ĐỘNG
           ========================================================= */
        section('MÀN KHỞI ĐỘNG, NỀN SAO, LỚP 3D');
        const boot = doc.getElementById('boot');
        if (boot.getAttribute('aria-hidden') === 'true') {
          ok('Màn khởi động đã tự ẩn sau khi chạy log');
        } else {
          fail('Màn khởi động không tự ẩn');
        }
        if (doc.getElementById('boot-log').innerHTML.length > 0) ok('Log khởi động có nội dung');
        else fail('Log khởi động trống');

        if (window.HUB_STARFIELD && typeof window.HUB_STARFIELD.stop === 'function') ok('Nền sao khởi tạo (HUB_STARFIELD)');
        else fail('Nền sao không khởi tạo');

        const spaceCanvas = doc.getElementById('space-canvas');
        if (spaceCanvas.getContext('2d')) ok('Canvas nền sao lấy được context 2D và vẽ không lỗi');
        else fail('Canvas nền sao không có context 2D');

        /* mô phỏng cuộn + di chuột để lớp parallax/độ sâu chạy */
        win.pageYOffset = 320;
        win.dispatch('scroll');
        win.dispatch('resize');
        win.dispatch('pointermove', { clientX: 900, clientY: 300, pointerType: 'mouse' });

        if (window.HUB_SCENE3D && typeof window.HUB_SCENE3D.refresh === 'function') ok('Lớp 3D khởi tạo (HUB_SCENE3D)');
        else fail('Lớp 3D không khởi tạo');

        const rootStyle = doc.documentElement.style;
        if (rootStyle.getPropertyValue('--scroll-z') || rootStyle.getPropertyValue('--scroll-rx')) {
          ok('Cuộn trang → lớp 3D ghi được biến độ sâu (--scroll-z/--scroll-rx)');
        } else {
          fail('Cuộn trang nhưng lớp 3D không cập nhật biến độ sâu');
        }

        setTimeout(() => {
          if (rootStyle.getPropertyValue('--mx')) ok('Parallax ghi được biến --mx theo con trỏ');
          else fail('Parallax không ghi biến --mx');

          /* ---- kết luận ---- */
          if (errors.length) {
            errors.slice(0, 8).forEach((e) => fail('lỗi runtime: ' + (e && (e.stack || e.message))));
          } else {
            ok('Không có lỗi runtime nào trong toàn bộ phiên chạy');
          }
          window.HUB_STARFIELD.stop();

          console.error = origError;
          console.log('');
          if (failures) {
            origError('=== HUB SMOKE TEST: THẤT BẠI — ' + failures + ' lỗi / ' + (checks + failures) + ' kiểm tra ===\n');
            process.exit(1);
          }
          console.log('=== HUB SMOKE TEST: TẤT CẢ ' + checks + ' KIỂM TRA ĐỀU PASS ===\n');
          process.exit(0);
        }, 120);
      }, 300);
    }, 140);
  }, 140);
}, 120);
