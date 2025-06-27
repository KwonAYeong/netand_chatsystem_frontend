import { api } from './axios';

// ✅ 1:1 채팅방 목록 조회
export const getChatRoomsByUser = (userId: number) => {
  return api.get(`/chat/dm/list/${userId}`);
};

// ✅ 메시지 목록 조회
export const getMessages = (chatRoomId: number) => {
  return api.get(`/chat/message/${chatRoomId}`);
};

// ✅ 텍스트 메시지 전송
export const sendMessage = (data: {
  chatRoomId: number;
  senderId: number;
  content: string;
  messageType: string;
  fileUrl?: string;
}) => {
  return api.post(`/chat/message`, data);
};

// ✅ 파일 메시지 전송 (multipart/form-data)
export const sendFileMessage = (
  chatRoomId: number,
  senderId: number,
  file: File
) => {
  const formData = new FormData();
  formData.append('chatRoomId', String(chatRoomId));
  formData.append('senderId', String(senderId));
  formData.append('file', file);

  // 디버깅용 로그
  formData.forEach((val, key) => {
    console.log('📦 FormData', key, val);
  });

  return api.post('/chat/message/file', formData);
};

// ✅ 메시지 읽음 처리
export const updateLastReadMessage = (
  chatRoomId: number,
  userId: number,
  lastReadMessageId: number
) => {
  return api.patch('/chat/last-read-message', {
    chatRoomId,
    userId,
    lastReadMessageId,
  });
};

// ✅ 그룹 채팅방 목록 조회
export const getGroupChannelsByUser = async (userId: number) => {
  const res = await api.get(`/chat/group/list/${userId}`);
  return res.data;
};

// ✅ 그룹 채팅방 멤버 목록 조회
export const getGroupMembers = (roomId: number) => {
  return api.get(`/chat/${roomId}/participants`);
};

// ✅ 그룹 채팅방 이름 변경
export const patchGroupChatRoomName = (chatRoomId: number, newName: string) => {
  return api.patch(`/chat/${chatRoomId}/name`, {
    newName,
  });
};

// ✅ 그룹 채팅방 나가기
export const leaveGroupChat = (chatRoomId: number, userId: number) => {
  return api.delete(`/chat/${chatRoomId}/leave/${userId}`);
};

// ✅ 그룹 채팅방에 유저 초대 (🚨 경로 수정 완료!)
export const inviteToGroupChat = (
  chatRoomId: number,
  inviteEmails: string[]
) => {
  return api.post(`/chat/${chatRoomId}/invite`, {
    inviteEmails,
  });
};
