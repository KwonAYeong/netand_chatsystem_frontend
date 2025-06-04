import clsx from 'clsx';

interface UserAvatarProps {
  src: string;
  alt?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isActive?: boolean;
  showIsActive?: boolean;
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
}: UserAvatarProps) => {
  const isActiveColor = isActive ? 'bg-green-500' : 'bg-gray-400';

  return (
    <div className={clsx('relative', sizeMap[size])}>
      <img
        src={src || '/default-avatar.png'}
        alt={alt}
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).src = '/default_profile.jpg';
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