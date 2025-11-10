# Onboarding Flow

## Tổng quan

Flow đăng ký mới của StudyMate bao gồm 3 bước chính:
1. Đăng ký tài khoản (Register)
2. Xác thực email (Email Verification)
3. Hoàn thiện hồ sơ (Onboarding)

## Chi tiết Flow

### 1. Đăng ký tài khoản (`/auth/register`)

User điền form đăng ký với:
- Họ và tên
- Email sinh viên (.edu)
- Mật khẩu
- Xác nhận mật khẩu

Sau khi submit:
- Hệ thống gửi email xác thực đến địa chỉ email
- Hiển thị màn hình thông báo kiểm tra email

### 2. Xác thực email

User click vào link trong email:
```
https://[supabase-url]/auth/v1/verify?token=[token]&type=signup&redirect_to=http://localhost:3000/auth/callback
```

Link này sẽ:
- Xác thực email
- Redirect đến `/auth/callback?code=[code]`
- Callback handler sẽ:
  - Exchange code for session
  - Tạo user profile trong database (nếu là user mới) với `profileCompleted = false`
  - Redirect đến `/onboarding` (nếu là user mới)
  - Redirect đến `/dashboard` (nếu là user cũ đã hoàn thành profile)

### 3. Hoàn thiện hồ sơ (`/onboarding`)

User hoàn thành 3 bước:

#### Bước 1: Thông tin học vấn
- Trường đại học
- Ngành học
- Năm học

#### Bước 2: Sở thích học tập
- Chọn các môn học/lĩnh vực quan tâm (tối thiểu 3)
- Nhập mục tiêu học tập

#### Bước 3: Thời gian học
- Chọn khung giờ học phù hợp
- Giới thiệu bản thân (tùy chọn)

Sau khi hoàn thành:
- Gọi API `/api/user/complete-profile` để cập nhật thông tin
- Set `profileCompleted = true`
- Redirect đến `/dashboard`

## Middleware Protection

Middleware (`middleware.ts`) xử lý profile completion check:

### Cách hoạt động
- Sử dụng `user.user_metadata.profile_completed` từ Supabase (không cần Prisma)
- Redirect đến `/onboarding` nếu user chưa hoàn thành profile
- Redirect đến `/dashboard` nếu user đã hoàn thành profile nhưng cố truy cập `/onboarding`
- Cho phép truy cập tự do:
  - Public routes (landing page, terms, privacy)
  - Auth routes (`/auth/*`)
  - API routes (`/api/*`)
  - Onboarding page (khi profile chưa hoàn thành)

### User Metadata
Profile completion status được lưu ở 2 nơi:
1. **Database**: `users.profileCompleted` (boolean)
2. **Supabase User Metadata**: `user_metadata.profile_completed` (boolean)

Middleware chỉ check metadata để tránh database query, giúp tăng performance.

## Database Schema

Thêm field mới vào User model:
```prisma
profileCompleted  Boolean  @default(false)
```

## API Endpoints

### POST `/api/user/complete-profile`

Cập nhật profile và đánh dấu hoàn thành.

Request body:
```json
{
  "university": "string",
  "major": "string",
  "year": number,
  "interests": ["string"],
  "studyGoals": ["string"],
  "preferredStudyTime": ["string"],
  "bio": "string" (optional)
}
```

Actions:
1. Cập nhật database: `users.profileCompleted = true`
2. Cập nhật Supabase metadata: `user_metadata.profile_completed = true`

Response:
```json
{
  "success": true,
  "user": { ... }
}
```

## Testing

Để test flow:
1. Đăng ký tài khoản mới tại `/auth/register`
2. Kiểm tra email và click vào link xác thực
3. Sẽ được redirect đến `/onboarding`
4. Hoàn thành 3 bước onboarding
5. Sẽ được redirect đến `/dashboard`

Nếu user đã hoàn thành onboarding và cố truy cập `/onboarding`, sẽ tự động redirect về `/dashboard`.
