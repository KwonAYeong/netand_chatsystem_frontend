import React, { useEffect, useState, useCallback, useRef } from 'react';
import { getChatRoomsByUser } from '../../api/chat';
import {
  connectSocket,
  subscribeToRoom,
  unsubscribeFromRoom,
  default as client,
} from '../../lib/websocket';
import InviteUser from './InviteUser';
import UserAvatar from '../common/UserAvatar';
import { useNavigate } from 'react-router-dom';

interface Props {
  currentUserId: number;
  selectedRoomId?: number | null;
  setSelectedRoom: (room: {
    id: number;
    type: 'dm';
    name: string;
    profileImage: string;
  }) => void;
}

interface ChatRoom {
  chatRoomId: number;
  chatRoomName: string;
  chatRoomType: string; // 'DM' | 'GROUP'
  receiverProfileImage: string;
  lastMessage: string;
  hasUnreadMessage: boolean;
  unreadMessageCount: number;
  receiverEmail?: string;
}

export default function ChatList({ currentUserId, selectedRoomId, setSelectedRoom }: Props) {
  const [dmRooms, setDmRooms] = useState<ChatRoom[]>([]);
  const navigate = useNavigate();
  const subscribedRef = useRef<Set<number>>(new Set());

  const fetchChatRooms = useCallback(() => {
    getChatRoomsByUser(currentUserId)
      .then((res) => {
        const dmOnly = res.data.filter((room: ChatRoom) => room.chatRoomType === 'DM'); // ✅ DM만
        setDmRooms(dmOnly);
      })
      .catch((err) => {
        console.error('❌ 채팅방 목록 불러오기 실패:', err);
      });
  }, [currentUserId]);

  useEffect(() => {
    fetchChatRooms();
  }, [fetchChatRooms]);

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
            (msg: any) => {
              console.log('📩 받은 메시지:', msg);
            },
            (roomId: number) => {
              setDmRooms((prev) =>
                prev.map((room) =>
                  room.chatRoomId === roomId
                    ? { ...room, unreadMessageCount: (room.unreadMessageCount || 0) + 1 }
                    : room
                )
              );
            },
            (roomId: number) => {
              setDmRooms((prev) =>
                prev.map((room) =>
                  room.chatRoomId === roomId
                    ? { ...room, unreadMessageCount: 0 }
                    : room
                )
              );
            },
            selectedRoomId || -1
          );

          subscribedRef.current.add(room.chatRoomId);
        }
      });
    };

    trySubscribe();

    return () => {
      subscribedRef.current.forEach((roomId) => {
        unsubscribeFromRoom(roomId);
      });
      subscribedRef.current.clear();
    };
  }, [dmRooms, selectedRoomId]);

  const handleSelectRoom = (room: ChatRoom) => {
    setSelectedRoom({
      id: room.chatRoomId,
      type: 'dm', // ✅ 'dm' 추가
      name: room.chatRoomName,
      profileImage: room.receiverProfileImage,
    });

    navigate(`/chat/${room.chatRoomId}`);

    setDmRooms((prev) =>
      prev.map((r) =>
        r.chatRoomId === room.chatRoomId ? { ...r, unreadMessageCount: 0 } : r
      )
    );
  };

  return (
    <div className="p-4">
      <h2 className="text-sm font-bold mb-2 text-gray-700">다이렉트 메시지</h2>
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

      <div className="mt-4">
        <InviteUser
          senderId={currentUserId}
          onCreated={fetchChatRooms}
          existingRooms={dmRooms}
        />
      </div>
    </div>
  );
}
