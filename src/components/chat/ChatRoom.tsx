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
  const lastReadMessageIdRef = useRef<number>(0); // 마지막 읽은 메시지 추적

  // 하단으로 스크롤
  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // 읽음 처리
  const tryUpdateLastRead = (msg: Message) => {
    const isNotMine = msg.sender.id !== userId;
    const isCurrentRoom = msg.chatRoomId === chatRoomId;
    const isNewer = msg.id > lastReadMessageIdRef.current;

    if (isNotMine && isCurrentRoom && isNewer) {
      updateLastReadMessage(chatRoomId, userId, msg.id)
        .then(() => {
          lastReadMessageIdRef.current = msg.id;
          onUnreadClear(chatRoomId);
        })
        .catch((err) => console.error('❌ 읽음 처리 실패:', err));
    }
  };

  // 수신 메시지 처리
  const handleIncomingMessage = (data: any) => {
    const newMessage = transform(data);

    setMessages((prev: Message[]) => {
      const map = new Map<number, Message>(prev.map((m) => [m.id, m]));
      map.set(newMessage.id, newMessage);
      return Array.from(map.values()).sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    });

    tryUpdateLastRead(newMessage);
    scrollToBottom();
  };

  // WebSocket 구독 및 메시지 전송
  const { sendMessage } = useWebSocket({
    roomId: chatRoomId,
    onMessage: handleIncomingMessage,
    activeRoomId: chatRoomId,
    onUnreadIncrease: () => {}, // DM이므로 무시
    onUnreadClear,
  });

  // 기존 메시지 불러오기
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

        const last = sorted.at(-1);
        if (last) tryUpdateLastRead(last);
      })
      .catch((err) => console.error('❌ 메시지 불러오기 실패:', err));
  }, [chatRoomId]);

  // 파일 업로드
  const uploadFile = async (file: File): Promise<string> => {
    const res = await sendFileMessage(chatRoomId, userId, file);
    return res.data.fileUrl;
  };

  // 메시지 전송
  const handleSend = async (text: string, file?: File) => {
    if(!user) return;
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
        id: Date.now(), // 임시 ID
        chatRoomId,
        sender: {
          id: user.userId,
          name: user.name?? '이름없음',
          profileImageUrl: user?.profileImageUrl || '/default-profile.png',
        },
        content: text,
        messageType: file ? 'FILE' : 'TEXT',
        fileUrl,
        createdAt: now,
      };

      setMessages((prev) => [...prev, tempMessage]);
      scrollToBottom();

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
        chatRoomType="dm"
        profileUrl={chatRoomProfileImage}
      />
      <div className="flex-1 overflow-y-auto px-4 py-2">
        <ProfileIntro
          name={`채팅방 ${chatRoomId}`}
          profileUrl="/default_profile.jpg"
          chatRoomType="dm"
        />
        <MessageList messages={messages} bottomRef={bottomRef} />
      </div>
      <MessageInput onSend={handleSend} />
    </div>
  );
}
