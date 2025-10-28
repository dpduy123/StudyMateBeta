# Tài liệu Yêu cầu: Thiết kế lại UI/UX Tin nhắn

## Giới thiệu

Tài liệu này mô tả các yêu cầu để cải thiện giao diện và trải nghiệm người dùng của hệ thống tin nhắn hiện tại trong ứng dụng StudyMate. Mục tiêu là làm đẹp và tối ưu hóa các thành phần UI/UX đã có sẵn bao gồm: Conversation List, Message Container, Message Input, Chat Header, Message Actions, Reactions, và Reply, lấy cảm hứng từ các ứng dụng nhắn tin phổ biến như Messenger, Telegram, và iMessage.

## Bảng thuật ngữ

- **Conversation List**: Danh sách các cuộc trò chuyện ở sidebar bên trái
- **Conversation Card**: Thẻ hiển thị một cuộc trò chuyện trong danh sách
- **Message Container**: Vùng hiển thị các tin nhắn trong cuộc trò chuyện
- **Message Bubble**: Khung hiển thị một tin nhắn đơn lẻ
- **Chat Header**: Phần đầu của cửa sổ chat hiển thị thông tin người dùng
- **Message Input**: Ô nhập tin nhắn ở cuối cửa sổ chat
- **Message Actions**: Các nút thao tác với tin nhắn (reply, edit, delete, reaction)
- **Reaction Picker**: Menu chọn emoji để phản ứng với tin nhắn
- **Reply Preview**: Khung hiển thị tin nhắn đang được trả lời
- **Typing Indicator**: Chỉ báo khi người khác đang nhập tin nhắn
- **Read Receipt**: Dấu tích cho biết tin nhắn đã được đọc

## Yêu cầu

### Yêu cầu 1: Cải thiện Conversation List UI

**User Story:** Là người dùng, tôi muốn danh sách cuộc trò chuyện có giao diện đẹp và dễ sử dụng để nhanh chóng tìm và truy cập các cuộc trò chuyện.

#### Tiêu chí chấp nhận

1. THE System SHALL hiển thị mỗi conversation card với chiều cao cố định 80px
2. THE System SHALL hiển thị avatar tròn 56x56px với border 2px màu trắng
3. THE System SHALL hiển thị online indicator tròn 14x14px với border 3px màu trắng ở góc dưới phải avatar
4. THE System SHALL hiển thị tên người dùng với font-size 16px, font-weight 600, màu #111827
5. THE System SHALL hiển thị preview tin nhắn với font-size 14px, màu #6B7280, truncate sau 60 ký tự
6. THE System SHALL hiển thị thời gian ở góc phải trên với font-size 12px, màu #9CA3AF
7. THE System SHALL hiển thị unread badge tròn với background #3B82F6, text màu trắng, min-width 20px
8. WHEN hover conversation card, THE System SHALL hiển thị background #F9FAFB
9. WHEN conversation được chọn, THE System SHALL hiển thị background #EEF2FF với border-left 4px màu #3B82F6
10. THE System SHALL thêm divider 1px màu #F3F4F6 giữa các conversation card

### Yêu cầu 2: Cải thiện Message Bubble UI

**User Story:** Là người dùng, tôi muốn tin nhắn có giao diện đẹp và dễ đọc để cuộc trò chuyện trở nên thú vị hơn.

#### Tiêu chí chấp nhận

1. THE System SHALL hiển thị own message bubble với background gradient từ #3B82F6 đến #2563EB
2. THE System SHALL hiển thị other message bubble với background #F3F4F6
3. THE System SHALL bo tròn message bubble với border-radius 18px
4. THE System SHALL thêm padding 12px 16px cho message content
5. THE System SHALL hiển thị text màu trắng cho own messages và màu #111827 cho other messages
6. THE System SHALL thêm shadow nhẹ (0 1px 2px rgba(0,0,0,0.05)) cho message bubble
7. THE System SHALL hiển thị avatar tròn 40x40px chỉ ở tin nhắn cuối cùng trong nhóm
8. THE System SHALL hiển thị tên người gửi với font-size 13px, font-weight 600, màu #6B7280
9. THE System SHALL hiển thị thời gian với font-size 11px, màu #9CA3AF bên cạnh checkmarks
10. THE System SHALL giữ max-width 65% màn hình cho message bubble

### Yêu cầu 3: Cải thiện Chat Header UI

**User Story:** Là người dùng, tôi muốn chat header hiển thị thông tin rõ ràng và có các action dễ truy cập.

#### Tiêu chí chấp nhận

1. THE System SHALL hiển thị chat header với chiều cao 72px và background #FFFFFF
2. THE System SHALL thêm border-bottom 1px màu #E5E7EB và shadow nhẹ (0 1px 3px rgba(0,0,0,0.1))
3. THE System SHALL hiển thị avatar tròn 48x48px với online indicator
4. THE System SHALL hiển thị tên người dùng với font-size 18px, font-weight 600, màu #111827
5. THE System SHALL hiển thị status "Đang hoạt động" với font-size 14px, màu #10B981 khi online
6. THE System SHALL hiển thị status "X phút trước" với font-size 14px, màu #6B7280 khi offline
7. THE System SHALL hiển thị 3 action buttons (phone, video, info) với icon 24x24px, màu #6B7280
8. WHEN hover action button, THE System SHALL hiển thị background #F3F4F6 với border-radius 8px
9. THE System SHALL hiển thị back button trên mobile với icon 24x24px ở góc trái
10. THE System SHALL căn giữa tất cả elements theo chiều dọc với gap 12px

### Yêu cầu 4: Cải thiện Message Input UI

**User Story:** Là người dùng, tôi muốn ô nhập tin nhắn đẹp và dễ sử dụng để soạn tin nhắn một cách thoải mái.

#### Tiêu chí chấp nhận

1. THE System SHALL hiển thị message input container với padding 16px và background #FFFFFF
2. THE System SHALL hiển thị textarea với border-radius 24px và border 1.5px màu #E5E7EB
3. WHEN focus textarea, THE System SHALL hiển thị border 2px màu #3B82F6 và shadow (0 0 0 3px rgba(59,130,246,0.1))
4. THE System SHALL hiển thị placeholder "Nhập tin nhắn..." với màu #9CA3AF
5. THE System SHALL hiển thị attachment button với icon 24x24px, màu #6B7280 ở bên trái trong textarea
6. THE System SHALL hiển thị send button tròn 44x44px với background #3B82F6 ở bên phải
7. THE System SHALL hiển thị send icon màu trắng 20x20px trong send button
8. WHEN hover send button, THE System SHALL scale 1.05 và hiển thị background #2563EB
9. WHEN textarea rỗng, THE System SHALL disable send button với opacity 0.5
10. THE System SHALL auto-resize textarea từ min-height 48px đến max-height 120px (3 dòng)

### Yêu cầu 5: Cải thiện Message Actions UI

**User Story:** Là người dùng, tôi muốn các action với tin nhắn hiển thị rõ ràng và dễ sử dụng.

#### Tiêu chí chấp nhận

1. WHEN hover message bubble, THE System SHALL hiển thị action buttons với animation fade in 150ms
2. THE System SHALL hiển thị action buttons với background #FFFFFF, shadow (0 2px 8px rgba(0,0,0,0.1)), border-radius 8px
3. THE System SHALL hiển thị 3 quick actions: reply, reaction, more với icon 20x20px, màu #6B7280
4. THE System SHALL thêm padding 6px cho mỗi action button
5. WHEN hover action button, THE System SHALL hiển thị background #F3F4F6 và scale 1.1
6. WHEN click more button, THE System SHALL hiển thị dropdown menu với animation slide down
7. THE System SHALL hiển thị dropdown menu với background #FFFFFF, shadow elevation-2, border-radius 8px
8. THE System SHALL hiển thị edit và delete actions trong dropdown với icon 18x18px
9. THE System SHALL hiển thị delete action với màu #EF4444
10. THE System SHALL thêm divider 1px màu #E5E7EB giữa edit và delete

### Yêu cầu 6: Cải thiện Reaction Picker UI

**User Story:** Là người dùng, tôi muốn reaction picker đẹp và dễ sử dụng để phản ứng nhanh với tin nhắn.

#### Tiêu chí chấp nhận

1. THE System SHALL hiển thị reaction picker với 6 emoji: 👍, ❤️, 😂, 😮, 😢, 🙏
2. THE System SHALL hiển thị reaction picker với background #FFFFFF, shadow (0 4px 12px rgba(0,0,0,0.15)), border-radius 24px
3. THE System SHALL hiển thị mỗi emoji với size 32x32px và padding 8px
4. THE System SHALL animate reaction picker với scale từ 0.8 đến 1 và opacity từ 0 đến 1 trong 150ms
5. WHEN hover emoji, THE System SHALL scale 1.3 và hiển thị background #F3F4F6 với border-radius 50%
6. THE System SHALL position reaction picker phía trên message bubble với margin 8px
7. THE System SHALL hiển thị reaction bubbles dưới message với background #F3F4F6, border-radius 12px
8. THE System SHALL hiển thị emoji và count trong reaction bubble với gap 4px
9. WHEN user đã react, THE System SHALL hiển thị reaction bubble với background #DBEAFE và border 1.5px màu #3B82F6
10. WHEN hover reaction bubble, THE System SHALL hiển thị tooltip với danh sách users đã react

### Yêu cầu 7: Cải thiện Reply Preview UI

**User Story:** Là người dùng, tôi muốn reply preview rõ ràng để biết mình đang trả lời tin nhắn nào.

#### Tiêu chí chấp nhận

1. WHEN click reply action, THE System SHALL hiển thị reply preview trên message input với animation slide up
2. THE System SHALL hiển thị reply preview với background #F9FAFB, border-left 3px màu #3B82F6, border-radius 8px
3. THE System SHALL thêm padding 12px cho reply preview
4. THE System SHALL hiển thị text "Trả lời [Tên người gửi]" với font-size 13px, font-weight 600, màu #3B82F6
5. THE System SHALL hiển thị nội dung tin nhắn gốc với font-size 14px, màu #6B7280, truncate sau 100 ký tự
6. THE System SHALL hiển thị close button với icon X 18x18px, màu #9CA3AF ở góc phải
7. WHEN hover close button, THE System SHALL hiển thị màu #6B7280 và background #F3F4F6 với border-radius 4px
8. THE System SHALL hiển thị reply indicator trong message bubble đã gửi với background #F3F4F6, padding 8px, border-radius 6px
9. THE System SHALL hiển thị tên người được reply với font-weight 600 trong reply indicator
10. THE System SHALL truncate nội dung reply sau 80 ký tự trong reply indicator

### Yêu cầu 8: Cải thiện Typing Indicator UI

**User Story:** Là người dùng, tôi muốn typing indicator rõ ràng để biết người khác đang trả lời.

#### Tiêu chí chấp nhận

1. THE System SHALL hiển thị typing indicator với background #F3F4F6, border-radius 18px, padding 12px 16px
2. THE System SHALL hiển thị avatar tròn 32x32px bên cạnh typing indicator
3. THE System SHALL hiển thị 3 chấm với size 8x8px, màu #9CA3AF
4. THE System SHALL animate 3 chấm với bounce effect, delay 0.2s giữa mỗi chấm
5. THE System SHALL hiển thị text "[Tên] đang nhập..." với font-size 13px, màu #6B7280
6. THE System SHALL animate typing indicator với fade in 200ms khi xuất hiện
7. THE System SHALL animate typing indicator với fade out 200ms khi biến mất
8. THE System SHALL position typing indicator ở cuối message list
9. THE System SHALL thêm margin-top 8px cho typing indicator
10. THE System SHALL auto scroll to typing indicator khi xuất hiện

### Yêu cầu 9: Cải thiện Read Receipts UI

**User Story:** Là người dùng, tôi muốn read receipts rõ ràng để biết trạng thái tin nhắn.

#### Tiêu chí chấp nhận

1. THE System SHALL hiển thị single checkmark (✓) màu #9CA3AF khi tin nhắn đã gửi
2. THE System SHALL hiển thị double checkmark (✓✓) màu #9CA3AF khi tin nhắn đã nhận
3. THE System SHALL hiển thị double checkmark (✓✓) màu #3B82F6 khi tin nhắn đã đọc
4. THE System SHALL hiển thị checkmark với font-size 14px bên cạnh thời gian
5. THE System SHALL animate checkmark với fade in khi thay đổi trạng thái
6. WHEN tin nhắn đang gửi, THE System SHALL hiển thị spinner animation với màu #9CA3AF
7. WHEN tin nhắn gửi thất bại, THE System SHALL hiển thị error icon màu #EF4444
8. THE System SHALL hiển thị retry button với text "Thử lại" màu #EF4444 khi gửi thất bại
9. WHEN hover checkmark, THE System SHALL hiển thị tooltip "Đã gửi", "Đã nhận", hoặc "Đã đọc"
10. THE System SHALL thêm gap 4px giữa thời gian và checkmark

### Yêu cầu 10: Cải thiện Empty States UI

**User Story:** Là người dùng, tôi muốn empty states đẹp và hữu ích khi không có dữ liệu.

#### Tiêu chí chấp nhận

1. WHEN không có conversations, THE System SHALL hiển thị empty state với icon chat 64x64px màu #D1D5DB
2. THE System SHALL hiển thị title "Chưa có cuộc trò chuyện" với font-size 20px, font-weight 600, màu #111827
3. THE System SHALL hiển thị description "Hãy kết nối với bạn học để bắt đầu trò chuyện!" với font-size 14px, màu #6B7280
4. THE System SHALL center empty state theo cả chiều ngang và dọc
5. WHEN không có messages, THE System SHALL hiển thị welcome message với icon 48x48px
6. THE System SHALL hiển thị welcome text "Chưa có tin nhắn" với font-size 18px, font-weight 600
7. THE System SHALL hiển thị sub-text "Hãy bắt đầu cuộc trò chuyện!" với font-size 14px, màu #6B7280
8. THE System SHALL animate empty state với fade in 300ms
9. THE System SHALL thêm margin 32px xung quanh empty state content
10. THE System SHALL hiển thị empty state với background subtle gradient từ #FFFFFF đến #F9FAFB

### Yêu cầu 11: Cải thiện Spacing và Layout

**User Story:** Là người dùng, tôi muốn layout hài hòa và spacing hợp lý để giao diện dễ nhìn.

#### Tiêu chí chấp nhận

1. THE System SHALL sử dụng spacing scale: 4px, 8px, 12px, 16px, 24px, 32px
2. THE System SHALL thêm padding 16px cho conversation list container
3. THE System SHALL thêm gap 0px giữa conversation cards (divider thay thế)
4. THE System SHALL thêm padding 16px cho message container
5. THE System SHALL thêm gap 12px giữa các message groups khác nhau
6. THE System SHALL thêm gap 4px giữa messages trong cùng group
7. THE System SHALL thêm padding 16px cho message input container
8. THE System SHALL thêm gap 12px giữa textarea và send button
9. THE System SHALL đảm bảo alignment chính xác cho tất cả text elements
10. THE System SHALL responsive spacing: giảm 25% trên mobile (< 768px)

### Yêu cầu 12: Cải thiện Colors và Contrast

**User Story:** Là người dùng, tôi muốn màu sắc hài hòa và contrast tốt để dễ đọc.

#### Tiêu chí chấp nhận

1. THE System SHALL sử dụng primary color #3B82F6 cho own messages, CTAs, và highlights
2. THE System SHALL sử dụng gray-50 #F9FAFB cho subtle backgrounds
3. THE System SHALL sử dụng gray-100 #F3F4F6 cho other messages và neutral elements
4. THE System SHALL sử dụng gray-200 #E5E7EB cho borders và dividers
5. THE System SHALL sử dụng gray-500 #6B7280 cho secondary text
6. THE System SHALL sử dụng gray-900 #111827 cho primary text
7. THE System SHALL sử dụng success color #10B981 cho online status
8. THE System SHALL sử dụng error color #EF4444 cho errors và destructive actions
9. THE System SHALL đảm bảo contrast ratio ≥ 4.5:1 cho text (WCAG AA)
10. THE System SHALL sử dụng shadow subtle: 0 1px 2px rgba(0,0,0,0.05) cho elevation-1, 0 2px 8px rgba(0,0,0,0.1) cho elevation-2

### Yêu cầu 13: Cải thiện Hover và Interactive States

**User Story:** Là người dùng, tôi muốn interactive states rõ ràng để biết elements có thể tương tác.

#### Tiêu chí chấp nhận

1. THE System SHALL thêm hover state với background change cho tất cả clickable elements
2. THE System SHALL thêm cursor pointer cho tất cả interactive elements
3. THE System SHALL thêm transition 150ms ease-in-out cho tất cả state changes
4. THE System SHALL thêm scale 1.05 cho buttons khi hover
5. THE System SHALL thêm opacity 0.8 cho disabled elements
6. THE System SHALL thêm focus ring 3px với primary color và opacity 0.3 cho keyboard navigation
7. THE System SHALL thêm active state với scale 0.95 cho buttons khi click
8. THE System SHALL thêm hover effect với background #F3F4F6 cho neutral elements
9. THE System SHALL thêm hover effect với background #2563EB cho primary buttons
10. THE System SHALL respect prefers-reduced-motion: reduce transitions to 0ms

---

## Yêu cầu phi chức năng

### Thẩm mỹ
- Giao diện hiện đại, sạch sẽ và nhất quán
- Màu sắc hài hòa theo design system
- Spacing và alignment chính xác
- Typography dễ đọc

### Khả năng sử dụng
- Feedback rõ ràng cho mọi interaction
- Consistent patterns
- Intuitive navigation
- Error states hữu ích

### Responsive
- Hoạt động tốt trên desktop (≥ 1024px)
- Hoạt động tốt trên tablet (768px - 1023px)
- Hoạt động tốt trên mobile (< 768px)
- Touch-friendly trên mobile

### Performance
- Smooth animations ở 60 FPS
- Transitions không quá 300ms
- No layout shifts
- Optimized re-renders

### Accessibility
- WCAG 2.1 AA compliance
- Keyboard navigation support
- Focus indicators
- Sufficient color contrast
