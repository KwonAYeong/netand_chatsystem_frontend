import React from 'react';
import MessageItem from './MessageItem';
import type { Message } from '../../types/message';

interface Props {
  messages: Message[];
}

export default function MessageList({ messages }: Props) {
  const grouped = messages.reduce((acc: Record<string, Message[]>, msg) => {
    const date = msg.createdAt.split('T')[0];
    acc[date] = acc[date] || [];
    acc[date].push(msg);
    return acc;
  }, {});

  return (
    <>
      {Object.entries(grouped).map(([date, msgs]) => (
        <div key={date}>
          {/* ✅ 날짜는 가운데 정렬 유지 */}
          <div className="text-center text-xs text-gray-400 my-4">
            {date}
          </div>

          {msgs.map((msg, index) => {
            const prev = msgs[index - 1];
            const showAvatar = !prev || prev.sender.id !== msg.sender.id;

            return (
              <MessageItem
                key={msg.id}
                message={msg}
                showAvatar={showAvatar}
              />
            );
          })}
        </div>
      ))}
    </>
  );
}
