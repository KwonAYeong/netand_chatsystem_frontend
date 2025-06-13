// src/utils/transform.ts
import type { Message } from '../types/message';

export const transform = (res: any): Message => ({
  id: res.messageId,
  chatRoomId: res.chatRoomId,
  sender: {
    id: res.senderId,
    name: res.senderName,
    profileImageUrl: res.senderProfileImage,
  },
  content: res.content,
  messageType: res.messageType as 'TEXT' | 'FILE',
  fileUrl: res.fileUrl || res.file_url, 
  createdAt: res.createdAt,
});

/**
 * 기존 메시지 배열에 중복 ID가 없을 때만 새 메시지 추가
 */
export function appendIfNotExists(
  messages: Message[],
  newMessage: Message
): Message[] {
  const exists = messages.some((msg) => msg.id === newMessage.id);
  if (exists) return messages;
  return [...messages, newMessage];
}

