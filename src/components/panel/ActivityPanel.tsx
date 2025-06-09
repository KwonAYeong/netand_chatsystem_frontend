import { JSX, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UserAvatar from '../common/UserAvatar';
import { FaAt, FaSmile, FaBookmark } from "react-icons/fa";

const AtIcon = FaAt as unknown as React.FC<React.SVGProps<SVGSVGElement>>;
const SmileIcon = FaSmile as unknown as React.FC<React.SVGProps<SVGSVGElement>>;
const BookmarkIcon = FaBookmark as unknown as React.FC<React.SVGProps<SVGSVGElement>>;

type ActivityType = 'all' | 'mention' | 'reaction' | 'bookmark';

interface ActivityItem {
  id: string;
  type: Exclude<ActivityType, 'all'>;
  channelName: string;
  date: string;
  sender: string;
  senderAvatar: string;
  mentionTarget?: string;
  message: string;
  emoji?: string;
  chatRoomId: number;
  messageId: string;
}

const dummyActivities: ActivityItem[] = [
  {
    id: '1',
    type: 'mention',
    channelName: '#채널2',
    date: '5월 28일',
    sender: '권아영',
    senderAvatar: '/avatars/user1.png',
    mentionTarget: '신재윤',
    message: '오늘 회의 자료 확인 부탁드려요!',
    chatRoomId: 2,
    messageId: 'msg-1',
  },
  {
    id: '2',
    type: 'bookmark',
    channelName: '#채널1',
    date: '5월 26일',
    sender: '권아영',
    senderAvatar: '/avatars/user1.png',
    message: '어제 얘기했던 그거 다시 정리함',
    chatRoomId: 1,
    messageId: 'msg-2',
  },
  {
    id: '3',
    type: 'reaction',
    channelName: '#채널2',
    date: '어제',
    sender: '신재윤',
    senderAvatar: '/avatars/user2.png',
    message: '내일 08시:20분 회의 있습니다',
    emoji: '😊',
    chatRoomId: 2,
    messageId: 'msg-3',
  },
];

const tabLabels: { label: string; type: ActivityType; icon: JSX.Element }[] = [
  { label: '전체', type: 'all', icon: <></> },
  { label: '멘션', type: 'mention', icon: <AtIcon className="inline" /> },
  { label: '반응', type: 'reaction', icon: <SmileIcon className="inline" /> },
  { label: '북마크', type: 'bookmark', icon: <BookmarkIcon className="inline" /> },
];

const getSummary = (item: ActivityItem) => {
  switch (item.type) {
    case 'mention':
      return `@ ${item.channelName} 에서 멘션`;
    case 'reaction':
      return `${item.sender}이(가) ${item.channelName} 에서 반응했습니다`;
    case 'bookmark':
      return `${item.channelName} 에서 북마크`;
    default:
      return '';
  }
};

const ActivityPanel = () => {
  const [activeTab, setActiveTab] = useState<ActivityType>('all');
  const navigate = useNavigate();

  const filtered = dummyActivities.filter(
    (a) => activeTab === 'all' || a.type === activeTab
  );

  return (
    <aside className="w-80 bg-white border-r border-gray-200 p-4 overflow-y-auto">
      <h2 className="text-lg font-bold mb-3">내 활동</h2>

      {/* 탭 */}
      <div className="flex gap-3 mb-4 text-sm border-b border-gray-300 pb-1">
        {tabLabels.map(({ label, type, icon }) => (
          <button
            key={type}
            onClick={() => setActiveTab(type)}
            className={`pb-1 ${
              activeTab === type
                ? 'text-black font-semibold border-b-2 border-black'
                : 'text-gray-500'
            }`}
          >
            {icon} {label}
          </button>
        ))}
      </div>

      {/* 활동 목록 */}
      <ul className="space-y-3">
        {filtered.map((item) => (
          <li
            key={item.id}
            onClick={() => navigate(`/chat?room=${item.chatRoomId}&message=${item.messageId}`)}
            className="bg-gray-50 hover:bg-gray-100 p-3 rounded-md cursor-pointer"
          >
            <p className="text-xs text-gray-500 mb-1">
              {getSummary(item)}
              <span className="float-right">{item.date}</span>
            </p>
            <div className="flex gap-3 items-start">
              <UserAvatar src={item.senderAvatar} size="md" />
              <div className="text-sm">
                <p className="font-semibold text-gray-800">{item.sender}</p>
                {item.mentionTarget && (
                  <p className="text-blue-500 text-xs font-medium">@{item.mentionTarget}</p>
                )}
                <p className="text-gray-700 text-sm mt-1">{item.message}</p>
                {item.emoji && <p className="mt-1 text-xl">{item.emoji}</p>}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default ActivityPanel;
