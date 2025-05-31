import React from 'react';
import clsx from 'clsx';

interface UserAvatarProps {
  src: string;
  alt?: string;
  size?: 'sm' | 'md' | 'lg';
  status?: 'online' | 'away' | 'offline';
}

const sizeMap = {
  sm: 'w-6 h-6',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
};

const statusColorMap = {
  online: 'bg-green-500',
  away: 'bg-yellow-400',
  offline: 'bg-gray-400',
};

const UserAvatar = ({
  src,
  alt = 'User Avatar',
  size = 'md',
  status = 'online',
}: UserAvatarProps) => {
  return (
    <div className={clsx('relative', sizeMap[size])}>
      <img
        src={src || '/default-avatar.png'}
        alt={alt}
        onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = '/default_profile.jpg';
        }}
        className="rounded-full object-cover w-full h-full border border-gray-200"
        />

      {status && (
        <span
          className={clsx(
            'absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border border-white',
            statusColorMap[status]
          )}
        />
      )}
    </div>
  );
};

export default UserAvatar;
