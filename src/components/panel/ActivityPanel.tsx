// src/components/activity/ActivityPanel.tsx
import { JSX, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaAt } from 'react-icons/fa';
import UserAvatar from '../common/UserAvatar';
import { getMentionActivities } from '../../api/myActivity';
import { useUser } from '../../context/UserContext';
import { SVGProps } from 'react';
import { getGroupChannelsByUser } from '../../api/chat'; // ✅ 이걸로 불러오고
import type { ChatRoom } from '../../types/chat';
import { useChatUI } from '../../context/ChatUIContext';
const AtIcon = FaAt as React.FC<SVGProps<SVGSVGElement>>;

interface MentionActivity {
  messageId: number;
  chatRoomId: number;
  chatRoomName: string;
  senderName: string;
  senderProfileImageUrl: string;
  content: string;
  createdAt: string;
}

const ActivityPanel = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [mentions, setMentions] = useState<MentionActivity[]>([]);
  const [groupRooms, setGroupRooms] = useState<ChatRoom[]>([]);
  const { setSelectedRoom } = useChatUI();
// 유틸 함수: 멘션된 본인 이름에 하이라이팅 적용
const highlightMention = (content: string, name: string) => {
  const regex = new RegExp(`@${name}(?=\\s|$)`, 'gi');
  const result: (string | JSX.Element)[] = [];

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(content)) !== null) {
    const start = match.index!;
    const end = start + match[0].length;

    if (start > lastIndex) {
      result.push(content.slice(lastIndex, start));
    }

    result.push(
      <span
        key={start}
        className="bg-blue-100 text-blue-800 font-semibold px-1 rounded"
      >
        {match[0]}
      </span>
    );

    lastIndex = end;
  }

  if (lastIndex < content.length) {
    result.push(content.slice(lastIndex));
  }

  return result;
};
useEffect(() => {
  if (!user) return;

  Promise.all([
    getMentionActivities(user.userId),
    getGroupChannelsByUser(user.userId),
  ])
    .then(([mentionData, groupRoomData]) => {
      setGroupRooms(groupRoomData); // ✅ 저장
      setMentions(
        mentionData.filter((m: MentionActivity) =>
          groupRoomData.some((room: ChatRoom) => room.chatRoomId === m.chatRoomId)
        )
      );
    })
    .catch((err) => {
      console.error('❌ 멘션 또는 그룹방 목록 불러오기 실패:', err);
    });
}, [user]);



  return (
    <aside className="w-80 bg-white border-r border-gray-200 p-4 overflow-y-auto">
      <h2 className="text-lg font-bold mb-3">내 활동</h2>

      <ul className="space-y-3">
        {mentions.map((item) => (
          <li
            key={item.messageId}
            onClick={() => {
              setSelectedRoom(null);
              navigate(`/chat/${item.chatRoomId}?message=${item.messageId}`, {
                replace: false,
                state: { forceNavigate: Date.now() }, // ✅ 강제 리렌더용
              });
            }}
            className="bg-white hover:bg-gray-100 border border-gray-200 p-3 rounded-md cursor-pointer shadow-sm"
          >
            {/* 상단 정보 */}
            <div className="flex justify-between items-center text-xs text-gray-500 mb-1">
              <div>
                <AtIcon className="inline mr-1 text-gray-400" />
                <span className="text-gray-600">{item.chatRoomName} 에서 멘션</span>
              </div>
              <span>{item.createdAt}</span>
            </div>

            {/* 보낸 사람 + 메시지 */}
            <div className="flex gap-3 items-start mt-1">
              <UserAvatar src={item.senderProfileImageUrl} size="md" />
              <div className="text-sm">
                <p className="font-semibold text-gray-800">{item.senderName}</p>
                <p className="text-gray-700 whitespace-pre-line mt-1">
                  {highlightMention(item.content, user?.name || '')}
                </p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default ActivityPanel;
