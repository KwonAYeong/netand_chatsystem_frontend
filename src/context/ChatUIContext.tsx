import React, { createContext, useContext, useState, ReactNode } from 'react';

// ✅ 1. 타입 정의
type RoomType = 'dm' | 'group';

interface SelectedRoom {
  id: number;
  type: RoomType;
  name: string;
  profileImage?: string;
  unreadMessageCount?: number;
}

interface ChatRoomMeta {
  id: number;
  name: string;
  type: RoomType;
}

interface ChatUIContextType {
  currentChatRoomId: number | null;
  setCurrentChatRoomId: React.Dispatch<React.SetStateAction<number | null>>;

  selectedRoom: SelectedRoom | null;
  setSelectedRoom: React.Dispatch<React.SetStateAction<SelectedRoom | null>>;

  chatRooms: ChatRoomMeta[];
  setChatRooms: React.Dispatch<React.SetStateAction<ChatRoomMeta[]>>;

  // ✅ 추가된 상태들
  selectedUser: { userId: number } | null;
  setSelectedUser: React.Dispatch<React.SetStateAction<{ userId: number } | null>>;

  showProfile: boolean;
  setShowProfile: React.Dispatch<React.SetStateAction<boolean>>;
}

// ✅ 2. Context 생성
const ChatUIContext = createContext<ChatUIContextType | undefined>(undefined);

// ✅ 3. Provider 컴포넌트
export const ChatUIProvider = ({ children }: { children: ReactNode }) => {
  const [currentChatRoomId, setCurrentChatRoomId] = useState<number | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<SelectedRoom | null>(null);
  const [chatRooms, setChatRooms] = useState<ChatRoomMeta[]>([]);

  // ✅ 추가된 상태들
  const [selectedUser, setSelectedUser] = useState<{ userId: number } | null>(null);
  const [showProfile, setShowProfile] = useState<boolean>(false);

  return (
    <ChatUIContext.Provider
      value={{
        currentChatRoomId,
        setCurrentChatRoomId,
        selectedRoom,
        setSelectedRoom,
        chatRooms,
        setChatRooms,
        selectedUser,
        setSelectedUser,
        showProfile,
        setShowProfile,
      }}
    >
      {children}
    </ChatUIContext.Provider>
  );
};

// ✅ 4. useChatUI 훅
export const useChatUI = () => {
  const context = useContext(ChatUIContext);
  if (context === undefined) {
    throw new Error('useChatUI must be used within a ChatUIProvider');
  }
  return context;
};
