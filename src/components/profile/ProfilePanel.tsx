import ProfileHeader from './ProfileHeader';
import ProfileView from './ProfileView';
import { useChatUI } from '../../hooks/useChatUI'; 

const ProfilePanel = () => {
  const { setShowProfileModal } = useChatUI(); // ✅ 모달 상태 전역에서 불러오기
  const { setShowProfile } = useChatUI();

  

  const user = {
    name: '신재윤',
    nickname: 'jeyoon',
    email: 'jeyoon@example.com',
    company: '카카오',
    position: '대리',
    profileImage: '/avatars/user2.png',
    status: 'online' as const,
  };

  return (
    <aside className="w-96 h-full bg-white border-l border-gray-200 fixed right-0 top-0 shadow-lg flex flex-col z-50">
      <ProfileHeader onClose={() => setShowProfile(false)} />

      <div className="flex-1 overflow-y-auto">
        <ProfileView {...user} />
      </div>

      <div className="p-4 border-t border-gray-100">
        <button
          onClick={() => setShowProfileModal(true)} // ✅ 이 버튼 클릭 시 중앙 모달 띄움
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          편집
        </button>
      </div>
    </aside>
  );
};

export default ProfilePanel;
