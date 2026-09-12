# 🎉 Vui Học Phân Số & Hỗn Số — Lớp 5

Website học tập vui nhộn giúp học sinh **lớp 5** luyện các công thức toán về **phân số** và **hỗn số**: bài trắc nghiệm được **sinh ngẫu nhiên mỗi phiên**, có **hướng dẫn giải từng bước** khi làm sai, **phần thưởng** (điểm, sao, huy hiệu, cấp bậc, pháo giấy) và **âm thanh vui nhộn** — tất cả chạy **offline hoàn toàn**, không cần kết nối mạng, không dùng thư viện ngoài.

> Các câu hỏi trong dự án này được biên soạn bởi **Qwen3.8-27B** (mô hình AI trong phiên làm việc). Muốn có thêm câu hỏi mới, chỉ cần yêu cầu AI mở rộng `js/bank.js` hoặc `js/generator.js` — mỗi câu đều kèm gợi ý và lời giải riêng.

## ▶️ Cách chạy

**Cách 1 — đơn giản nhất:** mở trực tiếp file `index.html` bằng trình duyệt (nhấp đúp).

**Cách 2 — chạy server cục bộ** (khuyến nghị):

```bash
cd hoc-phan-so-lop5
npx serve .
# hoặc: python -m http.server 8000
```

Rồi vào `http://localhost:3000` (hoặc `http://localhost:8000`).

## ✨ Tính năng

### 📚 7 chủ đề (đúng chương trình lớp 5)
| Chủ đề | Nội dung |
|---|---|
| 🔍 Khái niệm phân số | Tử số, mẫu số, đọc phân số, phân số bằng 1, tính chất cơ bản |
| ✂️ Rút gọn phân số | Tìm ƯCLN, rút gọn thành phân số tối giản |
| ⚖️ So sánh phân số | Dấu `>`, `<`, `=` — cùng mẫu và khác mẫu (quy đồng) |
| ➕ Cộng, trừ phân số | Cùng mẫu, khác mẫu + bài toán thực tế (cái bánh, bó hoa…) |
| ✖️ Nhân, chia phân số | Nhân: tử × tử, mẫu × mẫu; Chia: nhân với phân số đảo |
| 🥞 Hỗn số | Chuyển đổi hỗn số ↔ phân số, cộng, trừ hỗn số |
| 🎲 Ôn tập tổng hợp | Trộn tất cả các chủ đề |

### 🎲 Câu hỏi sinh ngẫu nhiên mỗi phiên
- Mỗi bài (10/15/20 câu) được **ghép mới**: ~45% câu khái niệm trong bộ đề + ~55% câu **tính toán sinh ngẫu nhiên** (số mới mỗi lần) — làm đi làm lại không bao giờ giống.
- **Mỗi câu đều có lời giải từng bước đúng phương pháp lớp 5** (quy đồng mẫu, tìm BCNN, rút gọn, chuyển hỗn số…). Trả lời **sai** → hiện ngay đáp án đúng + **hướng dẫn giải chi tiết**; trả lời **đúng** → hiện cách làm để ghi nhớ.
- Nút **💡 Gợi ý** cho phép xem manh mối trước khi chọn đáp án.

### 💾 Lưu / tải lại bài tập
- **Tự động lưu** khi thoát giữa bài — vào *Bài đã lưu* để **▶ Tiếp tục** đúng tiến độ cũ.
- Sau mỗi bài, màn kết quả có nút **📂 Xem bài đã lưu** để kiểm tra ngay; bài hoàn thành có thể **Làm lại** với cùng bộ câu hỏi hoặc đổi tên.
- **Xuất / nhập file `.json`** để sao lưu, mang sang máy khác — **nhập file còn khôi phục cả điểm và huy hiệu**.
- Dữ liệu lưu trong `localStorage` của trình duyệt (tối đa 30 bài gần nhất). Nếu trình duyệt chặn, website tự chuyển sang bộ nhớ trong phiên và **hiện thanh cảnh báo vàng** rõ ràng.

### 🏆 Phần thưởng khích lệ
- ⭐ **Điểm**: +10/câu đúng, thưởng thêm khi có chuỗi đúng (🔥 3+ câu: +5, 5+ câu: +10).
- 🌟 **Sao**: 3⭐ ≥ 90% · 2⭐ ≥ 70% · 1⭐ ≥ 50%.
- 🎖️ **10 huy hiệu**: Khởi đầu, Sao vàng, Lửa nhiệt huyết, Sát thủ phân số, Tổ hợp điểm, Kho báu, Bộ não thạc sĩ, Bậc thầy hỗn số, Nhà sưu tầm, Cú Mập thân thiết.
- 🌱→🏆 **5 cấp bậc**: Mầm non phân số → Học sinh chăm chỉ → Thủ lĩnh phân số → Chuyên gia số học → Thần đồng toán học.
- 🎊 Pháo giấy + nhạc chúc mừng khi làm đúng và khi kết thúc bài.
- 🔊 **Âm thanh vui nhộn** tự tổng hợp bằng Web Audio API (đúng/sai/nút/chúc mừng/lên cấp) — nút 🔊 để bật/tắt.

## 🗂️ Cấu trúc dự án

```
hoc-phan-so-lop5/
├── index.html            # Giao diện: 6 màn hình (home, chủ đề, quiz, kết quả, bài lưu, phần thưởng)
├── css/
│   └── style.css         # Phong cách: nền gradient động, nút 3D, phân số gạch ngang, hoạt ảnh
├── js/
│   ├── audio.js          # Âm thanh (Web Audio API, không cần file ngoài)
│   ├── generator.js      # Máy sinh câu hỏi ngẫu nhiên (14 bộ sinh) + lời giải từng bước
│   ├── bank.js           # 38 câu khái niệm & bài toán thực tế (biên soạn bởi Qwen3.8-27B)
│   ├── storage.js        # Lưu/load bài tập + thống kê (localStorage)
│   ├── confetti.js       # Hiệu ứng pháo giấy (canvas thuần)
│   ├── quiz.js           # Động cơ quiz, sao, huy hiệu, cấp bậc, ghép bài
│   └── app.js            # Điều khiển giao diện: điều hướng, làm bài, save/load, export/import
└── test/
    ├── generator-test.js # Kiểm tra ĐÚNG SAI TOÁN của mọi câu hỏi (chạy được ~17.000 kiểm tra)
    └── dom-smoke.js      # Mô phỏng trình duyệt, chạy trọn một phiên học để bắt lỗi runtime
```

## 🧪 Kiểm thử

```bash
node test/generator-test.js   # ✅ mọi câu hỏi đúng toán học, đủ 4 đáp án, không trùng, đủ lời giải
node test/dom-smoke.js        # ✅ cả phiên học (chọn chủ đề → làm bài → lưu → mở lại → xóa) không lỗi
```

Bộ kiểm tra đã phát hiện và xử lý các lỗi tinh vi: bẫy trùng giá trị đáp án đúng, hỗn số có phần phân số ≥ 1, phân số mẫu 1, câu so sánh hai phân số bằng nhau…

## 🧩 Muốn thêm câu hỏi?

- **Câu khái niệm**: thêm 1 dòng `B(...)` vào `js/bank.js` (có sẵn gợi ý + lời giải).
- **Câu tính toán mới**: viết 1 hàm `genXxx()` trong `js/generator.js` rồi đăng ký vào `PS.QUESTION_GENERATORS`.
- Sau đó chạy `node test/generator-test.js` để xác nhận mọi câu đều đúng.

## 🛠️ Khắc phục sự cố (lưu bài / phần thưởng)

Website đã được **kiểm thử bằng trình duyệt thật (Chrome & Edge, cả chế độ `file://`)** — lưu bài và phần thưởng hoạt động bình thường. Nếu bạn gặp hiện tượng "không lưu được / không ghi điểm":

1. **Nhìn thanh cảnh báo vàng** dưới thanh tiêu đề (nếu hiện nghĩa là trình duyệt đang chặn dữ liệu cục bộ).
2. **Dùng cửa sổ riêng tư (InPrivate/Incognito)**: dữ liệu bị xóa khi đóng cửa sổ — hãy dùng cửa sổ thường.
3. **Kiểm tra quyền riêng tư của trình duyệt**: nếu chặn cookie/dữ liệu trang web, cho phép với trang này.
4. **Cách chắc chắn nhất**: chạy server cục bộ rồi mở qua `http://localhost`:
   ```bash
   cd hoc-phan-so-lop5
   npx serve .
   # mở http://localhost:3000
   ```
5. **Lưu ý**: dữ liệu `file://` và `http://localhost` là **hai nơi lưu khác nhau** — mở bằng cách nào thì dữ liệu nằm ở đó.
6. Vào **🏆 Phần thưởng** có dòng "💾 Lưu trữ: …" cho biết tình trạng lưu trữ; nút **🧹 Xóa thống kê** giúp reset điểm/huy hiệu khi muốn kiểm tra lại.
7. Muốn **sao lưu / chuyển máy**: dùng nút **⬇️ Xuất ra file .json** (kèm cả điểm + huy hiệu) và **⬆️ Nhập từ file** ở màn Bài đã lưu.

> Mẹo: sau khi cập nhật website, nhấn **Ctrl + F5** để tải lại phiên bản mới nhất (tránh dùng bản cache cũ).
