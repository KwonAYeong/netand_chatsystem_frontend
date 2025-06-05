import { useEffect, useState } from 'react';
import { useUser } from '../../context/UserContext';
import { useChatUI } from '../../hooks/useChatUI';
import ProfileHeader from './ProfileHeader';
import ProfileCard from './ProfileCard';
import { getUserProfileById, patchUserStatus } from '../../api/profile';

const USE_MOCK = true;

const ProfilePanel = () => {
  const { setShowProfileModal, setShowProfile } = useChatUI();
  const { user } = useUser(); 
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    if (!user?.userId) return;

    const fetchProfile = async () => {
      const data = await getUserProfileById(user.userId); 
      setProfile(data);
    };

    fetchProfile();
  }, [user]);

  const handleStatusChange = async (isActive: boolean) => {
    const newStatus = isActive ? 'online' : 'away';

    if (USE_MOCK) {
      await patchUserStatus(profile.userId, newStatus);
      setProfile((prev: any) => ({ ...prev, isActive }));
    } else {
      try {
        await patchUserStatus(profile.userId, newStatus);
        setProfile((prev: any) => ({ ...prev, isActive }));
      } catch (err) {
        console.error('❌ 상태 변경 실패', err);
      }
    }
  };


  if (!profile) return null;

  return (
    <aside className="w-96 h-full bg-white border-l border-gray-200 fixed right-0 top-0 shadow-lg flex flex-col z-50">
      <ProfileHeader onClose={() => setShowProfile(false)} />

      <div className="flex-1 overflow-y-auto">
        <ProfileCard
          user={profile}
          onisActiveChange={handleStatusChange}
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
