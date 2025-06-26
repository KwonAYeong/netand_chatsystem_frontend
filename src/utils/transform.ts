import type { Message } from '../types/message';

export const transform = (res: any): Message => ({
  id: res.messageId ?? Date.now(),
  chatRoomId: res.chatRoomId,
  sender: {
    id: res.senderId,
    name: res.senderName,
    profileImageUrl: res.senderProfileImage,
  },
  content: res.content ?? '',
  messageType: res.messageType === 'FILE' ? 'FILE' : 'TEXT',
  fileUrl: res.fileUrl || '',
  createdAt: res.createdAt ?? new Date().toISOString(),
  mentionedUserNames: res.mentionedUserNames ?? [],
});


export function appendIfNotExistsById(
  messages: Message[],
  ...newMessages: Message[]
): Message[] {
  const existingIds = new Set(messages.map((msg) => msg.id.toString()));
  const filtered = newMessages.filter(
    (msg) => !existingIds.has(msg.id.toString())
  );
  return [...messages, ...filtered];
}
