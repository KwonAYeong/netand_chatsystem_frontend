// src/components/sidebar/ChatList.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { getChatRoomsByUser } from '../../api/chat';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import InviteUser from './InviteUser';
import UserAvatar from '../common/UserAvatar';
import { useNavigate } from 'react-router-dom';

interface Props {
  currentUserId: number;
  selectedRoomId?: number;
  setSelectedRoom: (room: { id: number; name: string; profileImage: string }) => void;
}

interface ChatRoom {
  chatRoomId: number;
  chatRoomName: string;
  chatRoomType: string;
  receiverProfileImage: string;
  lastMessage: string;
  hasUnreadMessage: boolean;
  unreadMessageCount: number;
}

export default function ChatList({ currentUserId, selectedRoomId, setSelectedRoom }: Props) {
  const [dmRooms, setDmRooms] = useState<ChatRoom[]>([]);
  const navigate = useNavigate();

  const fetchChatRooms = useCallback(() => {
    getChatRoomsByUser(currentUserId)
      .then((res) => {
        setDmRooms(res.data);
      })
      .catch((err) => {
        console.error('❌ 채팅방 목록 불러오기 실패:', err);
      });
  }, [currentUserId]);

  useEffect(() => {
    fetchChatRooms();
  }, [fetchChatRooms]);

  useEffect(() => {
    const socket = new SockJS('http://localhost:8080/ws');
    const client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      onConnect: () => {
        client.subscribe(`/sub/unread/${currentUserId}`, (message) => {
          const data = JSON.parse(message.body);
          setDmRooms((prev) =>
            prev.map((room) =>
              room.chatRoomId === data.chatRoomId
                ? { ...room, unreadMessageCount: data.unreadMessageCount }
                : room
            )
          );
        });
      },
      onStompError: (frame) => {
        console.error('❌ STOMP 오류:', frame);
      },
    });

    client.activate();
    return () => {
      client.deactivate();
    };
  }, [currentUserId]);

  const handleSelectRoom = (room: ChatRoom) => {
    setSelectedRoom({
      id: room.chatRoomId,
      name: room.chatRoomName,
      profileImage: room.receiverProfileImage,
    });

    navigate(`/chat/${room.chatRoomId}`);

    setDmRooms((prev) =>
      prev.map((r) =>
        r.chatRoomId === room.chatRoomId
          ? { ...r, unreadMessageCount: 0 }
          : r
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
                src={room.receiverProfileImage || '/default-profile.png'}
                alt={`${room.chatRoomName} 프로필`}
                size="sm"
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
        <InviteUser senderId={currentUserId} onCreated={fetchChatRooms} />
      </div>
    </div>
  );
}
