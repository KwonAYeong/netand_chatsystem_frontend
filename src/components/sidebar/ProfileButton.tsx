import { useChatUI } from '../../hooks/useChatUI';
import { useUser } from '../../context/UserContext';
import UserAvatar from '../common/UserAvatar';

const ProfileButton = () => {
  const { setShowProfile, setSelectedUser } = useChatUI();
  const { user } = useUser();

  return (
    <button
      onClick={() => {
        setSelectedUser(user);
        setShowProfile(true)
      }}
      className="rounded-lg hover:scale-105 transition"
      title="내 프로필"
    >
      <UserAvatar
        src={user?.profileImageUrl || '/default_profile.jpg'}
        size="md"
        isActive={user?.isActive}
        showIsActive={true}
      />
    </button>
  );
};

export default ProfileButton;
