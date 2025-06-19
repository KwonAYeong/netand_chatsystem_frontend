import { useEffect, useState } from 'react';
import { useUser } from '../../context/UserContext';
import { useChatUI } from '../../hooks/useChatUI';
import ProfileHeader from './ProfileHeader';
import ProfileCard from './ProfileCard';
import UserProfileCard from './UserProfileCard';
import { getUserProfileById, patchUserStatus } from '../../api/profile';

const ProfilePanel = () => {
  const { setShowProfile, setShowProfileModal, selectedUser } = useChatUI();
  const { user: currentUser } = useUser();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    if (!selectedUser?.userId) return;

    const fetchProfile = async () => {
      try {
        const data = await getUserProfileById(selectedUser.userId);
        setProfile(data);
      } catch (err) {
        console.error('❌ 프로필 로딩 실패', err);
      }
    };

    fetchProfile();
  }, [selectedUser]);

  const handleStatusChange = async (isActive: boolean) => {
    const newStatus = isActive ? 'online' : 'away';

    try {
      await patchUserStatus(profile.userId, newStatus);
      setProfile((prev: any) => ({ ...prev, isActive }));
    } catch (err) {
      console.error('❌ 상태 변경 실패', err);
    }
  };

  if (!profile) return null;

  const isMe = profile.userId === currentUser?.userId;

  return (
    <aside className="w-96 h-full bg-white border-l border-gray-200 fixed right-0 top-0 shadow-lg flex flex-col z-50">
      <ProfileHeader onClose={() => setShowProfile(false)} />

      <div className="flex-1 overflow-y-auto">
        {isMe ? (
          <ProfileCard user={profile} onisActiveChange={handleStatusChange} />
        ) : (
          <UserProfileCard user={profile} />
        )}
      </div>

      {isMe && (
        <div className="p-4 border-t border-gray-100">
          <button
            onClick={() => setShowProfileModal(true)}
            className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700"
          >
            편집
          </button>
        </div>
      )}
    </aside>
  );
};

export default ProfilePanel;