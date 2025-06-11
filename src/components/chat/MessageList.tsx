// src/components/chat/MessageList.tsx
import React, { useEffect, useRef } from 'react';
import MessageItem from './MessageItem';
import type { Message } from '../../types/message';

interface Props {
  messages: Message[];
}

export default function MessageList({ messages }: Props) {
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-col space-y-2">
      {messages.map((msg) => (
        <MessageItem
          key={`${msg.id}-${msg.createdAt}`} // ✅ id + 시간 조합으로 중복 방지
          message={msg}
          showAvatar={true}
        />
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
