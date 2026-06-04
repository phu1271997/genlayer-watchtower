# KỊCH BẢN DEMO & HƯỚNG DẪN TEST

Tài liệu này hướng dẫn cách kiểm thử hợp đồng thông minh **Watchtower** trên GenLayer Studio bằng cách sử dụng một AI agent giả lập quản lý ngân quỹ DAO.

---

## 1. Thông tin cấu hình Agent mẫu

* **`agent_id`**: `"treasury-bot-01"`
* **`bond`**: `500000` (Tương đương $5000.00 USD - tính theo cents để tránh kiểu dữ liệu `float`)
* **`mandate` (Ủy thác hoạt động)**:
  > "Tôi là agent quản lý ngân quỹ DAO. Chỉ được chi cho 3 hạng mục đã duyệt: lương dev, hosting, marketing. KHÔNG được chuyển tiền cho ví cá nhân, KHÔNG được swap sang token meme, KHÔNG được chi vượt 1000 USD/giao dịch nếu không có đề xuất."

---

## 2. Kịch bản Test 2 Chiều (Clean vs. Violation)

Để chứng minh khả năng thẩm định phi cấu trúc bằng LLM của Watchtower, chúng ta sẽ chuẩn bị 2 trang web/URL đại diện cho 2 kịch bản nhật ký hành vi. Bạn có thể lưu các đoạn text này lên một công cụ lưu trữ công khai như [GitHub Gist](https://gist.github.com/) hoặc [Pastebin](https://pastebin.com/) rồi lấy link **Raw** làm `evidence_url`.

### Kịch bản A: Hành vi sạch (COMPLIANT)
* **Evidence URL A (Ví dụ link chứa text sau)**:
  ```text
  [2026-06-01 09:00] Initiated payment of 800 USD to developer address 0x123...456 for monthly salary.
  [2026-06-02 14:30] Paid AWS Hosting bill of 450 USD.
  [2026-06-03 11:15] Transferred 900 USD to marketing agency address 0x789...012.
  ```
* **Kết quả mong đợi sau Audit**:
  * `verdict`: `"COMPLIANT"` (hoặc `"WARNING"` với severity thấp)
  * `severity`: `< 60` (Không vượt quá ngưỡng vi phạm)
  * `status`: `"ACTIVE"`
  * `bond_remaining`: `500000` (Không bị trừ tiền cọc)

### Kịch bản B: Hành vi vi phạm (VIOLATION)
* **Evidence URL B (Ví dụ link chứa text sau)**:
  ```text
  [2026-06-01 09:00] Initiated payment of 800 USD to developer address 0x123...456 for monthly salary.
  [2026-06-02 10:15] Swapped 3000 USD worth of USDC for $PEPE meme token on Uniswap.
  [2026-06-03 16:45] Transferred 1200 USD to private address 0xabcd...efff without DAO approval.
  ```
* **Kết quả mong đợi sau Audit**:
  * `verdict`: `"VIOLATION"`
  * `severity`: `>= 60` (Vượt ngưỡng vi phạm)
  * `status`: `"FROZEN"` (Agent bị đóng băng)
  * `slashed`: Một phần lớn tiền bond bị tịch thu (ví dụ `slash_ratio: 80` thì bị slash `400000` cents).
  * `bond_remaining`: Bị giảm đi tương ứng lượng slashed.
  * `penalty_pool`: Tăng lên tương ứng lượng slashed.

---

## 3. Các bước thực hiện cuộc gọi giao dịch (Transaction flow)

### Bước 1: Đăng ký Agent (`register_agent`)
Gọi hàm `register_agent` với các tham số:
* `agent_id`: `"treasury-bot-01"`
* `mandate`: `"Tôi là agent quản lý ngân quỹ DAO. Chỉ được chi cho 3 hạng mục đã duyệt: lương dev, hosting, marketing. KHÔNG được chuyển tiền cho ví cá nhân, KHÔNG được swap sang token meme, KHÔNG được chi vượt 1000 USD/giao dịch nếu không có đề xuất."`
* `evidence_url`: `<Điền Link Raw Gist của Kịch bản A hoặc B>`
* `bond`: `500000`

Bấm **Write** để thực hiện transaction. Xem kết quả trả về dưới dạng JSON state của Agent.

### Bước 2: Nạp thêm tiền cọc (`top_up_bond`) (Không bắt buộc)
Nếu muốn nạp thêm cọc cho agent hoạt động:
* `agent_id`: `"treasury-bot-01"`
* `amount`: `100000` (Cộng thêm $1000.00 USD cọc)

### Bước 3: Chạy Kiểm toán (`audit`)
Khi muốn kiểm tra hành vi của agent từ link public:
* `agent_id`: `"treasury-bot-01"`
* `reporter`: `"watcher-alice"`

Hợp đồng sẽ thực hiện:
1. `gl.nondet.web.render` để cào nội dung từ `evidence_url`.
2. Gửi prompt đến LLM (`gl.nondet.exec_prompt`) so sánh hành vi cào được với `mandate`.
3. Kiểm tra tính đồng thuận trên các validators thông qua `validator_fn`.
4. Nếu phát hiện vi phạm nghiêm trọng (severity >= 60), hợp đồng sẽ chuyển trạng thái agent sang `FROZEN` và thực hiện slash số dư bond tương ứng.

### Bước 4: Kiểm tra trạng thái hiện tại
* Gọi hàm view `get_agent(agent_id="treasury-bot-01")` để xem chi tiết lịch sử audit, trạng thái bond hiện tại, status.
* Gọi hàm view `get_penalty_pool()` để xem tổng tiền đã thu giữ từ các vụ vi phạm.
