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
import { useEffect, useRef, useCallback } from 'react';

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
  const prevRoomIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!chatRoomId) {
      setSelectedRoom(null);
      prevRoomIdRef.current = null;
    } else {
      const newRoomId = Number(chatRoomId);
      if (prevRoomIdRef.current !== newRoomId) {
        setSelectedRoom({
          id: newRoomId,
          name: `채팅방 ${chatRoomId}`,
          profileImage: '/default-profile.png',
        });
        prevRoomIdRef.current = newRoomId;
      }
    }
  }, [chatRoomId, setSelectedRoom]);

  const onUnreadClear = useCallback(
    (roomId: number) => {
      setSelectedRoom((prev) =>
        prev && prev.id === roomId ? { ...prev, unreadMessageCount: 0 } : prev
      );
    },
    [setSelectedRoom]
  );

  if (!user) {
    return <div className="p-4">유저 정보를 불러오는 중...</div>;
  }

  return (
    <div className="flex h-screen relative">
      {/* Sidebar */}
      <Sidebar clearSelectedRoom={() => {}} />

      {/* 중앙 패널 */}
      {activeMenu === 'home' && (
        <ChatMenuPanel
          currentUserId={user.userId}
          setSelectedRoom={setSelectedRoom}
          selectedRoomId={selectedRoom?.id}
        />
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
            onUnreadClear={onUnreadClear}
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
