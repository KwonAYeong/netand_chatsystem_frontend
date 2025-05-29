// src/context/SettingContext.tsx
import { createContext, useContext, useState } from 'react';

interface SettingContextValue {
  globalNotificationEnabled: boolean;
  timezone: string;
  toggleGlobalNotification: () => void;
  setTimezone: (tz: string) => void;
}

const SettingContext = createContext<SettingContextValue | undefined>(undefined);

export const SettingProvider = ({ children }: { children: React.ReactNode }) => {
  const [globalNotificationEnabled, setGlobalNotificationEnabled] = useState(true);
  const [timezone, setTimezone] = useState('Asia/Seoul');

  const toggleGlobalNotification = () => {
    setGlobalNotificationEnabled((prev) => !prev);
  };

  return (
    <SettingContext.Provider
      value={{ globalNotificationEnabled, timezone, toggleGlobalNotification, setTimezone }}
    >
      {children}
    </SettingContext.Provider>
  );
};

export const useSetting = () => {
  const context = useContext(SettingContext);
  if (!context) throw new Error('useSetting must be used within a SettingProvider');
  return context;
};
