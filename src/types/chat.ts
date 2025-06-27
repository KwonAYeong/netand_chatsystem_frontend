// src/types/chat.ts

export interface ChatRoom {
  chatRoomId: number;
  chatRoomName: string;
  chatRoomType: string;
  receiverProfileImage: string;
  lastMessage: string;
  hasUnreadMessage: boolean;
  unreadMessageCount: number;
  userId?: number;
}
