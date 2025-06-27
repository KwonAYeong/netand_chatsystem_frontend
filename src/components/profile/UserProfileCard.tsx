import { Mail, Building2, BadgeCheck } from 'lucide-react';
import UserAvatar from '../common/UserAvatar';
import UserisActiveBadge from '../common/UserStatusBadge';

interface UserProfileCardProps {
  user: any;
}

const UserProfileCard = ({ user }: UserProfileCardProps) => {
  return (
    <div className="flex flex-col h-full p-6 bg-white">
      <div className="flex flex-col items-center gap-4">
        <UserAvatar
          src={user.profileImageUrl}
          finalStatus={user.status || 'AWAY'}
          size="xl"
        />
        <div className="flex justify-start items-center w-full mt-4 gap-2">
          <p className="text-xl font-bold">{user.name}</p>
          <UserisActiveBadge finalStatus={user.status || 'AWAY'} size={10} withText />
        </div>
      </div>
      <div className="flex-1 mt-6 space-y-4 text-base text-gray-700">
        <div className="flex items-center gap-2">
          <Mail size={16} />
          <span>{user.email}</span>
        </div>
        <div className="flex items-center gap-2">
          <Building2 size={16} />
          <span>{user.company}</span>
        </div>
        <div className="flex items-center gap-2">
          <BadgeCheck size={16} />
          <span>{user.position}</span>
        </div>
      </div>
    </div>
  );
};

export default UserProfileCard;
