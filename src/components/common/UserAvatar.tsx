import clsx from 'clsx';

interface UserAvatarProps {
  src: string;
  alt?: string;
  size?: 'sm' | 'md' | 'lg';
  isActive?: boolean;
  className?: string; 
  showIsActive?: boolean;
}

const sizeMap = {
  sm: 'w-6 h-6',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
};

const UserAvatar = ({
  src,
  alt = 'User Avatar',
  size = 'md',
  isActive = false,
  className,
  showIsActive,
}: UserAvatarProps) => {
  const isActiveColor = isActive ? 'bg-green-500' : 'bg-gray-400';

  return (
    <div className={clsx('relative', sizeMap[size], className)}>
      <img
        src={src || '/default-avatar.png'}
        alt={alt}
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).src = '/default_profile.jpg';
        }}
        className="rounded-md object-cover w-full h-full border border-gray-200"
      />

      {showIsActive !== false && (
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
