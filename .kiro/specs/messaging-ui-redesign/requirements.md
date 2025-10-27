# Tài liệu Yêu cầu: Thiết kế lại UI/UX Tin nhắn

## Giới thiệu

Tài liệu này mô tả các yêu cầu để thiết kế lại giao diện và trải nghiệm người dùng của hệ thống tin nhắn trong ứng dụng StudyMate. Mục tiêu là tạo ra một giao diện tin nhắn hiện đại, đẹp mắt và dễ sử dụng hơn, lấy cảm hứng từ các ứng dụng nhắn tin phổ biến như Messenger, Telegram, và iMessage, đồng thời giữ được bản sắc riêng của StudyMate.

## Bảng thuật ngữ

- **Message Bubble**: Khung hiển thị một tin nhắn đơn lẻ trong giao diện chat
- **Conversation Card**: Thẻ hiển thị một cuộc trò chuyện trong danh sách
- **Chat Header**: Phần đầu của cửa sổ chat hiển thị thông tin người dùng
- **Message Input**: Ô nhập tin nhắn ở cuối cửa sổ chat
- **Typing Indicator**: Chỉ báo khi người khác đang nhập tin nhắn
- **Read Receipt**: Dấu hiệu cho biết tin nhắn đã được đọc
- **Presence Indicator**: Chỉ báo trạng thái online/offline
- **Reaction Bubble**: Biểu tượng cảm xúc phản ứng với tin nhắn
- **Date Separator**: Dòng phân cách ngày tháng giữa các tin nhắn
- **Empty State**: Giao diện hiển thị khi không có dữ liệu

## Yêu cầu

### Yêu cầu 1: Thiết kế lại Message Bubble

**User Story:** Là người dùng, tôi muốn tin nhắn có giao diện đẹp và dễ đọc để cuộc trò chuyện trở nên thú vị hơn.

#### Tiêu chí chấp nhận

1. THE System SHALL hiển thị tin nhắn của người gửi với màu nền primary gradient (xanh dương đến xanh lá nhạt)
2. THE System SHALL hiển thị tin nhắn của người nhận với màu nền xám nhạt (#F5F5F5)
3. THE System SHALL bo tròn góc message bubble với border-radius 18px cho tin nhắn đầu tiên trong nhóm
4. THE System SHALL bo tròn góc message bubble với border-radius 8px cho tin nhắn giữa nhóm
5. THE System SHALL thêm shadow nhẹ (0 1px 2px rgba(0,0,0,0.05)) cho message bubble
6. THE System SHALL hiển thị avatar tròn 40x40px với border 2px màu trắng
7. THE System SHALL hiển thị tên người gửi với font-weight 600 và màu #374151
8. THE System SHALL hiển thị thời gian với font-size 12px và màu #9CA3AF
9. THE System SHALL thêm khoảng cách 12px giữa các message bubble
10. THE System SHALL thêm padding 12px 16px cho nội dung tin nhắn

### Yêu cầu 2: Cải thiện Conversation List

**User Story:** Là người dùng, tôi muốn danh sách cuộc trò chuyện dễ nhìn và dễ tìm để nhanh chóng truy cập các cuộc trò chuyện quan trọng.

#### Tiêu chí chấp nhận

1. THE System SHALL hiển thị conversation card với chiều cao 80px
2. THE System SHALL thêm hover effect với background #F9FAFB và border-left 4px primary
3. THE System SHALL hiển thị avatar 56x56px với online indicator 12x12px
4. THE System SHALL hiển thị tên người dùng với font-size 16px và font-weight 600
5. THE System SHALL hiển thị preview tin nhắn với font-size 14px và màu #6B7280
6. THE System SHALL hiển thị thời gian với font-size 12px ở góc phải trên
7. THE System SHALL hiển thị unread badge tròn với background primary và số màu trắng
8. THE System SHALL thêm divider mỏng 1px giữa các conversation card
9. THE System SHALL highlight conversation đang chọn với background #EEF2FF
10. THE System SHALL truncate preview tin nhắn sau 50 ký tự với "..."

### Yêu cầu 3: Thiết kế lại Chat Header

**User Story:** Là người dùng, tôi muốn header chat hiển thị thông tin rõ ràng và có các action dễ truy cập.

#### Tiêu chí chấp nhận

1. THE System SHALL hiển thị chat header với chiều cao 72px và background trắng
2. THE System SHALL thêm shadow nhẹ (0 1px 3px rgba(0,0,0,0.1)) cho header
3. THE System SHALL hiển thị avatar 48x48px với online indicator
4. THE System SHALL hiển thị tên người dùng với font-size 18px và font-weight 600
5. THE System SHALL hiển thị trạng thái online với màu #10B981 và text "Đang hoạt động"
6. THE System SHALL hiển thị trạng thái offline với màu #6B7280 và thời gian "X phút trước"
7. THE System SHALL hiển thị các action button (call, video, info) với icon 24x24px
8. THE System SHALL thêm hover effect cho action button với background #F3F4F6
9. THE System SHALL hiển thị back button trên mobile với icon 24x24px
10. THE System SHALL căn giữa các element theo chiều dọc

### Yêu cầu 4: Cải thiện Message Input

**User Story:** Là người dùng, tôi muốn ô nhập tin nhắn đẹp và dễ sử dụng để soạn tin nhắn một cách thoải mái.

#### Tiêu chí chấp nhận

1. THE System SHALL hiển thị message input với border-radius 24px
2. THE System SHALL thêm border 1.5px màu #E5E7EB khi không focus
3. THE System SHALL thêm border 2px màu primary và shadow khi focus
4. THE System SHALL hiển thị placeholder với màu #9CA3AF
5. THE System SHALL hiển thị attachment button với icon 24x24px ở bên trái
6. THE System SHALL hiển thị emoji button với icon 24x24px ở giữa
7. THE System SHALL hiển thị send button tròn 44x44px với background primary gradient
8. THE System SHALL thêm hover effect cho send button với scale 1.05
9. THE System SHALL disable send button khi input rỗng với opacity 0.5
10. THE System SHALL auto-resize textarea từ 1 đến 4 dòng

### Yêu cầu 5: Thêm Date Separator

**User Story:** Là người dùng, tôi muốn thấy ngày tháng phân cách giữa các tin nhắn để dễ theo dõi thời gian.

#### Tiêu chí chấp nhận

1. WHEN tin nhắn thuộc ngày mới, THE System SHALL hiển thị date separator
2. THE System SHALL hiển thị date separator với text căn giữa
3. THE System SHALL hiển thị date với format "Hôm nay", "Hôm qua", hoặc "DD/MM/YYYY"
4. THE System SHALL hiển thị date với background #F3F4F6 và padding 4px 12px
5. THE System SHALL bo tròn date separator với border-radius 12px
6. THE System SHALL hiển thị date với font-size 12px và màu #6B7280
7. THE System SHALL thêm margin 16px trên và dưới date separator
8. THE System SHALL hiển thị date separator sticky khi scroll
9. THE System SHALL fade in date separator khi scroll qua
10. THE System SHALL center date separator theo chiều ngang

### Yêu cầu 6: Cải thiện Typing Indicator

**User Story:** Là người dùng, tôi muốn thấy chỉ báo nhập tin nhắn đẹp và rõ ràng để biết người khác đang trả lời.

#### Tiêu chí chấp nhận

1. THE System SHALL hiển thị typing indicator với 3 chấm nhấp nháy
2. THE System SHALL hiển thị typing indicator với background #F3F4F6
3. THE System SHALL bo tròn typing indicator với border-radius 18px
4. THE System SHALL hiển thị avatar 32x32px bên cạnh typing indicator
5. THE System SHALL animate 3 chấm với delay 0.2s giữa mỗi chấm
6. THE System SHALL hiển thị text "đang nhập..." với màu #6B7280
7. THE System SHALL fade in typing indicator với duration 0.2s
8. THE System SHALL fade out typing indicator với duration 0.2s
9. THE System SHALL hiển thị typing indicator ở cuối danh sách tin nhắn
10. THE System SHALL thêm padding 8px 12px cho typing indicator

### Yêu cầu 7: Thiết kế lại Read Receipts

**User Story:** Là người dùng, tôi muốn thấy trạng thái tin nhắn rõ ràng để biết tin nhắn đã được gửi và đọc chưa.

#### Tiêu chí chấp nhận

1. THE System SHALL hiển thị single checkmark (✓) màu #9CA3AF khi tin nhắn đang gửi
2. THE System SHALL hiển thị double checkmark (✓✓) màu #9CA3AF khi tin nhắn đã gửi
3. THE System SHALL hiển thị double checkmark (✓✓) màu primary khi tin nhắn đã đọc
4. THE System SHALL hiển thị checkmark với font-size 14px
5. THE System SHALL hiển thị checkmark bên cạnh thời gian
6. THE System SHALL thêm animation fade in khi checkmark thay đổi
7. THE System SHALL hiển thị sending spinner khi tin nhắn đang gửi
8. THE System SHALL hiển thị error icon màu đỏ khi gửi thất bại
9. THE System SHALL hiển thị retry button khi gửi thất bại
10. THE System SHALL thêm tooltip "Đã gửi", "Đã nhận", "Đã đọc" khi hover

### Yêu cầu 8: Cải thiện Message Reactions

**User Story:** Là người dùng, tôi muốn reaction hiển thị đẹp và dễ tương tác để phản ứng nhanh với tin nhắn.

#### Tiêu chí chấp nhận

1. THE System SHALL hiển thị reaction picker với 6 emoji phổ biến
2. THE System SHALL hiển thị reaction picker với background trắng và shadow
3. THE System SHALL bo tròn reaction picker với border-radius 24px
4. THE System SHALL hiển thị mỗi emoji với size 32x32px
5. THE System SHALL thêm hover effect cho emoji với scale 1.2
6. THE System SHALL hiển thị reaction bubble dưới tin nhắn
7. THE System SHALL hiển thị reaction bubble với background #F3F4F6
8. THE System SHALL bo tròn reaction bubble với border-radius 12px
9. THE System SHALL hiển thị emoji và số lượng trong reaction bubble
10. THE System SHALL highlight reaction của user với background primary nhạt

### Yêu cầu 9: Thêm Reply Preview

**User Story:** Là người dùng, tôi muốn thấy preview tin nhắn đang trả lời rõ ràng để biết mình đang trả lời tin nhắn nào.

#### Tiêu chí chấp nhận

1. WHEN user click reply, THE System SHALL hiển thị reply preview trên message input
2. THE System SHALL hiển thị reply preview với background #F9FAFB
3. THE System SHALL thêm border-left 3px màu primary cho reply preview
4. THE System SHALL hiển thị tên người gửi với font-weight 600
5. THE System SHALL hiển thị nội dung tin nhắn với màu #6B7280
6. THE System SHALL truncate nội dung sau 100 ký tự
7. THE System SHALL hiển thị close button với icon 20x20px
8. THE System SHALL thêm hover effect cho close button
9. THE System SHALL animate reply preview với slide up
10. THE System SHALL hiển thị reply indicator trong tin nhắn đã gửi

### Yêu cầu 10: Cải thiện Empty States

**User Story:** Là người dùng, tôi muốn thấy empty state đẹp và hữu ích khi không có dữ liệu.

#### Tiêu chí chấp nhận

1. WHEN không có conversation, THE System SHALL hiển thị empty state với icon và text
2. THE System SHALL hiển thị icon 64x64px với màu #D1D5DB
3. THE System SHALL hiển thị title với font-size 20px và font-weight 600
4. THE System SHALL hiển thị description với font-size 14px và màu #6B7280
5. THE System SHALL hiển thị CTA button với text "Khám phá bạn học"
6. WHEN không có tin nhắn, THE System SHALL hiển thị welcome message
7. THE System SHALL hiển thị welcome message với background gradient nhẹ
8. THE System SHALL hiển thị welcome icon với animation
9. THE System SHALL center empty state theo cả chiều ngang và dọc
10. THE System SHALL thêm animation fade in cho empty state

### Yêu cầu 11: Thêm Message Actions Menu

**User Story:** Là người dùng, tôi muốn menu action hiển thị đẹp và dễ sử dụng để thao tác với tin nhắn.

#### Tiêu chí chấp nhận

1. WHEN hover message, THE System SHALL hiển thị action buttons
2. THE System SHALL hiển thị action buttons với background trắng và shadow
3. THE System SHALL bo tròn action buttons với border-radius 8px
4. THE System SHALL hiển thị icon 20x20px cho mỗi action
5. THE System SHALL thêm hover effect với background #F3F4F6
6. THE System SHALL hiển thị tooltip cho mỗi action
7. THE System SHALL hiển thị dropdown menu khi click more button
8. THE System SHALL hiển thị dropdown với background trắng và shadow
9. THE System SHALL thêm divider giữa các action group
10. THE System SHALL highlight destructive action (delete) với màu đỏ

### Yêu cầu 12: Cải thiện Search UI

**User Story:** Là người dùng, tôi muốn search UI đẹp và dễ sử dụng để tìm kiếm tin nhắn nhanh chóng.

#### Tiêu chí chấp nhận

1. THE System SHALL hiển thị search input với icon search bên trái
2. THE System SHALL hiển thị search input với border-radius 12px
3. THE System SHALL thêm focus effect với border primary
4. THE System SHALL hiển thị clear button khi có text
5. THE System SHALL hiển thị search results với highlight
6. THE System SHALL hiển thị result count với format "X kết quả"
7. THE System SHALL hiển thị navigation buttons (prev/next)
8. THE System SHALL scroll to highlighted message với smooth animation
9. THE System SHALL hiển thị "Không tìm thấy" khi không có kết quả
10. THE System SHALL thêm keyboard shortcut Cmd/Ctrl+F

### Yêu cầu 13: Thêm File Preview

**User Story:** Là người dùng, tôi muốn file preview đẹp và dễ xem để xem trước file trước khi tải.

#### Tiêu chí chấp nhận

1. WHEN tin nhắn có ảnh, THE System SHALL hiển thị thumbnail với max-width 300px
2. THE System SHALL bo tròn ảnh với border-radius 12px
3. THE System SHALL thêm loading skeleton khi ảnh đang tải
4. THE System SHALL hiển thị lightbox khi click ảnh
5. WHEN tin nhắn có file, THE System SHALL hiển thị file card
6. THE System SHALL hiển thị file icon, tên và kích thước
7. THE System SHALL hiển thị download button với icon
8. THE System SHALL thêm hover effect cho file card
9. THE System SHALL hiển thị progress bar khi upload file
10. THE System SHALL hiển thị error state khi upload thất bại

### Yêu cầu 14: Cải thiện Mobile UI

**User Story:** Là người dùng mobile, tôi muốn UI tối ưu cho mobile để sử dụng dễ dàng trên điện thoại.

#### Tiêu chí chấp nhận

1. THE System SHALL hiển thị conversation list full screen trên mobile
2. THE System SHALL hiển thị chat full screen khi chọn conversation
3. THE System SHALL hiển thị back button ở góc trái trên
4. THE System SHALL tăng touch target lên 44x44px minimum
5. THE System SHALL tối ưu spacing cho màn hình nhỏ
6. THE System SHALL ẩn sidebar khi chat đang mở
7. THE System SHALL thêm swipe gesture để quay lại
8. THE System SHALL tối ưu keyboard behavior
9. THE System SHALL hiển thị action sheet thay vì dropdown trên mobile
10. THE System SHALL thêm haptic feedback cho các action

### Yêu cầu 15: Thêm Dark Mode Support

**User Story:** Là người dùng, tôi muốn có dark mode để sử dụng thoải mái trong môi trường thiếu sáng.

#### Tiêu chí chấp nhận

1. THE System SHALL hỗ trợ dark mode với color scheme tối
2. THE System SHALL sử dụng background #1F2937 cho dark mode
3. THE System SHALL sử dụng text #F9FAFB cho dark mode
4. THE System SHALL điều chỉnh message bubble colors cho dark mode
5. THE System SHALL điều chỉnh shadow cho dark mode
6. THE System SHALL lưu preference dark mode
7. THE System SHALL sync với system preference
8. THE System SHALL thêm toggle button cho dark mode
9. THE System SHALL animate transition giữa light và dark mode
10. THE System SHALL đảm bảo contrast ratio đạt WCAG AA

### Yêu cầu 16: Cải thiện Animation và Transitions

**User Story:** Là người dùng, tôi muốn animation mượt mà và tự nhiên để trải nghiệm sử dụng thú vị hơn.

#### Tiêu chí chấp nhận

1. THE System SHALL sử dụng ease-out timing cho entrance animations
2. THE System SHALL sử dụng ease-in timing cho exit animations
3. THE System SHALL sử dụng duration 200ms cho micro-interactions
4. THE System SHALL sử dụng duration 300ms cho transitions
5. THE System SHALL thêm fade in animation cho tin nhắn mới
6. THE System SHALL thêm slide up animation cho message input
7. THE System SHALL thêm scale animation cho reactions
8. THE System SHALL thêm smooth scroll animation
9. THE System SHALL respect prefers-reduced-motion
10. THE System SHALL sử dụng transform thay vì position cho performance

### Yêu cầu 17: Thêm Loading States

**User Story:** Là người dùng, tôi muốn thấy loading state đẹp để biết hệ thống đang xử lý.

#### Tiêu chí chấp nhận

1. THE System SHALL hiển thị skeleton loader cho conversation list
2. THE System SHALL hiển thị skeleton loader cho message list
3. THE System SHALL sử dụng shimmer effect cho skeleton
4. THE System SHALL match skeleton với layout thực tế
5. THE System SHALL hiển thị spinner cho inline loading
6. THE System SHALL hiển thị progress bar cho file upload
7. THE System SHALL hiển thị loading state cho send button
8. THE System SHALL thêm pulse animation cho loading
9. THE System SHALL hiển thị "Đang tải..." text khi cần
10. THE System SHALL timeout loading sau 10 giây

### Yêu cầu 18: Cải thiện Error States

**User Story:** Là người dùng, tôi muốn error state rõ ràng và hữu ích để biết cách khắc phục lỗi.

#### Tiêu chí chấp nhận

1. THE System SHALL hiển thị error message với màu đỏ
2. THE System SHALL hiển thị error icon với size 24x24px
3. THE System SHALL hiển thị retry button với text rõ ràng
4. THE System SHALL hiển thị error toast ở góc trên phải
5. THE System SHALL auto dismiss toast sau 5 giây
6. THE System SHALL cho phép dismiss toast thủ công
7. THE System SHALL hiển thị error state cho failed message
8. THE System SHALL hiển thị error state cho failed upload
9. THE System SHALL hiển thị helpful error message
10. THE System SHALL log error để debug

### Yêu cầu 19: Thêm Accessibility Features

**User Story:** Là người dùng có nhu cầu accessibility, tôi muốn UI hỗ trợ đầy đủ để sử dụng dễ dàng.

#### Tiêu chí chấp nhận

1. THE System SHALL thêm ARIA labels cho tất cả interactive elements
2. THE System SHALL hỗ trợ keyboard navigation đầy đủ
3. THE System SHALL hiển thị focus indicator rõ ràng
4. THE System SHALL đảm bảo contrast ratio đạt WCAG AA
5. THE System SHALL hỗ trợ screen reader
6. THE System SHALL thêm alt text cho images
7. THE System SHALL thêm role attributes
8. THE System SHALL announce tin nhắn mới cho screen reader
9. THE System SHALL hỗ trợ high contrast mode
10. THE System SHALL test với screen reader tools

### Yêu cầu 20: Cải thiện Typography

**User Story:** Là người dùng, tôi muốn typography đẹp và dễ đọc để đọc tin nhắn thoải mái.

#### Tiêu chí chấp nhận

1. THE System SHALL sử dụng font Inter hoặc system font
2. THE System SHALL sử dụng font-size 15px cho message content
3. THE System SHALL sử dụng line-height 1.5 cho readability
4. THE System SHALL sử dụng font-weight 400 cho regular text
5. THE System SHALL sử dụng font-weight 600 cho headings
6. THE System SHALL sử dụng letter-spacing -0.01em cho titles
7. THE System SHALL đảm bảo text không bị cut off
8. THE System SHALL hỗ trợ emoji với fallback font
9. THE System SHALL hỗ trợ Vietnamese characters đầy đủ
10. THE System SHALL scale typography responsive

---

## Yêu cầu phi chức năng

### Thẩm mỹ
- Giao diện hiện đại, sạch sẽ và nhất quán
- Màu sắc hài hòa và dễ nhìn
- Spacing và alignment chính xác
- Animation mượt mà và tự nhiên

### Khả năng sử dụng
- Dễ học và dễ sử dụng
- Feedback rõ ràng cho mọi action
- Error message hữu ích
- Consistent interaction patterns

### Responsive
- Hoạt động tốt trên mọi kích thước màn hình
- Tối ưu cho cả desktop và mobile
- Touch-friendly trên mobile
- Adaptive layout

### Performance
- Animation chạy ở 60 FPS
- Smooth scrolling
- Fast rendering
- Optimized images

### Accessibility
- WCAG 2.1 AA compliance
- Keyboard navigation
- Screen reader support
- High contrast support
