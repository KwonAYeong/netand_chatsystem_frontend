// src/components/panel/ChannelList.tsx
import React from 'react';

interface GroupChatRoom {
  chatRoomId: number;
  chatRoomName: string;
}

interface Props {
  channelRooms: GroupChatRoom[];
  selectedRoomId?: number;
  setSelectedRoom: (room: { id: number; name: string; type: 'group' }) => void;
  unreadCounts: Record<number, number>;
}

export default function ChannelList({
  channelRooms,
  selectedRoomId,
  setSelectedRoom,
  unreadCounts, // ✅ props 받고
}: Props) {
  return (
    <div className="space-y-1">
      {channelRooms.map(({ chatRoomId, chatRoomName }) => {
        const isSelected = selectedRoomId === chatRoomId;
        const unreadCount = unreadCounts[chatRoomId] || 0; // ✅ 카운트 조회

        return (
          <div
            key={chatRoomId}
            onClick={() =>
              setSelectedRoom({
                id: chatRoomId,
                name: chatRoomName,
                type: 'group',
              })
            }
            className={`pl-2 py-1 rounded cursor-pointer transition-colors flex justify-between items-center ${
              isSelected ? 'bg-gray-200 font-bold' : 'hover:bg-gray-100'
            }`}
          >
            <span># {chatRoomName}</span>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5 min-w-[20px] text-center">
                {unreadCount}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}