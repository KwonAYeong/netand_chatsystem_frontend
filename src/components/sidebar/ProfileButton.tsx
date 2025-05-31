import { useChatUI } from '../../hooks/useChatUI';
import { useUser } from '../../context/UserContext'; // 👈 유저 정보 가져옴

const ProfileButton = () => {
  const { setShowProfile } = useChatUI();
  const { user } = useUser(); // 👈 유저 객체 사용

  return (
    <button
    onClick={() => setShowProfile(true)}
    className="w-10 h-10 rounded-lg overflow-hidden bg-white hover:scale-105 transition"
    title="내 프로필"
    >
      <img
        src={user?.profileImageUrl || '/default_profile.jpg'}
        alt="프로필"
        className="w-full h-full object-cover"
      />
    </button>
  );
};

export default ProfileButton;
