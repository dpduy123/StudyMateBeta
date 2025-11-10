-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.achievements (
  id text NOT NULL,
  name text NOT NULL,
  description text NOT NULL,
  category USER-DEFINED NOT NULL,
  points integer NOT NULL DEFAULT 0,
  requirement text NOT NULL,
  isActive boolean NOT NULL DEFAULT true,
  createdAt timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT achievements_pkey PRIMARY KEY (id)
);
CREATE TABLE public.badges (
  id text NOT NULL,
  name text NOT NULL,
  description text NOT NULL,
  type USER-DEFINED NOT NULL,
  icon text NOT NULL,
  requirement text NOT NULL,
  isActive boolean NOT NULL DEFAULT true,
  createdAt timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT badges_pkey PRIMARY KEY (id)
);
CREATE TABLE public.daily_metrics (
  id text NOT NULL,
  date date NOT NULL,
  totalUsers integer NOT NULL DEFAULT 0,
  activeUsers integer NOT NULL DEFAULT 0,
  newUsers integer NOT NULL DEFAULT 0,
  totalMatches integer NOT NULL DEFAULT 0,
  successfulMatches integer NOT NULL DEFAULT 0,
  totalMessages integer NOT NULL DEFAULT 0,
  totalRooms integer NOT NULL DEFAULT 0,
  activeRooms integer NOT NULL DEFAULT 0,
  createdAt timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt timestamp without time zone NOT NULL,
  CONSTRAINT daily_metrics_pkey PRIMARY KEY (id)
);
CREATE TABLE public.matches (
  id text NOT NULL,
  senderId text NOT NULL,
  receiverId text NOT NULL,
  status USER-DEFINED NOT NULL DEFAULT 'PENDING'::"MatchStatus",
  message text,
  createdAt timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt timestamp without time zone NOT NULL,
  respondedAt timestamp without time zone,
  CONSTRAINT matches_pkey PRIMARY KEY (id),
  CONSTRAINT matches_senderId_fkey FOREIGN KEY (senderId) REFERENCES public.users(id),
  CONSTRAINT matches_receiverId_fkey FOREIGN KEY (receiverId) REFERENCES public.users(id)
);
CREATE TABLE public.message_reactions (
  id text NOT NULL,
  messageId text NOT NULL,
  userId text NOT NULL,
  emoji text NOT NULL,
  createdAt timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT message_reactions_pkey PRIMARY KEY (id),
  CONSTRAINT message_reactions_messageId_fkey FOREIGN KEY (messageId) REFERENCES public.messages(id),
  CONSTRAINT message_reactions_userId_fkey FOREIGN KEY (userId) REFERENCES public.users(id)
);
CREATE TABLE public.messages (
  id text NOT NULL,
  senderId text NOT NULL,
  receiverId text NOT NULL,
  type USER-DEFINED NOT NULL DEFAULT 'TEXT'::"MessageType",
  content text NOT NULL,
  fileUrl text,
  fileName text,
  fileSize integer,
  isRead boolean NOT NULL DEFAULT false,
  createdAt timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  readAt timestamp without time zone,
  updatedAt timestamp without time zone NOT NULL,
  replyToId text,
  isEdited boolean NOT NULL DEFAULT false,
  editedAt timestamp without time zone,
  CONSTRAINT messages_pkey PRIMARY KEY (id),
  CONSTRAINT messages_senderId_fkey FOREIGN KEY (senderId) REFERENCES public.users(id),
  CONSTRAINT messages_receiverId_fkey FOREIGN KEY (receiverId) REFERENCES public.users(id),
  CONSTRAINT messages_replyToId_fkey FOREIGN KEY (replyToId) REFERENCES public.messages(id)
);
CREATE TABLE public.notifications (
  id text NOT NULL,
  userId text NOT NULL,
  type USER-DEFINED NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  isRead boolean NOT NULL DEFAULT false,
  relatedUserId text,
  relatedMatchId text,
  relatedMessageId text,
  relatedRoomId text,
  metadata jsonb,
  createdAt timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  readAt timestamp without time zone,
  CONSTRAINT notifications_pkey PRIMARY KEY (id),
  CONSTRAINT notifications_userId_fkey FOREIGN KEY (userId) REFERENCES public.users(id)
);
CREATE TABLE public.ratings (
  id text NOT NULL,
  giverId text NOT NULL,
  receiverId text NOT NULL,
  rating integer NOT NULL,
  comment text,
  context text,
  createdAt timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT ratings_pkey PRIMARY KEY (id),
  CONSTRAINT ratings_giverId_fkey FOREIGN KEY (giverId) REFERENCES public.users(id),
  CONSTRAINT ratings_receiverId_fkey FOREIGN KEY (receiverId) REFERENCES public.users(id)
);
CREATE TABLE public.room_members (
  id text NOT NULL,
  roomId text NOT NULL,
  userId text NOT NULL,
  joinedAt timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  leftAt timestamp without time zone,
  isMuted boolean NOT NULL DEFAULT false,
  isBanned boolean NOT NULL DEFAULT false,
  CONSTRAINT room_members_pkey PRIMARY KEY (id),
  CONSTRAINT room_members_roomId_fkey FOREIGN KEY (roomId) REFERENCES public.rooms(id),
  CONSTRAINT room_members_userId_fkey FOREIGN KEY (userId) REFERENCES public.users(id)
);
CREATE TABLE public.room_message_reactions (
  id text NOT NULL,
  messageId text NOT NULL,
  userId text NOT NULL,
  emoji text NOT NULL,
  createdAt timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT room_message_reactions_pkey PRIMARY KEY (id),
  CONSTRAINT room_message_reactions_messageId_fkey FOREIGN KEY (messageId) REFERENCES public.room_messages(id),
  CONSTRAINT room_message_reactions_userId_fkey FOREIGN KEY (userId) REFERENCES public.users(id)
);
CREATE TABLE public.room_messages (
  id text NOT NULL,
  roomId text NOT NULL,
  senderId text NOT NULL,
  type USER-DEFINED NOT NULL DEFAULT 'TEXT'::"MessageType",
  content text NOT NULL,
  fileUrl text,
  fileName text,
  fileSize integer,
  replyToId text,
  isEdited boolean NOT NULL DEFAULT false,
  editedAt timestamp without time zone,
  createdAt timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt timestamp without time zone NOT NULL,
  CONSTRAINT room_messages_pkey PRIMARY KEY (id),
  CONSTRAINT room_messages_roomId_fkey FOREIGN KEY (roomId) REFERENCES public.rooms(id),
  CONSTRAINT room_messages_senderId_fkey FOREIGN KEY (senderId) REFERENCES public.users(id),
  CONSTRAINT room_messages_replyToId_fkey FOREIGN KEY (replyToId) REFERENCES public.room_messages(id)
);
CREATE TABLE public.rooms (
  id text NOT NULL,
  name text NOT NULL,
  description text,
  type USER-DEFINED NOT NULL DEFAULT 'STUDY_GROUP'::"RoomType",
  topic text,
  maxMembers integer NOT NULL DEFAULT 10,
  isPrivate boolean NOT NULL DEFAULT false,
  password text,
  ownerId text NOT NULL,
  allowVideo boolean NOT NULL DEFAULT true,
  allowVoice boolean NOT NULL DEFAULT true,
  allowText boolean NOT NULL DEFAULT true,
  allowScreenShare boolean NOT NULL DEFAULT false,
  createdAt timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt timestamp without time zone NOT NULL,
  lastActivity timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT rooms_pkey PRIMARY KEY (id),
  CONSTRAINT rooms_ownerId_fkey FOREIGN KEY (ownerId) REFERENCES public.users(id)
);
CREATE TABLE public.user_achievements (
  id text NOT NULL,
  userId text NOT NULL,
  achievementId text NOT NULL,
  progress double precision NOT NULL DEFAULT 0.0,
  completedAt timestamp without time zone,
  CONSTRAINT user_achievements_pkey PRIMARY KEY (id),
  CONSTRAINT user_achievements_userId_fkey FOREIGN KEY (userId) REFERENCES public.users(id),
  CONSTRAINT user_achievements_achievementId_fkey FOREIGN KEY (achievementId) REFERENCES public.achievements(id)
);
CREATE TABLE public.user_activities (
  id text NOT NULL,
  userId text NOT NULL,
  activityType text NOT NULL,
  metadata jsonb,
  createdAt timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT user_activities_pkey PRIMARY KEY (id)
);
CREATE TABLE public.user_badges (
  id text NOT NULL,
  userId text NOT NULL,
  badgeId text NOT NULL,
  earnedAt timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT user_badges_pkey PRIMARY KEY (id),
  CONSTRAINT user_badges_userId_fkey FOREIGN KEY (userId) REFERENCES public.users(id),
  CONSTRAINT user_badges_badgeId_fkey FOREIGN KEY (badgeId) REFERENCES public.badges(id)
);
CREATE TABLE public.users (
  id text NOT NULL,
  email text NOT NULL CHECK (email ~* '@[^@]+\.edu(\.|$)'::text),
  emailVerified timestamp without time zone,
  username text,
  firstName text NOT NULL,
  lastName text NOT NULL,
  avatar text,
  bio text,
  university text NOT NULL,
  major text NOT NULL,
  year integer NOT NULL,
  gpa double precision,
  status USER-DEFINED NOT NULL DEFAULT 'ACTIVE'::"UserStatus",
  subscriptionTier USER-DEFINED NOT NULL DEFAULT 'BASIC'::"SubscriptionTier",
  subscriptionExpiry timestamp without time zone,
  interests ARRAY,
  skills ARRAY,
  studyGoals ARRAY,
  preferredStudyTime ARRAY,
  languages ARRAY,
  isProfilePublic boolean NOT NULL DEFAULT true,
  allowMessages boolean NOT NULL DEFAULT true,
  allowCalls boolean NOT NULL DEFAULT true,
  responseRate double precision NOT NULL DEFAULT 0.0,
  averageRating double precision NOT NULL DEFAULT 0.0,
  totalMatches integer NOT NULL DEFAULT 0,
  successfulMatches integer NOT NULL DEFAULT 0,
  createdAt timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt timestamp without time zone NOT NULL,
  lastActive timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  profileCompleted boolean NOT NULL DEFAULT false,
  CONSTRAINT users_pkey PRIMARY KEY (id)
);