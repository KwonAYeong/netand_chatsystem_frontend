import ProfileHeader from './ProfileHeader';
import ProfileCard from './ProfileCard';
import { useChatUI } from '../../hooks/useChatUI'; 
import { useState } from 'react';

const ProfilePanel = () => {
  const { setShowProfileModal, setShowProfile } = useChatUI();
  const [user, setUser] = useState({
    name: '신재윤',
    email: 'jeyoon@example.com',
    company: '카카오',
    rank: '대리',
    profileImage: '/avatars/user2.png',
    isActive: true,
  });

  return (
    <aside className="w-96 h-full bg-white border-l border-gray-200 fixed right-0 top-0 shadow-lg flex flex-col z-50">
      <ProfileHeader onClose={() => setShowProfile(false)} />

      <div className="flex-1 overflow-y-auto">
        <ProfileCard
          user={user}
          onisActiveChange={(newisActive) => setUser((prev) => ({ ...prev, isActive: newisActive }))}
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
