// src/components/sidebar/ChannelList.tsx
import React from 'react';
import { useChatUI } from '../../context/ChatUIContext';

export default function ChannelList() {
  const { chatRooms, selectedRoom, setSelectedRoom } = useChatUI();

  // 그룹 채팅방만 필터링
  const groupRooms = chatRooms.filter((room) => room.type === 'group');

  return (
    <div className="space-y-1">
      {groupRooms.map((room) => (
        <div
          key={room.id}
          onClick={() =>
            setSelectedRoom({
              id: room.id,
              name: room.name,
              type: 'group',
            })
          }
          className={`pl-2 py-1 rounded cursor-pointer hover:bg-gray-100 ${
            selectedRoom?.id === room.id ? 'bg-gray-200 font-bold' : ''
          }`}
        >
          # {room.name}
        </div>
      ))}
    </div>
  );
}
