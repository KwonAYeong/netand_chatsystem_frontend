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
import { useSearchParams } from 'react-router-dom';
import { getGroupChannelsByUser } from '../../api/chat';
import { useLocation } from 'react-router-dom';
const ChatLayout = () => {
  const { user } = useUser(); // ✅ unreadCounts도 여기서 가져옴
  const { chatRoomId } = useParams();
  const prevRoomIdRef = useRef<number | null>(null);
  const [dmRooms, setDmRooms,] = useState<ChatRoomType[]>([]);
  const [groupRooms, setGroupRooms] = useState<ChatRoomType[]>([]);
  const [searchParams] = useSearchParams();
  const targetMessageId = searchParams.get('message'); 
  const location = useLocation();
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
      .then((res) => {
        const patchedRooms = res.data.map((room: any) => ({
          ...room,
          userId: room.userId,
        }));
        setDmRooms(patchedRooms);
      })
      .catch((err) => console.error('❌ 채팅방 목록 가져오기 실패:', err));
       getGroupChannelsByUser(user.userId)
    .then((res) => {
      const patchedGroups = res.map((room: any) => ({
        ...room,
        userId: room.userId,
      }));
      setGroupRooms(patchedGroups);
    })
    .catch((err) => console.error('❌ 그룹 채팅방 실패:', err));
  }, [user]);
useEffect(() => {
  if (user) {
    fetchChatRooms(); 
  }
}, [user, fetchChatRooms]);
  // ✅ 선택된 채팅방 변경 감지
 useEffect(() => {
  console.log('📍 useEffect triggered by pathname:', location.pathname);
  if (!chatRoomId) return;
  if (dmRooms.length === 0 && groupRooms.length === 0) return;

  const newRoomId = Number(chatRoomId);
  const matchedRoom = [...dmRooms, ...groupRooms].find(
    (room) => room.chatRoomId === newRoomId
  );

  if (!matchedRoom) return;

  setSelectedRoom({
    id: newRoomId,
    type: matchedRoom.chatRoomType === 'GROUP' ? 'group' : 'dm',
    name: matchedRoom.chatRoomName,
    profileImage: matchedRoom.receiverProfileImage ?? '',
  });

  prevRoomIdRef.current = newRoomId;
}, [location.pathname, dmRooms, groupRooms]);

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
                onUnreadClear={() => {}} // ✅ 필요하면 context에서 setUnreadCounts 사용
                refetchChatRooms={fetchChatRooms}
              />
            ) : (
              <GroupChatRoom
                key={`${selectedRoom.id}-${targetMessageId || ''}`}
                roomId={selectedRoom.id}
                chatRoomName={selectedRoom.name}
                currentUser={{
                  id: user.userId,
                  nickname: user.nickname ?? user.name,
                }}
                onUnreadIncrease={() => {}}
                onUnreadClear={() => {}}
                targetMessageId={targetMessageId || undefined}
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
