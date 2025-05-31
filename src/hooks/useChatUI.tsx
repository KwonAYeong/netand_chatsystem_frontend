// src/hooks/useChatUI.tsx

import { useState, createContext, useContext, useMemo } from 'react';

type Menu = 'home' | 'activity' | 'settings';

interface ChatUIContextType {
  activeMenu: Menu;
  setActiveMenu: (menu: Menu) => void;
  showProfile: boolean;
  setShowProfile: (show: boolean) => void;
  showProfileModal: boolean;
  setShowProfileModal: (show: boolean) => void;
  showSettingsModal: boolean;
  setShowSettingsModal: (v: boolean) => void;

}


// 컨텍스트 생성
const ChatUIContext = createContext<ChatUIContextType | null>(null);

// Provider 컴포넌트
export const ChatUIProvider = ({ children }: { children: React.ReactNode }) => {
  const [activeMenu, setActiveMenu] = useState<Menu>('home');
  const [showProfile, setShowProfile] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);


  const value = useMemo(() => ({
  activeMenu,
  setActiveMenu,
  showProfile,
  setShowProfile,
  showProfileModal,
  setShowProfileModal,
  showSettingsModal,
   setShowSettingsModal,
}), [activeMenu, showProfile, showProfileModal,showSettingsModal]);

  return (
    <ChatUIContext.Provider value={value}>
      {children}
    </ChatUIContext.Provider>
  );
};

// 커스텀 훅
export const useChatUI = () => {
  const context = useContext(ChatUIContext);
  if (!context) throw new Error('useChatUI must be used within ChatUIProvider');
  return context;
};
