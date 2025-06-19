// src/components/common/WelcomeScreen.tsx
import React from 'react';
import UserAvatar from './UserAvatar';

interface WelcomeScreenProps {
  userName: string;
  profileImage: string;
}

const WelcomeScreen = ({ userName, profileImage }: WelcomeScreenProps) => {
  return (
    <div className="flex flex-col justify-center items-center h-full bg-gray-100 text-center">
      <div className="text-5xl text-gray-700 mb-4">
        <span className="inline-block">
          💬
        </span>
      </div>

      <div className="flex items-center gap-2 mb-2 text-xl font-semibold text-black">
        <UserAvatar
          src={profileImage || '/default_profile.jpg'}
          alt={`${userName} 프로필`}
          size="md"
        />
        <span>{userName}님 오신 걸 환영합니다</span>
      </div>

      <div className="mt-2 text-sm text-gray-500">
        채팅을 시작해보세요
      </div>
    </div>
  );
};

export default WelcomeScreen;
