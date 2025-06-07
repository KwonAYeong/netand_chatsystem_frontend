import React, { useEffect, useState } from 'react';
import { useChat } from '../../context/ChatContext';
import { useUser } from '../../context/UserContext';
import { mockStore } from '../../mock/mockStore';

interface ChatListItem {
  userId: number;
  name: string;
}

type MockChatRoom = {
  chatRoomId: number;
  chatRoomType: 'dm' | 'group';
};

type MockParticipant = {
  chatRoomId: number;
  userId: number;
};

export default function DMList() {
  const { setCurrentRoomId, setCurrentRoomName, currentRoomId } = useChat();
  const { user } = useUser();
  const [userList, setUserList] = useState<ChatListItem[]>([]);

  useEffect(() => {
    const others = mockStore.users
      .filter((u) => u.userId !== user?.userId)
      .map((u) => ({
        userId: u.userId,
        name: u.name,
      }));
    setUserList(others);
  }, [user]);

  const handleSelectUser = (otherUser: ChatListItem) => {
    const dmRoom = mockStore.chatRooms.find((room: MockChatRoom) => {
      if (room.chatRoomType !== 'dm') return false;

      const participants = mockStore.chatRoomParticipants
    .filter((p: MockParticipant) => p.chatRoomId === room.chatRoomId)
    .map((p: MockParticipant) => p.userId); // ✅ 타입 명시


      return (
        participants.includes(user!.userId) && participants.includes(otherUser.userId)
      );
    });

    if (dmRoom) {
      setCurrentRoomId(String(dmRoom.chatRoomId));
      setCurrentRoomName(otherUser.name);
    } else {
      alert('해당 유저와의 DM 채팅방이 없습니다.');
    }
  };

  return (
    <div className="p-4">
      <h2 className="font-bold mb-2">다이렉트 메세지</h2>
      <ul>
        {userList.map((other) => (
          <li
            key={other.userId}
            className={`cursor-pointer p-2 rounded hover:bg-purple-100 ${
              currentRoomId === String(other.userId) ? 'bg-purple-200' : ''
            }`}
            onClick={() => handleSelectUser(other)}
          >
            {other.name}
          </li>
        ))}
      </ul>
    </div>
  );
}
