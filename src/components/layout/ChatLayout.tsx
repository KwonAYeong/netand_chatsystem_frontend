// src/components/layout/ChatLayout.tsx
import React, { useState } from 'react';
import Sidebar from '../sidebar/Sidebar';
import ChatList from '../sidebar/ChatList';
import ChatRoom from '../chat/ChatRoom';
import { useUser } from '../../context/UserContext';

export default function ChatLayout() {
  const { user } = useUser();
  const [selectedRoom, setSelectedRoom] = useState<{ id: number; name: string } | null>(null);

  // ✅ 콘솔에 유저 정보 확인용 로그
  console.log('📦 현재 user context:', user);

  if (!user) {
    return <div className="p-4">유저 정보를 불러오는 중...</div>;
  }

  return (
    <div className="flex h-screen w-screen">
      {/* 왼쪽 아이콘 사이드바 */}
      <Sidebar />

      {/* 채널/DM 리스트 */}
      <div className="w-[250px] border-r border-gray-200 bg-[#f5f6f8]">
        <ChatList
          currentUserId={user.userId}
          onSelectRoom={(id, name) => {
            console.log(`${name} 클릭됨`);
            setSelectedRoom({ id, name });
          }}
        />
      </div>

      {/* 채팅방 */}
      <div className="flex-1">
        {selectedRoom ? (
          <ChatRoom
            chatRoomId={selectedRoom.id}
            userId={user.userId}
            roomName={selectedRoom.name}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            채팅방을 선택하세요.
          </div>
        )}
      </div>
    </div>
  );
}
