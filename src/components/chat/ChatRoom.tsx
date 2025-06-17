// src/components/chat/ChatRoom.tsx
import React, { useEffect, useRef, useState } from 'react';
import {
  sendFileMessage,
  getMessages,
  updateLastReadMessage,
} from '../../api/chat';
import Header from './Header';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import ProfileIntro from './ProfileIntro';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import { transform, appendIfNotExistsById } from '../../utils/transform';
import type { Message } from '../../types/message';

interface ChatRoomProps {
  chatRoomId: number;
  userId: number;
  chatRoomName: string;
  chatRoomProfileImage: string;
  onUnreadClear: (roomId: number) => void;
}

export default function ChatRoom({
  chatRoomId,
  userId,
  chatRoomName,
  chatRoomProfileImage,
  onUnreadClear,
}: ChatRoomProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const clientRef = useRef<Client | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    getMessages(chatRoomId)
      .then((res) => {
        const transformed = res.data.map(transform);
        setMessages(transformed);
        scrollToBottom();
      })
      .catch((err) => console.error('❌ 메시지 불러오기 실패:', err));

    updateLastReadMessage(chatRoomId, userId)
      .then(() => onUnreadClear(chatRoomId))
      .catch((err) => console.error('❌ 초기 읽음 처리 실패:', err));

    const socket = new SockJS('http://localhost:8080/ws');
    const client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      onConnect: () => {
        client.subscribe(`/sub/chatroom/${chatRoomId}`, (message) => {
          const data = JSON.parse(message.body);
          const newMessage = transform(data);

          setMessages((prev) => appendIfNotExistsById(prev, newMessage));
          scrollToBottom();

          updateLastReadMessage(chatRoomId, userId)
            .then(() => onUnreadClear(chatRoomId))
            .catch((err) => console.error('❌ 실시간 읽음 처리 실패:', err));
        });
      },
      onWebSocketError: (err) => {
        console.error('❌ WebSocket 연결 실패:', err);
      },
      onStompError: (frame) => {
        console.error('❌ STOMP 프로토콜 오류:', frame);
      },
    });

    client.activate();
    clientRef.current = client;

    return () => {
      client.deactivate();
      setMessages([]);
    };
  }, [chatRoomId, userId, onUnreadClear]);

  const uploadFile = async (file: File): Promise<string> => {
    const res = await sendFileMessage(chatRoomId, userId, file);
    return res.data.fileUrl;
  };

  const handleSend = async (text: string, file?: File) => {
    try {
      let fileUrl: string | undefined;

      if (file) {
        fileUrl = await uploadFile(file);
      }

      const payload = {
        chatRoomId,
        senderId: userId,
        content: text,
        messageType: file ? 'FILE' : 'TEXT',
        fileUrl,
      };

      if (clientRef.current?.connected) {
        clientRef.current.publish({
          destination: '/pub/chat.sendMessage',
          body: JSON.stringify(payload),
        });
      } else {
        console.warn('⚠️ WebSocket 연결 안됨. 메시지 전송 불가');
      }
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
        <ProfileIntro name={`채팅방 ${chatRoomId}`} profileUrl="/default-profile.png" />
        <MessageList messages={messages} bottomRef={bottomRef} />
      </div>

      <MessageInput onSend={handleSend} />
    </div>
  );
}
