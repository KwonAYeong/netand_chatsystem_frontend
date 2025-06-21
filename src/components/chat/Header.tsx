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
}

export default function Header({
  chatRoomName,
  chatRoomId,
  chatRoomType = 'dm',
  memberCount = 0, // ✅ 기본값 0으로 설정
  onShowMembers,
}: HeaderProps) {
  const [showSettingModal, setShowSettingModal] = useState(false);  
  const { selectedRoom, setSelectedRoom, setCurrentChatRoomId } = useChatUI();
  console.log('🧪 Header에서 selectedRoom:', selectedRoom);
  return (
    <>
      <div className="flex items-center justify-between px-4 py-2 bg-white shadow-sm">
        {/* 좌측: 채팅방 이름 + 멤버 보기 */}
        <div className="flex items-center space-x-3 font-bold text-base text-gray-800">
          <span>{`#${selectedRoom?.name ?? '이름 없음'}`}</span>

          {/* ✅ 그룹 채팅이면 항상 버튼 표시 */}
          {selectedRoom?.type === 'group' && (
            <button
              onClick={onShowMembers}
              className="text-sm text-violet-600 hover:underline flex items-center space-x-1"
            >
              <span>👥 {memberCount}</span>
            </button>
          )}
        </div>

        {/* 우측: 설정 버튼 */}
        {chatRoomId && (
          <SettingsIcon
            className="text-xl cursor-pointer"
            onClick={() => setShowSettingModal(true)}
          />
        )}
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
              // TODO: 나가기 후 처리 (채팅방 닫기 등)
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
