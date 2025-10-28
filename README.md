# StudyMate - Nền tảng kết nối sinh viên

StudyMate là một nền tảng kết nối sinh viên thông minh sử dụng AI để giúp sinh viên tìm được những người bạn học phù hợp, tham gia các phòng thảo luận và xây dựng cộng đồng học tập năng động.

Note for deploy:
## 🌟 Tính năng chính 

### 1. **AI-Powered Matching (Khám phá)**
- Thuật toán AI phân tích hồ sơ học thuật để gợi ý những người bạn học phù hợp
- Matching dựa trên môn học, sở thích, mục tiêu và lịch học
- Độ chính xác cao với tỷ lệ match thành công >85%

### 2. **Hệ thống tin nhắn**
- Chat real-time với Pusher (WebSocket + HTTP fallback)
- Chia sẻ file tài liệu, ghi chú
- Typing indicators và read receipts
- Voice/Video calls tích hợp

### 3. **Voice/Video Chat Rooms**
- Phòng học nhóm theo chủ đề
- Screen sharing (Premium feature)
- Moderation tools

### 4. **Hệ thống thành tích**
- Badge system: Network Pro, Chat Master, Study Influencer
- Leaderboards dựa trên hoạt động
- Điểm thưởng và ranking

### 5. **Xác thực .edu**
- Chỉ sinh viên có email .edu được tham gia
- Môi trường an toàn 100%
- OAuth 2.0 integration

### 6. **Gói Premium**
- **Basic (Miễn phí)**: 5 matches/ngày, 5 rooms/ngày
- **Premium (79k/tháng)**: Unlimited matches, advanced filters
- **Elite (149k/tháng)**: AI Tutor, exclusive events, career mentoring

## 🛠 Tech Stack

### Frontend
- **Next.js 15** với App Router
- **React 19** với TypeScript
- **Tailwind CSS** cho styling
- **Framer Motion** cho animations
- **React Hook Form** + **Zod** cho form validation
- **Lucide React** cho icons

### Backend & Database
- **Supabase** cho authentication và database
- **PostgreSQL** database
- **Prisma ORM** cho database management
- **Pusher** cho real-time messaging (WebSocket + HTTP fallback)
- **Redis** (optional) cho caching và performance optimization

### UI/UX
- **Responsive design** cho mobile, HD, 2K, 4K, 21:9 screens
- **GenZ professional styling** với màu sắc đồng bộ
- **No linear gradients** theo yêu cầu
- **Accessibility compliant**

## 📁 Cấu trúc dự án

```
src/
├── app/                    # Next.js App Router
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Dashboard và các trang chính
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Landing page
├── components/            # React components
│   ├── landing/           # Landing page components
│   ├── dashboard/         # Dashboard components
│   ├── layout/            # Layout components
│   └── providers/         # Context providers
├── lib/                   # Utility functions
│   └── supabase/          # Supabase client configuration
└── types/                 # TypeScript type definitions

prisma/
└── schema.prisma          # Database schema
```

## 🚀 Cài đặt và chạy

### 1. Clone repository
```bash
git clone <repository-url>
cd StudyMateProject
```

### 2. Cài đặt dependencies
```bash
npm install
```

### 3. Cấu hình environment variables
```bash
cp .env.example .env.local
```

Điền thông tin cần thiết trong `.env.local`:
- Supabase URL và keys
- Database connection strings
- Pusher credentials (app ID, key, secret, cluster)
- Redis connection (optional)
- Các API keys khác

**Pusher Setup:**
1. Đăng ký tài khoản miễn phí tại [https://dashboard.pusher.com/](https://dashboard.pusher.com/)
2. Tạo một Channels app mới
3. Copy credentials vào `.env.local`:
   - `PUSHER_APP_ID`
   - `PUSHER_SECRET`
   - `NEXT_PUBLIC_PUSHER_KEY`
   - `NEXT_PUBLIC_PUSHER_CLUSTER`

### 4. Setup database
```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma db push

# (Optional) Seed database
npx prisma db seed
```

### 5. Chạy development server
```bash
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000) để xem ứng dụng.

## 📊 Database Schema

### Các model chính:

- **User**: Thông tin người dùng và hồ sơ học thuật
- **Match**: Hệ thống matching giữa users
- **Message**: Tin nhắn giữa users đã match
- **Room**: Phòng voice/video chat
- **RoomMember**: Thành viên trong phòng
- **Badge**: Hệ thống badge
- **Achievement**: Thành tích và progress
- **Rating**: Đánh giá giữa users

Xem chi tiết trong `prisma/schema.prisma`

## 🎨 Design System

### Màu sắc
- **Primary**: Blue tones (#0ea5e9)
- **Accent**: Purple tones (#e149ff)
- **Success**: Green tones (#22c55e)
- **Warning**: Yellow tones (#f59e0b)
- **Gray**: Neutral tones

### Typography
- **Font**: Inter (Vietnamese support)
- **Responsive text**: Tự động scale theo screen size

### Components
- Consistent spacing và border radius
- Hover effects và micro-interactions
- Mobile-first responsive design

## 🔒 Security Features

- **Email .edu verification**
- **Rate limiting** cho API calls
- **Input sanitization**
- **CSRF protection**
- **Secure file uploads**

## 📱 Responsive Design

- **Mobile**: 375px - 767px
- **Tablet**: 768px - 1023px
- **Desktop**: 1024px - 1919px
- **2K**: 1920px - 2559px
- **4K**: 2560px+
- **Ultrawide**: 3440px+ (21:9 aspect ratio)

## 🚀 Deployment

### Vercel (Recommended)
1. Connect GitHub repository to Vercel
2. Add environment variables
3. Deploy automatically

### Manual Deployment
```bash
npm run build
npm start
```

## 🤝 Contributing

1. Fork repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.

## 👥 Team

- **Frontend**: React/Next.js developers
- **Backend**: Node.js/Supabase developers
- **UI/UX**: Design team
- **QA**: Testing team

## 📞 Support

- Email: support@studymate.vn
- Documentation: [docs.studymate.vn](https://docs.studymate.vn)
- Community: [community.studymate.vn](https://community.studymate.vn)

---

**StudyMate** - Kết nối sinh viên, học tập cùng nhau! 🎓✨
