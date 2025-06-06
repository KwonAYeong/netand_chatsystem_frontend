import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ChatContextValue {
  currentRoomId: string | null;
  currentRoomName: string | null;
  setCurrentRoomId: (id: string) => void;
  setCurrentRoomName: (name: string) => void;
}

const ChatContext = createContext<ChatContextValue>({
  currentRoomId: null,
  currentRoomName: null,
  setCurrentRoomId: () => {},
  setCurrentRoomName: () => {},
});

export function ChatProvider({ children }: { children: ReactNode }) {
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);
  const [currentRoomName, setCurrentRoomName] = useState<string | null>(null);

  return (
    <ChatContext.Provider
      value={{ currentRoomId, currentRoomName, setCurrentRoomId, setCurrentRoomName }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  return useContext(ChatContext);
}
