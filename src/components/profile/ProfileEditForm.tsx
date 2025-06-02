import { useState } from 'react';
import EditableField from './EditableField';
import UserAvatar from '../common/UserAvatar';

interface ProfileEditFormProps {
  user: {
    name: string;
    email: string;
    company: string;
    rank: string;
    profileImage: string;
  };
  onCancel: () => void;
}

const ProfileEditForm = ({ user, onCancel }: ProfileEditFormProps) => {
  const [form, setForm] = useState(user);
  const [previewImage, setPreviewImage] = useState(user.profileImage);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

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

  const handleSubmit = () => {
    console.log('수정된 정보:', form);
    console.log('변경된 프로필 사진:', imageFile); // → 백엔드 연동 필요
    onCancel();
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex flex-col items-center space-y-2">
        <UserAvatar src={previewImage} className="w-32 h-32" showIsActive={false} />
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
      </div>

      <EditableField label="이메일" value={form.email} disabled />
      <EditableField label="이름" value={form.name} onChange={(v) => handleChange('name', v)} />
      <EditableField label="회사" value={form.company} onChange={(v) => handleChange('company', v)} />
      <EditableField label="직급" value={form.rank} onChange={(v) => handleChange('rank', v)} />

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
