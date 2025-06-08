import { api } from './axios';

// 채팅방 목록 조회
export const getChatRoomsByUser = (userId: number) => {
  return api.get(`/chat/dm/list/${userId}`);
};

// 메시지 목록 조회
export const getMessages = (chatRoomId: number) => {
  return api.get(`/chat/message/${chatRoomId}`);
};

// 텍스트 메시지 전송
export const sendMessage = (data: {
  chatRoomId: number;
  senderId: number;
  content: string;
  messageType: string;
  fileUrl?: string;
}) => {
  return api.post(`/chat/message`, data);
};

// 파일 메시지 전송 (multipart/form-data)
export const sendFileMessage = (chatRoomId: number, senderId: number, file: File) => {
  const formData = new FormData();
  formData.append('chatRoomId', chatRoomId.toString());
  formData.append('senderId', senderId.toString());
  formData.append('file', file);

  return api.post(`/chat/message/file`, formData);
};
