# 🔐 Authentication là gì? - Hướng dẫn từ A-Z

## 📚 Phần 1: Khái niệm cơ bản

### Authentication (Xác thực) là gì?
**Authentication** = "Bạn có phải là người mà bạn nói bạn là không?"

Ví dụ thực tế:
- Bạn đi vào ngân hàng, nhân viên hỏi CMND → **Authentication**
- Bạn mở khóa điện thoại bằng vân tay → **Authentication**
- Bạn đăng nhập Facebook bằng email/password → **Authentication**

### Tại sao cần Authentication?
```
❌ KHÔNG có Authentication:
- Ai cũng có thể xem tin nhắn của bạn
- Hacker có thể xóa dữ liệu
- Thông tin cá nhân bị lộ

✅ CÓ Authentication:
- Chỉ bạn mới vào được tài khoản
- Dữ liệu được bảo vệ
- An toàn và riêng tư
```

## 🏠 Phần 2: Authentication hoạt động như thế nào?

### Bước 1: Đăng ký (Register)
```
Bạn → Web → "Tôi là Nguyễn Văn A, email: nva@uit.edu.vn, password: 123456"
Web → "OK, tôi lưu thông tin này vào database"
```

**Code thực tế:**
```javascript
// Người dùng nhập form
const userData = {
  email: "nva@uit.edu.vn",
  password: "123456",
  fullName: "Nguyễn Văn A"
}

// Gửi lên server
await signUp(userData.email, userData.password)
```

### Bước 2: Xác thực email
```
Web → Gửi email với link đặc biệt
Email → "Click vào link này để xác nhận email"
Bạn → Click link
Web → "OK, email đã được xác thực!"
```

### Bước 3: Đăng nhập (Login)
```
Bạn → Web → "Tôi là nva@uit.edu.vn, password: 123456"
Web → Kiểm tra database → "Đúng rồi, đây là Nguyễn Văn A"
Web → Tạo "vé" (token) cho bạn
```

**Token là gì?**
Token giống như **vé xem phim**:
- Có thời hạn (1-2 tiếng)
- Chứng minh bạn đã mua vé (đã đăng nhập)
- Không có vé = không vào được

## 🔄 Phần 3: Luồng hoạt động chi tiết

### Kịch bản: Bạn vào trang StudyMate

**Lần 1 - Chưa đăng nhập:**
```
1. Bạn gõ: studymate.com/dashboard
2. Web kiểm tra: "Có token không?" → KHÔNG
3. Web: "Bạn chưa đăng nhập, về trang login đi!"
4. Chuyển hướng → studymate.com/login
```

**Lần 2 - Đã đăng nhập:**
```
1. Bạn gõ: studymate.com/dashboard
2. Web kiểm tra: "Có token không?" → CÓ
3. Web kiểm tra: "Token còn hạn không?" → CÒN
4. Web: "OK, vào dashboard được!"
5. Hiển thị nội dung dashboard
```

## 💾 Phần 4: Dữ liệu được lưu ở đâu?

### 1. Trên máy tình bạn (Browser)
```javascript
// LocalStorage (lưu trữ cục bộ)
localStorage.setItem('token', 'abc123...')

// Cookie (bánh quy - file nhỏ)
document.cookie = "session=abc123; expires=..."
```

### 2. Trên server (Database)
```sql
-- Bảng users
CREATE TABLE users (
  id: uuid,
  email: "nva@uit.edu.vn",
  password_hash: "$2a$12$...", -- Mã hóa, không lưu plain text
  created_at: "2024-01-15"
);
```

## 🛡️ Phần 5: Bảo mật - Tại sao không lưu password thẳng?

### ❌ SAI - Lưu password thẳng:
```sql
-- NGUY HIỂM!
password: "123456" -- Ai xem database đều biết password
```

### ✅ ĐÚNG - Hash password:
```sql
-- AN TOÀN
password_hash: "$2a$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW"
```

**Hash hoạt động như nào?**
```javascript
// Khi đăng ký
input: "123456"
hash: bcrypt("123456") → "$2a$12$EixZa..."
// Lưu hash vào database

// Khi đăng nhập
input: "123456"
hash: bcrypt("123456") → "$2a$12$EixZa..."
// So sánh với hash trong database
```

**Hash là "máy băm một chiều":**
- `"123456"` → `"$2a$12$Eix..."` ✅ Được
- `"$2a$12$Eix..."` → `"123456"` ❌ Không thể ngược lại

## 🎯 Phần 6: StudyMate Authentication Flow

### Đăng ký StudyMate:

```
Bước 1: Form đăng ký
┌─────────────────────┐
│ Họ tên: Nguyễn Văn A│
│ Email: nva@uit.edu.vn│
│ Password: ••••••••  │
│ [ĐĂNG KÝ]          │
└─────────────────────┘
           ↓
Bước 2: Kiểm tra email .edu
if (!email.endsWith('.edu')) {
  show("Chỉ nhận email trường đại học!")
  return;
}
           ↓
Bước 3: Gửi đến Supabase
supabase.auth.signUp({
  email: "nva@uit.edu.vn",
  password: "123456"
})
           ↓
Bước 4: Supabase xử lý
- Tạo user trong auth.users
- Gửi email xác thực
- Trả về kết quả
           ↓
Bước 5: Hiển thị kết quả
"Vui lòng kiểm tra email để xác thực!"
```

### Xử lý email trùng lặp:

```javascript
// Supabase trả về khi email đã tồn tại:
{
  user: null,        // ← Key point: null = email đã tồn tại
  session: null,
  error: null        // Không có error!
}

// Code xử lý:
const { data } = await signUp(email, password);

if (!data.user) {
  // Đây là cách phát hiện email trùng
  throw new Error("Email đã được đăng ký!");
}
```

## 🔐 Phần 7: Session Management (Quản lý phiên)

### Session là gì?
Session = "Phiên làm việc" = Thời gian từ khi login đến logout

```
Session bắt đầu: Khi login thành công
Session kết thúc:
  - Khi logout
  - Khi hết hạn (1-2 tiếng)
  - Khi đóng browser (tùy cài đặt)
```

### Token Structure:
```javascript
// JWT Token ví dụ
{
  header: {
    "alg": "HS256",     // Thuật toán mã hóa
    "typ": "JWT"        // Loại token
  },
  payload: {
    "user_id": "123",   // ID người dùng
    "email": "nva@uit.edu.vn",
    "exp": 1640995200   // Thời hạn (timestamp)
  },
  signature: "abc123..." // Chữ ký xác thực
}
```

## 🚪 Phần 8: Auth Guard (Bảo vệ trang)

### AuthGuard hoạt động như thế nào?

```jsx
function AuthGuard({ children }) {
  const { user, loading } = useAuth();

  // Bước 1: Đang tải thông tin user
  if (loading) {
    return <div>Đang tải...</div>;
  }

  // Bước 2: Không có user = chưa đăng nhập
  if (!user) {
    router.push('/login'); // Đẩy về trang login
    return null;
  }

  // Bước 3: Có user = đã đăng nhập → Hiển thị nội dung
  return children;
}
```

### Sử dụng AuthGuard:

```jsx
// Trang Dashboard (cần đăng nhập)
export default function Dashboard() {
  return (
    <AuthGuard>
      <div>Nội dung chỉ user đã login mới thấy</div>
    </AuthGuard>
  );
}
```

## 🌐 Phần 9: Client vs Server Authentication

### Client-side (Trình duyệt):
```javascript
// Chạy trong browser
const supabase = createClient(url, key);
await supabase.auth.signIn(email, password);
```
**Đặc điểm:**
- Nhanh, tương tác realtime
- User có thể xem source code
- Ít bảo mật hơn

### Server-side (Máy chủ):
```javascript
// Chạy trên server
const supabase = createClient(url, serviceKey); // Key mạnh hơn
await supabase.from('users').insert(data);
```
**Đặc điểm:**
- Bảo mật cao
- User không xem được code
- Xử lý dữ liệu nhạy cảm

## 🔄 Phần 10: Error Handling (Xử lý lỗi)

### Các lỗi thường gặp:

```javascript
// 1. Email đã tồn tại
if (!data.user) {
  setError("Email đã được đăng ký!");
}

// 2. Password yếu
if (error.message.includes('Password should be')) {
  setError("Mật khẩu phải ít nhất 6 ký tự!");
}

// 3. Email không hợp lệ
if (error.message.includes('Invalid email')) {
  setError("Email không đúng định dạng!");
}

// 4. Đăng nhập sai
if (error.message.includes('Invalid credentials')) {
  setError("Email hoặc mật khẩu không đúng!");
}
```

## 📱 Phần 11: Responsive Auth (Thích ứng thiết bị)

### Trên điện thoại:
```css
/* Mobile: Form full width */
.auth-form {
  width: 100%;
  padding: 20px;
}
```

### Trên máy tính:
```css
/* Desktop: Form ở giữa, có shadow */
.auth-form {
  width: 400px;
  margin: 0 auto;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}
```

## 🎨 Phần 12: UX (Trải nghiệm người dùng)

### Loading States:
```jsx
{isLoading ? (
  <button disabled>
    <Spinner /> Đang đăng nhập...
  </button>
) : (
  <button onClick={handleLogin}>
    Đăng nhập
  </button>
)}
```

### Error Messages:
```jsx
{error && (
  <div className="error-message">
    ❌ {error}
  </div>
)}
```

### Success Messages:
```jsx
{success && (
  <div className="success-message">
    ✅ Đăng ký thành công! Kiểm tra email.
  </div>
)}
```

## 🧪 Phần 13: Testing Auth

### Test cases cơ bản:

```javascript
// Test 1: Đăng ký thành công
test('Đăng ký với email hợp lệ', async () => {
  const result = await signUp('test@uit.edu.vn', '123456');
  expect(result.user).toBeTruthy();
});

// Test 2: Email trùng lặp
test('Đăng ký với email đã tồn tại', async () => {
  await expect(
    signUp('existing@uit.edu.vn', '123456')
  ).rejects.toThrow('Email đã được đăng ký');
});

// Test 3: Password yếu
test('Đăng ký với password ngắn', async () => {
  await expect(
    signUp('test@uit.edu.vn', '123')
  ).rejects.toThrow('Password phải ít nhất 6 ký tự');
});
```

## 🚀 Phần 14: Deployment & Production

### Environment Variables:
```bash
# Development
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
SUPABASE_SERVICE_ROLE_KEY=eyJ...dev...

# Production
NEXT_PUBLIC_SUPABASE_URL=https://abc.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...prod...
```

### Security Checklist:
```
✅ HTTPS enabled
✅ Environment variables set
✅ Email confirmation required
✅ Strong password policy
✅ Rate limiting enabled
✅ Session timeout configured
```

---

## 📝 Tóm tắt

**Authentication** = Hệ thống xác minh "bạn là ai"

**Quy trình cơ bản:**
1. **Đăng ký** → Tạo tài khoản
2. **Xác thực email** → Chứng minh email thật
3. **Đăng nhập** → Nhận "vé" (token)
4. **Truy cập** → Dùng "vé" để vào các trang
5. **Đăng xuất** → Thu hồi "vé"

**Bảo mật:**
- Password được hash (mã hóa một chiều)
- Token có thời hạn
- AuthGuard bảo vệ trang private

**StudyMate đặc biệt:**
- Chỉ nhận email .edu (sinh viên)
- Xử lý duplicate email thông minh
- UX thân thiện bằng tiếng Việt

*Giờ bạn đã hiểu authentication từ A-Z! 🎉*