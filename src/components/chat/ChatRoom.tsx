// src/components/chat/ChatRoom.tsx
import React, { useEffect, useRef, useState } from 'react';
import {
  getMessages,
  sendFileMessage,
  updateLastReadMessage,
} from '../../api/chat';
import Header from './Header';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import ProfileIntro from './ProfileIntro';
import { transform } from '../../utils/transform';
import type { Message } from '../../types/message';
import useWebSocket from '../../hooks/useWebSocket';
import { useUser } from '../../context/UserContext';

interface ChatRoomProps {
  chatRoomId: number;
  userId: number;
  chatRoomName: string;
  chatRoomProfileImage: string;
  onUnreadClear: (roomId: number) => void;
  refetchChatRooms: () => void;
}

export default function ChatRoom({
  chatRoomId,
  userId,
  chatRoomName,
  chatRoomProfileImage,
  onUnreadClear,
  refetchChatRooms,
}: ChatRoomProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const { user } = useUser();

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleIncomingMessage = (data: any) => {
    const newMessage = transform(data);

    setMessages((prev: Message[]) => {
      const map = new Map<number, Message>(prev.map((m) => [m.id, m]));
      map.set(newMessage.id, newMessage);
      return Array.from(map.values()).sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    });

    if (
      newMessage.sender.id !== userId &&
      newMessage.chatRoomId === chatRoomId &&
      typeof newMessage.id === 'number' &&
      newMessage.id > 0
    ) {
      updateLastReadMessage(chatRoomId, userId, newMessage.id);
      onUnreadClear(chatRoomId);
    }

    scrollToBottom();
  };

  const { sendMessage } = useWebSocket(
    String(chatRoomId),
    handleIncomingMessage,
    String(chatRoomId),
    refetchChatRooms
  );

  useEffect(() => {
    getMessages(chatRoomId)
      .then((res) => {
        const transformed = res.data.map(transform);
        const sorted = transformed.sort(
          (a: Message, b: Message) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );

        setMessages(sorted);
        scrollToBottom();

        const lastMessage = sorted[sorted.length - 1];
        if (
          lastMessage &&
          lastMessage.sender.id !== userId &&
          lastMessage.chatRoomId === chatRoomId &&
          typeof lastMessage.id === 'number' &&
          lastMessage.id > 0
        ) {
          updateLastReadMessage(chatRoomId, userId, lastMessage.id);
        }

        onUnreadClear(chatRoomId);
      })
      .catch((err) => console.error('❌ 메시지 불러오기 실패:', err));
  }, [chatRoomId]);

  const uploadFile = async (file: File): Promise<string> => {
    const res = await sendFileMessage(chatRoomId, userId, file);
    return res.data.fileUrl;
  };

  const handleSend = async (text: string, file?: File) => {
    console.log('🟢 handleSend 호출됨:', { text, file });

    try {
      let fileUrl: string | undefined;

      if (file) {
        fileUrl = await uploadFile(file);
      }

      const now = new Date().toISOString();
      const payload = {
        chatRoomId,
        senderId: userId,
        content: text,
        messageType: file ? 'FILE' : 'TEXT',
        fileUrl,
      };

      const tempMessage: Message = {
        id: Date.now(),
        chatRoomId,
        sender: {
          id: userId,
          name: '나',
          profileImageUrl: '/default-profile.png',
        },
        content: text,
        messageType: file ? 'FILE' : 'TEXT',
        fileUrl,
        createdAt: now,
      };

      setMessages((prev) => [...prev, tempMessage]);
      scrollToBottom();

      console.log('🚀 최종 전송 payload:', payload);
      sendMessage(payload);
    } catch (err) {
      console.error('❌ 메시지 전송 실패:', err);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <Header
        chatRoomName={chatRoomName}
        chatRoomId={chatRoomId}
        profileUrl={chatRoomProfileImage}
      />

      <div className="flex-1 overflow-y-auto px-4 py-2">
        <ProfileIntro name={`채팅방 ${chatRoomId}`} profileUrl="/default_profile.jpg" />
        <MessageList messages={messages} bottomRef={bottomRef} />
      </div>

      <MessageInput onSend={handleSend} />
    </div>
  );
}

