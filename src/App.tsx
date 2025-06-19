import React, { useEffect, useRef, useState } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from 'react-router-dom';

import { UserProvider, useUser } from './context/UserContext';
import { NotificationSettingsProvider, useNotificationSettings } from './context/NotificationSettingsContext';
import { useSSEWithNotification } from './hooks/useSSEWithNotification';
import { ChatUIProvider } from './context/ChatUIContext';
import ChatRoutes from './routes/chatRoutes';

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
const prevUserIdRef = useRef<number | null>(null);
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
  if (user?.userId !== prevUserIdRef.current) {
    // userId가 바뀐 경우에만 실행
    console.log('✅ userId 변경 감지 → /chat 으로 이동');
    navigate('/chat');
    refreshSettings();

    // prevUserId 업데이트
    prevUserIdRef.current = user?.userId ?? null;
  }
}, [user?.userId, navigate, refreshSettings]);


  //console.log('🔥 AppContent 렌더링 userId:', user?.userId);

  useSSEWithNotification(user?.userId ?? 0, windowIsFocused, navigate);

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/chat" replace />} />
      <Route path="/chat/*" element={<ChatRoutes />} />
    </Routes>
  );
};

export default App;
