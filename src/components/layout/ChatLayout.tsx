import Sidebar from '../sidebar/Sidebar';
import ChatMenuPanel from '../panel/ChatMenuPanel';
import ActivityPanel from '../panel/ActivityPanel';
import ChatRoomComponent from '../chat/ChatRoom';
import { useUser } from '../../context/UserContext';
import ProfilePanel from '../profile/ProfilePanel';
import ProfileEditModal from '../profile/ProfileEditModal';
import SettingsModal from '../settings/SettingsModal';
import WelcomeScreen from '../common/WelcomeScreen';
import { useParams } from 'react-router-dom';
import { useChatUI as useChatUIContext } from '../../context/ChatUIContext';
import { useChatUI as useChatUIUIHooks } from '../../hooks/useChatUI';
import { useEffect, useRef, useCallback, useState } from 'react';
import { getChatRoomsByUser } from '../../api/chat';
import type { ChatRoom as ChatRoomType } from '../../types/chat';

const ChatLayout = () => {
  const { user } = useUser();

  const {
    showProfile,
    showProfileModal,
    showSettingsModal,
    activeMenu,
    setShowProfile,
  } = useChatUIUIHooks();

  const {
    selectedRoom,
    setSelectedRoom,
  } = useChatUIContext();

  const { chatRoomId } = useParams();
  const prevRoomIdRef = useRef<number | null>(null);

  const [dmRooms, setDmRooms] = useState<ChatRoomType[]>([]);

  const fetchChatRooms = useCallback(() => {
    if (!user) return;
    getChatRoomsByUser(user.userId)
      .then((res) => {
        setDmRooms(res.data);
      })
      .catch((err) => {
        console.error('❌ 채팅방 목록 가져오기 실패:', err);
      });
  }, [user]);

  useEffect(() => {
    fetchChatRooms();
  }, [fetchChatRooms]);

  useEffect(() => {
    setSelectedRoom(null);
    prevRoomIdRef.current = null;
  }, [user?.userId]);

  useEffect(() => {
    //console.log('📦 현재 user context:', user);

    if (!chatRoomId) {
      setSelectedRoom(null);
      prevRoomIdRef.current = null;
    } else {
      const newRoomId = Number(chatRoomId);
      if (prevRoomIdRef.current !== newRoomId) {
        const matchedRoom = dmRooms.find((room) => room.chatRoomId === newRoomId);

        setSelectedRoom({
          id: newRoomId,
          name: matchedRoom?.chatRoomName || `채팅방 ${chatRoomId}`,
          profileImage: matchedRoom?.receiverProfileImage || '/default_profile.jpg',
        });
        prevRoomIdRef.current = newRoomId;
      }
    }

    setShowProfile(false); // ✅ 추가됨
  }, [chatRoomId, user?.userId, setSelectedRoom, setShowProfile, dmRooms]);

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
      <div className="flex flex-1 relative">
        <div className="flex-1">
          {/* 채팅방 또는 WelcomeScreen */}
          {chatRoomId ? (
            <ChatRoomComponent
              chatRoomId={Number(chatRoomId)}
              userId={user.userId}
              chatRoomName={selectedRoom?.name ?? `채팅방 ${chatRoomId}`}
              chatRoomProfileImage={selectedRoom?.profileImage ?? '/default_profile.jpg'}
              onUnreadClear={onUnreadClear}
              refetchChatRooms={fetchChatRooms}
            />
          ) : (
            <WelcomeScreen
              userName={user.name || '사용자'}
              profileImage={user.profileImageUrl || '/default_profile.jpg'}
            />
          )}
        </div>

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
