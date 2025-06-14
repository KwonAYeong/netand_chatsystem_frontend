// src/components/chat/Header.tsx
import React, { useState } from 'react';
import { SettingsIcon } from "../../icons";
import UserAvatar from '../common/UserAvatar';
import DMNotificationModal from './DMNotificationModal';

interface HeaderProps {
  chatRoomName?: string;
  profileUrl?: string;
  chatRoomId?: number;
}

export default function Header({ chatRoomName, profileUrl, chatRoomId }: HeaderProps) {
  const [showDMNotificationModal, setShowDMNotificationModal] = useState(false);

  return (
    <>
      <div className="flex items-center justify-between px-4 py-2 bg-white shadow-sm">
        <div className="flex items-center space-x-2">
          <UserAvatar
            src={profileUrl || '/default-profile.png'}
            alt={`${chatRoomName} 프로필`}
            size="sm"
          />
          <span className="font-bold">{chatRoomName}</span>
        </div>
        <SettingsIcon
          className="text-xl cursor-pointer"
          onClick={() => { setShowDMNotificationModal(true); }}
        />
      </div>

      {/* DM 알림 설정 모달 */}
      {chatRoomId && showDMNotificationModal && (
        <DMNotificationModal
          chatRoomId={chatRoomId}
          onClose={() => setShowDMNotificationModal(false)}
        />
      )}
    </>
  );
}
