import React, { useEffect, useRef } from 'react';
import { connectSocket, subscribeToRoom, unsubscribeFromRoom, default as client } from '../../lib/websocket';
import UserAvatar from '../common/UserAvatar';
import { useNavigate } from 'react-router-dom';
import { useUserStatusContext } from '../../context/UserStatusContext';
import { getUserStatusesByIds } from '../../api/profile'; // API 함수 추가
import type { ChatRoom } from '../../types/chat';
import useUserStatus from '../../hooks/useUserStatus';

interface Props {
  currentUserId: number;
  selectedRoomId?: number | null;
  setSelectedRoom: (room: { id: number; type: 'dm'; name: string; profileImage: string }) => void;
  dmRooms: ChatRoom[];
}

export default function ChatList({ currentUserId, selectedRoomId, setSelectedRoom, dmRooms }: Props) {
  const navigate = useNavigate();
  const subscribedRef = useRef<Set<number>>(new Set());
  const { subscribeUsers, unsubscribeUsers } = useUserStatusContext();
  const { userStatuses, setUserStatuses } = useUserStatusContext();

  // 1. 채팅방에서 유저 ID 추출
  const userIds = dmRooms
    .map((room) => room.receiverId)
    .filter((id): id is number => typeof id === 'number');

  // 2. 초기 상태를 API에서 받아오기
useEffect(() => {
  const fetchUserStatuses = async () => {
    // 이미 상태가 있을 경우 API 호출을 방지
    if (Object.keys(userStatuses).length > 0) return;

    try {
      const statusMap = await getUserStatusesByIds(userIds);
      setUserStatuses((prev) => ({
        ...prev,
        ...statusMap,
      }));
    } catch (error) {
      console.error('유저 상태를 받아오는 데 실패했습니다', error);
    }
  };

  if (userIds.length > 0) {
    fetchUserStatuses();
  }
}, [userIds, userStatuses]); 

  // 3. 실시간 상태 업데이트
  useUserStatus(userIds, (userId, status) => {
    console.log(`📥 상태 수신: ${userId} → ${status}`);
    setUserStatuses((prev) => ({
      ...prev,
      [userId]: status, // 실시간 상태 변경 처리
    }));
  });

  // 4. WebSocket 구독
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
            () => {},
            () => {},
            selectedRoomId || -1
          );
          subscribedRef.current.add(room.chatRoomId);
        }
      });
    };

    trySubscribe();

    return () => {
      subscribedRef.current.forEach((roomId) => unsubscribeFromRoom(roomId));
      subscribedRef.current.clear();
    };
  }, [dmRooms, selectedRoomId]);

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
                alt={`${room.chatRoomName} 프로필`}
                size="sm"
                showIsActive
                finalStatus={
                  typeof room.receiverId === 'number'
                    ? userStatuses[room.receiverId] || 'AWAY'
                    : 'AWAY'
                }
              />
              <span>{room.chatRoomName}</span>
              {room.unreadMessageCount > 0 && (
                <span className="absolute right-2 top-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
                  {room.unreadMessageCount}
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
