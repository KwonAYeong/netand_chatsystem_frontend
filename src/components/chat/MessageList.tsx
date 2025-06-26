import React, { useEffect } from 'react';
import MessageItem from './MessageItem';
import { Message } from '../../types/message';

interface Props {
  messages: Message[];
  bottomRef: React.RefObject<HTMLDivElement | null>;
}

// 날짜 포맷 (예: 2025년 6월 23일 월)
function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  });
}

// 같은 날짜인지 확인
function isSameDate(a: string, b: string) {
  return new Date(a).toDateString() === new Date(b).toDateString();
}

export default function MessageList({ messages, bottomRef }: Props) {
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, bottomRef]);

  let lastDate: string | null = null;

  return (
    <div className="flex flex-col gap-1 py-2">
      {messages.map((msg, index) => {
        const prev = messages[index - 1];

        // 날짜 구분
        const showDateHeader =
          !lastDate || !isSameDate(lastDate, msg.createdAt);
        lastDate = msg.createdAt;

        // 연속 메시지 그룹 판단
        const isGrouped =
          prev &&
          prev.sender.id === msg.sender.id &&
          isSameDate(prev.createdAt, msg.createdAt) &&
          Math.abs(
            new Date(msg.createdAt).getTime() -
              new Date(prev.createdAt).getTime()
          ) < 1 * 60 * 1000; // 1분 이내 같은 사람 → 그룹으로 묶음

        return (
          <React.Fragment key={msg.id}>
            {showDateHeader && (
              <div className="text-center text-xs text-gray-500 my-2">
                <div className="inline-block px-3 py-1 bg-gray-100 rounded-full">
                  {formatDate(msg.createdAt)}
                </div>
              </div>
            )}
            <div className={isGrouped ? 'mt-1' : 'mt-4'}>
            <MessageItem message={msg} isGrouped={!!isGrouped} /></div>
          </React.Fragment>
        );
      })}

      <div ref={bottomRef} />
    </div>
  );
}
