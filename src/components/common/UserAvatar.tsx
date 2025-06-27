import clsx from 'clsx';
import UserisActiveBadge from './UserStatusBadge';

interface UserAvatarProps {
  src: string;
  alt?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  finalStatus?: 'ONLINE' | 'AWAY';
  showIsActive?: boolean;
  onClick?: () => void;
  isSelf?: boolean;
  isActive?: boolean;
  wsConnected?: boolean;
}

const sizeMap = {
  sm: 'w-6 h-6',
  md: 'w-8 h-8',
  lg: 'w-32 h-32',
  xl: 'w-60 h-60',
};

const badgeSizeMap = {
  sm: 8,
  md: 10,
  lg: 14,
  xl: 18,
};

const UserAvatar = ({
  src,
  alt = 'User Avatar',
  size = 'md',
  finalStatus,
  showIsActive,
  onClick,
  isSelf = false,
  isActive = false,
  wsConnected = false,
}: UserAvatarProps) => {
  const finalSrc = src?.trim() ? src : '/default_profile.jpg';

  return (
    <div
      className={clsx('relative', sizeMap[size], onClick && 'cursor-pointer')}
      onClick={onClick}
    >
      <img
        src={finalSrc}
        alt={alt}
        onError={(e) => {
          const target = e.currentTarget as HTMLImageElement;
          if (target.src !== window.location.origin + '/default_profile.jpg') {
            target.onerror = null;
            target.src = '/default_profile.jpg';
          }
        }}
        className="rounded-md object-cover w-full h-full border border-gray-200"
      />
      {showIsActive && (
        <div className="absolute bottom-0 right-0">
          <UserisActiveBadge
            isSelf={isSelf}
            isActive={isActive}
            finalStatus={finalStatus}
            wsConnected={wsConnected}
            size={badgeSizeMap[size]}
            withText={false}
          />
        </div>
      )}
    </div>
  );
};

export default UserAvatar;
