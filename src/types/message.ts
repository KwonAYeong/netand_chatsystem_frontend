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

  // ✅ 이 줄 추가해줘야 오류 해결됨
  messageType: 'TEXT' | 'FILE';
}
