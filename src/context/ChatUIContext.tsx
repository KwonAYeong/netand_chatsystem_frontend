import React, { createContext, useContext, useState, ReactNode } from 'react';

// 1️⃣ Context 타입 정의
interface ChatUIContextType {
  currentChatRoomId: number | null;
  setCurrentChatRoomId: React.Dispatch<React.SetStateAction<number | null>>;
}

// 2️⃣ 초기값 null → 타입 명시적으로 설정
const ChatUIContext = createContext<ChatUIContextType | undefined>(undefined);

// 3️⃣ Provider 컴포넌트 정의
export const ChatUIProvider = ({ children }: { children: ReactNode }) => {
  const [currentChatRoomId, setCurrentChatRoomId] = useState<number | null>(null);

  return (
    <ChatUIContext.Provider value={{ currentChatRoomId, setCurrentChatRoomId }}>
      {children}
    </ChatUIContext.Provider>
  );
};

// 4️⃣ Hook으로 제공
export const useChatUI = () => {
  const context = useContext(ChatUIContext);
  if (context === undefined) {
    throw new Error('useChatUI must be used within a ChatUIProvider');
  }
  return context;
};
