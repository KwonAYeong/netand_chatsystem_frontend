// src/components/chat/ProfileIntro.tsx
import React from 'react';
import UserAvatar from '../common/UserAvatar';

interface Props {
  name: string;
  profileUrl?: string;
  chatRoomType: 'dm' | 'group';
}

const ProfileIntro = ({ name, profileUrl, chatRoomType }: Props) => {
  if (chatRoomType === 'group') {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <div className="text-3xl font-bold text-gray-800 mt-32">#{name}</div>
      </div>
    );
  }

  // 기본은 DM
  return (
    <div className="flex flex-col items-center justify-center py-8 bg-white">
      <UserAvatar src={profileUrl || '/default_profile.jpg'} size="lg" />
      <div className="mt-4 text-2xl font-bold text-gray-800">{name}</div>
      <div className="mt-1 text-sm text-gray-500">지금 대화를 시작해보세요</div>
    </div>
  );
};

export default ProfileIntro;
