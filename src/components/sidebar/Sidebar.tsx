// src/components/sidebar/Sidebar.tsx
import { HomeIcon, SettingsIcon, ClipboardListIcon } from '../../icons';
import { useChatUI } from '../../hooks/useChatUI';
import ProfileButton from './ProfileButton';
import clsx from 'clsx';
import UserSwitcher from '../common/UserSwitcher';

interface SidebarProps {
  clearSelectedRoom: () => void;
}

const Sidebar = ({ clearSelectedRoom }: SidebarProps) => {
  const { activeMenu, setActiveMenu, setShowSettingsModal } = useChatUI();

  return (
    <aside className="flex flex-col justify-between w-20 bg-white text-black py-4 border-r border-gray-200">
      {/* 상단 메뉴 */}
      <div className="flex flex-col items-center space-y-6 text-2xl">
        <button
          onClick={() => {
            setActiveMenu('home');
            clearSelectedRoom(); // ✅ 채팅방 선택 해제
          }}
          className="flex flex-col items-center hover:text-gray-600"
        >
          <HomeIcon className={clsx(activeMenu === 'home' && 'text-gray-800')} />
          <span className="text-xs mt-1 font-bold">홈</span>
        </button>

        <button
          onClick={() => setActiveMenu('activity')}
          className="flex flex-col items-center hover:text-gray-600"
        >
          <ClipboardListIcon className={clsx(activeMenu === 'activity' && 'text-gray-800')} />
          <span className="text-xs mt-1 font-bold">내 활동</span>
        </button>
      </div>

      {/* 하단 메뉴 */}
      <div className="flex flex-col items-center space-y-6 text-2xl mt-4 relative">
        <div className="relative h-6 w-6 mb-2">
          <UserSwitcher />
        </div>

        <button
          onClick={() => setShowSettingsModal(true)}
          className="flex flex-col items-center hover:text-gray-600"
        >
          <SettingsIcon className="text-gray-800" />
          <span className="text-xs mt-1 font-bold">설정</span>
        </button>

        <ProfileButton />
      </div>
    </aside>
  );
};

export default Sidebar;
