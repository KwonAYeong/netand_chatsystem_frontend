import { useState } from 'react';
import EditableField from './EditableField';
import UserAvatar from '../common/UserAvatar';

interface ProfileEditFormProps {
  user: {
    userId: number;
    name: string;
    email: string;
    company: string;
    position: string;
    profileImageUrl: string;
  };
  onCancel: () => void;
  onSave: (form: any, imageFile: File | null, imageDeleted: boolean) => void;
  onDeleteImage?: () => void;
}

const ProfileEditForm = ({ user, onCancel, onSave, onDeleteImage }: ProfileEditFormProps) => {
  const [form, setForm] = useState(user);
  const [previewImage, setPreviewImage] = useState(user.profileImageUrl);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const isDefaultImage = !previewImage || previewImage.includes('/default_profile.jpg');
  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };
const [imageDeleted, setImageDeleted] = useState(false);
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteImage = () => {
    if (previewImage === '/default_profile.jpg') {
      alert('기본 이미지입니다. 삭제할 수 없습니다.');
      return;
    }
    setPreviewImage('/default_profile.jpg');
    setImageFile(null);
    setImageDeleted(true); 
 
  };

  const handleSubmit = () => {
    console.log('수정된 정보:', form);
    console.log('변경된 프로필 사진:', imageFile);
    onSave(form, imageFile, imageDeleted); // API 처리 포함은 상위 컴포넌트에서
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex flex-col items-center space-y-2">
        <UserAvatar src={previewImage} size="lg" showIsActive={false} />
        <label className="relative inline-block cursor-pointer">
          <input
            type="file"
            accept="image/*"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={handleImageChange}
          />
          <div className="px-4 py-1.5 text-sm font-medium text-white bg-gray-700 rounded hover:bg-gray-800 transition">
            프로필 사진 변경
          </div>
        </label>

        <button
          type="button"
          onClick={handleDeleteImage}
          disabled={isDefaultImage}
          className={`mt-1 text-sm text-red-500 hover:underline ${
            isDefaultImage ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          프로필 사진 삭제
        </button>
      </div>

      <EditableField label="이메일" value={form.email} disabled />
      <EditableField label="이름" value={form.name} onChange={(v) => handleChange('name', v)} />
      <EditableField label="회사" value={form.company} onChange={(v) => handleChange('company', v)} />
      <EditableField label="직급" value={form.position} onChange={(v) => handleChange('position', v)} />

      <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-sm rounded border border-gray-300 hover:bg-gray-100"
        >
          취소
        </button>
        <button
          onClick={handleSubmit}
          className="px-4 py-2 text-sm rounded bg-blue-600 text-white hover:bg-blue-700"
        >
          저장
        </button>
      </div>
    </div>
    
  );
};

export default ProfileEditForm;
