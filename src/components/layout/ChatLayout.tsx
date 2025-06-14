// src/components/layout/ChatLayout.tsx
import Sidebar from '../sidebar/Sidebar';
import ChatMenuPanel from '../panel/ChatMenuPanel';
import ActivityPanel from '../panel/ActivityPanel';
import ChatRoom from '../chat/ChatRoom';
import { useUser } from '../../context/UserContext';
import ProfilePanel from '../profile/ProfilePanel';
import ProfileEditModal from '../profile/ProfileEditModal';
import SettingsModal from '../settings/SettingsModal';
import WelcomeScreen from '../common/WelcomeScreen';
import { useParams } from 'react-router-dom';
import { useChatUI as useChatUIContext } from '../../context/ChatUIContext';
import { useChatUI as useChatUIUIHooks } from '../../hooks/useChatUI';
import { useEffect } from 'react';  // ✅ useEffect import 필요

const ChatLayout = () => {
  const { user } = useUser();

  const {
    showProfile,
    showProfileModal,
    showSettingsModal,
    activeMenu,
  } = useChatUIUIHooks();

  const {
    selectedRoom,
    setSelectedRoom,
  } = useChatUIContext();

  const { chatRoomId } = useParams();

  console.log('📦 현재 user context:', user);

  // ✅ chatRoomId 바뀌면 selectedRoom도 업데이트 (핵심 추가 부분!)
 useEffect(() => {
  if (!chatRoomId) {
    setSelectedRoom(null);
  } else {
    setSelectedRoom((prev) => {
      if (prev?.id === Number(chatRoomId)) {
        return prev;
      } else {
        return {
          id: Number(chatRoomId),
          name: `채팅방 ${chatRoomId}`,
          profileImage: '/default-profile.png',
        };
      }
    });
  }
}, [chatRoomId, user?.userId, setSelectedRoom]);

  if (!user) {
    return <div className="p-4">유저 정보를 불러오는 중...</div>;
  }

  return (
    <div className="flex h-screen relative">
      {/* Sidebar */}
      <Sidebar clearSelectedRoom={() => {}} />

      {/* 중앙 패널 */}
      {activeMenu === 'home' && (
        <ChatMenuPanel currentUserId={user.userId} setSelectedRoom={setSelectedRoom} />
      )}

      {activeMenu === 'activity' && <ActivityPanel />}

      {/* 오른쪽 채팅/모달 패널 */}
      <div className={showProfile ? 'w-1/2 transition-all' : 'flex-1 transition-all'}>
        {chatRoomId ? (
          <ChatRoom
            chatRoomId={Number(chatRoomId)}
            userId={user.userId}
            chatRoomName={selectedRoom?.name ?? `채팅방 ${chatRoomId}`}
            chatRoomProfileImage={selectedRoom?.profileImage ?? '/default-profile.png'}
          />
        ) : (
          <WelcomeScreen
            userName={user.name || '사용자'}
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
      {showSettingsModal && <SettingsModal key={user?.userId} />}
    </div>
  );
};

export default ChatLayout;
