import ChatList from "./ChatList";

interface Props {
  currentUserId: number;
  setSelectedRoom: (room: { id: number; name: string; profileImage: string }) => void;
}

const ChatMenuPanel = ({ currentUserId, setSelectedRoom }: Props) => {
  return (
    <div className="w-[250px] border-r border-gray-200 bg-[#f5f6f8]">
      <ChatList currentUserId={currentUserId} setSelectedRoom={setSelectedRoom} />
    </div>
  );
};


export default ChatMenuPanel;
