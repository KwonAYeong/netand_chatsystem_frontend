import React, { useState, useEffect, useCallback } from 'react';
import ChatList from './ChatList';
import ChannelList from './ChannelList';
import InviteChannel from './InviteChannel';
import InviteUser from './InviteUser';
import { useUser } from '../../context/UserContext';
import { useChatUI } from '../../context/ChatUIContext';
import { api } from '../../api/axios';
import type { ChatRoom } from '../../types/chat';
import { getGroupChannelsByUser } from '../../api/chat';
import { subscribeToRoom, default as client } from '../../lib/websocket';
import { useRef } from 'react';

interface Props {
  currentUserId: number;
  selectedRoomId?: number;
  onUnreadClear: (roomId: number) => void;
}

export default function ChatMenuPanel({ currentUserId }: Props) {
  const { user, unreadCounts, setUnreadCounts } = useUser(); // ✅ Context에서 받기
  const { selectedRoom, setChatRooms, setSelectedRoom, setCurrentChatRoomId } = useChatUI();
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [dmRooms, setDmRooms] = useState<ChatRoom[]>([]);
  const [channels, setChannels] = useState<ChatRoom[]>([]);

  const subscribedRef = useRef<Set<number>>(new Set());

  const handleLeftRoom = (leftRoomId: number) => {
  const leftId = Number(leftRoomId);

  setChannels((prev) => {
    const updated = prev.filter((room) => room.chatRoomId !== leftId);
    console.log('🧹 channels 제거:', updated);
    return updated;
  });

  setChatRooms((prev) =>
    prev.filter((room) => room.id !== leftId)
  );

  if (selectedRoom?.id === leftId) {
    setSelectedRoom(null);
    setCurrentChatRoomId(null);
  }
};



  // ✅ 그룹 채팅방 불러오기
  const fetchChannelRooms = useCallback(async () => {
    if (!user) return;
    try {
      const data = await getGroupChannelsByUser(user.userId);

      const enriched = data.map((room: any) => ({
        ...room,
        chatRoomType: 'GROUP',
        receiverProfileImage: '',
        lastMessage: room.lastMessage ?? '',
        hasUnreadMessage: room.hasUnreadMessage ?? false,
        unreadMessageCount: room.unreadMessageCount ?? 0,
      }));

      setChannels(enriched);

      const convertedForUI = enriched.map((room: ChatRoom) => ({
        id: room.chatRoomId,
        name: room.chatRoomName,
        type: 'group',
      }));

      setChatRooms((prev) => [
        ...prev.filter((room) => room.type !== 'group'),
        ...convertedForUI,
      ]);
    } catch (err) {
      console.error('❌ 그룹 채팅방 목록 실패:', err);
    }
  }, [user, setChatRooms]);

  // ✅ 안 읽은 메시지 수 수동 증가 (웹소켓 이벤트 전용)
  const handleUnreadIncrease = (roomId: number) => {
    setUnreadCounts((prev) => ({
      ...prev,
      [roomId]: (prev[roomId] || 0) + 1,
    }));
  };

  // ✅ 안 읽은 메시지 수 수동 초기화
  const handleUnreadClear = (roomId: number) => {
    setUnreadCounts((prev) => {
      const updated = { ...prev };
      delete updated[roomId];
      return updated;
    });
  };

  useEffect(() => {
  if (!client.connected) {
    console.warn('❌ WebSocket 연결 안 됨');
    return;
  }

  const currentRoomId = selectedRoom?.id ?? -1;

  [...dmRooms, ...channels].forEach((room) => {
    if (!subscribedRef.current.has(room.chatRoomId)) {
      console.log(`✅ 구독 시작: ${room.chatRoomId}`);

      subscribeToRoom(
  room.chatRoomId,
  (message: any) => {
    console.log('[💬 수신 메시지]', message);

    if (message.messageType === 'LEAVE' && message.userId === currentUserId) {
      console.log('[👋 내가 나간 방 처리]', message.chatRoomId);
      handleLeftRoom(message.chatRoomId); // 이제 정확한 roomId 전달됨
    }
  },
  handleUnreadIncrease,
  handleUnreadClear,
  currentRoomId,
  currentUserId
);


      subscribedRef.current.add(room.chatRoomId);
    }
  });
}, [dmRooms, channels, selectedRoom?.id]);

  // ✅ 1:1 채팅방 불러오기
  const fetchDmRooms = useCallback(async () => {
    if (!user) return;
    try {
      const res = await api.get(`/chat/dm/list/${user.userId}`);
      const enriched: ChatRoom[] = res.data
        .filter((room: any) => room.chatRoomType === 'DM')
        .map((room: any) => ({
          ...room,
          lastMessage: room.lastMessage ?? '',
          hasUnreadMessage: room.hasUnreadMessage ?? false,
          unreadMessageCount: room.unreadMessageCount ?? 0,
        }));

      const unique: ChatRoom[] = Array.from(
        new Map(enriched.map((r: ChatRoom) => [r.chatRoomId, r])).values()
      );

      setDmRooms(unique);
    } catch (err) {
      console.error('❌ DM 채팅방 목록 실패:', err);
    }
  }, [user]);

  useEffect(() => {
    fetchChannelRooms();
    fetchDmRooms();
  }, [fetchChannelRooms, fetchDmRooms]);

  
  return (
    <div className="w-64 h-full p-4 border-r bg-white overflow-y-auto space-y-6 relative">
      {/* ✅ 그룹 채널 목록 */}
      <div>
        <h2 className="text-xs font-bold text-gray-500 mb-1">채널</h2>
        <ChannelList
          channelRooms={channels}
          selectedRoomId={selectedRoom?.type === 'group' ? selectedRoom.id : undefined}
          setSelectedRoom={setSelectedRoom}
          unreadCounts={unreadCounts}
          onUnreadClear={handleUnreadClear}
        />
        <button
          className="text-sm text-gray-600 hover:text-blue-600"
          onClick={() => setIsInviteOpen(true)}
        >
          ➕ 채팅방 생성하기
        </button>
      </div>

      {/* ✅ 1:1 다이렉트 메시지 목록 */}
      <div>
        <h2 className="text-xs font-bold text-gray-500 mb-1">다이렉트 메시지</h2>
        <ChatList
          currentUserId={currentUserId}
          selectedRoomId={selectedRoom?.type === 'dm' ? selectedRoom.id : undefined}
          setSelectedRoom={setSelectedRoom}
          dmRooms={dmRooms}
          onUnreadIncrease={handleUnreadIncrease}
          onUnreadClear={handleUnreadClear}
          unreadCounts={unreadCounts} // ✅ Context에서 받은 상태 사용
        />
        <InviteUser
          senderId={user!.userId}
          existingRooms={dmRooms}
          onCreated={(newRoom) => {
            setSelectedRoom({
              id: newRoom.chatRoomId,
              name: newRoom.chatRoomName,
              type: 'dm',
              profileImage: newRoom.receiverProfileImage || '/default_profile.jpg',
            });
            fetchDmRooms();
          }}
        />
      </div>

      {/* ✅ 그룹 초대 모달 */}
      {isInviteOpen && user && (
        <InviteChannel
          senderId={user.userId}
          existingRooms={channels}
          fetchChannelRooms={fetchChannelRooms}
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
