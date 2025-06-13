// src/components/layout/ChatLayout.tsx
import React, { useState } from 'react';
import Sidebar from '../sidebar/Sidebar';
import ChatMenuPanel from '../panel/ChatMenuPanel';
import ActivityPanel from '../panel/ActivityPanel';
import ChatRoom from '../chat/ChatRoom';
import { useUser } from '../../context/UserContext';
import { useChatUI } from '../../hooks/useChatUI';
import ProfilePanel from '../profile/ProfilePanel';
import ProfileEditModal from '../profile/ProfileEditModal';
import SettingsModal from '../settings/SettingsModal';
import WelcomeScreen from '../common/WelcomeScreen'; // ✅ 추가

const ChatLayout = () => {
  const { user } = useUser();
  const { showProfile, showProfileModal, showSettingsModal, activeMenu } = useChatUI();

  const [selectedRoom, setSelectedRoom] = useState<{ id: number; name: string } | null>(null);

  console.log('📦 현재 user context:', user);

  if (!user) {
    return <div className="p-4">유저 정보를 불러오는 중...</div>;
  }

  return (
    <div className="flex h-screen relative">
      {/* ✅ Sidebar에 clearSelectedRoom 전달 */}
      <Sidebar clearSelectedRoom={() => setSelectedRoom(null)} />

      {/* 중앙 패널 */}
      {activeMenu === 'home' && (
        <ChatMenuPanel
          currentUserId={user.userId}
          onSelectRoom={(id, name) => {
            console.log(`${name} 클릭됨`);
            setSelectedRoom({ id, name });
          }}
        />
      )}
      {activeMenu === 'activity' && <ActivityPanel />}

      {/* 오른쪽 채팅/모달 패널 */}
      <div className={showProfile ? 'w-1/2 transition-all' : 'flex-1 transition-all'}>
        {selectedRoom ? (
          <ChatRoom
            chatRoomId={selectedRoom.id}
            userId={user.userId}
            chatRoomName={selectedRoom.name}
          />
        ) : (
          // ✅ WelcomeScreen으로 변경
          <WelcomeScreen
            userName={user.name|| '사용자'}
            profileImage={user.profileImageUrl || '/default-profile.png'}
          />
        )}

        {showProfile && (
          <div className="absolute top-0 right-0 w-[400px] h-full z-50">
            <ProfilePanel />
          </div>
        )}
      </div>

      {/* 모달들 */}
      {showProfileModal && <ProfileEditModal />}
      {showSettingsModal && <SettingsModal />}
    </div>
  );
};

export default ChatLayout;
