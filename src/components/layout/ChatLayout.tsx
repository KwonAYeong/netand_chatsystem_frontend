import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useSearchParams, useLocation } from 'react-router-dom';
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
import { getChatRoomsByUser, getGroupChannelsByUser } from '../../api/chat';
import type { ChatRoom as ChatRoomType } from '../../types/chat';

const ChatLayout = () => {
  const { chatRoomId } = useParams();
  const [searchParams] = useSearchParams();
  const targetMessageId = searchParams.get('message');
  const location = useLocation();

  const prevRoomIdRef = useRef<number | null>(null);

  const [dmRooms, setDmRooms] = useState<ChatRoomType[]>([]);
  const [groupRooms, setGroupRooms] = useState<ChatRoomType[]>([]);

  const { user, unreadCounts, setUnreadCounts } = useUser();
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

  const handleUnreadClear = (roomId: number) => {
    setUnreadCounts((prev) => {
      const updated = { ...prev };
      delete updated[roomId];
      return updated;
    });
  };

  // 📥 DM & 그룹 채팅방 목록 가져오기
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
      .catch((err) => console.error('❌ DM 채팅방 목록 실패:', err));

    getGroupChannelsByUser(user.userId)
      .then((res) => {
        const patchedGroups = res.map((room: any) => ({
          ...room,
          userId: room.userId,
        }));
        setGroupRooms(patchedGroups);
      })
      .catch((err) => console.error('❌ 그룹 채팅방 목록 실패:', err));
  }, [user]);

  // ✅ 채팅방 변경 감지
  useEffect(() => {
    if (!chatRoomId) {
      setSelectedRoom(null);
      prevRoomIdRef.current = null;
    } else {
      const newRoomId = Number(chatRoomId);
      if (prevRoomIdRef.current !== newRoomId) {
        const allRooms = [...dmRooms, ...groupRooms];
        const matchedRoom = allRooms.find((room) => room.chatRoomId === newRoomId);
        if (!matchedRoom) return;

        setSelectedRoom({
          id: newRoomId,
          type: matchedRoom.chatRoomType === 'GROUP' ? 'group' : 'dm',
          name: matchedRoom.chatRoomName || `채팅방 ${chatRoomId}`,
          profileImage: matchedRoom.receiverProfileImage || '/default_profile.jpg',
        });

        prevRoomIdRef.current = newRoomId;
      }

      if (!showProfile) {
        setShowProfile(false);
      }
    }
  }, [chatRoomId, location.pathname, dmRooms, groupRooms]);

  useEffect(() => {
    if (user) {
      fetchChatRooms();
    }
  }, [user, fetchChatRooms]);

  useEffect(() => {
    if (selectedRoom?.id) {
      handleUnreadClear(selectedRoom.id);
    }
  }, [selectedRoom?.id]);

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
          onUnreadClear={handleUnreadClear}
        />
      )}
      {activeMenu === 'activity' && <ActivityPanel />}

      {/* 채팅 화면 */}
      <div className="flex flex-1 relative">
        <div className={`flex-1 transition-all duration-300 ${showProfile ? 'mr-[400px]' : ''}`}>
          {selectedRoom ? (
            selectedRoom.type === 'dm' ? (
              <ChatRoom
                chatRoomId={selectedRoom.id}
                userId={user.userId}
                chatRoomName={selectedRoom.name}
                chatRoomProfileImage={selectedRoom.profileImage || ''}
                onUnreadClear={() => {}}
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
