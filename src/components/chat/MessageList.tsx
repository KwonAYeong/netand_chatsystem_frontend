import React, { useEffect } from 'react';
import MessageItem from './MessageItem';
import type { Message } from '../../types/message';

interface Props {
  messages: Message[];
  bottomRef: React.RefObject<HTMLDivElement | null>; // ✅ Ref 타입 수정
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  });
}

function isSameDate(a: string, b: string) {
  return new Date(a).toDateString() === new Date(b).toDateString();
}

export default function MessageList({ messages, bottomRef }: Props) {
  // ✅ 메시지가 바뀔 때마다 자동 스크롤
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, bottomRef]);

  let lastDate: string | null = null;

  return (
    <div className="flex flex-col space-y-2">
      {messages.map((msg, index) => {
        const showDateHeader = !lastDate || !isSameDate(lastDate, msg.createdAt);
        lastDate = msg.createdAt;

        const prev = messages[index - 1];

        // ✅ 같은 사람 + 같은 시/분이면 아바타 생략
        const showAvatar =
          !prev ||
          prev.sender.id !== msg.sender.id ||
          prev.createdAt.slice(0, 16) !== msg.createdAt.slice(0, 16); // "yyyy-MM-ddTHH:mm"

        return (
          <React.Fragment key={msg.id}>
            {showDateHeader && (
              <div className="text-center text-xs text-gray-500 my-2">
                <div className="inline-block px-3 py-1 bg-gray-100 rounded-full">
                  {formatDate(msg.createdAt)}
                </div>
              </div>
            )}
            <MessageItem message={msg} showAvatar={showAvatar} />
          </React.Fragment>
        );
      })}

      {/* ✅ 스크롤 대상 */}
      <div ref={bottomRef} />
    </div>
  );
}
