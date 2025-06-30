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
import InviteMoreModal from '../panel/InviteMoreModal'; // ✅ 추가
import { transform } from '../../utils/transform';
import { useUser } from '../../context/UserContext';
import useWebSocket from '../../hooks/useWebSocket';
import type { Message } from '../../types/message';
import type { User } from '../../types/user';
import { useChatUI } from '../../context/ChatUIContext';
import { useLocation,useSearchParams, useNavigate } from 'react-router-dom';
import { subscribeToParticipants, unsubscribeFromParticipants } from '../../lib/websocket';
interface GroupChatRoomProps {
  roomId: number;
  chatRoomName: string;
  currentUser: {
    id: number;
    nickname?: string;
  };
  onUnreadIncrease: (roomId: number) => void;
  onUnreadClear: (roomId: number) => void;
  targetMessageId?: string;
}

export default function GroupChatRoom({
  roomId,
  chatRoomName,
  currentUser,
  onUnreadIncrease,
  onUnreadClear,
  targetMessageId
}: GroupChatRoomProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [members, setMembers] = useState<User[]>([]);
  const [showMembers, setShowMembers] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false); // ✅ 초대 모달 상태
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const lastReadMessageIdRef = useRef<number>(0);
  const { user } = useUser();
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const handleRoomEvent = (data: any) => {
  console.log('📡 그룹 멤버 이벤트 수신:', data);
  if (data.type === 'memberUpdate') {
    // 멤버 수 갱신 (예: setMembers 호출)
    getGroupMembers(roomId)
      .then((res) => setMembers(res.data))
      .catch((err) => console.error('❌ 멤버 갱신 실패:', err));
  }
};

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  const hasTargetMessage = messages.some((m) => m.id === Number(targetMessageId));
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
    console.log('📦 WebSocket 수신 원본:', data);
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

  const { sendMessage } = useWebSocket({
    roomId,
    onMessage: handleIncomingMessage,
    onRoomEvent: handleRoomEvent,
    activeRoomId: roomId,
    onUnreadIncrease,
    onUnreadClear,
  });


  useEffect(() => {
    if (messages.length > 0) return;
    getMessages(roomId)
      .then((res) => {
        console.log('📦 메시지 불러오기 응답:', res.data);
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

useEffect(() => {
  if (targetMessageId && hasTargetMessage) {
    requestAnimationFrame(() => {
      setTimeout(() => {
        const el = document.getElementById(`message-${targetMessageId}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.classList.add('ring', 'ring-blue-300', 'rounded-md');

          setTimeout(() => {
            el.classList.remove('ring', 'ring-blue-300', 'rounded-md');

            // ✅ 하이라이트 후 URL 정리
            searchParams.delete('message');
            setSearchParams(searchParams, { replace: true });
          }, 2000);
        }
      }, 100);
    });
  }
}, [targetMessageId, messages, location.state?.forceNavigate]);


  useEffect(() => {
    getGroupMembers(roomId)
      .then((res) => setMembers(res.data))
      .catch((err) => console.error('❌ 멤버 목록 불러오기 실패:', err));
  }, [roomId]);

  const uploadFile = async (file: File): Promise<string> => {
    const res = await sendFileMessage(roomId, currentUser.id, file);
    return res.data.fileUrl;
  };

  const handleSend = async (text: string, file?: File,mentionedUserNames: string[] = []) => {
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
        mentionedUserNames,
      };

      const tempMessage: Message = {
        id: Date.now(),
        chatRoomId: roomId,
        sender: {
          id: currentUser.id,
          name: user?.name?? '이름없음',
          profileImageUrl: user?.profileImageUrl || '/default-profile.png',
        },
        content: text,
        messageType: file ? 'FILE' : 'TEXT',
        fileUrl,
        createdAt: now,
        mentionedUserNames,
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
      console.error('❌ 멤버 새로고침 실패:', err);
    }
  };
useEffect(() => {
  const refetchMembers = () => {
    getGroupMembers(roomId)
      .then((res) => setMembers(res.data))
      .catch((err) => console.error('❌ 멤버 갱신 실패:', err));
  };

  subscribeToParticipants(roomId, refetchMembers);
  return () => unsubscribeFromParticipants(roomId);
}, [roomId]);

  return (
    <div className="flex flex-col h-full">
      <Header
        chatRoomName={`# ${chatRoomName}`}
        chatRoomId={roomId}
        chatRoomType="group"
        memberCount={members.length}
        onShowMembers={openMemberList}
        onInviteClick={() => setShowInviteModal(true)} // ✅ 초대 버튼 연결
      />

      <div className="flex-1 overflow-y-auto px-4 py-2">
        <ProfileIntro
          name={`채널 ${chatRoomName || '이름 없음'}`}
          profileUrl="/default_profile.jpg"
          chatRoomType="group"
        />
        <MessageList messages={messages} bottomRef={bottomRef} />
      </div>

      <MessageInput onSend={handleSend} chatRoomId={roomId}/>

      {showMembers && (
        <MemberListModal members={members} onClose={() => setShowMembers(false)} />
      )}

      {showInviteModal && (
        <InviteMoreModal
          chatRoomId={roomId}
          onClose={() => setShowInviteModal(false)}
          onInvited={() => {
            setShowInviteModal(false);
            openMemberList(); // ✅ 새 멤버 반영
          }}
        />
      )}
    </div>
  );
}
