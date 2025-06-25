import React, { useState } from 'react';
import { SettingsIcon } from '../../icons';
import DMNotificationModal from './DMNotificationModal';
import GroupSettingModal from './GroupSettingModal';
import { useChatUI } from '../../context/ChatUIContext';

interface HeaderProps {
  chatRoomName?: string;
  chatRoomId?: number;
  chatRoomType?: 'dm' | 'group';
  profileUrl?: string;
  memberCount?: number;
  onShowMembers?: () => void;
  onInviteClick?: () => void;
}

export default function Header({
  chatRoomName,
  chatRoomId,
  chatRoomType = 'dm',
  profileUrl,
  memberCount = 0,
  onShowMembers,
  onInviteClick,
}: HeaderProps) {
  const [showSettingModal, setShowSettingModal] = useState(false);
  const { selectedRoom, setSelectedRoom, setCurrentChatRoomId } = useChatUI();

  console.log('🧪 Header에서 selectedRoom:', selectedRoom);

  return (
    <>
      <div className="flex items-center justify-between px-4 py-2 bg-white shadow-sm">
        {/* 좌측: 채팅방 이름 or 프로필 */}
        <div className="flex items-center space-x-3 font-bold text-base text-gray-800">
          {selectedRoom?.type === 'dm' ? (
            <div className="flex items-center space-x-2">
              <img
                src={selectedRoom.profileImage || '/default-profile.png'}
                alt={selectedRoom.name}
                className="w-8 h-8 rounded"
              />
              <span className="text-base font-semibold">{selectedRoom.name}</span>
            </div>
          ) : (
            <>
              <span>{`#${selectedRoom?.name ?? '이름 없음'}`}</span>
              <button
                onClick={onShowMembers}
                className="text-sm text-violet-600 hover:underline flex items-center space-x-1"
              >
                <span>👥 {memberCount}</span>
              </button>
            </>
          )}
        </div>

        {/* 우측: 멤버초대 + 설정 */}
        <div className="flex items-center space-x-3">
          {selectedRoom?.type === 'group' && (
            <button
              onClick={onInviteClick}
              className="text-sm text-black-600 hover:underline flex items-center space-x-1"
            >
              <span>멤버 초대</span>
            </button>
          )}
          {chatRoomId && (
            <SettingsIcon
              className="text-xl cursor-pointer"
              onClick={() => setShowSettingModal(true)}
            />
          )}
        </div>
      </div>

      {/* 모달: DM 또는 그룹에 따라 분기 */}
      {chatRoomId && showSettingModal && (
        chatRoomType === 'dm' ? (
          <DMNotificationModal
            chatRoomId={chatRoomId}
            onClose={() => setShowSettingModal(false)}
          />
        ) : (
          <GroupSettingModal
            roomId={chatRoomId}
            onClose={() => setShowSettingModal(false)}
            onLeft={() => {
              setShowSettingModal(false);
              if (selectedRoom?.id === chatRoomId) {
                setSelectedRoom(null);
                setCurrentChatRoomId(null);
              }
            }}
          />
        )
      )}
    </>
  );
}
