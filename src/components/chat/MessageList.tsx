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

            let showAvatar = false;

            if (!prev) {
              showAvatar = true;
            } else {
              const sameSender = prev.sender.id === msg.sender.id;
              const prevTime = new Date(prev.createdAt).getTime();
              const currTime = new Date(msg.createdAt).getTime();
              const timeDiffInMinutes = (currTime - prevTime) / (1000 * 60);

              // ✅ 같은 사람이라도 1분 이상 차이 나면 다시 표시
              showAvatar = !sameSender || timeDiffInMinutes >= 1;
            }

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
