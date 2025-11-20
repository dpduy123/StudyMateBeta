# B2C Partner Discovery Feature

## Overview

The B2C Partner Discovery page is a new feature designed for business partners to view all users on the StudyMate platform in a comprehensive grid layout. Unlike the standard discovery page which shows users one-by-one in a Tinder-style interface, this page displays all users as cards in a grid, allowing partners to browse and interact with multiple users simultaneously.

## Features

### 1. Grid Layout Display
- **User Cards**: Each user is displayed as a card with key information
- **Responsive Design**: Grid adapts from 1 column (mobile) to 4 columns (desktop)
- **Premium Badges**: Visual indicators for Premium/Elite subscribers

### 2. Advanced Search & Filtering
- **Text Search**: Search by name, university, major, or bio
- **University Filter**: Filter users by their university
- **Major Filter**: Filter users by their academic major
- **Real-time Filtering**: Instant results as you type or change filters

### 3. User Profile Dialog
- **Full Profile View**: Click any card to see complete user details
- **Same as Standard Discovery**: Shows all profile information including:
  - Bio, interests, skills, languages
  - Study goals and preferred study times
  - Academic stats (GPA, matches, ratings)
- **Action Buttons**: PASS, LIKE, and Message (Nhắn tin) buttons

### 4. Access Control
- **Admin Only**: Currently restricted to admin emails
- **Future B2C Partner Access**: Ready for B2C partner account integration

## File Structure

```
app/
├── discover-b2c/
│   └── page.tsx                          # Main B2C discover page
├── api/
│   └── discover/
│       └── b2c-users/
│           └── route.ts                   # API endpoint for fetching users

components/
└── discover/
    └── UserProfileDialog.tsx              # User profile dialog component
```

## Usage

### For Admins
1. Navigate to `/admin` dashboard
2. Click the "B2C Discovery" button in the header
3. Browse all users in grid layout
4. Use search and filters to find specific users
5. Click any card to view full profile and take action

### For B2C Partners (Future)
Once B2C partner accounts are implemented:
1. Direct access to `/discover-b2c` route
2. Same functionality as admins
3. Can view all active, public users

## API Endpoints

### GET /api/discover/b2c-users

Returns all active users with public profiles.

**Authentication**: Required (Admin or B2C Partner)

**Response**:
```json
{
  "users": [
    {
      "id": "user-id",
      "email": "user@example.com",
      "firstName": "Minh",
      "lastName": "Anh",
      "avatar": "url or null",
      "university": "Đại học Bách khoa Hà Nội",
      "major": "Khoa học Máy tính",
      "year": 3,
      "bio": "...",
      "interests": ["Coding", "Research"],
      "skills": ["Python", "JavaScript"],
      "languages": ["Tiếng Việt", "English"],
      "preferredStudyTime": ["Tối (19:00-22:00)"],
      "studyGoals": ["Trở thành AI Engineer"],
      "totalMatches": 45,
      "successfulMatches": 32,
      "averageRating": 4.9,
      "gpa": 3.8,
      "status": "ACTIVE",
      "subscriptionTier": "PREMIUM",
      "isProfilePublic": true,
      "lastActive": "2024-01-15T10:30:00Z"
    }
  ],
  "total": 150,
  "timestamp": "2024-01-15T12:00:00Z"
}
```

**Sorting**: Users are sorted by:
1. Subscription tier (Premium/Elite first)
2. Last active date (most recent first)
3. Join date (newest first)

**Limit**: Maximum 500 users returned for performance

## User Actions

### 1. LIKE
- Sends a match request to the user
- Creates a PENDING match record in database
- If mutual match, automatically becomes ACCEPTED
- User receives notification

### 2. PASS
- Rejects the user
- Creates a REJECTED match record
- User will not appear again in this session

### 3. Message (Nhắn tin)
- Navigates to `/messages/new?userId={userId}`
- Opens new message conversation
- Can message regardless of match status

## Design Features

### Card Information Display
Each card shows:
- User avatar (or placeholder)
- Full name
- University (with location icon)
- Major and year (with academic cap icon)
- Match count, rating, and GPA
- Subscription tier badge (if Premium/Elite)
- Bio preview (2 lines max)
- "Xem chi tiết" button

### Filter Panel
- Collapsible filter section
- Shows "Active" badge when filters applied
- Clear all filters button
- Real-time result count

### User Stats
- **Found**: Shows count of filtered users
- **Premium Indicators**: Visual badges for paid tiers
- **Loading States**: Spinner during data fetch
- **Error Handling**: Friendly error messages with retry

## Performance Optimizations

1. **Lazy Loading**: Grid cards animate on scroll
2. **SWR Caching**: Cached API responses for fast navigation
3. **Optimistic UI**: Instant feedback on user actions
4. **Limited Results**: Max 500 users to prevent performance issues
5. **Efficient Filtering**: Client-side filtering for instant results

## Future Enhancements

### Phase 1: B2C Partner Accounts
- [ ] Create BusinessAccount model in database
- [ ] Add B2C partner authentication
- [ ] Partner-specific access controls
- [ ] Partner dashboard with analytics

### Phase 2: Advanced Features
- [ ] Bulk actions (like/pass multiple users)
- [ ] Export user data to CSV/Excel
- [ ] Save search filters as presets
- [ ] User comparison tool
- [ ] Advanced analytics (demographics, engagement)

### Phase 3: Integration
- [ ] CRM integration
- [ ] Email campaign tools
- [ ] Custom reporting
- [ ] API access for partners

## Access Control

### Current Implementation
```typescript
// Admin emails hardcoded in route
const ADMIN_EMAILS = [
  '23560004@gm.uit.edu.vn',
  '23520362@gm.uit.edu.vn'
]
```

### Future Implementation
```typescript
// Check for B2C partner account
const isB2CPartner = await checkB2CPartnerAccess(currentUser.id)
const hasAccess = isAdmin || isB2CPartner
```

## Security Considerations

1. **Authentication Required**: All endpoints require valid session
2. **Access Control**: Only admins/partners can access
3. **Public Profiles Only**: Only shows `isProfilePublic: true`
4. **Active Users Only**: Only shows `status: ACTIVE`
5. **Email Privacy**: Email addresses shown (consider hiding for partners)

## Mobile Responsiveness

- **Grid**: 1 column (mobile) → 2 (tablet) → 3 (desktop) → 4 (large)
- **Search Bar**: Full width on mobile
- **Filter Panel**: Collapsible on mobile
- **Dialog**: Full screen on mobile, centered modal on desktop
- **Navigation**: Bottom tab navigation hidden on this page

## Testing Checklist

- [x] Page loads successfully for admin users
- [x] API returns user data correctly
- [x] Search filters users in real-time
- [x] University filter works correctly
- [x] Major filter works correctly
- [x] User profile dialog opens on card click
- [x] PASS button creates REJECTED match
- [x] LIKE button creates PENDING match
- [x] Message button navigates correctly
- [ ] Access denied for non-admin users (manual test)
- [ ] Mobile responsive layout works
- [ ] Error states display correctly
- [ ] Loading states show appropriately

## Development Notes

### Dependencies
- `@headlessui/react`: Dialog component
- `framer-motion`: Animations
- `swr`: Data fetching and caching
- `heroicons`: Icon components

### TypeScript Types
All user data is properly typed with the `User` interface matching the Prisma schema.

### Styling
- Tailwind CSS for all styling
- Consistent with existing StudyMate design system
- Primary color: `primary-600` (blue)
- Accent colors for subscription tiers

## Quick Start for Development

1. **Access the page**:
   ```
   http://localhost:3000/discover-b2c
   ```

2. **Or via admin panel**:
   ```
   http://localhost:3000/admin
   Click "B2C Discovery" button
   ```

3. **Test with seed data**:
   - Use admin panel to seed test users
   - Navigate to B2C discovery page
   - All seeded users should appear

## Troubleshooting

### "B2C Partner access required" Error
- **Cause**: User is not in admin emails list
- **Solution**: Add email to `ADMIN_EMAILS` in `/app/api/discover/b2c-users/route.ts`

### No users displayed
- **Cause**: No users with `isProfilePublic: true` and `status: ACTIVE`
- **Solution**: Seed users or update existing users in database

### Dialog not opening
- **Cause**: Missing `@headlessui/react` dependency
- **Solution**: Run `npm install @headlessui/react`

### Card layout broken
- **Cause**: Tailwind CSS not compiled
- **Solution**: Restart dev server `npm run dev`

## Maintenance

### Adding New Filters
1. Add filter state in page component
2. Add filter UI in filter panel
3. Update `filteredUsers` logic
4. Test thoroughly

### Modifying Card Display
1. Edit card section in `page.tsx`
2. Ensure responsive breakpoints
3. Test on mobile and desktop

### Updating User Data
1. Modify API endpoint in `route.ts`
2. Update `User` interface in both files
3. Update card and dialog displays

---

**Last Updated**: 2024-01-15
**Version**: 1.0.0
**Status**: Production Ready (pending B2C partner account system)
