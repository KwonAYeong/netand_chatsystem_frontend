// src/components/sidebar/ChatList.tsx
import React, { useEffect, useState } from 'react';
import { getChatRoomsByUser } from '../../api/chat';

interface Props {
  currentUserId: number;
  onSelectRoom: (id: number, name: string) => void;
}

interface ChatRoom {
  chatRoomId: number;
  chatRoomName: string;
  chatRoomType: string;
  receiverProfileImage: string;
  lastMessage: string;
  hasUnreadMessage: boolean;
  unreadMessageCount: number;
}

export default function ChatList({ currentUserId, onSelectRoom }: Props) {
  const [dmRooms, setDmRooms] = useState<ChatRoom[]>([]);

  useEffect(() => {
    getChatRoomsByUser(currentUserId)
      .then((res) => {
        console.log('✅ 받은 채팅방 목록:', res.data);
        setDmRooms(res.data);
      })
      .catch((err) => {
        console.error('❌ 채팅방 목록 불러오기 실패:', err);
      });
  }, [currentUserId]);

  return (
    <div className="p-4">
      <h2 className="text-sm font-bold mb-2 text-gray-700">다이렉트 메시지</h2>
      <div className="space-y-1">
        {dmRooms.length > 0 ? (
          dmRooms.map((room) => (
            <button
              key={room.chatRoomId}
              onClick={() => onSelectRoom(room.chatRoomId, room.chatRoomName)}
              className="text-left w-full text-gray-800 hover:bg-gray-100 px-2 py-1 rounded"
            >
              {room.chatRoomName}
            </button>
          ))
        ) : (
          <div className="text-gray-400 text-sm">채팅방이 없습니다</div>
        )}
      </div>
    </div>
  );
}
