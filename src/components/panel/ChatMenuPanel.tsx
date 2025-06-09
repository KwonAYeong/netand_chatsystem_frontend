import ChatList from './ChatList';

interface Props {
  currentUserId: number;
  onSelectRoom: (id: number, name: string) => void;
}

const ChatMenuPanel = ({ currentUserId, onSelectRoom }: Props) => {
  return (
    <div className="w-[250px] border-r border-gray-200 bg-[#f5f6f8]">
      <ChatList currentUserId={currentUserId} onSelectRoom={onSelectRoom} />
    </div>
  );
};

export default ChatMenuPanel;
