# Landing Page "Trạm Điều Khiển Dự Án" — sci-fi, tự chứa, mở rộng được

> Trạng thái: **ĐÃ HOÀN THÀNH** — kế hoạch được duyệt và thực thi đầy đủ
> Ngày lập: 2025 · Ngôn ngữ UI: tiếng Việt · Phong cách: sci-fi vũ trụ
> Cách thêm dự án mới: `docs/THEM-DU-AN-MOI.md`

## 1. Mục tiêu & tiêu chí thành công

Tạo **một hub page** ở gốc project, giới thiệu toàn bộ dự án hiện có, giao diện sci-fi vũ trụ với nhiều chuyển động + chiều sâu 3D + ánh sáng, và **thêm dự án mới chỉ bằng 1 entry dữ liệu** (không sửa layout).

Tiêu chí nghiệm thu:

- Mở `http://localhost:8000/` (hoặc `:3000`) thấy hub: nền vũ trụ 3D chuyển động, 4 thẻ dự án, click → mở overlay chi tiết → nút mở dự án chạy đúng.
- Thêm 1 dự án thứ 5 = copy 1 object trong `hub/projects.data.js`, sửa nội dung. Grid/filter/tìm kiếm/overlay tự cập nhật, **không sửa HTML/CSS**.
- `node hub/test/hub-test.js` → PASS toàn bộ (schema + link tồn tại thật trên đĩa).
- Hub hoạt động **offline và qua `file://`** (không phụ thuộc CDN/thư viện ngoài).
- Không sửa nội dung/logic của 4 dự án hiện có (chỉ thêm 1 link "quay lại trạm").

## 2. Quyết định thiết kế đã chốt

| Vấn đề | Chốt | Lý do |
|---|---|---|
| Vị trí hub | `index.html` ở **gốc** `D:\WORKS\Test\` | `serve .` mặc định trả về hub; đường dẫn tới 4 dự án là tương đối cùng cấp |
| Tài sản hub | `hub/` (data, css, js, test) | Tiền tố `_` đứng đầu bảng chữ cái, không đụng tên dự án tương lai |
| 3D engine | **Không dùng three.js** — Canvas 2D tự chiếu phối cảnh + CSS 3D `perspective`/`translateZ` | jsdelivr/npm không truy cập được từ môi trường này; hub tự chứa, chạy cả offline |
| Ảnh thumbnail | **Không dùng file ảnh** — mỗi thẻ có 1 canvas nhỏ vẽ cảnh thủ tục riêng (quỹ đạo/ống nước/ô chuột/phân số) | Không cần chụp screenshot, không thêm file nặng, hoạt ảnh sống động |
| Video demo | Không autoload trên thẻ (file .mp4 nặng tới 138MB) | Thẻ chỉ hiện huy hiệu "▶ DEMO"; overlay có nút mở video |
| Font | Google Fonts (Orbitron/Rajdhani) là **tăng cường**, có fallback `system-ui` | Mạng có thể không có; chữ vẫn đẹp và đúng nội dung |
| Ngôn ngữ UI | Tiếng Việt (khớp 4 dự án) | |

## 3. Cấu trúc file

```
D:\WORKS\Test\
├── index.html                      ← MỚI: trang trạm điều khiển
├── flappy.html                     ← + link quay lại
├── whack-a-mole.html               ← + link quay lại
├── solar-system.html               ← + link quay lại
├── solar-system - Backup.html      ← + link quay lại
├── hoc-phan-so-lop5/
│   ├── index.html                  ← + link quay lại
│   └── css/style.css               ← + ~10 dòng style cho link đó
├── hub/
│   ├── projects.data.js            ← NGUỒN SỰ THẬT DUY NHẤT (UMD: browser + Node)
│   ├── hub.css                     ← toàn bộ giao diện sci-fi
│   ├── starfield.js                ← trường sao 3D + tinh vân + sao băng (canvas)
│   ├── scene3d.js                  ← parallax chuột/gyro, scroll→translateZ, tilt thẻ
│   ├── cards.js                    ← render grid, filter, search, thẻ số liệu
│   ├── overlay.js                  ← overlay chi tiết dự án + điều hướng bàn phím
│   ├── main.js                     ← khởi động, vòng lặp HUD, reduced-motion
│   └── test/hub-test.js            ← test Node thuần (không cần trình duyệt)
└── docs/
    ├── LANDING-PAGE-PLAN.md        ← file này
    └── THEM-DU-AN-MOI.md           ← hướng dẫn 3 bước thêm dự án
```

## 4. Data model — trái tim của khả năng mở rộng

`hub/projects.data.js` giữ mảng `HUB_PROJECTS` + `HUB_CATEGORIES`, xuất UMD (`window.HUB_*` cho browser, `module.exports` cho Node test). Mọi thứ khác đọc từ đây; **không hardcode tên dự án ở file nào khác**.

```js
{
  id: 'solar-system',            // bắt buộc, duy nhất, kebab-case
  order: 10,                     // số nhỏ hiện trước
  name: 'Hệ Mặt Trời 3D',        // bắt buộc
  nameEn: 'SOLAR SYSTEM',        // dòng phụ kiểu HUD
  category: 'mô phỏng',          // bắt buộc → sinh filter pill tự động
  tagline: 'Trạm quan sát K-77',
  description: '…',              // bắt buộc
  href: 'solar-system.html',     // bắt buộc, tương đối từ gốc
  tech: ['three.js r165', 'WebGL'],
  accent: '#7df9ff',             // màu chủ đạo (glow, hạt, viền)
  icon: 'orbit',                 // orbit|bird|mole|fraction|generic → hàm vẽ thủ tục
  status: 'online',              // online | beta | archived
  needsNetwork: true,            // → huy hiệu "CẦN MẠNG"
  year: 2025,
  demo: 'Solar-System.mp4'       // tùy chọn
}
```

4 entry khởi tạo:

| id | href | category | accent | icon | needsNetwork |
|---|---|---|---|---|---|
| `solar-system` | `solar-system.html` | mô phỏng | `#7df9ff` | orbit | **true** |
| `flappy-bird` | `flappy.html` | trò chơi | `#ffd27d` | bird | false |
| `whack-a-mole` | `whack-a-mole.html` | trò chơi | `#ff8fd0` | mole | false |
| `hoc-phan-so-lop5` | `hoc-phan-so-lop5/index.html` | giáo dục | `#8affc1` | fraction | false |

`112233.mp4` **không** đưa vào (chưa xác định thuộc dự án nào).

## 5. Giao diện & hiệu ứng

**a) Nền vũ trụ — `starfield.js`**
3 lớp sao trong không gian 3D chiếu bằng `scale = fov/(fov+z)` → sao gần di chuyển nhanh và dài hơn. 2–3 tinh vân trôi chậm. Sao băng ngẫu nhiên, sao nhấp nháy theo `sin`. Sau ~6s không thao tác: bật **warp** (streak) ~4s rồi trả về. Tắt nếu `prefers-reduced-motion`. Cap DPR = 2, ngân sách hạt theo diện tích, tạm dừng khi tab ẩn.

**b) Chiều sâu 3D — `scene3d.js`**
`perspective: 1400px` → `preserve-3d`; cuộn trang map sang `translateZ` + `rotateX` giảm dần → cảm giác "tàu tiến vào trạm". Parallax theo chuột/`deviceorientation` chia lớp qua `data-depth`, cập nhật CSS var trong 1 `rAF`. Hover thẻ: tilt theo con trỏ + `translateZ(24px)` + quầng sáng đi theo con trỏ + vệt scan-line.

**c) Ánh sáng**
Glow nhiều lớp `box-shadow` + `radial-gradient` sau thẻ; viền vuông góc kiểu HUD; bloom nhấp nháy cho thẻ `online`; dải sáng quét qua tiêu đề; glitch 2 lớp cho tên trạm.

**d) Chuyển động**
Màn boot 1.2–2s (log + thanh tiến trình, tự ẩn, có nút bỏ qua). Reveal thẻ theo `IntersectionObserver` stagger 60ms + nhịp lơ lửng lệch pha. Số liệu HUD đếm tăng, radar quay, telemetry thời gian/FPS. Overlay mở bằng scale+blur+trượt, đóng bằng ESC, chuyển dự án bằng `←/→`.

**e) Bố cục cho tương lai**
Hero + 3 chỉ số tự tính. Filter pill **sinh tự động từ `category`** (kèm số lượng) + ô tìm kiếm theo tên/mô tả/tech, có trạng thái "không tìm thấy". Grid `auto-fill minmax(320px,1fr)` → hợp lý ở 4 hay 40 dự án. Thẻ dài/ngắn khác nhau không vỡ layout. Overlay duy nhất đọc từ data. Responsive 1 cột < 640px, 2 cột < 1024px; nút là `<button>/<a>` thật, có `:focus-visible`.

## 6. Tích hợp 4 dự án (thay đổi tối thiểu)

Thêm đúng **1 thẻ `<a>` "⌂ VỀ TRẠM ĐIỀU KHIỂN"** dạng inline style, `position:fixed`, `z-index` cao, `pointer-events:auto` vào: `flappy.html`, `whack-a-mole.html`, `solar-system.html`, `solar-system - Backup.html`, `hoc-phan-so-lop5/index.html` (kèm CSS vào `style.css`). Không đụng logic, không đổi ID, không xóa gì.

## 7. Test & kiểm chứng

`hub/test/hub-test.js` (Node thuần):

1. Mảng không rỗng; mỗi entry đủ trường bắt buộc, đúng kiểu.
2. `id` duy nhất + kebab-case.
3. `href` **trỏ tới file thật** (`fs.existsSync`).
4. `category` thuộc `HUB_CATEGORIES`; `accent` đúng `#rrggbb`; `status`/`icon` thuộc enum.
5. `demo` (nếu có) tồn tại trên đĩa.
6. Mỗi `category` có ≥1 dự án.

Kiểm chứng thủ công: `python -m http.server 8000` → mở `http://localhost:8000/`; thử cả `file://`.

**Kết quả kiểm chứng thực tế (đã chạy):**

| Hạng mục | Kết quả |
|---|---|
| `node hub/test/hub-test.js` | PASS 3/3 nhóm (dữ liệu, link tồn tại thật, danh mục) |
| `node hub/test/hub-smoke.js` | PASS 39/39 kiểm tra (dựng thẻ, nút "MỞ NGAY", lọc, tìm kiếm, bảng chi tiết, bàn phím, màn khởi động, nền sao, lớp 3D) |
| `node --check` 7 file JS | Tất cả hợp lệ |
| 2 test cũ của `hoc-phan-so-lop5` | Vẫn PASS (17.387 kiểm tra toán + DOM smoke) sau khi chèn nút "VỀ TRẠM" |
| Ảnh chụp Chrome headless (1440px, 1600px, 430px) | Font Orbitron tải được; thẻ, hình vẽ thủ tục, radar, bộ lọc, bảng chi tiết và giao diện mobile đều hiển thị đúng |
| Phục vụ qua `python -m http.server 8000` | 16/16 đường dẫn trả 200 |

**Giới hạn đã biết:** Chrome headless bị sandbox chặn ở chế độ mặc định (`Access is denied` — named-pipe/EPERM), phải chạy với quyền rộng hơn để chụp ảnh kiểm tra. Vì vậy các bước kiểm tra thị giác cần sự cho phép của người dùng; phần còn lại được bảo đảm tự động bằng test Node.

**Kiểm chứng bằng chuột thật qua Chrome DevTools Protocol (điều khiển Chrome thật, bấm `Input.dispatchMouseEvent`):**

| Đường đi | Kết quả |
|---|---|
| Bấm nút **MỞ NGAY** trên thẻ | Vào thẳng `/solar-system.html` trong tab hiện tại ✅ |
| Bấm thân thẻ | Mở bảng chi tiết, đúng tên dự án, hiện dòng nhắc "cần mạng" ✅ |
| Bấm **MỞ DỰ ÁN** trong bảng | Điều hướng trong tab hiện tại, không mở tab nền ✅ |
| Bấm **VỀ TRẠM ĐIỀU KHIỂN** trong dự án | Quay về `/index.html` ✅ |
| Dự án trong thư mục con | `/hoc-phan-so-lop5/index.html` mở đúng, nút về trạm dùng `../index.html` ✅ |

**Ba lỗi phát hiện qua kiểm tra thị giác và đã sửa:**

1. Thẻ bị kẹt ở `opacity: 0` khi khung nhìn thấp (1440×1100) vì ngưỡng IntersectionObserver quá chặt → hạ `threshold` xuống 0.01, nới `rootMargin` và thêm lưới an toàn 1,6 giây.
2. Tràn ngang trên mobile do `transform` 3D của lưới cộng với chuỗi `letter-spacing` dài → tắt nghiêng 3D dưới 900px / thiết bị cảm ứng và cho phép ngắt dòng phần chữ động.
3. Tiêu đề phụ và ô tìm kiếm bị cắt trên màn hình hẹp → giảm `letter-spacing`, thêm `min-width: 0` trong thẻ.

## 8. Thứ tự thực thi

1. `docs/LANDING-PAGE-PLAN.md` + `hub/projects.data.js` + `hub/test/hub-test.js` → test PASS.
2. `index.html`.
3. `hub/hub.css`.
4. `hub/starfield.js` → `hub/scene3d.js`.
5. `hub/cards.js` → `hub/overlay.js` → `hub/main.js`.
6. Chèn link quay lại vào 5 file dự án + chạy lại 2 test của `hoc-phan-so-lop5`.
7. Chạy `hub-test.js`, `node --check` mọi file JS, khởi động server nền để xem.
8. `docs/THEM-DU-AN-MOI.md`.

## 9. Giả định & ngoài phạm vi

- Khuyến nghị xem hub qua `http://localhost` (vì `solar-system.html` cần HTTP + internet); các dự án khác chạy cả `file://`.
- Không dùng CDN, không cài npm, không thêm file ảnh/video, không đổi nội dung 4 dự án, không tạo git repo.
- `112233.mp4` để nguyên.
- Dự án trong thư mục con lồng sâu hơn chỉ cần khai báo `href` đúng; link "quay lại trạm" trong chính dự án đó phải tự chỉnh độ sâu (ghi rõ trong `THEM-DU-AN-MOI.md`).
