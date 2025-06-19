import clsx from 'clsx';

interface UserAvatarProps {
  src: string;
  alt?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isActive?: boolean;
  showIsActive?: boolean;
  onClick?: () => void;
}

const sizeMap = {
  sm: 'w-6 h-6',
  md: 'w-8 h-8',
  lg: 'w-32 h-32',
  xl: 'w-60 h-60',
};

const UserAvatar = ({
  src,
  alt = 'User Avatar',
  size = 'md',
  isActive = false,
  showIsActive,
  onClick,
}: UserAvatarProps) => {
  const isActiveColor = isActive ? 'bg-green-500' : 'bg-gray-400';
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
            target.onerror = null; // 루프 방지
            target.src = '/default_profile.jpg';
          }
        }}
        className="rounded-md object-cover w-full h-full border border-gray-200"
      />
      {showIsActive && (
        <span
          className={clsx(
            'absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border border-white',
            isActiveColor
          )}
        />
      )}
    </div>
  );
};

export default UserAvatar;
