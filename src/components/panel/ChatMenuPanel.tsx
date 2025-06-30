// ✅ ChatMenuPanel.tsx
import React, {
  useState, useEffect, useCallback,
  useImperativeHandle, forwardRef,
  useRef
} from 'react';
import ChatList from './ChatList';
import ChannelList from './ChannelList';
import InviteChannel from './InviteChannel';
import InviteUser from './InviteUser';
import { useUser } from '../../context/UserContext';
import { useChatUI } from '../../context/ChatUIContext';
import { api } from '../../api/axios';
import type { ChatRoom } from '../../types/chat';
import { getGroupChannelsByUser } from '../../api/chat';
import { subscribeToRoom, default as client, subscribeToRoomList, unsubscribeFromRoom } from '../../lib/websocket';

interface Props {
  currentUserId: number;
  selectedRoomId?: number;
  onUnreadClear: (roomId: number) => void;
}

export interface ChatMenuPanelRef {
  refetchChannelRooms: () => void;
}

const ChatMenuPanel = forwardRef<ChatMenuPanelRef, Props>(({ currentUserId, selectedRoomId, onUnreadClear }, ref) => {
  const { user, unreadCounts, setUnreadCounts } = useUser();
  const { selectedRoom, setChatRooms, setSelectedRoom, setCurrentChatRoomId } = useChatUI();
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [dmRooms, setDmRooms] = useState<ChatRoom[]>([]);
  const [channels, setChannels] = useState<ChatRoom[]>([]);
  const subscribedRef = useRef<Set<number>>(new Set());
  const currentChatRoomIdRef = useRef<number>(selectedRoom?.id ?? -1);


  const handleLeftRoom = (leftRoomId: number) => {
    const leftId = Number(leftRoomId);
    setChannels(prev => prev.filter((room) => room.chatRoomId !== leftId));
    setChatRooms(prev => prev.filter((room) => room.id !== leftId));
    if (selectedRoom?.id === leftId) {
      setSelectedRoom(null);
      setCurrentChatRoomId(null);
    }
  };

  const fetchChannelRooms = useCallback(async () => {
    if (!user) return;
    try {
      const data = await getGroupChannelsByUser(user.userId);
      const enriched = data.map((room: ChatRoom) => ({
        ...room,
        chatRoomType: 'GROUP',
        receiverProfileImage: '',
        lastMessage: room.lastMessage ?? '',
        hasUnreadMessage: room.hasUnreadMessage ?? false,
        unreadMessageCount: room.unreadMessageCount ?? 0,
      }));

      const convertedForUI = enriched.map((room: ChatRoom) => ({
        id: room.chatRoomId,
        name: room.chatRoomName,
        type: 'group',
      }));

      setChannels(prev => {
        const prevMap = new Map(prev.map(room => [room.chatRoomId, room.chatRoomName]));
        const changed = enriched.some((room: ChatRoom) => prevMap.get(room.chatRoomId) !== room.chatRoomName);
        if (!changed && prev.length === enriched.length) return prev;
        return enriched;
      });

      setChatRooms(prev => [
        ...prev.filter((room) => room.type !== 'group'),
        ...convertedForUI,
      ]);

      setSelectedRoom((prev) => {
        if (!prev) return prev;
        const matched = convertedForUI.find((room: { id: number; name: string; type: string }) => room.id === prev.id);
        if (matched && matched.name !== prev.name) {
          console.log('✏️ selectedRoom 이름 동기화:', matched.name);
          return { ...prev, name: matched.name };
        }
        return prev;
      });
    } catch (err) {
      console.error('❌ 그룹 채팅방 목록 실패:', err);
    }
  }, [user, setChatRooms]);

  useImperativeHandle(ref, () => ({
    refetchChannelRooms: fetchChannelRooms
  }));

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

      const unique: ChatRoom[] = Array.from(new Map(enriched.map((r: ChatRoom) => [r.chatRoomId, r])).values());
      setDmRooms(unique);
    } catch (err) {
      console.error('❌ DM 채팅방 목록 실패:', err);
    }
  }, [user]);

  const handleUnreadIncrease = (roomId: number) => {
    setUnreadCounts(prev => ({
      ...prev,
      [roomId]: (prev[roomId] || 0) + 1,
    }));
  };

  const handleUnreadClear = (roomId: number) => {
    setUnreadCounts(prev => {
      const updated = { ...prev };
      delete updated[roomId];
      return updated;
    });
  };
useEffect(() => {
  currentChatRoomIdRef.current = selectedRoom?.id ?? -1;
}, [selectedRoom]);
  useEffect(() => {
    if (!client.connected) return;
    [...dmRooms, ...channels].forEach((room) => {
      unsubscribeFromRoom(room.chatRoomId);
        subscribeToRoom(
          room.chatRoomId,
          () => {},
          handleUnreadIncrease,
          handleUnreadClear,
          currentChatRoomIdRef,
          currentUserId
        );
    });
  }, [dmRooms, channels, selectedRoom?.id]);

  useEffect(() => {
    fetchChannelRooms();
    fetchDmRooms();
  }, [fetchChannelRooms, fetchDmRooms]);

  useEffect(() => {
    if (!user) return;
    const refresh = () => {
      console.log('📥 ChatMenuPanel → 채팅방 리스트 갱신 수신됨');
      fetchChannelRooms();
      fetchDmRooms();
    };
    subscribeToRoomList(user.userId, refresh);
  }, [user, fetchChannelRooms, fetchDmRooms]);
  
  useEffect(() => {
    if (dmRooms.length || channels.length) {
      const initialCounts: { [key: number]: number } = {};
      [...dmRooms, ...channels].forEach((room) => {
        if (room.hasUnreadMessage && room.unreadMessageCount > 0) {
          initialCounts[room.chatRoomId] = room.unreadMessageCount;
        }
      });
      setUnreadCounts(initialCounts);
    }
  }, [dmRooms, channels]);

  return (
    <div className="w-64 h-full p-4 border-r bg-white overflow-y-auto space-y-6 relative">
      {/* 채널 목록 */}
      <div>
        <h2 className="text-xs font-bold text-gray-500 mb-1">채널</h2>
        <ChannelList
          key={channels.map(r => `${r.chatRoomId}-${r.chatRoomName}`).join(',')}
          channelRooms={channels}
          selectedRoomId={selectedRoom?.type === 'group' ? selectedRoom.id : undefined}
          setSelectedRoom={setSelectedRoom}
          unreadCounts={unreadCounts}
          onUnreadClear={onUnreadClear}
        />
        <button
          className="text-sm text-gray-600 hover:text-blue-600"
          onClick={() => setIsInviteOpen(true)}
        >
          ➕ 채팅방 생성하기
        </button>
      </div>

      {/* 다이렉트 메시지 */}
      <div>
        <h2 className="text-xs font-bold text-gray-500 mb-1">다이렉트 메시지</h2>
        <ChatList
          currentUserId={currentUserId}
          selectedRoomId={selectedRoom?.type === 'dm' ? selectedRoom.id : undefined}
          setSelectedRoom={setSelectedRoom}
          dmRooms={dmRooms}
          onUnreadIncrease={handleUnreadIncrease}
          onUnreadClear={handleUnreadClear}
          unreadCounts={unreadCounts}
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
});

export default ChatMenuPanel;
