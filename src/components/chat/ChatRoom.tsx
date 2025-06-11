// src/components/chat/ChatRoom.tsx
import React, { useEffect, useRef, useState } from 'react';
import {
  getMessages,
  sendMessage,
  sendFileMessage,
  updateLastReadMessage,
} from '../../api/chat';
import Header from './Header';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import { transform, appendIfNotExists } from '../../utils/transform';
import type { Message } from '../../types/message';

interface ChatRoomProps {
  chatRoomId: number;
  userId: number;
  chatRoomName: string;
}

export default function ChatRoom({ chatRoomId, userId, chatRoomName }: ChatRoomProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const clientRef = useRef<Client | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // 1. 메시지 불러오기
    getMessages(chatRoomId)
      .then((res) => {
        const transformed = res.data.map(transform);
        setMessages(transformed);
      })
      .catch((err) => console.error('❌ 메시지 불러오기 실패:', err));

    // 2. 채팅방 입장 시 읽음 처리
    updateLastReadMessage(chatRoomId, userId)
      .then(() => console.log('✅ 읽음 처리 완료'))
      .catch((err) => console.error('❌ 읽음 처리 실패:', err));

    // 3. WebSocket 연결
    const socket = new SockJS('http://localhost:8080/ws');
    const client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      onConnect: () => {
        console.log('🟢 WebSocket 연결됨');
        setIsConnected(true);

        client.subscribe(`/sub/chatroom/${chatRoomId}`, (message) => {
          console.log('📩 수신된 메시지:', message.body);
          const data = JSON.parse(message.body);
          const newMessage = transform(data);
          setMessages((prev) => appendIfNotExists(prev, newMessage));
        });
      },
      onStompError: (frame) => {
        console.error('❌ STOMP 오류:', frame);
      },
    });

    client.activate();
    clientRef.current = client;

    return () => {
      client.deactivate();
      setIsConnected(false);
    };
  }, [chatRoomId]);

  const handleSend = async (text: string, file?: File) => {
    try {
      let res;

      if (file) {
        res = await sendFileMessage(chatRoomId, userId, file);
      } else {
        const messagePayload = {
          chatRoomId,
          senderId: userId,
          content: text,
          messageType: 'TEXT',
        };
        res = await sendMessage(messagePayload);
      }

      if (clientRef.current && clientRef.current.connected) {
        clientRef.current.publish({
          destination: '/pub/chat.sendMessage',
          body: JSON.stringify(res.data),
        });
      } else {
        console.warn('⚠️ WebSocket 연결되지 않아 메시지를 보낼 수 없습니다.');
      }
    } catch (err) {
      console.error('❌ 메시지 전송 실패:', err);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <Header chatRoomName={chatRoomName} />
      <div className="flex-1 overflow-y-auto px-4 py-2">
        <MessageList messages={messages} />
      </div>
      <MessageInput onSend={handleSend} />
    </div>
  );
}
