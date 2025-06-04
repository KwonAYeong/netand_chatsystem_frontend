import { useChatUI } from '../../hooks/useChatUI';
import { useUser } from '../../context/UserContext';
import UserAvatar from '../common/UserAvatar';

const ProfileButton = () => {
  const { setShowProfile } = useChatUI();
  const { user } = useUser();

  return (
    <button
      onClick={() => setShowProfile(true)}
      className="rounded-lg hover:scale-105 transition"
      title="내 프로필"
    >
      <UserAvatar
        src={user?.profileImageUrl || ''}
        size="md"
        isActive={user?.isActive}
        showIsActive={true}
      />
    </button>
  );
};

export default ProfileButton;
