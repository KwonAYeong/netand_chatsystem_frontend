// src/components/chat/Header.tsx
import React from 'react';
import { FiSettings } from "react-icons/fi";

interface HeaderProps {
  chatRoomName: string;
  profileUrl?: string;
}

export default function Header({ chatRoomName, profileUrl }: HeaderProps) {
  return (
    <div className="flex items-center justify-between px-4 py-2 bg-white shadow-sm">
      <div className="flex items-center space-x-2">
        <img
          src={profileUrl || '/default-profile.png'}
          alt="profile"
          className="w-8 h-8 rounded-full"
        />
        <span className="font-bold">{chatRoomName}</span>
      </div>
      <FiSettings className="text-xl cursor-pointer" />
    </div>
  );
}
