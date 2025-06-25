// src/components/layout/ChatLayout.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import Sidebar from '../sidebar/Sidebar';
import ChatMenuPanel from '../panel/ChatMenuPanel';
import ActivityPanel from '../panel/ActivityPanel';
import ChatRoom from '../chat/ChatRoom';
import GroupChatRoom from '../chat/GroupChatRoom';
import ProfilePanel from '../profile/ProfilePanel';
import ProfileEditModal from '../profile/ProfileEditModal';
import SettingsModal from '../settings/SettingsModal';
import WelcomeScreen from '../common/WelcomeScreen';
import { useUser } from '../../context/UserContext';
import { useChatUI as useChatUIContext } from '../../context/ChatUIContext';
import { useChatUI as useChatUIHooks } from '../../hooks/useChatUI';
import { getChatRoomsByUser } from '../../api/chat';
import type { ChatRoom as ChatRoomType } from '../../types/chat';

const ChatLayout = () => {
  const { user } = useUser();
  const { chatRoomId } = useParams();
  const prevRoomIdRef = useRef<number | null>(null);
  const [dmRooms, setDmRooms] = useState<ChatRoomType[]>([]);
  const [unreadCounts, setUnreadCounts] = useState<Record<number, number>>({});

  const {
    showProfile,
    showProfileModal,
    showSettingsModal,
    activeMenu,
    setShowProfile,
  } = useChatUIHooks();

  const {
    selectedRoom,
    setSelectedRoom,
  } = useChatUIContext();

  // 📥 1:1 채팅방 목록 가져오기
  const fetchChatRooms = useCallback(() => {
    if (!user) return;
    getChatRoomsByUser(user.userId)
      .then((res) => setDmRooms(res.data))
      .catch((err) => console.error('❌ 채팅방 목록 가져오기 실패:', err));
  }, [user]);

  useEffect(() => {
    fetchChatRooms();
  }, [fetchChatRooms]);

  // ✅ 선택된 채팅방 변경 감지 → dm 또는 group 구분해서 이름 설정
  useEffect(() => {
    if (!chatRoomId) {
      setSelectedRoom(null);
      prevRoomIdRef.current = null;
    } else {
      const newRoomId = Number(chatRoomId);
      if (prevRoomIdRef.current !== newRoomId) {
        const matchedRoom = dmRooms.find((room) => room.chatRoomId === newRoomId);

        setSelectedRoom({
          id: newRoomId,
          type: matchedRoom?.chatRoomType === 'GROUP' ? 'group' : 'dm',
          name: matchedRoom?.chatRoomName || `채팅방 ${chatRoomId}`,
          profileImage: matchedRoom?.receiverProfileImage || '/default_profile.jpg',
        });

        prevRoomIdRef.current = newRoomId;
      }
    }
    setShowProfile(false);
  }, [chatRoomId, user?.userId, dmRooms, setSelectedRoom, setShowProfile]);

  // 📬 안 읽은 메시지 수 관리
  const handleUnreadIncrease = (roomId: number) => {
    setUnreadCounts((prev) => ({
      ...prev,
      [roomId]: (prev[roomId] || 0) + 1,
    }));
  };

  const handleUnreadClear = (roomId: number) => {
    setUnreadCounts((prev) => {
      const updated = { ...prev };
      delete updated[roomId];
      return updated;
    });
  };

  if (!user) return <div className="p-4">유저 정보를 불러오는 중...</div>;

  return (
    <div className="flex h-screen relative">
      {/* Sidebar */}
      <Sidebar clearSelectedRoom={() => setSelectedRoom(null)} />

      {/* 중앙 메뉴 패널 */}
      {activeMenu === 'home' && (
        <ChatMenuPanel
          currentUserId={user.userId}
          selectedRoomId={selectedRoom?.id}
          unreadCounts={unreadCounts}
        />
      )}
      {activeMenu === 'activity' && <ActivityPanel />}

      {/* 채팅화면 영역 */}
      <div className="flex flex-1 relative">
        <div className={`flex-1 transition-all duration-300 ${showProfile ? 'mr-[400px]' : ''}`}>
          {selectedRoom ? (
            selectedRoom.type === 'dm' ? (
              <ChatRoom
                chatRoomId={selectedRoom.id}
                userId={user.userId}
                chatRoomName={selectedRoom.name}
                chatRoomProfileImage={selectedRoom.profileImage || ''}
                onUnreadClear={handleUnreadClear}
                refetchChatRooms={fetchChatRooms}
              />
            ) : (
              <GroupChatRoom
              key={selectedRoom.id}
                roomId={selectedRoom.id}
                chatRoomName={selectedRoom.name}
                currentUser={{
                  id: user.userId,
                  nickname: user.nickname ?? user.name,
                }}
                onUnreadIncrease={handleUnreadIncrease}
                onUnreadClear={handleUnreadClear}
              />
            )
          ) : (
            <WelcomeScreen
              userName={user.name || '사용자'}
              profileImage={user.profileImageUrl || '/default_profile.jpg'}
            />
          )}
        </div>

        {/* 우측 프로필 패널 */}
        {showProfile && (
          <div className="absolute top-0 right-0 w-[400px] h-full z-50 bg-white shadow-lg">
            <ProfilePanel />
          </div>
        )}
      </div>

      {/* 모달 */}
      {showProfileModal && <ProfileEditModal />}
      {showSettingsModal && <SettingsModal key={user?.userId} />}
    </div>
  );
};

export default ChatLayout;
