import { useChatUI } from '../../hooks/useChatUI';
import { useUser } from '../../context/UserContext';
import {
  getUserProfileById,
  updateUserProfileInfo,
  deleteUserProfileImage,
  uploadUserProfileImage,
} from '../../api/profile';
import ProfileEditForm from './ProfileEditForm';
import { X } from 'lucide-react';
import { useEffect, useState } from 'react';

const ProfileEditModal = () => {
  const { setShowProfileModal } = useChatUI();
  const { user, setUser } = useUser();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    if (!user?.userId) return;
  console.log('🧩 useEffect 실행됨 - userId:', user.userId);
    const fetchProfile = async () => {
      const data = await getUserProfileById(user.userId);
      console.log('📦 프로필 받아옴:', data);
      setProfile(data);
    };

    fetchProfile();
  
  }, [user?.userId]);

  if (!user || !user.userId) return null;

  const handleSave = async (form: any, imageFile: File | null,imageDeleted: boolean) => {
    try {
      await updateUserProfileInfo(user.userId, {
        name: form.name,
        company: form.company,
        position: form.position,
      });

      if (imageDeleted) {
      await deleteUserProfileImage(user.userId); 
    } else if (imageFile) {
      await uploadUserProfileImage(user.userId, imageFile);
    }
      const updated = await getUserProfileById(user.userId);
      setUser({ ...updated, userId: updated.id });
      setProfile(updated);
      alert('프로필이 저장되었습니다!');
      setShowProfileModal(false);
    } catch (err) {
      console.error('업데이트 실패:', err);
      alert('저장 실패');
    }
  };

  const handleDeleteImage = async () => {
    try {
      await deleteUserProfileImage(user.userId);
      alert('프로필 이미지가 삭제되었습니다.');
    } catch (err) {
      console.error('삭제 실패:', err);
      alert('삭제 실패');
    }
  };

  if (!profile) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative">
        <button
          onClick={() => setShowProfileModal(false)}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X size={20} />
        </button>

        <h2 className="text-lg font-bold mb-4">프로필 편집</h2>
        <ProfileEditForm
          user={profile}
          onCancel={() => setShowProfileModal(false)}
          onSave={handleSave}
          onDeleteImage={handleDeleteImage}
        />
      </div>
    </div>
  );
};

export default ProfileEditModal;
