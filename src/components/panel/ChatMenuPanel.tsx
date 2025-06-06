import ChannelList from './ChannelList';
import DMList from './DMList'; // ✅ 여기가 DMList로 import 되어야 함

const ChatMenuPanel = () => {
  return (
    <aside className="w-72 bg-gray-50 border-r border-gray-200 p-4 overflow-y-auto">
      <ChannelList />
      <DMList /> {/* ✅ 유저 클릭 가능 목록 */}
    </aside>
  );
};

export default ChatMenuPanel;