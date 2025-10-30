# 🔧 Fix: Apply .edu Email Validation (Alternative Approach)

## ❌ Vấn đề

Khi chạy `07_enforce_edu_email.sql`, bạn gặp lỗi:
```
ERROR: 42501: must be owner of relation users
```

**Nguyên nhân:** Supabase không cho phép user thông thường tạo trigger trên bảng `auth.users`.

---

## ✅ Giải pháp Alternative

Thay vì tạo trigger trên `auth.users`, chúng ta sẽ:
1. Thêm **CHECK constraint** vào bảng `public.users`
2. Validate ở **Backend** (đã có)
3. Validate ở **Frontend** (đã có)

**Tại sao vẫn an toàn?**
- Users không thể dùng app mà không có profile trong `public.users`
- Profile chỉ được tạo qua API (đã validate .edu)
- CHECK constraint đảm bảo không thể insert non-.edu email vào `public.users`

---

## 🚀 Cách Apply

### **Bước 1: Xóa file cũ (nếu đã chạy)**

Nếu bạn đã chạy `07_enforce_edu_email.sql` và gặp lỗi, không cần làm gì (vì nó fail rồi).

### **Bước 2: Chạy file mới**

1. **Vào Supabase Dashboard:**
   - https://app.supabase.com
   - Chọn project
   - Click **SQL Editor**

2. **Copy & Paste:**
   - Mở file `database/08_enforce_edu_email_alternative.sql`
   - Copy toàn bộ
   - Paste vào SQL Editor
   - Click **Run**

3. **Kiểm tra kết quả:**
   - Nếu thấy: `✅ All existing users have valid .edu emails` → OK
   - Nếu thấy warning về invalid emails → Cần xem lại

---

## ✅ Verify

### **Test 1: Check constraint tồn tại**

```sql
SELECT
  conname,
  pg_get_constraintdef(oid) as definition
FROM pg_constraint
WHERE conname = 'users_email_edu_check';
```

**Expected output:**
```
conname              | definition
---------------------+------------------------------------------
users_email_edu_check| CHECK (email ~* '@[^@]+\.edu(\.|$)')
```

---

### **Test 2: Try insert non-.edu email (should FAIL)**

```sql
INSERT INTO public.users (
  id, email, "firstName", "lastName",
  university, major, year
)
VALUES (
  gen_random_uuid(),
  'hacker@gmail.com',
  'Test', 'User', 'Test Uni', 'CS', 1
);
```

**Expected error:**
```
ERROR: new row for relation "users" violates check constraint "users_email_edu_check"
```

---

### **Test 3: Try insert .edu email (should SUCCEED)**

```sql
INSERT INTO public.users (
  id, email, "firstName", "lastName",
  university, major, year
)
VALUES (
  gen_random_uuid(),
  'student@university.edu.vn',
  'Test', 'User', 'Test Uni', 'CS', 1
);
```

**Expected:** Success (no error)

---

### **Test 4: Test validation function**

```sql
SELECT
  email,
  public.is_edu_email(email) as is_valid
FROM (
  VALUES
    ('student@university.edu'),
    ('student@hcmut.edu.vn'),
    ('test@gmail.com')
) AS test_emails(email);
```

**Expected output:**
```
email                    | is_valid
-------------------------+----------
student@university.edu   | true
student@hcmut.edu.vn     | true
test@gmail.com           | false
```

---

## 🔒 Security Layers (Final)

| Layer | Location | Status | Strength |
|-------|----------|--------|----------|
| 1. Frontend | `app/auth/register/page.tsx:45` | ✅ | WEAK |
| 2. Backend | `components/providers/Providers.tsx:105` | ✅ | MEDIUM |
| 3. Database | `public.users` CHECK constraint | ✅ | **STRONG** |

**Kết luận:** Vẫn đảm bảo bảo mật 3 lớp!

---

## 🔄 Rollback (nếu cần)

```sql
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_email_edu_check;
DROP FUNCTION IF EXISTS public.is_edu_email(TEXT);
DROP FUNCTION IF EXISTS public.validate_and_create_user_profile;
```

---

## 📝 Notes

- File `07_enforce_edu_email.sql` **KHÔNG CẦN** chạy nữa
- Chỉ chạy file `08_enforce_edu_email_alternative.sql`
- Constraint chỉ áp dụng cho `public.users`, không phải `auth.users`
- Điều này vẫn đảm bảo security vì:
  - User phải có profile trong `public.users` mới dùng được app
  - Profile chỉ tạo được qua API (đã validate)
  - Không thể bypass CHECK constraint
