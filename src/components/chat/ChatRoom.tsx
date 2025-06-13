// src/components/chat/ChatRoom.tsx
import React, { useEffect, useRef, useState } from 'react';
import Header from './Header';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import ProfileIntro from './ProfileIntro';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import { getMessages, updateLastReadMessage } from '../../api/chat';
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
    // 1. 이전 메시지 불러오기
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

  const handleSend = (text: string, file?: File) => {
    if (!clientRef.current || !clientRef.current.connected) {
      console.warn('⚠️ WebSocket 연결되지 않아 메시지를 보낼 수 없습니다.');
      return;
    }

    const payload: any = {
      chatRoomId,
      senderId: userId,
      messageType: file ? 'FILE' : 'TEXT',
    };

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        payload.fileUrl = reader.result;
        clientRef.current!.publish({
          destination: '/pub/chat.sendMessage',
          body: JSON.stringify(payload),
        });
      };
      reader.readAsDataURL(file);
    } else {
      payload.content = text;
      clientRef.current.publish({
        destination: '/pub/chat.sendMessage',
        body: JSON.stringify(payload),
      });
    }
  };

  return (
    <div className="flex flex-col h-full">
      <Header chatRoomName={chatRoomName} 
      chatRoomId={chatRoomId}/>
      <div className="flex-1 overflow-y-auto px-4 py-2">
        <ProfileIntro name={chatRoomName} profileUrl="/default-profile.png" />
        <MessageList messages={messages} />
      </div>
      <MessageInput onSend={handleSend} />
    </div>
  );
}