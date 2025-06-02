import { useChatUI } from '../../hooks/useChatUI';
import { Settings } from 'lucide-react';

const SettingsMenu = () => {
  const { setShowSettingsModal } = useChatUI();

  return (
    <button
      onClick={() => setShowSettingsModal(true)}
      className="flex items-center gap-2 text-sm text-gray-700 hover:text-blue-600 p-2"
    >
      <Settings size={16} />
      환경 설정
    </button>
  );
};

export default SettingsMenu;
