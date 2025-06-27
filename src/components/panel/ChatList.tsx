import React, { useEffect, useRef } from 'react';
import {
  subscribeToRoom,
  default as client,
} from '../../lib/websocket';
import UserAvatar from '../common/UserAvatar';
import { useNavigate } from 'react-router-dom';
import { useUserStatusContext } from '../../context/UserStatusContext';
import { getUserStatusesByIds } from '../../api/profile';
import type { ChatRoom } from '../../types/chat';
import useUserStatus from '../../hooks/useUserStatus';
import { useChatUI } from '../../context/ChatUIContext';

interface Props {
  currentUserId: number;
  selectedRoomId?: number | null;
  setSelectedRoom: (room: {
    id: number;
    type: 'dm';
    name: string;
    profileImage: string;
  }) => void;
  dmRooms: ChatRoom[];
  onUnreadIncrease: (roomId: number) => void;
  onUnreadClear: (roomId: number) => void;
  unreadCounts: Record<number, number>;
}

export default function ChatList({
  currentUserId,
  selectedRoomId,
  setSelectedRoom,
  dmRooms,
  onUnreadIncrease,
  onUnreadClear,
  unreadCounts,
}: Props) {
  const navigate = useNavigate();
    const { selectedRoom } = useChatUI();  // ✅ 가장 최신 선택 채팅방 정보
  const currentChatRoomId = selectedRoom?.type === 'dm' ? selectedRoom.id : -1;
  const subscribedRef = useRef<Set<number>>(new Set());
  const { subscribeUsers, unsubscribeUsers, userStatuses, setUserStatuses } =
    useUserStatusContext();

  // 1. 채팅방에서 유저 ID 추출
  const userIds = dmRooms
    .map((room) => room.userId)
    .filter((id): id is number => typeof id === 'number');

  // 2. 유저 상태 초기화 (새 유저 있을 때만 요청)
  useEffect(() => {
    const fetchedUserIds = Object.keys(userStatuses).map(Number);
    const newIds = userIds.filter((id) => !fetchedUserIds.includes(id));

    if (newIds.length === 0) return;

    const fetchUserStatuses = async () => {
      try {
        const statusMap = await getUserStatusesByIds(newIds);
        setUserStatuses((prev) => ({
          ...prev,
          ...statusMap,
        }));
      } catch (error) {
        console.error('유저 상태를 받아오는 데 실패했습니다', error);
      }
    };

    fetchUserStatuses();
  }, [userIds, userStatuses, setUserStatuses]);

  // 3. 실시간 상태 업데이트
  useUserStatus(userIds, (userId: number, status: 'ONLINE' | 'AWAY') => {
    console.log(`📥 상태 수신: ${userId} → ${status}`);
    setUserStatuses((prev) => ({
      ...prev,
      [userId]: status,
    }));
  });

  // 4. WebSocket 채팅방 구본 (한 번만, 해제 없음)
  useEffect(() => {
    const trySubscribe = () => {
      if (!client.connected) {
        setTimeout(trySubscribe, 200);
        return;
      }

      dmRooms.forEach((room) => {
        if (!subscribedRef.current.has(room.chatRoomId)) {
          subscribeToRoom(
            room.chatRoomId,
            () => {},
            onUnreadIncrease,  // ✅ 읽지 않은 메시지 증가
            onUnreadClear,     // ✅ 현재 방이면 읽음 처리
            currentChatRoomId,
            currentUserId 
          );
          subscribedRef.current.add(room.chatRoomId);
        }
      });
    };

    trySubscribe();
  }, [dmRooms, currentChatRoomId]); // ✅ selectedRoomId 제거, 재구독 막기 위해

  // 5. 채팅방 선택
  const handleSelectRoom = (room: ChatRoom) => {
    setSelectedRoom({
      id: room.chatRoomId,
      type: 'dm',
      name: room.chatRoomName,
      profileImage: room.receiverProfileImage,
    });
    navigate(`/chat/${room.chatRoomId}`);
  };

  return (
    <div className="p-4">
      <div className="space-y-1">
        {dmRooms.length > 0 ? (
          dmRooms.map((room) => (
            <button
              key={room.chatRoomId}
              onClick={() => handleSelectRoom(room)}
              className={`relative flex items-center gap-2 w-full text-gray-800 px-2 py-1 rounded transition ${
                room.chatRoomId === selectedRoomId
                  ? 'bg-gray-200 font-semibold'
                  : 'hover:bg-gray-100'
              }`}
            >
              <UserAvatar
                src={room.receiverProfileImage || '/default_profile.jpg'}
                alt={`${room.chatRoomName} 프리필`}
                size="sm"
                showIsActive
                finalStatus={
                  typeof room.userId === 'number'
                    ? userStatuses[room.userId] || 'AWAY'
                    : 'AWAY'
                }
              />
              <span>{room.chatRoomName}</span>
              {room.unreadMessageCount > 0 && (
                <span className="absolute right-2 top-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
                  {unreadCounts[room.chatRoomId]}
                </span>
              )}
            </button>
          ))
        ) : (
          <div className="text-gray-400 text-sm">채팅방이 없습니다</div>
        )}
      </div>
    </div>
  );
}
