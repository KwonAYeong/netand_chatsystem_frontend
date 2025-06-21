// src/components/layout/ChatLayout.tsx
import React, { useState } from 'react';
import Sidebar from '../sidebar/Sidebar';
import ChatMenuPanel from '../panel/ChatMenuPanel';
import ChatRoom from '../chat/ChatRoom';
import GroupChatRoom from '../chat/GroupChatRoom';
import { useUser } from '../../context/UserContext';

export interface SelectedRoom {
  id: number;
  type: 'dm' | 'group';
  name: string;
  profileImage?: string;
}

export default function ChatLayout() {
  const { user } = useUser();
  const [selectedRoom, setSelectedRoom] = useState<SelectedRoom | null>(null);

  // 채팅방별 안 읽은 메시지 상태 (예시)
  const [unreadCounts, setUnreadCounts] = useState<Record<number, number>>({});

  // ✅ 뱃지 수 증가 처리
  const handleUnreadIncrease = (roomId: number) => {
    setUnreadCounts((prev) => ({
      ...prev,
      [roomId]: (prev[roomId] || 0) + 1,
    }));
  };

  // ✅ 뱃지 제거 처리
  const handleUnreadClear = (roomId: number) => {
    setUnreadCounts((prev) => {
      const updated = { ...prev };
      delete updated[roomId];
      return updated;
    });
  };

  if (!user) return <div>로딩 중...</div>;

  return (
    <div className="flex h-screen">
      {/* ✅ 사이드바에 선택 해제 기능 전달 */}
      <Sidebar clearSelectedRoom={() => setSelectedRoom(null)} />

      {/* ✅ 메뉴 패널에 유저 정보 및 방 선택 상태 전달 */}
      <ChatMenuPanel
        currentUserId={user.userId}
        setSelectedRoom={setSelectedRoom}
        selectedRoom={selectedRoom}
        unreadCounts={unreadCounts} // 필요시 메뉴에서 뱃지 표시용
      />

      <div className="flex-1">
        {selectedRoom ? (
          selectedRoom.type === 'dm' ? (
            <ChatRoom
              chatRoomId={selectedRoom.id}
              userId={user.userId}
              chatRoomName={selectedRoom.name}
              chatRoomProfileImage={selectedRoom.profileImage || ''}
              onUnreadClear={handleUnreadClear}
              refetchChatRooms={() => {}}
            />
          ) : (
            <GroupChatRoom
              roomId={selectedRoom.id}
              chatRoomName={selectedRoom.name}
              currentUser={{
                id: user.userId,
                nickname: user.nickname ?? user.name,
              }}
              onUnreadIncrease={handleUnreadIncrease}
              onUnreadClear={handleUnreadClear}
            />
          )
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            채팅방을 선택해주세요.
          </div>
        )}
      </div>
    </div>
  );
}
