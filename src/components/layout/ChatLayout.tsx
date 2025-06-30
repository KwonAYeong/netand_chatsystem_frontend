// ✅ ChatLayout.tsx
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useParams, useSearchParams, useLocation } from 'react-router-dom';
import Sidebar from '../sidebar/Sidebar';
import ChatMenuPanel, { ChatMenuPanelRef } from '../panel/ChatMenuPanel';
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
import { subscribeToRoomList } from '../../lib/websocket';

const ChatLayout = () => {
  const { chatRoomId } = useParams();
  const [searchParams] = useSearchParams();
  const targetMessageId = searchParams.get('message');
  const location = useLocation();
  const menuRef = useRef<ChatMenuPanelRef>(null);

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

  const fetchChatRooms = useCallback(() => {
    if (!user) return;
    getChatRoomsByUser(user.userId)
      .then((res) => setDmRooms(res.data))
      .catch((err) => console.error('❌ DM 채팅방 목록 실패:', err));

    getGroupChannelsByUser(user.userId)
      .then((res) => setGroupRooms(res))
      .catch((err) => console.error('❌ 그룹 채팅방 목록 실패:', err));
  }, [user]);

  useEffect(() => {
    if (!chatRoomId || !groupRooms.length) return;
    const roomId = Number(chatRoomId);
    const matchedRoom = groupRooms.find((room) => room.chatRoomId === roomId);
    if (!matchedRoom) return;
    if (activeMenu === 'home' || activeMenu === 'activity') {
      setSelectedRoom({
        id: roomId,
        type: 'group',
        name: matchedRoom.chatRoomName,
        profileImage: matchedRoom.receiverProfileImage || '/default_profile.jpg',
      });
    }
  }, [chatRoomId, groupRooms, targetMessageId]);

  useEffect(() => {
    if (user) {
      fetchChatRooms();

      subscribeToRoomList(user.userId, () => {
        console.log('🔄 채팅방 리스트 WebSocket 갱신 → ChatMenuPanel.refresh() 호출');
        menuRef.current?.refetchChannelRooms();
      });
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
      <Sidebar clearSelectedRoom={() => setSelectedRoom(null)} />

      {activeMenu === 'home' && (
        <ChatMenuPanel
          ref={menuRef}
          currentUserId={user.userId}
          selectedRoomId={selectedRoom?.id}
          onUnreadClear={handleUnreadClear}
        />
      )}
      {activeMenu === 'activity' && <ActivityPanel />}

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
                key={`${selectedRoom.id}`}
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

        {showProfile && (
          <div className="absolute top-0 right-0 w-[400px] h-full z-50 bg-white shadow-lg">
            <ProfilePanel />
          </div>
        )}
      </div>

      {showProfileModal && <ProfileEditModal />}
      {showSettingsModal && <SettingsModal key={user?.userId} />}
    </div>
  );
};

export default ChatLayout;
