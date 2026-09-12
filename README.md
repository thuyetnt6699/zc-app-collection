# ZC App Collection — Trạm Điều Khiển

Kho tập hợp các ứng dụng web tự chứa (game, mô phỏng 3D, ứng dụng học tập), mở đầu bằng một **landing page sci-fi** làm cửa vào cho toàn bộ kho: [index.html](index.html).

> Mở `index.html` là thấy "trạm điều khiển": nền vũ trụ 3D chuyển động, thẻ dự án nghiêng theo con trỏ, bảng chi tiết, bộ lọc và tìm kiếm.

---

## Cách chạy

**Cách 1 — chạy server cục bộ (khuyến nghị, cần thiết cho dự án 3D):**

```bash
python -m http.server 8000
# hoặc: npx serve .
```

Rồi mở **http://localhost:8000/**

**Cách 2 — mở trực tiếp:** nhấp đúp `index.html`. Cách này chạy được cho hầu hết dự án, nhưng **dự án Hệ Mặt Trời 3D cần server** (xem mục *Lưu ý* bên dưới).

---

## Các dự án trong kho

| Dự án | Đường dẫn | Công nghệ | Ghi chú |
|---|---|---|---|
| **Hệ Mặt Trời 3D** | [solar-system.html](solar-system.html) | three.js r165 (CDN), WebGL | Mô phỏng hệ Mặt Trời, xoay/phóng, thăm dò hành tinh & vệ tinh, có trợ lý AI. **Cần mạng + server.** |
| **Flappy Bird** | [flappy.html](flappy.html) | Vanilla JS, Canvas 2D | Vật lý trọng lực – vỗ cánh, ống vô hạn, lưu kỷ lục. Chạy offline. |
| **Đập Chuột AI** | [whack-a-mole.html](whack-a-mole.html) | Vanilla JS, Canvas 2D | Nhịp độ tăng dần, combo, mạng, cấp độ. Chạy offline. |
| **Vui Học Phân Số** | [hoc-phan-so-lop5/index.html](hoc-phan-so-lop5/index.html) | Vanilla JS, Web Audio, localStorage | 7 chủ đề toán lớp 5, đề sinh ngẫu nhiên, lời giải từng bước, huy hiệu, điểm, sao. Chạy offline. |

Bấm nút **MỞ NGAY** trên thẻ để vào thẳng dự án, hoặc bấm vào thân thẻ để xem chi tiết trước.

---

## Cấu trúc thư mục

```
.
├── index.html                  # Trạm điều khiển (landing page)
├── solar-system.html           # Dự án 1
├── flappy.html                 # Dự án 2
├── whack-a-mole.html           # Dự án 3
├── hoc-phan-so-lop5/           # Dự án 4 (có test riêng)
│   ├── index.html
│   ├── css/, js/
│   └── test/                   # generator-test.js, dom-smoke.js
├── _hub/                       # Mã nguồn của trang chủ
│   ├── projects.data.js        # ⭐ NGUỒN DỮ LIỆU DUY NHẤT — thêm dự án mới ở đây
│   ├── hub.css                 # Giao diện sci-fi: nền vũ trụ, HUD, grid 3D, ánh sáng
│   ├── starfield.js            # Nền sao 3 chiều, tinh vân, sao băng, chế độ warp
│   ├── scene3d.js              # Parallax, chiều sâu 3D theo cuộn trang, nghiêng thẻ
│   ├── cards.js                # Dựng thẻ, lọc, tìm kiếm, chỉ số, hình vẽ thủ tục
│   ├── overlay.js              # Bảng chi tiết dự án + điều hướng bàn phím
│   ├── main.js                 # Màn khởi động, đồng hồ HUD, hiệu ứng gõ chữ
│   └── test/                   # hub-test.js, hub-smoke.js, dom-shim.js
└── docs/
    ├── LANDING-PAGE-PLAN.md    # Bản kế hoạch xây trạm điều khiển + kết quả kiểm chứng
    └── THEM-DU-AN-MOI.md       # Hướng dẫn thêm dự án mới (3 bước)
```

---

## Thêm một dự án mới

1. Đặt dự án vào kho (file hoặc thư mục con).
2. Thêm một object vào `HUB_PROJECTS` trong [`_hub/projects.data.js`](_hub/projects.data.js).
3. Chạy `node _hub/test/hub-test.js` để kiểm tra.

**Không cần sửa HTML, CSS hay JavaScript** — thẻ, huy hiệu, bộ lọc, ô tìm kiếm, dải chỉ số và bảng chi tiết đều sinh tự động từ dữ liệu.

Hướng dẫn đầy đủ từng trường: [docs/THEM-DU-AN-MOI.md](docs/THEM-DU-AN-MOI.md)

---

## Kiểm thử

Không cần cài thư viện nào (Node.js thuần):

```bash
node _hub/test/hub-test.js                    # dữ liệu: đủ trường, id duy nhất, href trỏ tới file có thật
node _hub/test/hub-smoke.js                   # chạy trọn trang chủ trong DOM giả (40 kiểm tra)

cd hoc-phan-so-lop5
node test/generator-test.js                   # kiểm tra toán học mọi câu hỏi
node test/dom-smoke.js                        # chạy trọn một phiên học
```

Trang chủ không có bước build: mở là chạy.

---

## Lưu ý

- **Video demo không nằm trong git.** Bốn file `.mp4` (~196 MB, riêng `Solar-System.mp4` đã 132 MB) bị `.gitignore` loại vì vượt giới hạn dung lượng của GitHub. Trên GitHub, các nút **▶ XEM DEMO** được ẩn tự động (nhờ cờ `demoDisabled` trong dữ liệu). Muốn bật lại: tải video về đặt cạnh `index.html`, hoặc đổi trường `demo` thành link YouTube/Drive rồi xoá `demoDisabled`.
- **Hệ Mặt Trời 3D cần mạng và server cục bộ** vì nạp three.js từ CDN qua ES module; mở bằng `file://` sẽ không chạy. Ba dự án còn lại chạy hoàn toàn offline.
- Trang chủ tự chứa 100%: Canvas 2D + CSS 3D, không thư viện ngoài. Font Google chỉ là lớp tăng cường, thiếu mạng vẫn dùng font hệ thống.

---

## Giấy phép

[MIT](https://opensource.org/licenses/MIT)
