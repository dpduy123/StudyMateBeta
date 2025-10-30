# 🔐 Hướng Dẫn Apply .edu Email Validation

## 📋 Tổng Quan

File này hướng dẫn apply database trigger để enforce `.edu` email validation ở database level.

**Layers bảo mật:**
- ✅ **Frontend**: Register page validate (WEAK - có thể bypass)
- ✅ **Backend**: `signUp()` function validate (MEDIUM - đã apply)
- 🔒 **Database**: Trigger validate (STRONG - cần apply)

---

## 🚀 Cách Apply Migration

### **Option 1: Sử dụng Supabase Dashboard (RECOMMENDED)**

1. **Truy cập Supabase Dashboard:**
   - Vào https://app.supabase.com
   - Chọn project của bạn
   - Click vào **SQL Editor** (icon Database)

2. **Copy & Paste SQL:**
   - Mở file [`database/07_enforce_edu_email.sql`](./07_enforce_edu_email.sql)
   - Copy toàn bộ nội dung
   - Paste vào SQL Editor
   - Click **Run** (hoặc `Ctrl/Cmd + Enter`)

3. **Verify:**
   ```sql
   -- Check if trigger exists
   SELECT * FROM information_schema.triggers
   WHERE trigger_name = 'enforce_edu_email_trigger';
   ```

---

### **Option 2: Sử dụng psql command line**

```bash
# Get database URL from Supabase Dashboard → Settings → Database
export DATABASE_URL="postgresql://postgres:[password]@[host]:5432/postgres"

# Apply migration
psql $DATABASE_URL -f database/07_enforce_edu_email.sql
```

---

## ✅ Verification Tests

### **Test 1: Check trigger tồn tại**

```sql
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE trigger_name = 'enforce_edu_email_trigger';
```

### **Test 2: Try non-.edu email (should FAIL)**

```sql
INSERT INTO auth.users (email, encrypted_password)
VALUES ('hacker@gmail.com', 'dummy');
-- Expected: ERROR: Only .edu email addresses are allowed
```

### **Test 3: Try .edu email (should SUCCEED)**

```sql
INSERT INTO auth.users (email, encrypted_password)
VALUES ('student@university.edu', 'dummy');
-- Expected: Success
```

---

## 🔄 Rollback

```sql
DROP TRIGGER IF EXISTS enforce_edu_email_trigger ON auth.users;
DROP FUNCTION IF EXISTS auth.check_edu_email();
```

---

## 📝 Security Notes

- Trigger runs **BEFORE** INSERT/UPDATE - blocks at database level
- Cannot be bypassed via API or frontend manipulation
- Case-insensitive: `test@UNIVERSITY.EDU` is valid
- Pattern: Email must **END** with `.edu`
