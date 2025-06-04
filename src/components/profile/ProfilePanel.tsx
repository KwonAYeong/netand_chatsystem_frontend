import ProfileHeader from './ProfileHeader';
import ProfileCard from './ProfileCard';
import { useChatUI } from '../../hooks/useChatUI';
import { useUser } from '../../context/UserContext'; // ✅ 이거 추가


const ProfilePanel = () => {
  const { setShowProfileModal, setShowProfile } = useChatUI();
  const { user, setUser } = useUser(); // ✅ UserContext에서 유저 정보 사용

  if (!user) return null; // 유저 없으면 아무것도 렌더 안함

  return (
    <aside className="w-96 h-full bg-white border-l border-gray-200 fixed right-0 top-0 shadow-lg flex flex-col z-50">
      <ProfileHeader onClose={() => setShowProfile(false)} />

      <div className="flex-1 overflow-y-auto">
        <ProfileCard
          user={user}
          onisActiveChange={(newIsActive) =>
            setUser({ ...user, isActive: newIsActive })
          }
        />
      </div>

      <div className="p-4 border-t border-gray-100">
        <button
          onClick={() => setShowProfileModal(true)}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          편집
        </button>
      </div>
    </aside>
  );
};

export default ProfilePanel;
