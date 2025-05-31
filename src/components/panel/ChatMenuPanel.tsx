import ChannelList from './ChannelList';
import DMList from './DMList';

const ChatMenuPanel = () => {
  return (
    <aside className="w-72 bg-gray-50 border-r border-gray-200 p-4 overflow-y-auto">
      <ChannelList />
      <DMList />
    </aside>
  );
};

export default ChatMenuPanel;
