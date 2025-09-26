# 🔒 Avatar Storage Security Setup

## 🎯 Goal
- Users can only upload/modify files in their own `userId/` folder
- All users can **read** avatars (for display purposes)
- Secure and scalable solution

## 🏗️ Setup Instructions

### 1. **Go to Supabase Dashboard**
- Navigate to: **Storage** → **Policies** → **Avatar bucket**

### 2. **Create These RLS Policies:**

#### **Policy 1: Public Read Access** 
```sql
-- Name: "Public can view avatars"
-- Action: SELECT
-- Definition:
bucket_id = 'Avatar'
```

#### **Policy 2: Users Upload Own Files**
```sql  
-- Name: "Users can upload own avatars"
-- Action: INSERT
-- Definition:
bucket_id = 'Avatar' AND (storage.foldername(name))[1] = auth.uid()::text
```

#### **Policy 3: Users Update Own Files**
```sql
-- Name: "Users can update own avatars"  
-- Action: UPDATE
-- Definition:
bucket_id = 'Avatar' AND (storage.foldername(name))[1] = auth.uid()::text
```

#### **Policy 4: Users Delete Own Files**
```sql
-- Name: "Users can delete own avatars"
-- Action: DELETE  
-- Definition:
bucket_id = 'Avatar' AND (storage.foldername(name))[1] = auth.uid()::text
```

## 🛡️ Security Model

### **What This Achieves:**
- ✅ **Public Read**: Anyone can view avatars (needed for UI display)
- ✅ **Private Write**: Users can only modify their own `userId/` folder
- ✅ **Folder Isolation**: User `abc123` can't access folder `def456`
- ✅ **Admin Access**: Backend with service key can manage all files

### **File Structure:**
```
Avatar/
├── user-abc-123/
│   └── avatar.png    ← Only user-abc-123 can write here
├── user-def-456/  
│   └── avatar.jpg    ← Only user-def-456 can write here
└── user-xyz-789/
    └── avatar.gif    ← Only user-xyz-789 can write here
```

### **Access Control:**
- **Read**: `https://supabase.co/storage/.../Avatar/userId/avatar.png` ✅ (Anyone)
- **Write**: Only the authenticated user whose `auth.uid()` matches `userId`

## 🧪 Testing
1. Upload avatar as User A → Should save to `userA/avatar.ext`
2. Try to access `userB/avatar.ext` via direct API → Should fail
3. View avatar in profile → Should display (public read)
4. Upload new avatar → Should overwrite old one in same folder

This setup provides **secure isolation** while maintaining **public display capability**! 🚀