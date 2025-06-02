import { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';

const ChatRoom = () => {
  const [searchParams] = useSearchParams();
  const messageIdToScroll = searchParams.get('message');

  const messageRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
const mockMessages = [
  { id: 'msg-123', sender: '권아영', text: '메세지1' },
  { id: 'msg-124', sender: '김형진', text: '메세지2' },
  { id: 'msg-125', sender: '신재윤', text: '메세지3' },
];

  useEffect(() => {
    if (messageIdToScroll && messageRefs.current[messageIdToScroll]) {
      messageRefs.current[messageIdToScroll]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [messageIdToScroll]);

  return (
    <div className="flex flex-col h-full">
      {/* Header 등 생략 */}

      <div className="flex-1 overflow-y-auto">
        {mockMessages.map((msg) => (
          <div
            key={msg.id}
            ref={(el) => {
            messageRefs.current[msg.id] = el;
            }}
            className="p-2 hover:bg-gray-100"
          >
            {msg.sender}: {msg.text}
          </div>
        ))}
      </div>

      {/* MessageInput 등 생략 */}
    </div>
  );
};

export default ChatRoom;
