// src/context/ChatUIContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';

// ✅ 1. selectedRoom 타입 확장
type RoomType = 'dm' | 'group';

interface SelectedRoom {
  id: number;
  type: RoomType;
  name: string;
  profileImage?: string;
  unreadMessageCount?: number;
}

interface ChatUIContextType {
  currentChatRoomId: number | null;
  setCurrentChatRoomId: React.Dispatch<React.SetStateAction<number | null>>;

  selectedRoom: SelectedRoom | null;
  setSelectedRoom: React.Dispatch<React.SetStateAction<SelectedRoom | null>>;
}

// ✅ 2. Context 생성
const ChatUIContext = createContext<ChatUIContextType | undefined>(undefined);

// ✅ 3. Provider 정의
export const ChatUIProvider = ({ children }: { children: ReactNode }) => {
  const [currentChatRoomId, setCurrentChatRoomId] = useState<number | null>(null);

  const [selectedRoom, setSelectedRoom] = useState<SelectedRoom | null>(null);

  return (
    <ChatUIContext.Provider
      value={{
        currentChatRoomId,
        setCurrentChatRoomId,
        selectedRoom,
        setSelectedRoom,
      }}
    >
      {children}
    </ChatUIContext.Provider>
  );
};

// ✅ 4. 훅 export
export const useChatUI = () => {
  const context = useContext(ChatUIContext);
  if (context === undefined) {
    throw new Error('useChatUI must be used within a ChatUIProvider');
  }
  return context;
};
