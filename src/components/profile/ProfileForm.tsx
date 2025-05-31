import { useState } from 'react';
import EditableField from './EditableField';
import StatusToggle from './StatusToggle';

interface ProfileFormProps {
  user: {
    name: string;
    nickname: string;
    email: string;
    company: string;
    position: string;
    profileImage: string;
    status: 'online' | 'away';
  };
  onCancel: () => void;
}

const ProfileForm = ({ user, onCancel }: ProfileFormProps) => {
  const [form, setForm] = useState(user);

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    // TODO: API 연동 또는 context 저장
    console.log('수정된 정보:', form);
    onCancel(); // 저장 후 닫기
  };

  return (
    <div className="p-4 space-y-4">
      <EditableField label="이름" value={form.name} onChange={(v) => handleChange('name', v)} />
      <EditableField label="닉네임" value={form.nickname} onChange={(v) => handleChange('nickname', v)} />
      <EditableField label="이메일" value={form.email} disabled /> {/* 이메일은 수정불가 */}
      <EditableField label="회사" value={form.company} onChange={(v) => handleChange('company', v)} />
      <EditableField label="직급" value={form.position} onChange={(v) => handleChange('position', v)} />
      <StatusToggle value={form.status} onChange={(v) => handleChange('status', v)} />
      
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

export default ProfileForm;
