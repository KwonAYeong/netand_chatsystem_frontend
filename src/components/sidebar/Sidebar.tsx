import { MdHome, MdSettings } from 'react-icons/md';
import { FaClipboardList } from 'react-icons/fa6';
import { useChatUI } from '../../hooks/useChatUI';
import ProfileButton from './ProfileButton';
import clsx from 'clsx';
import UserSwitcher from '../common/UserSwitcher';

const Sidebar = () => {
  const { activeMenu, setActiveMenu,setShowSettingsModal } = useChatUI();

  return (
   <aside className="flex flex-col justify-between w-20 bg-white text-black py-4 border-r border-gray-200">
    {/* 상단 메뉴 */}
    <div className="flex flex-col items-center space-y-6 text-2xl">
        <button
        onClick={() => setActiveMenu('home')}
        className="flex flex-col items-center hover:text-gray-600"
        >
        <MdHome className={clsx(activeMenu === 'home' && 'text-gray-800')} />
        <span className="text-xs mt-1">홈</span>
        </button>

        <button
        onClick={() => setActiveMenu('activity')}
        className="flex flex-col items-center hover:text-gray-600"
        >
        <FaClipboardList className={clsx(activeMenu === 'activity' && 'text-gray-800')} />
        <span className="text-xs mt-1">내 활동</span>
        </button>
    </div>

    {/* 하단: 유저 전환 + 설정 + 프로필  */}
      <div className="flex flex-col items-center space-y-6 text-2xl mt-4 relative">
        {/* ✅ 유저 스위처 (설정 위에) */}
        <div className="relative h-6 w-6 mb-2">
          <UserSwitcher />
        </div>

        {/* 설정 버튼 */}
        <button
          onClick={() => setShowSettingsModal(true)}
          className="flex flex-col items-center hover:text-gray-600"
        >
          <MdSettings className="text-gray-800" />
          <span className="text-xs mt-1">설정</span>
        </button>

        {/* 프로필 */}
        <ProfileButton />
      </div>

    </aside>

  );
};

export default Sidebar;
