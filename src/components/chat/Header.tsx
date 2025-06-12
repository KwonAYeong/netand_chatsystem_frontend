// src/components/chat/Header.tsx
import React, { useState } from 'react';
import { SettingsIcon } from "../../icons";
import DMNotificationModal from './DMNotificationModal';

interface HeaderProps {
  chatRoomName: string;
  profileUrl?: string;
  chatRoomId?: number;
}

export default function Header({ chatRoomName, profileUrl, chatRoomId }: HeaderProps) {
  const [showDMNotificationModal, setShowDMNotificationModal] = useState(false);

  return (
    <>
      <div className="flex items-center justify-between px-4 py-2 bg-white shadow-sm">
        <div className="flex items-center space-x-2">
          <img
            src={profileUrl || '/default-profile.png'}
            alt="profile"
            className="w-8 h-8 rounded-full"
          />
          <span className="font-bold">{chatRoomName}</span>
        </div>
        <SettingsIcon
          className="text-xl cursor-pointer"
          onClick={() => {setShowDMNotificationModal(true);}}
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
