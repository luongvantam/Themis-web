# Themis Web

Hệ thống chấm thi lập trình tự động trên nền tảng Web, được viết lại dựa trên phần mềm **Themis** truyền thống.

- **Tác giả Themis bản gốc**: Thầy Lê Minh Hoàng & Thầy Đỗ Đức Đông (Trường ĐH Sư phạm Hà Nội).
- **Người viết lại cho bản web**: Lương Văn Tâm (Học sinh).
- **Mã nguồn**: [https://github.com/luongvantam/Themis-web](https://github.com/luongvantam/Themis-web)

---

## 📖 Giới thiệu sản phẩm

**Themis Web** mang trải nghiệm chấm thi lập trình quen thuộc của phần mềm Themis bản Windows lên nền tảng web hiện đại. Phần mềm giúp giáo viên và học sinh dễ dàng tổ chức các buổi thi thử, luyện tập đội tuyển và chấm bài tự động với giao diện thân thiện, trực quan.

### ✨ Các tính năng chính

1. **Quản lý đề thi & Bộ test**:
   - Thêm bài thi không giới hạn, đặt tên bài, giới hạn thời gian chạy (Time Limit), giới hạn bộ nhớ (Memory Limit) và thang điểm.
   - Nạp trực tiếp file `.zip` chứa toàn bộ bộ test chuẩn Themis.

2. **Quản lý thí sinh**:
   - Thêm, sửa, xóa danh sách thí sinh tham gia kỳ thi.
   - Nạp nhanh danh sách thí sinh từ tệp văn bản.

3. **Nạp bài thi linh hoạt**:
   - Nạp hàng loạt bài làm của học sinh qua tệp zip hoặc chọn nhiều file mã nguồn cùng lúc.
   - Tính năng **Nạp file lẻ** giúp bổ sung hoặc cập nhật bài thi của từng học sinh mà không phải nạp lại từ đầu.

4. **Chế độ chấm bài tự động**:
   - Hỗ trợ đầy đủ các ngôn ngữ thi đấu phổ biến: **C++**, **C**, **Python 3**, **Free Pascal**, **Java**.
   - Hỗ trợ bài làm sử dụng luồng nhập xuất chuẩn (Standard I/O) hoặc đọc ghi tệp (File I/O: `TASK.INP` / `TASK.OUT`).
   - Tự động xóa kết quả chấm cũ trước khi tiến hành chấm lại để đảm bảo tính khách quan và chính xác.
   - Hỗ trợ **Chấm có chọn lọc**: Cho phép chỉ chấm một thí sinh hoặc một bài thi cụ thể.

5. **Bảng điểm thời gian thực & Xuất kết quả**:
   - Bảng điểm hiển thị trực tiếp điểm số chi tiết từng bài và tổng điểm của thí sinh.
   - Xuất bảng điểm chi tiết ra tệp `KetQua.csv` (tương thích mở bằng Microsoft Excel).

6. **Bảng điều khiển nhật ký**:
   - Cửa sổ log hiển thị quá trình biên dịch, thời gian chạy, dung lượng bộ nhớ và kết quả từng test case (`AC`, `WA`, `TLE`, `MLE`, `CE`, `RTE`).

---

## 📂 Quy tắc đặt tên tệp & Cấu trúc bộ test

### 1. Quy tắc đặt tên bài nộp của thí sinh
Tên file bài làm của thí sinh cần được đặt theo cú pháp chuẩn của Themis:

- Cú pháp có ngoặc vuông: `[MãThíSinh][TênBài].[phần mở rộng]`
  - Ví dụ: `HS01[BAI1].cpp`, `HS01[TONG].py`, `HS02[BAI1].pas`
- Cú pháp gạch dưới: `[MãThíSinh]_[TênBài].[phần mở rộng]`
  - Ví dụ: `HS01_BAI1.cpp`, `TAM01_TONG.py`

*Trong đó, phần mở rộng tương ứng với từng ngôn ngữ: `.cpp` / `.c` (C/C++), `.py` (Python), `.pas` (Pascal), `.java` (Java).*

### 2. Cấu trúc thư mục bộ test
File nén zip bộ test của mỗi bài cần tuân theo đúng cấu trúc thư mục của Themis:

```text
TÊN_BÀI/
├── TEST01/
│   ├── TÊN_BÀI.INP
│   └── TÊN_BÀI.OUT
├── TEST02/
│   ├── TÊN_BÀI.INP
│   └── TÊN_BÀI.OUT
├── TEST03/
│   ├── TÊN_BÀI.INP
│   └── TÊN_BÀI.OUT
└── ...
```

---

## 🚀 Hướng dẫn sử dụng

### Bước 1: Tạo mới hoặc nạp kỳ thi
1. Trên thanh công cụ, nhấn **Tạo mới** để khởi tạo phiên thi mới.
2. Nhấn **Cấu hình Đề** để thêm các bài thi trong kỳ thi, thiết lập giới hạn thời gian (giây), bộ nhớ (MB), thang điểm và tải lên file `.zip` bộ test.

### Bước 2: Nạp danh sách thí sinh
1. Nhấn nút **Nạp Thí sinh** hoặc vào mục **Quản lý HS**.
2. Nhập mã thí sinh và họ tên của từng học sinh hoặc nạp từ file danh sách.

### Bước 3: Nạp bài thi của học sinh
- **Nạp hàng loạt**: Nhấn **Nạp Bài thi**, chọn tệp nén hoặc thư mục chứa toàn bộ bài nộp của các thí sinh.
- **Nạp file lẻ**: Nếu một học sinh cần nộp bổ sung hoặc nộp lại bài, nhấn **Nạp file lẻ** để chọn riêng file bài làm của bạn đó.

### Bước 4: Thực hiện chấm bài
- **Chấm toàn bộ**: Nhấn nút **Chấm bài** trên thanh công cụ. Hệ thống sẽ tự động dọn dẹp các kết quả chấm trước đó và tiến hành chấm tuần tự toàn bộ bài thi.
- **Chấm có chọn lọc**: Nhấn nút **Bộ lọc** nếu bạn chỉ muốn chấm lại cho một thí sinh hoặc một bài cụ thể.

### Bước 5: Xem kết quả và xuất bảng điểm
- Theo dõi điểm số cập nhật trực tiếp trên bảng điểm chính.
- Xem chi tiết lỗi hoặc thời gian chạy từng test trong khung Nhật ký phía dưới.
- Nhấn nút **Xuất Excel** để tải tệp `KetQua.csv` về máy tính.

---

## 💻 Cài đặt và chạy trên máy cá nhân (Local Development)

Yêu cầu máy tính đã cài đặt **Node.js** (phiên bản 18 trở lên).

```bash
# 1. Clone repository
git clone https://github.com/luongvantam/Themis-web.git

# 2. Di chuyển vào thư mục dự án
cd Themis-web

# 3. Cài đặt các thư viện phụ thuộc
npm install

# 4. Khởi chạy server phát triển
npm run dev
```

Sau khi chạy lệnh trên, mở trình duyệt web và truy cập địa chỉ: `http://localhost:3000` (hoặc cổng được hiển thị trên màn hình terminal).

---

## 📜 Giấy phép bản quyền (License)

Dự án được phát hành theo giấy phép **MIT License**. Xem chi tiết tại tệp [LICENSE](LICENSE).
