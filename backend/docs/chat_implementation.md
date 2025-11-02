[HƯỚNG DẪN FRONTEND] Cấu hình WebSocket & Luồng chat
======================================================================================

Tổng quan tài liệu
--------
Tài liệu này giải thích cấu trúc WebSocket trong luồng chat để frontend có thể tích hợp UI chatbox đúng cách:
1) WebSocket hoạt động ra sao khi người dùng gửi – nhận tin nhắn.
2) Luồng chat qua WebSocket có thay đổi gì trên database và backend xử lý thế nào khi DB thay đổi.
3) Frontend cần chú ý gì khi xây dựng UI chat và gọi API/WS.
4) Payload mẫu & checklist tích hợp.

URL WebSocket & Cơ chế xác thực
-------------------------------
- Endpoint: `wss://<server>/chat/ws?token=<ACCESS_TOKEN>`
- `ACCESS_TOKEN` là JWT truy cập (cùng loại token bạn dùng để gọi REST). Backend sẽ kiểm tra token, ánh xạ ra `user_id` rồi mới chấp nhận kết nối.
- Nếu token không hợp lệ/hết hạn → server từ chối hoặc đóng kết nối với thông điệp lỗi.

Kiến trúc tổng quan WebSocket
-----------------------------
- Backend duy trì một `ConnectionManager` ánh xạ: `user_id -> set(WebSocket)` (một người có thể mở nhiều tab/thết bị).
- Sự kiện realtime được gửi dạng JSON theo trường `"type"` và `"data"`.
- Các sự kiện chính:
  - `presence` (user online/offline)
  - `message` (tin nhắn mới)
  - `receipt` (cập nhật trạng thái delivered/read)
  - `typing` (đang nhập)
  - `error` (thông báo lỗi dành riêng cho client gửi sai)

1) Cách WebSocket hoạt động khi người dùng gửi tin nhắn
-------------------------------------------------------
**Luồng gửi – nhận (ở mức khái niệm):**
1. Client A kết nối WS với token hợp lệ → server đánh dấu A online và **broadcast** `presence{A: "online"}` tới các “contacts” (những người từng chung cuộc trò chuyện với A).
2. A gửi gói JSON qua WS:
   ```json
   {"type":"message","conversation_id":"<uuid>","content":"Xin chào"}
   ```
3. Backend kiểm tra:
   - **Membership**: A có thuộc conversation không?
   - **Moderation**: content không rỗng, không quá dài, không chứa URL bị chặn…
   - **Rate limit**: tần suất gửi trong ngưỡng cho phép.
4. Hợp lệ → backend **ghi DB** (xem phần 2 bên dưới), tạo receipts cho người nhận.
5. Backend **broadcast** tới toàn bộ participants của conversation (bao gồm cả A):
   ```json
   {
     "type": "message",
     "data": {
       "id": "<message_id>",
       "conversation_id": "<uuid>",
       "sender": {"id":"<user_id>", "username":"..."},
       "content": "Xin chào",
       "created_at": "<ISO>",
       "attachment": null,
       "delivered_to": [],
       "read_by": []
     }
   }
   ```
6. Client B nhận event `message` → render ngay vào UI (append vào cuối), đồng thời có thể tự động gửi ACK (xem 2.3) nếu đang mở khung chat.

2) Luồng WS và tác động tới Database
-----------------------------------
**2.1. Khi tạo tin nhắn (A gửi message):**
- Bảng **ChatMessage**: chèn 1 record mới.
- Bảng **ChatMessageReceipt**: tạo mỗi người nhận 1 dòng với `delivered_at = null`, `read_at = null`.
- Bảng **ChatConversation**: cập nhật `last_message_at = now()` để sắp xếp danh sách cuộc trò chuyện.
- Sau khi commit DB → backend broadcast sự kiện `message` cho tất cả participants.

**2.2. Khi client lấy lịch sử tin nhắn qua REST (GET /chat/conversations/{id}/messages):**
- Backend sẽ bulk-update các message chưa “delivered” cho **chính client đang fetch** thành **delivered** (điền `delivered_at = now()` trong receipts).
- Sau đó backend **broadcast** một sự kiện `receipt` tới các participants để họ cập nhật huy hiệu/trạng thái:
  ```json
  {"type":"receipt","data":{"message_ids":["...","..."],"status":"delivered","user_id":"<viewer_id>"}}
  ```

**2.3. Khi client gửi ACK qua WS/REST (đánh dấu đã nhận/đã đọc):**
- Payload ví dụ (WS):
  ```json
  {"type":"ack","message_id":"<id>","status":"read"}
  ```
- Backend cập nhật **ChatMessageReceipt** tương ứng: điền `delivered_at` hoặc `read_at` (tùy `status`).
- Có thể cập nhật thêm `ChatParticipant.last_read_at` cho người gửi ACK (phục vụ tính badge chưa đọc).
- Sau khi commit DB → backend **broadcast** lại:
  ```json
  {"type":"receipt","data":{"message_ids":["<id>"],"status":"read","user_id":"<ack_user_id>"}}
  ```

**2.4. Khi connect/disconnect WS:**
- Không ghi DB mỗi lần ping, nhưng khi **disconnect**, backend có thể cập nhật/trả về `last_seen_at` và **broadcast presence**:
  ```json
  {"type":"presence","data":{"user_id":"<id>","status":"offline","last_seen_at":"<ISO>"}}
  ```

3) Frontend cần chú ý gì khi làm UI chatbox
-------------------------------------------
**3.1. Kết nối & tái kết nối**
- Luôn truyền `token` hợp lệ trong query: `wss://.../chat/ws?token=...`
- Cài **auto-reconnect** với backoff (1s → 2s → 5s…) khi mất kết nối mạng/tab sleep.
- Lắng nghe `presence` để hiển thị chấm xanh/“vừa hoạt động”.

**3.2. Đồng bộ tin nhắn & thứ tự**
- Tin nhắn realtime đến qua `message`. Tuy vậy, khi mở một conversation, **luôn gọi REST** để:
  - Lấy trang lịch sử (`before`, `limit`), đảm bảo không mất tin do rớt WS.
  - Trigger đánh dấu `delivered` (server sẽ tự bulk-update và broadcast receipt).
- Sắp xếp theo `created_at`/`id` tăng dần. Tránh lệch thứ tự do latency.

**3.3. ACK (delivered/read)**
- Gửi ACK “read” khi:
  - User đang **focus** vào khung chat và message **đã hiển thị** trong viewport.
  - Có thể debounce (vd: gửi 300–500ms sau khi ổn định cuộn).
- Nếu chỉ mở khung mà chưa đọc hết, có thể gửi ACK “delivered” trước.
- Nhận sự kiện `receipt` để cập nhật tick/badge trong UI.

**3.4. Typing**
- Gửi typing:
  ```json
  {"type":"typing","conversation_id":"<id>","is_typing":true}
  ```
- Debounce 300–1000ms; gửi `is_typing:false` khi ngừng gõ hoặc blur.
- Chỉ render “X đang nhập…” tối đa vài giây nếu không có cập nhật tiếp.

**3.5. Tải đính kèm**
- Upload file **qua REST** (`POST /chat/conversations/{id}/attachments`), **không tải file qua WS**.
- Server trả về message có `attachment` và **pre-signed URL** → frontend hiển thị nút tải/xem.
- Kiểm tra mime/size client-side trước khi gọi API để UX tốt hơn.

**3.6. Trạng thái gửi (optimistic UI)**
- Có thể **optimistic** push tin nhắn vào UI ngay khi gửi WS (gắn trạng thái “sending”). Khi nhận `message` từ server (có `id` thật) → thay thế bản tạm.
- Nếu nhận `error` → hiển thị toast, roll back trạng thái gửi.

**3.7. Phân trang & cuộn**
- API lịch sử hỗ trợ `before`/`limit`. Lưu `earliest_message_id`/`created_at` để kéo lên là gọi trang trước.
- Chặn `limit` tối đa (vd 100) theo backend, tránh gọi quá nhiều làm nghẽn.

**3.8. Bảo mật & hiệu năng**
- Token hết hạn → WS bị đóng. Cần **làm mới token** (qua flow login/refresh) rồi kết nối lại.
- Đừng gửi quá nhanh → có **rate limit** phía server. Nếu bị 429, hãy backoff.
- Sanitize UI, không render raw HTML từ `content`.

4) Payload mẫu
--------------
**4.1. Gửi tin nhắn (WS → Server)**
```json
{"type":"message","conversation_id":"<uuid>","content":"Xin chào"}
```

**4.2. Sự kiện tin nhắn mới (Server → WS)**
```json
{
  "type":"message",
  "data":{
    "id":"<msg_id>",
    "conversation_id":"<uuid>",
    "sender":{"id":"<user_id>","username":"..."},
    "content":"Xin chào",
    "created_at":"<ISO>",
    "attachment":null,
    "delivered_to":[],
    "read_by":[]
  }
}
```

**4.3. ACK đã đọc (WS → Server)**
```json
{"type":"ack","message_id":"<msg_id>","status":"read"}
```

**4.4. Receipt broadcast (Server → WS)**
```json
{"type":"receipt","data":{"message_ids":["<msg_id>"],"status":"read","user_id":"<reader_id>"}}
```

**4.5. Typing (2 chiều)**
```json
{"type":"typing","conversation_id":"<uuid>","is_typing":true}
```

**4.6. Presence (Server → WS)**
```json
{"type":"presence","data":{"user_id":"<id>","status":"online"}}
{"type":"presence","data":{"user_id":"<id>","status":"offline","last_seen_at":"<ISO>"}}
```

Checklist tích hợp nhanh (Frontend)
-----------------------------------
- [ ] Kết nối WS với `token`, auto-reconnect + backoff.
- [ ] Sau khi mở 1 conversation: gọi REST lấy lịch sử, rồi lắng nghe `message`.
- [ ] Debounce gửi `typing` và ACK `read` hợp lý.
- [ ] Hiển thị receipts dựa trên sự kiện `receipt`.
- [ ] Upload file qua REST, dùng pre-signed URL để tải/xem.
- [ ] Optimistic UI cho message “sending” → hợp nhất khi nhận `message` thật.
- [ ] Xử lý 401/403/429 và lỗi `error` từ WS.
- [ ] Sắp xếp, phân trang ổn định; tránh trùng message bằng `id`.
- [ ] Bảo mật UI (escape), giới hạn kích thước/loại file phía client.

Kết luận
--------
- WS được dùng cho realtime: `message`, `receipt`, `typing`, `presence`.
- Mọi thay đổi *trạng thái bền vững* (tin nhắn, receipts, mốc thời gian) **đều ghi DB trước**, sau đó mới broadcast.
- Frontend cần phối hợp **REST (đồng bộ lịch sử + upload)** và **WS (realtime)** để UI luôn chính xác, không mất sự kiện.
