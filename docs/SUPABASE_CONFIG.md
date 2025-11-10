# Cấu hình Supabase cho Onboarding Flow

## Vấn đề hiện tại

Link xác thực email từ Supabase đang có format:
```
https://[supabase-url]/auth/v1/verify?token=...&type=signup&redirect_to=http://localhost:3000/
```

Sau khi verify, Supabase redirect đến `redirect_to` URL với `code` parameter:
```
http://localhost:3000/?code=...
```

Nhưng chúng ta cần redirect đến `/auth/callback` để xử lý authentication flow.

## Giải pháp

### 1. Cấu hình Redirect URLs trong Supabase Dashboard

Truy cập Supabase Dashboard:
1. Vào project của bạn
2. Authentication → URL Configuration
3. Thêm các Redirect URLs sau:
   - `http://localhost:3000/auth/callback` (development)
   - `https://yourdomain.com/auth/callback` (production)

### 2. Code đã được cập nhật

File `components/providers/Providers.tsx` đã được cập nhật với:
```typescript
const { data, error } = await supabase.auth.signUp({
  email,
  password,
  options: {
    data: metaData,
    emailRedirectTo: `${window.location.origin}/auth/callback`,
  },
});
```

### 3. Kiểm tra Email Template (Optional)

Nếu vẫn không hoạt động, kiểm tra email template trong Supabase:
1. Authentication → Email Templates
2. Chọn "Confirm signup"
3. Đảm bảo link có format: `{{ .ConfirmationURL }}`

Supabase sẽ tự động thay thế với URL đúng dựa trên `emailRedirectTo`.

## Test Flow

1. Đăng ký tài khoản mới
2. Kiểm tra email
3. Click link xác thực
4. Sẽ redirect đến `/auth/callback?code=...`
5. Callback handler sẽ:
   - Exchange code for session
   - Tạo user profile
   - Redirect đến `/onboarding` (user mới) hoặc `/dashboard` (user cũ)

## Troubleshooting

Nếu vẫn redirect về landing page:
1. Clear browser cache và cookies
2. Kiểm tra Supabase Dashboard → Authentication → URL Configuration
3. Đảm bảo `emailRedirectTo` được set đúng trong code
4. Kiểm tra console logs trong browser và server
