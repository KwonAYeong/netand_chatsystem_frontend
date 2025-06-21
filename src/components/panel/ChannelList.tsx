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

export default function ChannelList({ channelRooms, selectedRoomId, setSelectedRoom }: Props) {
  return (
    <div className="space-y-1">
      {channelRooms.map((room) => (
        <div
          key={room.chatRoomId}
          onClick={() =>
            setSelectedRoom({
              id: room.chatRoomId,
              name: room.chatRoomName,
              type: 'group',
            })
          }
          className={`pl-2 py-1 rounded cursor-pointer hover:bg-gray-100 ${
            selectedRoomId === room.chatRoomId ? 'bg-gray-200 font-bold' : ''
          }`}
        >
          # {room.chatRoomName}
        </div>
      ))}
    </div>
  );
}
