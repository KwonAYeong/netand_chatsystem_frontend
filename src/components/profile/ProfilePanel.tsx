import { useEffect, useState } from 'react';
import { useUser } from '../../context/UserContext';
import { useChatUI } from '../../hooks/useChatUI';
import ProfileHeader from './ProfileHeader';
import ProfileCard from './ProfileCard';
import { getUserProfileById } from '../../api/profile'; 

const USE_MOCK = true;

const ProfilePanel = () => {
  const { setShowProfileModal, setShowProfile } = useChatUI();
  const { user } = useUser(); // user.id만 담고 있다고 가정
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    if (!user?.userId) return;
    const fetchProfile = async () => {
      if (USE_MOCK) {
        const data = await getUserProfileById(user.userId); // mock 여부는 내부에서 처리
        setProfile(data);
      } else {
        const data = await getUserProfileById(user.userId); // ✅ 여기 핵심
        setProfile(data);
      }
    };

    fetchProfile();
  }, [user]);

  if (!profile) return null;

  return (
    <aside className="w-96 h-full bg-white border-l border-gray-200 fixed right-0 top-0 shadow-lg flex flex-col z-50">
      <ProfileHeader onClose={() => setShowProfile(false)} />

      <div className="flex-1 overflow-y-auto">
        <ProfileCard
          user={profile}
          onisActiveChange={(isActive) =>
            setProfile({ ...profile, isActive })
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
