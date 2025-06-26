import { Mail, Building2, BadgeCheck } from 'lucide-react';
import UserAvatar from '../common/UserAvatar';
import UserisActiveBadge from '../common/UserStatusBadge';
import IsActiveToggle from './IsActiveToggle';
import { setOnline, setAway } from '../../lib/websocket'; // ✅ 상태 전송 함수
import type { User } from '../../types/user';
import { useUser } from '../../context/UserContext';
interface ProfileCardProps {
  user: User;
  onIsActiveChange: (isActive: boolean) => void;
}

const ProfileCard = ({ user, onIsActiveChange }: ProfileCardProps) => {
  const { wsConnected } = useUser(); 
  console.log('👤 내 상태', {
  isActive: user.isActive,
  wsConnected,
  최종: user.isActive && wsConnected,
});
  const handleIsActiveChange = (value: boolean) => {
    onIsActiveChange(value);
  };

  return (
    <div className="flex flex-col h-full p-6 bg-white">
      {/* 상단 아바타 */}
      <div className="flex flex-col items-center gap-4">
        <UserAvatar
          src={user.profileImageUrl}
          finalStatus={user.isActive && wsConnected ? 'ONLINE' : 'AWAY'}
          size="xl"
        />

        {/* 이름 + 상태설정 */}
        <div className="flex justify-between items-center w-full mt-4">
          <div className="flex items-center gap-2">
            <p className="text-xl font-bold">{user.name}</p>
            <UserisActiveBadge
              isSelf
              isActive={user.isActive}
              wsConnected={wsConnected}
              size={10}
              withText
            />
          </div>

          <IsActiveToggle
            isActive={user.isActive}
            onChange={handleIsActiveChange}
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
