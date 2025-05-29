export const getChatDestination = (chatRoomId: number) => `/topic/chatroom/${chatRoomId}`;

export const getSendDestination = (chatRoomId: number) => `/app/chat/${chatRoomId}`;
