// src/context/ChatContext.tsx
import { createContext, useContext, useState } from 'react';

interface ChatContextValue {
  currentRoomId: string | null;
  setCurrentRoomId: (roomId: string | null) => void;
  roomNotificationSettings: Record<string, boolean>; // { roomId: 알림 여부 }
  setRoomNotification: (roomId: string, enabled: boolean) => void;
}

const ChatContext = createContext<ChatContextValue | undefined>(undefined);

export const ChatProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);
  const [roomNotificationSettings, setRoomNotificationSettings] = useState<Record<string, boolean>>({});

  const setRoomNotification = (roomId: string, enabled: boolean) => {
    setRoomNotificationSettings((prev) => ({ ...prev, [roomId]: enabled }));
  };

  return (
    <ChatContext.Provider
      value={{ currentRoomId, setCurrentRoomId, roomNotificationSettings, setRoomNotification }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) throw new Error('useChat must be used within a ChatProvider');
  return context;
};
