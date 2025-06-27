import { useNavigate } from 'react-router-dom';
import UserAvatar from '../common/UserAvatar';
import { FaAt } from "react-icons/fa";

const AtIcon = FaAt as unknown as React.FC<React.SVGProps<SVGSVGElement>>;

interface ActivityItem {
  id: string;
  channelName: string;
  date: string;
  sender: string;
  senderAvatar: string;
  mentionTarget: string;
  message: string;
  chatRoomId: number;
  messageId: string;
}

const dummyActivities: ActivityItem[] = [
  {
    id: '1',
    channelName: '#채널2',
    date: '5월 28일',
    sender: '권아영',
    senderAvatar: '/avatars/user1.png',
    mentionTarget: '신재윤',
    message: '오늘 회의 자료 확인 부탁드려요!',
    chatRoomId: 2,
    messageId: 'msg-1',
  },
];

const ActivityPanel = () => {
  const navigate = useNavigate();

  return (
    <aside className="w-80 bg-white border-r border-gray-200 p-4 overflow-y-auto">
      <h2 className="text-lg font-bold mb-3">내 활동</h2>

      <ul className="space-y-3">
        {dummyActivities.map((item) => (
          <li
            key={item.id}
            onClick={() => navigate(`/chat?room=${item.chatRoomId}&message=${item.messageId}`)}
            className="bg-gray-50 hover:bg-gray-100 p-3 rounded-md cursor-pointer"
          >
            <p className="text-xs text-gray-500 mb-1">
              <AtIcon className="inline mr-1" />
              @{item.mentionTarget} — {item.channelName} 에서 멘션
              <span className="float-right">{item.date}</span>
            </p>
            <div className="flex gap-3 items-start">
              <UserAvatar src={item.senderAvatar} size="md" />
              <div className="text-sm">
                <p className="font-semibold text-gray-800">{item.sender}</p>
                <p className="text-blue-500 text-xs font-medium">@{item.mentionTarget}</p>
                <p className="text-gray-700 text-sm mt-1">{item.message}</p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default ActivityPanel;
