# Themis Web (Cloudflare Pages Edition) 🚀

Phiên bản Web hiện đại của phần mềm chấm thi tự động **Themis**, tối ưu để chạy trên **Cloudflare Pages** và sử dụng **Judge0 API** làm công cụ biên dịch & thực thi sandbox trực tuyến.

---

## ✨ Điểm nổi bật

1. **Zero-Database (Không cần cài đặt Database)**:
   - Toàn bộ dữ liệu đề thi, test case, mã nguồn và bảng điểm lưu trữ trực tiếp trên trình duyệt bằng **IndexedDB (Dexie.js / idb-keyval)**.
   - Sẵn sàng kiến trúc mở rộng `IStorageProvider`: Khi cần kết nối Cloudflare D1 (SQL) hoặc REST API server trong tương lai, chỉ cần cắm thêm adapter mà không cần sửa code UI hay chấm.

2. **Chấm mã nguồn qua Judge0 API**:
   - Sử dụng **Cloudflare Pages Functions** (`/functions/api/judge.ts`) làm Edge Proxy an toàn, bảo vệ API key và triệt tiêu lỗi CORS.
   - Hỗ trợ đầy đủ các ngôn ngữ thi đấu phổ biến: **C++ (GCC)**, **Python 3**, **Free Pascal (FPC)**, **Java**, **C**.
   - Hỗ trợ cả **Public Judge0 CE** lẫn máy chủ Judge0 tự host (Self-Hosted).

3. **Tương thích chuẩn Themis Việt Nam**:
   - Tự động thích ứng các bài thi dùng **File I/O** truyền thống (`freopen("TASK.INP", "r", stdin);` / `assign(f, 'TASK.INP')`) sang sandbox của Judge0 mà không bị lỗi File Not Found.
   - So khớp kết quả thông minh: Tự chuẩn hóa xuống dòng Windows `\r\n` / Unix `\n`, loại bỏ khoảng trắng thừa cuối dòng và hỗ trợ sai số số thực (Float Epsilon).

4. **Hai chế độ linh hoạt**:
   - **Chế độ Thí sinh (Contestant Workspace)**: Chọn bài tập, viết code trực tiếp trên trình duyệt (hoặc tải file từ máy tính), nộp bài và xem chi tiết thời gian, bộ nhớ, điểm số từng test case (AC, WA, TLE, MLE, CE, RTE).
   - **Chế độ Giám khảo (Admin Console)**:
     - Nạp trực tiếp file `.zip` bộ test case chuẩn Themis (`TASK/TEST01/TASK.INP` & `TASK.OUT`).
     - Chấm bài nộp hàng loạt (**Batch Judge**) bằng cách kéo thả nhiều file của học sinh (VD: `HS01[BAI1].cpp`, `HS02_BAI1.py`).
     - Bảng xếp hạng trực tiếp (**Live Scoreboard**) xếp hạng theo tổng điểm và thời gian.
     - Xuất kết quả ra file `KetQua.csv` chuẩn Themis và xuất/nhập toàn bộ kỳ thi thành file `.themis`.

---

## 🛠 Hướng dẫn chạy thử trên máy (Local Development)

```bash
cd themis-web

# Cài đặt thư viện
npm install

# Chạy server phát triển
npm run dev
```

Mở trình duyệt tại: `http://localhost:3000`

---

## 🌐 Hướng dẫn triển khai lên Cloudflare Pages

### Cách 1: Triển khai qua GitHub (Khuyên dùng)
1. Đẩy mã nguồn thư mục `themis-web` lên repository GitHub của bạn.
2. Đăng nhập vào trang quản trị **Cloudflare Dashboard** -> **Workers & Pages** -> **Create application** -> **Pages** -> **Connect to Git**.
3. Cấu hình thông số Build:
   - **Framework preset**: `Vite`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
4. Bấm **Save and Deploy**. Cloudflare sẽ tự động nhận diện cả frontend tĩnh và các Edge Functions trong thư mục `functions/`.

### Cách 2: Triển khai qua Wrangler CLI
```bash
cd themis-web

# Build dự án
npm run build

# Triển khai trực tiếp lên Cloudflare Pages
npx wrangler pages deploy dist --project-name=themis-web
```

---

## 🧪 Kiểm thử tự động (Unit Tests)

Dự án được bảo vệ bởi bộ test tự động Vitest toàn diện:

```bash
npm test
```

