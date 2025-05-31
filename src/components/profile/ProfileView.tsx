import UserAvatar from '../common/UserAvatar';

interface ProfileViewProps {
  name: string;
  nickname: string;
  email: string;
  company: string;
  position: string;
  profileImage: string;
  status: 'online' | 'away';
}

const ProfileView = ({
  name,
  nickname,
  email,
  company,
  position,
  profileImage,
  status,
}: ProfileViewProps) => {
  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-4">
        <UserAvatar src={profileImage} size="lg" status={status} />
        <div>
          <p className="text-lg font-semibold">{name}</p>
          <p className="text-sm text-gray-500">@{nickname}</p>
        </div>
      </div>

      <div className="text-sm text-gray-700 space-y-1">
        <p><span className="font-medium">이메일:</span> {email}</p>
        <p><span className="font-medium">회사:</span> {company}</p>
        <p><span className="font-medium">직급:</span> {position}</p>
        <p><span className="font-medium">상태:</span> {status === 'online' ? '온라인' : '자리비움'}</p>
      </div>
    </div>
  );
};

export default ProfileView;
