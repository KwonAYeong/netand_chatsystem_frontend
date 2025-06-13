import React, { createContext, useCallback, useContext, useState } from 'react';
import { getNotificationSettingsForContext } from '../api/settings';
import { NotificationSettings } from '../types/notification';

interface NotificationSettingsContextValue {
  notificationSettings: NotificationSettings | null;
  refreshSettings: () => void;  // 필요 시 수동으로 호출할 수 있게 남겨둠
}

const NotificationSettingsContext = createContext<NotificationSettingsContextValue | undefined>(undefined);

export const NotificationSettingsProvider = ({ userId, children }: { userId: number; children: React.ReactNode }) => {
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings | null>(null);

  const refreshSettings = useCallback(async () => {
    try {
      const settings = await getNotificationSettingsForContext(userId);
      setNotificationSettings(settings);
      console.log('✅ 알림 설정 갱신됨:', settings);
    } catch (error) {
      console.error('❌ 알림 설정 불러오기 실패:', error);
    }
  }, [userId]);

 
  return (
    <NotificationSettingsContext.Provider value={{ notificationSettings, refreshSettings }}>
      {children}
    </NotificationSettingsContext.Provider>
  );
};

export const useNotificationSettings = () => {
  const context = useContext(NotificationSettingsContext);
  if (!context) throw new Error('useNotificationSettings must be used within NotificationSettingsProvider');
  return context;
};
