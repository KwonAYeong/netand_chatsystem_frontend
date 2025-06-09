import React from 'react';
import { FiSettings } from "react-icons/fi";
const SettingsIcon = FiSettings as unknown as React.FC<React.SVGProps<SVGSVGElement>>;

interface HeaderProps {
  name: string;
  profileUrl?: string;
}

export default function Header({ name, profileUrl }: HeaderProps) {
  return (
    <div className="flex items-center justify-between px-4 py-2 bg-white shadow-sm">
      <div className="flex items-center space-x-2">
        <img
          src={profileUrl || '/profileEX.png'}
          alt="profile"
          className="w-8 h-8 rounded-full border-2 border-purple-500"
        />
        <span className="font-bold">{name}</span>
      </div>
      <SettingsIcon className="text-xl cursor-pointer" />
    </div>
  );
}
