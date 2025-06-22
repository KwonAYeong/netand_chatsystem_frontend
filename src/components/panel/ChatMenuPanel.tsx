import React, { useState, useEffect, useCallback } from 'react';
import ChatList from './ChatList';
import ChannelList from './ChannelList';
import InviteChannel from './InviteChannel';
import { useUser } from '../../context/UserContext';
import { useChatUI } from '../../context/ChatUIContext';

interface Props {
  currentUserId: number;
  unreadCounts?: Record<number, number>;
  selectedRoomId?: number;
}

interface GroupChatRoom {
  chatRoomId: number;
  chatRoomName: string;
}

export default function ChatMenuPanel({ currentUserId, unreadCounts }: Props) {
  const { user } = useUser();
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [channels, setChannels] = useState<GroupChatRoom[]>([]);
  const { selectedRoom, setChatRooms, setSelectedRoom } = useChatUI();

  // ✅ 그룹채팅 목록 fetch 함수 분리
  const fetchChannelRooms = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch(`http://localhost:8080/chat/group/list/${user.userId}`);
      const data = await res.json();
      setChannels(data); // 로컬 백업
      const converted = data.map((room: any) => ({
        id: room.chatRoomId,
        name: room.chatRoomName,
        type: 'group',
      }));
      setChatRooms(converted); // ChannelList에 반영됨
    } catch (err) {
      console.error('❌ 그룹 채팅방 목록 실패:', err);
    }
  }, [user, setChatRooms]);

  useEffect(() => {
    fetchChannelRooms();
  }, [fetchChannelRooms]);

  return (
    <div className="w-64 h-full p-4 border-r bg-white overflow-y-auto space-y-6 relative">
      {/* ✅ 채널 목록 + 초대 버튼 */}
      <div>
        <h2 className="text-xs font-bold text-gray-500 mb-1">채널</h2>
        <ChannelList />
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

      {/* ✅ 초대 모달 */}
      {isInviteOpen && user && (
        <InviteChannel
          senderId={user.userId}
          existingRooms={channels}
          fetchChannelRooms={fetchChannelRooms} // ✅ 추가!
          onCreated={(newRoom) => {
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
