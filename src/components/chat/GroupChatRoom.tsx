// src/components/chat/GroupChatRoom.tsx
import React, { useEffect, useRef, useState } from 'react';
import {
  getMessages,
  sendFileMessage,
  updateLastReadMessage,
  getGroupMembers,
} from '../../api/chat';
import Header from './Header';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import ProfileIntro from './ProfileIntro';
import MemberListModal from './MemberListModal';
import { transform } from '../../utils/transform';
import { useUser } from '../../context/UserContext';
import useWebSocket from '../../hooks/useWebSocket';
import type { Message } from '../../types/message';
import type { User } from '../../types/user';

interface GroupChatRoomProps {
  roomId: number;
  chatRoomName: string;
  currentUser: {
    id: number;
    nickname?: string;
  };
  onUnreadIncrease: (roomId: number) => void;
  onUnreadClear: (roomId: number) => void;
}

export default function GroupChatRoom({
  roomId,
  chatRoomName,
  currentUser,
  onUnreadIncrease,
  onUnreadClear,
}: GroupChatRoomProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [members, setMembers] = useState<User[]>([]);
  const [showMembers, setShowMembers] = useState(false);

  const bottomRef = useRef<HTMLDivElement | null>(null);
  const lastReadMessageIdRef = useRef<number>(0);
  const { user } = useUser();

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const tryUpdateLastRead = (msg: Message) => {
    const isNotMine = msg.sender.id !== currentUser.id;
    const isCurrentRoom = msg.chatRoomId === roomId;
    const isNewer = msg.id > lastReadMessageIdRef.current;

    if (isNotMine && isCurrentRoom && isNewer) {
      updateLastReadMessage(roomId, currentUser.id, msg.id)
        .then(() => {
          lastReadMessageIdRef.current = msg.id;
          onUnreadClear(roomId);
        })
        .catch((err) => console.error('❌ 읽음 처리 실패:', err));
    }
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

    tryUpdateLastRead(newMessage);
    scrollToBottom();
  };

  const { sendMessage, connectWebSocket, disconnectWebSocket } = useWebSocket({
    roomId,
    onMessage: handleIncomingMessage,
    activeRoomId: roomId,
    onUnreadIncrease,
    onUnreadClear,
  });

  useEffect(() => {
    connectWebSocket();
    return () => {
      disconnectWebSocket();
    };
  }, [roomId]);

  useEffect(() => {
    getMessages(roomId)
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
  }, [roomId]);

  const uploadFile = async (file: File): Promise<string> => {
    const res = await sendFileMessage(roomId, currentUser.id, file);
    return res.data.fileUrl;
  };

  const handleSend = async (text: string, file?: File) => {
    try {
      let fileUrl: string | undefined;

      if (file) {
        fileUrl = await uploadFile(file);
      }

      const now = new Date().toISOString();
      const payload = {
        chatRoomId: roomId,
        senderId: currentUser.id,
        content: text,
        messageType: file ? 'FILE' : 'TEXT',
        fileUrl,
      };

      const tempMessage: Message = {
        id: Date.now(),
        chatRoomId: roomId,
        sender: {
          id: currentUser.id,
          name: currentUser.nickname ?? '나',
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

  const openMemberList = async () => {
    try {
      const res = await getGroupMembers(roomId);
      setMembers(res.data);
      setShowMembers(true);
    } catch (err) {
      console.error('❌ 멤버 목록 불러오기 실패:', err);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <Header
        chatRoomName={`# ${chatRoomName}`}
        chatRoomId={roomId}
        chatRoomType="group"
        memberCount={members.length}
        onShowMembers={openMemberList}
      />
      <div className="flex-1 overflow-y-auto px-4 py-2">
        <ProfileIntro
          name={`채널 ${chatRoomName}`}
          profileUrl="/default_profile.jpg"
          chatRoomType="group"
        />
        <MessageList messages={messages} bottomRef={bottomRef} />
      </div>
      <MessageInput onSend={handleSend} />
      {showMembers && (
        <MemberListModal members={members} onClose={() => setShowMembers(false)} />
      )}
    </div>
  );
}
