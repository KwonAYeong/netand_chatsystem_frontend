import Sidebar from '../sidebar/Sidebar';
import ChatMenuPanel from '../panel/ChatMenuPanel';
import ActivityPanel from '../activity/ActivityPanel';
import ChatRoom from '../chat/ChatRoom';
import { useChatUI } from '../../hooks/useChatUI';
import ProfilePanel from '../profile/ProfilePanel';
import ProfileEditModal from '../profile/ProfileEditModal';
import SettingsModal from '../settings/SettingsModal';
import { ChatProvider } from '../../context/ChatContext'; // ✅ 추가

const ChatLayout = () => {
  const { showProfile, showProfileModal, showSettingsModal, activeMenu } = useChatUI();

  return (
    <ChatProvider> {/* ✅ 꼭 감싸야 함 */}
      <div className="flex h-screen relative">
        <Sidebar />

        {/* 중앙 패널 */}
        {activeMenu === 'home' && <ChatMenuPanel />}
        {activeMenu === 'activity' && <ActivityPanel />}

        {/* 오른쪽 채팅/모달 패널 */}
        <div className={showProfile ? 'w-1/2 transition-all' : 'flex-1 transition-all'}>
          <ChatRoom />

          {showProfile && (
            <div className="absolute top-0 right-0 w-[400px] h-full z-50">
              <ProfilePanel />
            </div>
          )}
        </div>

        {/* 모달들 */}
        {showProfileModal && <ProfileEditModal />}
        {showSettingsModal && <SettingsModal />}
      </div>
    </ChatProvider>
  );
};

export default ChatLayout;