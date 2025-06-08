// src/components/chat/ChatRoom.tsx
import React, { useEffect, useState } from 'react';
import { getMessages, sendMessage, sendFileMessage } from '../../api/chat';
import {
  connectWebSocket,
  disconnectWebSocket,
  sendWebSocketMessage,
} from '../../utils/websocket';
import Header from './Header';
import MessageList from './MessageList';
import MessageInput from './MessageInput';

interface Props {
  chatRoomId: number;
  userId: number;
  roomName: string;
}

interface Message {
  id: number;
  chatRoomId: number;
  sender: {
    id: number;
    name: string;
    profileImageUrl: string;
  };
  content: string;
  messageType: string;
  fileUrl?: string;
  createdAt: string;
}

export default function ChatRoom({ chatRoomId, userId, roomName }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);

  const transform = (res: any): Message => ({
    id: res.messageId,
    chatRoomId: res.chatRoomId,
    sender: {
      id: res.senderId,
      name: res.senderName,
      profileImageUrl: res.senderProfileImage,
    },
    content: res.content,
    messageType: res.messageType,
    fileUrl: res.fileUrl,
    createdAt: res.createdAt,
  });

  useEffect(() => {
    getMessages(chatRoomId)
      .then((res) => {
        const transformed = res.data.map(transform);
        setMessages(transformed);
      })
      .catch((err) => console.error('❌ 메시지 불러오기 실패:', err));

    connectWebSocket(chatRoomId, (msg) => {
      setMessages((prev) => [...prev, transform(msg)]);
    });

    return () => disconnectWebSocket();
  }, [chatRoomId]);

  const handleSend = async (text: string, file?: File) => {
    try {
      if (file) {
        await sendFileMessage(chatRoomId, userId, file);
      } else {
        const message = {
          chatRoomId,
          senderId: userId,
          content: text,
          messageType: 'TEXT',
        };
        const res = await sendMessage(message);
        // socket 전송
        sendWebSocketMessage(res.data);
      }
    } catch (err) {
      console.error('❌ 메시지 전송 실패:', err);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <Header name={roomName} />
      <div className="flex-1 overflow-y-auto px-4 py-2">
        <MessageList messages={messages} />
      </div>
      <MessageInput onSend={handleSend} />
    </div>
  );
}
