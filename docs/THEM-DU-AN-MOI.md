# Thêm một dự án mới vào TRẠM ĐIỀU KHIỂN

Trang chủ `index.html` **không chứa tên dự án nào**. Toàn bộ thẻ, huy hiệu, bộ lọc,
ô tìm kiếm, dải chỉ số và bảng chi tiết đều được dựng tự động từ **một file dữ liệu duy nhất**:

```
_hub/projects.data.js
```

Thêm dự án mới = thêm một object vào mảng `HUB_PROJECTS`, rồi chạy kiểm tra. Không phải sửa HTML, CSS hay JavaScript.

> **Hai đường vào dự án:** bấm nút **MỞ NGAY** ở góc dưới–phải mỗi thẻ để vào thẳng dự án; bấm vào thân thẻ để mở bảng chi tiết rồi bấm **MỞ DỰ ÁN**. Cả hai đều lấy đường dẫn từ trường `href`, nên chỉ cần khai báo đúng là xong.

---

## 3 bước

### 1. Đặt dự án vào kho

Tạo file/thư mục dự án trong `D:\WORKS\Test\` (cùng cấp với `index.html`), ví dụ:

```
D:\WORKS\Test\game-moi\index.html
```

### 2. Thêm một object vào `_hub/projects.data.js`

```js
{
  id: 'game-moi',                        // BẮT BUỘC — duy nhất, kebab-case (a-z, 0-9, gạch nối)
  order: 50,                             // số nhỏ hiện trước
  name: 'Game Mới',                      // BẮT BUỘC — tên hiển thị
  nameEn: 'NEW GAME',                    // dòng phụ kiểu HUD
  category: 'trò chơi',                  // BẮT BUỘC — phải có trong HUB_CATEGORIES
  tagline: 'Một dòng mô tả ngắn',
  description: 'Hai tới ba câu tiếng Việt…',   // BẮT BUỘC
  href: 'game-moi/index.html',           // BẮT BUỘC — đường dẫn tương đối từ gốc kho
  tech: ['Canvas 2D', 'Vanilla JS'],
  accent: '#7df9ff',                     // BẮT BUỘC — màu chủ đạo, dạng #rrggbb
  icon: 'generic',                        // BẮT BUỘC — orbit | bird | mole | fraction | generic
  status: 'online',                      // BẮT BUỘC — online | beta | archived
  needsNetwork: true,                    // true → hub gắn huy hiệu "CẦN MẠNG" + dòng nhắc trong bảng chi tiết
  year: 2026,
  demo: 'Game-Moi.mp4'                   // tùy chọn — có thì hub hiện nút "▶ XEM DEMO"
}
```

Nhớ **dấu phẩy** giữa các object.

### 3. Chạy kiểm tra

```bash
node _hub/test/hub-test.js
```

Lệnh này tự bắt các lỗi hay gặp: thiếu trường bắt buộc, `id` trùng hoặc ghi sai kiểu,
`href` gõ sai đường dẫn (file không tồn tại), `category` lạ, màu sai định dạng,
`status`/`icon` không nằm trong danh sách cho phép, `demo` không tồn tại.

Chạy thêm bài kiểm tra giao diện (không cần trình duyệt):

```bash
node _hub/test/hub-smoke.js
```

Xong. Mở lại trang (Ctrl + F5 để tránh bản cache) là thấy dự án mới.

---

## Ý nghĩa từng trường

| Trường | Bắt buộc | Ghi chú |
|---|---|---|
| `id` | ✅ | Duy nhất, kebab-case. Dùng làm khoá nội bộ. |
| `order` | — | Số nhỏ đứng trước. Không khai báo thì giữ nguyên thứ tự trong file. |
| `name` | ✅ | Tên hiển thị trên thẻ và trong bảng chi tiết. |
| `nameEn` | — | Dòng chữ nhỏ bên dưới tên (thường là tên tiếng Anh). |
| `category` | ✅ | Phải khớp một `id` trong `HUB_CATEGORIES` — nếu không hub bỏ qua khi lọc. |
| `tagline` | — | Một dòng mô tả ngắn, hiện màu nhấn. |
| `description` | ✅ | 2–3 câu. Trên thẻ chỉ hiện 3 dòng đầu, trong bảng chi tiết hiện đầy đủ. |
| `href` | ✅ | Đường dẫn **tương đối từ gốc kho** (`D:\WORKS\Test`). |
| `tech` | — | Mảng nhãn nhỏ (công nghệ, kỹ thuật). |
| `accent` | ✅ | Màu chủ đạo của thẻ: viền, quầng sáng, hạt, chữ nhấn. Dạng `#rrggbb`. |
| `icon` | ✅ | Chọn hình vẽ thủ tục: `orbit` (hệ hành tinh), `bird` (ống nước + chim), `mole` (lưới ô + chuột đội lên), `fraction` (phân số), `generic` (mạng lưới nút). |
| `status` | ✅ | `online` (xanh, có nhịp sáng), `beta` (vàng), `archived` (xám). |
| `needsNetwork` | — | `true` → huy hiệu "CẦN MẠNG" và ô "KẾT NỐI: CẦN MẠNG" trong bảng chi tiết. |
| `year` | — | Năm thực hiện. |
| `demo` | — | Đường dẫn video demo tương đối từ gốc kho. Có thì hiện nút tải/xem. Video **không** tự tải trên thẻ nên không làm nặng trang. |

---

## Thêm lĩnh vực (danh mục) mới

Sửa `HUB_CATEGORIES` trong cùng file:

```js
var HUB_CATEGORIES = [
  { id: 'trò chơi',  name: 'TRÒ CHƠI',  en: 'ARCADE' },
  { id: 'giáo dục',  name: 'GIÁO DỤC',  en: 'EDUCATION' },
  { id: 'mô phỏng',  name: 'MÔ PHỎNG',  en: 'SIMULATION' },
  { id: 'tiện ích',  name: 'TIỆN ÍCH',  en: 'UTILITY' }   // ← thêm ở đây
];
```

Nút lọc trên hub được sinh tự động và **chỉ hiện khi lĩnh vực đó có ít nhất một dự án**.

---

## Thêm kiểu hình vẽ mới cho thẻ

Hình trên thẻ là tranh vẽ bằng canvas, không phải ảnh. Muốn thêm kiểu mới:

1. Mở `_hub/cards.js`.
2. Thêm hàm vẽ vào đối tượng `ART`, nhận `(c, w, h, accent, t, seed)` — `c` là context 2D,
   `w/h` là kích thước, `accent` là màu của dự án, `t` là số giây để vẽ chuyển động.
3. Thêm tên khoá đó vào `HUB_ICONS` trong `_hub/projects.data.js`.
4. `node _hub/test/hub-test.js` để xác nhận `icon` mới hợp lệ.

---

## Nếu dự án nằm sâu nhiều cấp thư mục

Chỉ cần khai báo `href` đúng, ví dụ `a/b/c/index.html`. Hub vẫn liên kết đúng.

Riêng **nút "⌂ VỀ TRẠM ĐIỀU KHIỂN"** đặt trong chính dự án đó phải tự chỉnh độ sâu:

- Dự án ở gốc: `<a href="index.html">`
- Dự án cách 1 cấp: `<a href="../index.html">`
- Dự án cách 2 cấp: `<a href="../../index.html">`

Đoạn HTML + CSS của nút này đã có sẵn trong `flappy.html`, `whack-a-mole.html`
và `hoc-phan-so-lop5/index.html` — chỉ việc sao chép và sửa `href`.

---

## Vị trí nút "VỀ TRẠM" trong từng dự án

| Dự án | Cách chèn | Vì sao đặt ở đó |
|---|---|---|
| `flappy.html` | Thẻ `<a class="hub-back">` + `<style>` sau `#wrap` | Góc dưới–trái, không đè khung game đang canh giữa |
| `whack-a-mole.html` | Thẻ `<a class="hub-back">` + `<style>` sau `#wrap` | Giống trên |
| `solar-system.html` | Thẻ `<a class="hub-back">` trước `#scene`, CSS nằm trong `<style>` ngay trên | Góc dưới–trái; `#hint` đã được nâng lên `bottom:62px` để chừa chỗ |
| `hoc-phan-so-lop5/` | `<a class="hub-back" href="../index.html">` ở đầu `<body>` + CSS trong `css/style.css` | Góc dưới–trái, tránh thanh toast nằm giữa dưới và phần thưởng |

Trong cả 4 dự án, nút này **chỉ trang trí**: nền mờ, viền cyan, không ảnh hưởng logic.
Trên màn hình nhỏ (≤ 520–560px) nút tự thu lại còn biểu tượng `⌂`.
