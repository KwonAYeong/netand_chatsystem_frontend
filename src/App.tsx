import React, { useEffect, useState } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from 'react-router-dom';

import Chat from './pages/chat';
import { UserProvider, useUser } from './context/UserContext';
import { NotificationSettingsProvider, useNotificationSettings } from './context/NotificationSettingsContext';
import { useSSEWithNotification } from './hooks/useSSEWithNotification';
import { ChatUIProvider } from './context/ChatUIContext';

const App = () => {
  return (
    <Router>
      <UserProvider>
        <NotificationSettingsProviderWrapper />
      </UserProvider>
    </Router>
  );
};

// 🚩 이게 반드시 있어야 함!
const NotificationSettingsProviderWrapper = () => {
  const { user } = useUser();

  if (!user?.userId) {
    return <div>Loading...</div>;
  }

  return (
    <NotificationSettingsProvider userId={user.userId}>
      <ChatUIProvider>
        <AppContent />
      </ChatUIProvider>
    </NotificationSettingsProvider>
  );
};

const AppContent = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const { refreshSettings } = useNotificationSettings();

  const [windowIsFocused, setWindowIsFocused] = useState(true);

  useEffect(() => {
    const handleFocus = () => setWindowIsFocused(true);
    const handleBlur = () => setWindowIsFocused(false);

    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }, []);

  useEffect(() => {
    if (user?.userId) {
      refreshSettings();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.userId]);

  console.log('🔥 AppContent 렌더링 userId:', user?.userId);

  useSSEWithNotification(user?.userId ?? 0, windowIsFocused, navigate);

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/chat" replace />} />
      <Route path="/chat" element={<Chat />} />
    </Routes>
  );
};

export default App;
