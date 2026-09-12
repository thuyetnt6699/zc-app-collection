/* =========================================================
   PROJECTS DATA — NGUỒN SỰ THẬT DUY NHẤT của trạm điều khiển.
   Thêm dự án mới = thêm 1 object vào HUB_PROJECTS bên dưới.
   Xem docs/THEM-DU-AN-MOI.md để biết chi tiết từng trường.

   Xuất UMD: chạy được ở browser (window.HUB_PROJECTS)
             và ở Node (module.exports). Chạy test: node hub/test/hub-test.js
   ========================================================= */
(function (root, factory) {
  'use strict';
  var api = factory();
  if (typeof module === 'object' && module.exports) {
    module.exports = api;
  } else {
    /* trình duyệt: gắn lên window để các script sau đọc được */
    var g = root.window || root;
    g.HUB_PROJECTS = api.HUB_PROJECTS;
    g.HUB_CATEGORIES = api.HUB_CATEGORIES;
    g.HUB_ICONS = api.HUB_ICONS;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  /* Danh mục hợp lệ — filter trên hub được sinh tự động từ danh sách này. */
  var HUB_CATEGORIES = [
    { id: 'trò chơi', name: 'TRÒ CHƠI', en: 'ARCADE' },
    { id: 'giáo dục', name: 'GIÁO DỤC', en: 'EDUCATION' },
    { id: 'mô phỏng', name: 'MÔ PHỎNG', en: 'SIMULATION' }
  ];

  /* Loại hình vẽ thủ tục có sẵn (xem hub/cards.js → HUB_ART). */
  var HUB_ICONS = ['orbit', 'bird', 'mole', 'fraction', 'generic'];

  var HUB_PROJECTS = [
    {
      id: 'solar-system',
      order: 10,
      name: 'Hệ Mặt Trời 3D',
      nameEn: 'SOLAR SYSTEM',
      category: 'mô phỏng',
      tagline: 'Trạm quan sát K-77',
      description:
        'Mô phỏng 3D toàn bộ hệ Mặt Trời: kéo để xoay, lăn để phóng, chọn từng hành tinh và vệ tinh để đọc dữ liệu chi tiết. Có điều khiển tốc độ thời gian, bật/tắt nhãn và đường quỹ đạo, kèm trợ lý AI hỏi đáp ngay trong cảnh.',
      href: 'solar-system.html',
      tech: ['three.js r165', 'WebGL', 'Orbit', 'AI chat'],
      accent: '#7df9ff',
      icon: 'orbit',
      status: 'online',
      needsNetwork: true,
      year: 2025,
      demo: 'Solar-System.mp4',
      /* Video demo bị .gitignore loại khỏi git (quá nặng) nên trên GitHub sẽ
         không có file. Đặt true để hub tạm ẩn nút DEMO khi máy chưa có video;
         tải video về cạnh index.html, hoặc đổi "demo" thành link YouTube/Drive,
         rồi xoá dòng này là nút hiện lại. */
      demoDisabled: true
    },
    {
      id: 'flappy-bird',
      order: 20,
      name: 'Flappy Bird',
      nameEn: 'FLAPPY BIRD',
      category: 'trò chơi',
      tagline: 'Vỗ cánh qua rừng ống',
      description:
        'Bản Flappy Bird viết tay bằng canvas thuần: vật lý trọng lực – lực vỗ cánh cân chỉnh kỹ, ống sinh vô hạn, điểm số và kỷ lục lưu trên máy. Hỗ trợ cả phím Space lẫn chạm/gõ trên điện thoại, có màn hình lỗi thân thiện nếu trình duyệt quá cũ.',
      href: 'flappy.html',
      tech: ['Canvas 2D', 'Vanilla JS', 'Vật lý'],
      accent: '#ffd27d',
      icon: 'bird',
      status: 'online',
      needsNetwork: false,
      year: 2025,
      demo: 'FlappyBird.mp4',
      demoDisabled: true
    },
    {
      id: 'whack-a-mole',
      order: 30,
      name: 'Đập Chuột AI',
      nameEn: 'WHACK-A-MOLE',
      category: 'trò chơi',
      tagline: 'Phản xạ nhanh, chuột thông minh',
      description:
        'Chuột AI đội lên khỏi hang với nhịp độ tăng dần, bạn đập bằng chuột hoặc chạm. Có combo, mạng, cấp độ và hiệu ứng riêng cho từng loại chuột. Nhịp sinh chuột được điều chỉnh động để ván nào cũng căng nhưng không bất công.',
      href: 'whack-a-mole.html',
      tech: ['Canvas 2D', 'Vanilla JS', 'Nhịp độ động'],
      accent: '#ff8fd0',
      icon: 'mole',
      status: 'online',
      needsNetwork: false,
      year: 2025,
      demo: 'Whack-A-Mole.mp4',
      demoDisabled: true
    },
    {
      id: 'hoc-phan-so-lop5',
      order: 40,
      name: 'Vui Học Phân Số',
      nameEn: 'FRACTIONS — GRADE 5',
      category: 'giáo dục',
      tagline: 'Toán lớp 5: phân số & hỗn số',
      description:
        '7 chủ đề đúng chương trình lớp 5, mỗi phiên sinh đề ngẫu nhiên nên làm lại không bao giờ trùng. Trả lời sai là hiện ngay lời giải từng bước đúng phương pháp; kèm gợi ý, điểm, sao, 10 huy hiệu, 5 cấp bậc, pháo giấy và âm thanh. Lưu tiến độ vào máy, xuất/nhập file .json để chuyển máy. Chạy offline hoàn toàn, có bộ test toán học riêng.',
      href: 'hoc-phan-so-lop5/index.html',
      tech: ['Vanilla JS', 'Web Audio', 'localStorage', '2 bộ test Node'],
      accent: '#8affc1',
      icon: 'fraction',
      status: 'online',
      needsNetwork: false,
      year: 2025,
      demo: 'Hoc-Toan.mp4',
      demoDisabled: true
    }
  ];

  return { HUB_PROJECTS: HUB_PROJECTS, HUB_CATEGORIES: HUB_CATEGORIES, HUB_ICONS: HUB_ICONS };
});
