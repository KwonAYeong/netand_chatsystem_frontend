import { X } from 'lucide-react';

interface ProfileHeaderProps {
  onClose: () => void;
}

const ProfileHeader = ({ onClose }: ProfileHeaderProps) => {
  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-200">
      <h2 className="text-lg font-semibold">내 프로필</h2>
      <button onClick={onClose}>
        <X size={20} />
      </button>
    </div>
  );
};

export default ProfileHeader;
