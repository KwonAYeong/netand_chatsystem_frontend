// src/components/chat/Header.tsx
import React, { useState } from 'react';
import { SettingsIcon } from '../../icons';
import DMNotificationModal from './DMNotificationModal';

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
  const [showDMNotificationModal, setShowDMNotificationModal] = useState(false);

  return (
    <>
      <div className="flex items-center justify-between px-4 py-2 bg-white shadow-sm">
        {/* 좌측: 채팅방 이름 + 멤버 보기 */}
        <div className="flex items-center space-x-3 font-bold text-base text-gray-800">
          <span># {chatRoomName}</span>

          {/* ✅ 그룹 채팅이면 항상 버튼 표시 */}
          {chatRoomType === 'group' && (
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
            onClick={() => setShowDMNotificationModal(true)}
          />
        )}
      </div>

      {/* 모달: DM일 때만 표시 */}
      {chatRoomType === 'dm' && chatRoomId && showDMNotificationModal && (
        <DMNotificationModal
          chatRoomId={chatRoomId}
          onClose={() => setShowDMNotificationModal(false)}
        />
      )}
    </>
  );
}
