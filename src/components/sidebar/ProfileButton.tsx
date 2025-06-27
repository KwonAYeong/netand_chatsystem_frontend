import { useChatUI } from '../../hooks/useChatUI';
import { useUser } from '../../context/UserContext';
import UserAvatar from '../common/UserAvatar';

const ProfileButton = () => {
  const { setShowProfile, setSelectedUser } = useChatUI();
  const { user, wsConnected } = useUser();

  return (
    <button
      onClick={() => {
        if (user && user.userId) {
          setSelectedUser(user);
          setShowProfile(true);
        } else {
          console.log('user 데이터가 준비되지 않았습니다.');
        }
      }}
      className="rounded-lg hover:scale-105 transition"
      title="내 프로필"
    >
      <UserAvatar
        src={user?.profileImageUrl || '/default_profile.jpg'}
        size="md"
        isSelf={true}
        isActive={user?.isActive ?? false}
        wsConnected={wsConnected}
        showIsActive={true}
      />
    </button>
  );
};

export default ProfileButton;
