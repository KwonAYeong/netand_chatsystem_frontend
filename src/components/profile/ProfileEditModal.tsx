// components/profile/ProfileEditModal.tsx
import { useChatUI } from '../../hooks/useChatUI';
import ProfileEditForm from './ProfileEditForm';
import { X } from 'lucide-react';

const ProfileEditModal = () => {
  const { setShowProfileModal } = useChatUI();

  const user = {
    name: '신재윤',
    email: 'jeyoon@example.com',
    company: '카카오',
    rank: '대리',
    profileImageUrl: '',
    isActive: true,
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative">
        {/* 닫기 버튼 */}
        <button
          onClick={() => setShowProfileModal(false)}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X size={20} />
        </button>

        <h2 className="text-lg font-bold mb-4">프로필 편집</h2>
        <ProfileEditForm user={user} onCancel={() => setShowProfileModal(false)} />
      </div>
    </div>
  );
};

export default ProfileEditModal;
