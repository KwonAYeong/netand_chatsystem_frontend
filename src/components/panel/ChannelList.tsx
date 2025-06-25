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
}

export default function ChannelList({
  channelRooms,
  selectedRoomId,
  setSelectedRoom,
}: Props) {
  return (
    <div className="space-y-1">
      {channelRooms.map(({ chatRoomId, chatRoomName }) => {
        const isSelected = selectedRoomId === chatRoomId;

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
            className={`pl-2 py-1 rounded cursor-pointer transition-colors ${
              isSelected ? 'bg-gray-200 font-bold' : 'hover:bg-gray-100'
            }`}
          >
            # {chatRoomName}
          </div>
        );
      })}
    </div>
  );
}
