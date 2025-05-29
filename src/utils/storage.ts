export const setLastVisitedChatRoom = (roomId: number) => {
  localStorage.setItem('lastChatRoomId', String(roomId));
};

export const getLastVisitedChatRoom = (): number | null => {
  const id = localStorage.getItem('lastChatRoomId');
  return id ? Number(id) : null;
};
