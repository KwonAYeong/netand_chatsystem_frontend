import ChatList from "./ChatList";

interface Props {
  currentUserId: number;
  setSelectedRoom: (room: { id: number; name: string; profileImage: string }) => void;
  selectedRoomId?: number;
}

const ChatMenuPanel = ({ currentUserId, setSelectedRoom, selectedRoomId }: Props) => {
  return (
    <div className="w-[250px] border-r border-gray-200 bg-[#f5f6f8]">
      <ChatList
        currentUserId={currentUserId}
        setSelectedRoom={setSelectedRoom}
        selectedRoomId={selectedRoomId}
      />
    </div>
  );
};

export default ChatMenuPanel;
