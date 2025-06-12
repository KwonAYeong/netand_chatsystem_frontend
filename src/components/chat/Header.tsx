// src/components/chat/Header.tsx
import React from 'react';
import { SettingsIcon } from "../../icons";
import UserAvatar from '../common/UserAvatar';

interface HeaderProps {
  chatRoomName: string;
  profileUrl?: string;
}

export default function Header({ chatRoomName, profileUrl }: HeaderProps) {
  return (
    <div className="flex items-center justify-between px-4 py-2 bg-white shadow-sm">
      <div className="flex items-center space-x-2">
        <UserAvatar
          src={profileUrl || '/default-profile.png'}
          alt={`${chatRoomName} 프로필`}
          size="sm"
        />
        <span className="font-bold">{chatRoomName}</span>
      </div>
      <SettingsIcon className="text-xl cursor-pointer" />
    </div>
  );
}
