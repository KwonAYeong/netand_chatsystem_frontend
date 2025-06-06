import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { useUser } from '../../context/UserContext';
import { useChat } from '../../context/ChatContext';
import Header from './Header';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import type { Message } from '../../types/message';

export default function ChatRoom() {
  const { user } = useUser();
  const { currentRoomId, currentRoomName } = useChat();
  const [messages, setMessages] = useState<Message[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  // ✅ 메시지 불러오기
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await axios.get(`/chat/message/${currentRoomId}`);
        const enriched: Message[] = res.data.map((msg: any) => ({
          id: msg.chatMessageId,
          sender: {
            id: msg.senderId,
            name: msg.senderName,
            profileImageUrl: msg.profileImageUrl,
          },
          content: msg.content,
          time: new Date(msg.createdAt).toLocaleTimeString('ko-KR', {
            hour: '2-digit',
            minute: '2-digit',
          }),
          createdAt: msg.createdAt,
        }));
        setMessages(enriched);
      } catch (error) {
        console.error('메시지 불러오기 실패:', error);
      }
    };

    if (currentRoomId) fetchMessages();
  }, [currentRoomId]);

  // ✅ 메시지 맨 아래로 스크롤
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ✅ 메시지 전송
  const handleSend = async (text: string) => {
    if (!user || !currentRoomId) return;

    const now = new Date();

    // 낙관적 UI
    const newMsg: Message = {
      id: Date.now(),
      sender: {
        id: user.userId,
        name: user.name,
        profileImageUrl: user.profileImageUrl,
      },
      content: text,
      time: now.toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      createdAt: now.toISOString(),
    };
    setMessages((prev) => [...prev, newMsg]);

    try {
      await axios.post(`/chat/message`, {
        chatRoomId: currentRoomId,
        senderId: user.userId,
        content: text,
      });
    } catch (error) {
      console.error('메시지 전송 실패:', error);
    }
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
