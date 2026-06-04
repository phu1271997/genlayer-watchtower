# QUY TRÌNH DEPLOY & VERIFY

Dưới đây là các bước chi tiết để deploy và xác minh hợp đồng thông minh trên GenLayer Studio.

## Các bước triển khai

1. **Mở trình duyệt và truy cập:**
   [GenLayer Studio Run/Debug](https://studio.genlayer.com/run-debug)

2. **Dọn dẹp môi trường (Rất quan trọng):**
   * Vào **Settings** (biểu tượng bánh răng) -> Chọn **Reset Storage** -> Nhấp **Confirm**.
   * Việc này giúp xóa sạch state cũ của các hợp đồng trước đó, tránh xung đột bộ nhớ.

3. **Làm mới trang cứng (Hard Refresh):**
   * Nhấn tổ hợp phím `Cmd + Shift + R` (trên macOS) hoặc `Ctrl + Shift + F5` / `Ctrl + F5` (trên Windows/Linux).

4. **Deploy Sanity Check Contract trước (`storage_test.py`):**
   * Copy toàn bộ code từ file [storage_test.py](file:///Users/ai/bot AI/Watchtower/contracts/storage_test.py).
   * Dán vào editor của GenLayer Studio.
   * Chọn compiler/environment phù hợp và bấm **Deploy**.
   * Thực hiện gọi hàm `put` với tham số ví dụ: `k="test_key"`, `v="hello_world"`.
   * Thực hiện gọi hàm `get` với tham số `k="test_key"`, kiểm tra xem có trả về đúng `"hello_world"` hay không. Nếu hoạt động bình thường, môi trường đã sẵn sàng.

5. **Deploy Contract chính (`watchtower.py`):**
   * Copy toàn bộ code từ file [watchtower.py](file:///Users/ai/bot AI/Watchtower/contracts/watchtower.py).
   * Dán đè lên editor trong GenLayer Studio.
   * Bấm **Deploy**.

## Kiểm tra kết quả giao dịch

6. **Xác nhận Transaction Result:**
   * Sau khi gửi một transaction (deploy hoặc call method), hãy theo dõi danh sách transaction ở thanh sidebar bên trái.
   * Chờ transaction chuyển sang trạng thái `Status: FINALIZED`.
   * **Click trực tiếp vào transaction đó** để mở panel chi tiết.
   * Xác nhận xem trường **`Result`** có hiển thị **`SUCCESS`** hay không. Nếu `Result` là `ERROR`, hợp đồng đã gặp lỗi runtime mặc dù block đã được finalize.

## Hướng dẫn xử lý sự cố (Troubleshooting)

Nếu `Result` trả về `ERROR`, hãy xem traceback lỗi và đối chiếu với checklist sau:

| Lỗi hiển thị | Nguyên nhân phổ biến | Cách khắc phục |
| :--- | :--- | :--- |
| `Contract Queues not found` hoặc `Contract IdlenessPhase not found` | Trình biên dịch hiểu sai phiên bản và fallback về v0.1.0 | Đảm bảo dòng đầu tiên của file luôn là `# v0.2.16` |
| `AssertionError: Is right the same storage type? TreeMap <- TreeMap` | Gán `self.agents = TreeMap()` trong hàm khởi tạo `__init__` | Xóa dòng gán TreeMap/DynArray trong `__init__` (để trống hoặc chỉ khởi tạo kiểu số nguyên) |
| Lỗi Schema / Không thể biên dịch | Sử dụng các kiểu dữ liệu không hợp lệ trong tham số/kiểu trả về | Thay thế `float`, `list`, `dict` bằng `int`, `DynArray`, `TreeMap` hoặc `str` |
| `AttributeError: module 'genlayer' has no attribute 'Contract'` | Sử dụng sai cú pháp import (vd: `import genlayer`) | Chỉ sử dụng `from genlayer import *` |
| Lỗi "Not deployed yet" dù transaction deploy đã hiển thị `FINALIZED` | Lỗi xảy ra trong quá trình deploy nên hợp đồng không được lưu | Click vào transaction deploy ở sidebar để đọc mã lỗi chi tiết trong field `Result` |
| Hôm qua chạy tốt nhưng hôm nay deploy lỗi | State lưu trữ cục bộ của Studio bị cache lỗi | Thực hiện **Reset Storage** trong Settings và **Hard Refresh** lại trang |
