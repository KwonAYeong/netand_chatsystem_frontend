// src/components/chat/MessageList.tsx
import React, { useEffect, useRef } from 'react';
import MessageItem from './MessageItem';
import type { Message } from '../../types/message';

interface Props {
  messages: Message[];
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

export default function MessageList({ messages }: Props) {
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  let lastDate: string | null = null;

  return (
    <div className="flex flex-col space-y-2">
      {messages.map((msg, index) => {
        const showDateHeader = !lastDate || !isSameDate(lastDate, msg.createdAt);
        lastDate = msg.createdAt;

        return (
          <React.Fragment key={msg.id}>
            {showDateHeader && (
              <div className="text-center text-xs text-gray-500 my-2">
                <div className="inline-block px-3 py-1 bg-gray-100 rounded-full">
                  {formatDate(msg.createdAt)}
                </div>
              </div>
            )}
            <MessageItem message={msg} showAvatar={true} />
          </React.Fragment>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
}
