import React, { useState, useEffect } from 'react';
import ChatList from './ChatList';
import ChannelList from './ChannelList';
import InviteChannel from './InviteChannel';
import type { SelectedRoom } from '../layout/ChatLayout';
import { useUser } from '../../context/UserContext';

interface Props {
  currentUserId: number;
  setSelectedRoom: React.Dispatch<React.SetStateAction<SelectedRoom | null>>;
  selectedRoom: SelectedRoom | null;
  unreadCounts?: Record<number, number>;
}

interface GroupChatRoom {
  chatRoomId: number;
  chatRoomName: string;
}

export default function ChatMenuPanel({
  currentUserId,
  selectedRoom,
  setSelectedRoom,
  unreadCounts,
}: Props) {
  const { user } = useUser();
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [channels, setChannels] = useState<GroupChatRoom[]>([]);

  useEffect(() => {
    if (!user) return;
    fetch(`http://localhost:8080/chat/group/list/${user.userId}`)
      .then((res) => res.json())
      .then((data) => setChannels(data))
      .catch((err) => console.error('❌ 그룹 채팅방 목록 실패:', err));
  }, [user]);

  return (
    <div className="w-64 h-full p-4 border-r bg-white overflow-y-auto space-y-6 relative">
      {/* ✅ 채널 목록 + 초대 버튼 */}
      <div>
        <h2 className="text-xs font-bold text-gray-500 mb-1">채널</h2>
        <ChannelList
      channelRooms={channels}
      selectedRoomId={selectedRoom?.type === 'group' ? selectedRoom.id : undefined}
      setSelectedRoom={setSelectedRoom}
        />
        <button
          className="text-sm text-gray-600 hover:text-blue-600"
          onClick={() => setIsInviteOpen(true)}
        >
          ➕ 채팅방 생성하기
        </button>
      </div>

      {/* ✅ 다이렉트 메시지 목록 */}
      <div>
        <h2 className="text-xs font-bold text-gray-500 mb-1">다이렉트 메시지</h2>
        <ChatList
          currentUserId={currentUserId}
          selectedRoomId={selectedRoom?.type === 'dm' ? selectedRoom.id : undefined}
          setSelectedRoom={setSelectedRoom}
        />
      </div>

      {/* ✅ 초대 모달 (InviteChannel) */}
      {isInviteOpen && user && (
        <InviteChannel
          senderId={user.userId}
          existingRooms={channels}
          onCreated={(newRoom) => {
            setChannels((prev) => [...prev, newRoom]);
            setSelectedRoom({
              id: newRoom.chatRoomId,
              name: newRoom.chatRoomName,
              type: 'group',
            });
            setIsInviteOpen(false);
          }}
          onClose={() => setIsInviteOpen(false)}
        />
      )}
    </div>
  );
}
