/* =========================================================
   HUB TEST — kiểm tra dữ liệu trạm điều khiển (không cần trình duyệt).
   Chạy: node _hub/test/hub-test.js
   Bắt được: thiếu trường, id trùng/sai định dạng, href gõ sai
   (file không tồn tại), danh mục lạ, màu sai, enum sai, demo thiếu.
   ========================================================= */
'use strict';

const path = require('path');
const fs = require('fs');

const ROOT = path.join(__dirname, '..', '..');
const data = require(path.join(__dirname, '..', 'projects.data.js'));
const { HUB_PROJECTS, HUB_CATEGORIES, HUB_ICONS } = data;

let failures = 0;
function fail(msg) { failures++; console.error('  \u2717 FAIL: ' + msg); }
function pass(msg) { console.log('  \u2713 ' + msg); }

const KEBAB = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const HEX = /^#[0-9a-fA-F]{6}$/;
const STATUSES = ['online', 'beta', 'archived'];
const REQUIRED = ['id', 'name', 'category', 'description', 'href', 'accent', 'icon', 'status'];

console.log('\n=== HUB TEST — trạm điều khiển dự án ===\n');

/* ---------- 1. Hình dạng dữ liệu tổng thể ---------- */
if (!Array.isArray(HUB_PROJECTS) || HUB_PROJECTS.length === 0) {
  fail('HUB_PROJECTS phải là mảng và không rỗng');
  process.exit(1);
}
if (!Array.isArray(HUB_CATEGORIES) || HUB_CATEGORIES.length === 0) fail('HUB_CATEGORIES phải là mảng và không rỗng');
if (!Array.isArray(HUB_ICONS) || HUB_ICONS.length === 0) fail('HUB_ICONS phải là mảng và không rỗng');
if (failures === 0) pass('Cấu trúc dữ liệu: ' + HUB_PROJECTS.length + ' dự án, ' + HUB_CATEGORIES.length + ' danh mục, ' + HUB_ICONS.length + ' loại hình vẽ');

const catIds = HUB_CATEGORIES.map((c) => c.id);

/* ---------- 2. Từng dự án ---------- */
const seenIds = new Set();
const seenHref = new Map();
const usedCats = new Set();
const demoMissing = [];
const warnList = [];

HUB_PROJECTS.forEach((p, i) => {
  const at = '[' + i + '] ' + (p && p.id ? p.id : '(không có id)');

  if (!p || typeof p !== 'object') { fail(at + ' không phải object'); return; }

  /* trường bắt buộc */
  REQUIRED.forEach((k) => {
    const v = p[k];
    if (v === undefined || v === null || v === '') fail(at + ' thiếu trường bắt buộc "' + k + '"');
    else if (typeof v !== 'string') fail(at + ' trường "' + k + '" phải là chuỗi');
  });

  /* id */
  if (typeof p.id === 'string') {
    if (!KEBAB.test(p.id)) fail(at + ' id phải kebab-case (a-z, 0-9, gạch nối)');
    if (seenIds.has(p.id)) fail(at + ' id bị trùng với dự án khác');
    seenIds.add(p.id);
  }

  /* category */
  if (typeof p.category === 'string') {
    if (catIds.indexOf(p.category) < 0) fail(at + ' danh mục "' + p.category + '" không có trong HUB_CATEGORIES');
    else usedCats.add(p.category);
  }

  /* accent */
  if (typeof p.accent === 'string' && !HEX.test(p.accent)) fail(at + ' accent phải dạng #rrggbb, đang là "' + p.accent + '"');

  /* enum */
  if (p.status !== undefined && STATUSES.indexOf(p.status) < 0) fail(at + ' status phải thuộc ' + STATUSES.join(' | '));
  if (p.icon !== undefined && HUB_ICONS.indexOf(p.icon) < 0) fail(at + ' icon phải thuộc ' + HUB_ICONS.join(' | '));

  /* tech */
  if (p.tech !== undefined) {
    if (!Array.isArray(p.tech) || p.tech.some((t) => typeof t !== 'string' || !t)) fail(at + ' tech phải là mảng chuỗi không rỗng');
  }

  /* needsNetwork / order / year */
  if (p.needsNetwork !== undefined && typeof p.needsNetwork !== 'boolean') fail(at + ' needsNetwork phải là boolean');
  if (p.order !== undefined && typeof p.order !== 'number') fail(at + ' order phải là số');
  if (p.year !== undefined && !Number.isInteger(p.year)) fail(at + ' year phải là số nguyên');

  /* href trỏ tới file thật */
  if (typeof p.href === 'string' && p.href) {
    const abs = path.resolve(ROOT, p.href);
    if (!abs.startsWith(ROOT)) fail(at + ' href trỏ ra ngoài project: ' + p.href);
    else if (!fs.existsSync(abs)) fail(at + ' href không tồn tại trên đĩa: ' + p.href);
    else if (fs.statSync(abs).isDirectory()) fail(at + ' href đang trỏ tới thư mục, cần trỏ tới file: ' + p.href);
    else {
      if (seenHref.has(p.href)) fail(at + ' href trùng với dự án "' + seenHref.get(p.href) + '": ' + p.href);
      seenHref.set(p.href, p.id);
    }
  }

  /* demo (tùy chọn)
     Video demo bị .gitignore loại khỏi git vì quá nặng, nên khi thiếu file mà
     dự án đã khai báo demoDisabled:true thì chỉ cảnh báo, không tính là lỗi. */
  if (p.demo !== undefined) {
    if (typeof p.demo !== 'string' || !p.demo) fail(at + ' demo phải là chuỗi không rỗng');
    else if (!fs.existsSync(path.resolve(ROOT, p.demo))) {
      if (p.demoDisabled === true) demoMissing.push(p.id + ' → ' + p.demo);
      else fail(at + ' demo không tồn tại trên đĩa: ' + p.demo + ' (thêm "demoDisabled: true" nếu video không nằm trong git)');
    } else if (p.demoDisabled === true) {
      warnList.push(p.id + ': có file demo trên đĩa nhưng đang đặt demoDisabled:true → nút DEMO không hiện');
    }
  }
});

if (failures === 0) {
  pass('Mọi dự án hợp lệ: đủ trường, id duy nhất, href tồn tại thật trên đĩa' +
       (demoMissing.length ? ' (demo thiếu file có khai báo demoDisabled → chỉ cảnh báo)' : ' + demo tồn tại thật'));
}
/* ---------- 3. Mỗi danh mục phải có ít nhất 1 dự án ---------- */
catIds.forEach((c) => {
  if (!usedCats.has(c)) fail('Danh mục "' + c + '" không có dự án nào → filter trên hub sẽ rỗng');
});
if (catIds.every((c) => usedCats.has(c))) pass('Mỗi danh mục đều có dự án');

/* ---------- 4. Cảnh báo mềm (không tính là fail) ---------- */
const warns = [];
HUB_PROJECTS.forEach((p) => {
  if (!p.tagline) warns.push(p.id + ': thiếu tagline → dòng phụ trên thẻ sẽ trống');
  if (!p.tech || !p.tech.length) warns.push(p.id + ': thiếu tech → hàng nhãn trên thẻ sẽ trống');
  if (p.needsNetwork === true && (!p.demo || p.demoDisabled)) warns.push(p.id + ': cần mạng nhưng không có demo xem được');
});
demoMissing.forEach((d) => warns.push('thiếu file video demo (' + d + ') → nút DEMO đang ẩn, xem .gitignore'));
warnList.forEach((w) => warns.push(w));
warns.forEach((w) => console.log('  ! cảnh báo: ' + w));

/* ---------- Kết luận ---------- */
console.log('');
if (failures) {
  console.error('=== HUB TEST: THẤT BẠI — ' + failures + ' lỗi ===\n');
  process.exit(1);
}
console.log('=== HUB TEST: TẤT CẢ ĐỀU PASS ===\n');
