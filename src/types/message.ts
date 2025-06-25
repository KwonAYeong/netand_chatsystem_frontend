export interface Message {
  id: number;
  chatRoomId: number;
  sender: {
    id: number;
    name: string;
    profileImageUrl?: string;
  };
  content: string;
  time?: string;
  createdAt: string;
  fileUrl?: string;
  fileName?: string;

  // ✅ 메시지 타입 추가
  messageType: 'TEXT' | 'FILE';
}
