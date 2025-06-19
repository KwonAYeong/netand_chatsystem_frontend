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
  selectedUser: any | null;
  setSelectedUser: (user: any | null) => void;
}

const ChatUIContext = createContext<ChatUIContextType | null>(null);

export const ChatUIProvider = ({ children }: { children: React.ReactNode }) => {
  const [activeMenu, setActiveMenu] = useState<Menu>('home');
  const [showProfile, setShowProfile] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);

  const value = useMemo(() => ({
    activeMenu,
    setActiveMenu,
    showProfile,
    setShowProfile,
    showProfileModal,
    setShowProfileModal,
    showSettingsModal,
    setShowSettingsModal,
    selectedUser,
    setSelectedUser,
  }), [activeMenu, showProfile, showProfileModal, showSettingsModal, selectedUser]);

  return (
    <ChatUIContext.Provider value={value}>
      {children}
    </ChatUIContext.Provider>
  );
};

export const useChatUI = () => {
  const context = useContext(ChatUIContext);
  if (!context) throw new Error('useChatUI must be used within ChatUIProvider');
  return context;
};