import React, { useEffect, useRef, useState } from 'react';
import { useUser } from '../../context/UserContext';
import { useChat } from '../../context/ChatContext';
import Header from './Header';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { mockStore } from '../../mock/mockStore';
import type { Message } from '../../types/message';

type MockMessage = {
  chatMessageId: number;
  chatRoomId: number;
  senderId: number;
  content: string;
  createdAt: string;
  fileUrl?: string;
};

export default function ChatRoom() {
  const { user } = useUser();
  const { currentRoomId, currentRoomName } = useChat();
  const [messages, setMessages] = useState<Message[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  // ✅ 메시지 불러오기 (mock 기반)
  useEffect(() => {
    if (!currentRoomId) return;

    const filtered: MockMessage[] = mockStore.messages.filter(
      (msg: MockMessage) => String(msg.chatRoomId) === String(currentRoomId)
    );

    const enriched: Message[] = filtered.map((msg: MockMessage) => {
      const sender = mockStore.users.find((u) => u.userId === msg.senderId);
      return {
        id: msg.chatMessageId,
        sender: {
          id: sender?.userId || 0,
          name: sender?.name || '알 수 없음',
          profileImageUrl: (sender as any)?.profile_image_url || '', // 타입 우회
        },
        content: msg.content,
        fileUrl: msg.fileUrl,
        time: new Date(msg.createdAt).toLocaleTimeString('ko-KR', {
          hour: '2-digit',
          minute: '2-digit',
        }),
        createdAt: msg.createdAt,
      };
    });

    setMessages(enriched);
  }, [currentRoomId]);

  // ✅ 자동 스크롤
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ✅ 메시지 & 파일 전송 (mock 방식)
  const handleSend = (text: string, file?: File) => {
    if (!user || !currentRoomId) return;

    const now = new Date();

    const newMsg: Message = {
      id: Date.now(),
      sender: {
        id: user.userId,
        name: user.name,
        profileImageUrl: user.profileImageUrl,
      },
      content: text,
      fileUrl: file ? URL.createObjectURL(file) : undefined, // mock에서 임시 미리보기 URL
      time: now.toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      createdAt: now.toISOString(),
    };

    setMessages((prev) => [...prev, newMsg]);
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500">
        <p className="text-lg font-semibold">유저 정보가 없습니다.</p>
        <p className="text-sm mt-1">로그인 상태를 확인하세요.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-100">
      {!currentRoomId ? (
        <div className="flex flex-col items-center justify-center h-full">
          <img
            src={user.profileImageUrl || '/default-profile.png'}
            alt="user"
            className="w-12 h-12 rounded-full border-2 border-purple-400 mb-4"
          />
          <h1 className="text-xl font-bold">{user.name}님 오신걸 환영합니다</h1>
          <p className="text-gray-500 mt-2">좌측에서 채팅 상대를 선택하세요</p>
        </div>
      ) : (
        <>
          <Header name={currentRoomName || ''} />
          <div className="flex-1 overflow-y-auto p-4">
            <MessageList messages={messages} />
            <div ref={bottomRef} />
          </div>
          <MessageInput onSend={handleSend} />
        </>
      )}
    </div>
  );
}
