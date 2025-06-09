import { Mail, Building2, BadgeCheck } from 'lucide-react';
import UserAvatar from '../common/UserAvatar';
import UserisActiveBadge from '../common/UserStatusBadge';
import IsActiveToggle from './IsActiveToggle';

interface User {
  name: string;
  email: string;
  company: string;
  position: string;
  profileImageUrl: string;
  isActive: boolean;
}

interface ProfileCardProps {
  user: User;
  onisActiveChange: (isActive: boolean) => void;
}

const ProfileCard = ({ user, onisActiveChange }: ProfileCardProps) => {
  return (
    <div className="flex flex-col h-full p-6 bg-white">
      {/* 상단 아바타 */}
      <div className="flex flex-col items-center gap-4">
        <UserAvatar
          src={user.profileImageUrl}
          isActive={user.isActive}
          size="xl"
          showIsActive={false}
        />

        {/* 이름 + 상태설정 */}
        <div className="flex justify-between items-center w-full mt-4">
          <div className="flex items-center gap-2">
            <p className="text-xl font-bold">{user.name}</p>
            <UserisActiveBadge isActive={user.isActive} size={10} withText />
          </div>

          {/* ✅ 상태 토글 버튼 (디자인 유지) */}
          <IsActiveToggle
            isActive={user.isActive}
            onChange={onisActiveChange}
            compact
          />
        </div>
      </div>

      {/* 이메일, 회사, 직급 */}
      <div className="flex-1 mt-6 space-y-4 text-sm text-gray-700">
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

export default ProfileCard;
