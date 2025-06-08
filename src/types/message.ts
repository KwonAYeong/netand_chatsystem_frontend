export interface Message {
  id: number;
  sender: {
    id: number;
    name: string;
    profileImageUrl?: string; // ✅ 선택적 필드로 추가
  };
  content: string;
  time?: string;
  createdAt: string;
  fileUrl?: string; // ✅ 추가됨
}
