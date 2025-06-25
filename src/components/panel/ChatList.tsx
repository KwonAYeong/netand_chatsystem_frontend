// src/components/sidebar/ChatList.tsx
import React, { useEffect, useRef } from 'react';
import {
  connectSocket,
  subscribeToRoom,
  unsubscribeFromRoom,
  default as client,
} from '../../lib/websocket';
import UserAvatar from '../common/UserAvatar';
import { useNavigate } from 'react-router-dom';

interface ChatRoom {
  chatRoomId: number;
  chatRoomName: string;
  chatRoomType: string;
  receiverProfileImage: string;
  lastMessage: string;
  hasUnreadMessage: boolean;
  unreadMessageCount: number;
  receiverEmail?: string;
}

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
}

export default function ChatList({
  currentUserId,
  selectedRoomId,
  setSelectedRoom,
  dmRooms,
}: Props) {
  const navigate = useNavigate();
  const subscribedRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    connectSocket();
  }, []);

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
