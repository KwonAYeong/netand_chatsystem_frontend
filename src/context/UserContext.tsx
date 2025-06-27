import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  ReactNode,
  Dispatch,
  SetStateAction,
} from 'react';
import { getUserProfileById } from '../api/profile';
import type { User } from '../types/user';
import { Client } from '@stomp/stompjs';
import { setOnline, waitUntilReady } from '../lib/websocket';
import { useUserStatusContext } from './UserStatusContext';
import client from '../lib/websocket'; // ✅ WebSocket 클라이언트
import { useChatUI } from './ChatUIContext';

interface UserContextValue {
  user: User | null;
  setUser: Dispatch<SetStateAction<User | null>>;
  setUserById: (id: number) => Promise<void>;
  wsConnected: boolean;
  unreadCounts: Record<number, number>; // ✅ 추가
  setUnreadCounts: Dispatch<SetStateAction<Record<number, number>>>; // ✅ 추가
}

const UserContext = createContext<UserContextValue>({
  user: null,
  setUser: () => {},
  setUserById: async () => {},
  wsConnected: false,
  unreadCounts: {},
  setUnreadCounts: () => {},
});

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [wsConnected, setWsConnected] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState<Record<number, number>>({}); // ✅ 상태 추가
  const { setTargetUserIds } = useUserStatusContext();

  const setUserById = async (id: number) => {
    if (client.connected) {
      client.deactivate(); // 기존 연결 해제
    }

    try {
      const data = await getUserProfileById(id);
      const formattedUser: User = {
        userId: data.id,
        name: data.name,
        email: data.email,
        company: data.company,
        position: data.position,
        profileImageUrl: data.profileImageUrl,
        isActive: data.active,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        nickname: data.nickname,
        status: 'AWAY',
      };

      setUser(formattedUser);

      // ✅ WebSocket 새로 연결
      client.connectHeaders = {
        userId: String(formattedUser.userId),
      };

      client.onConnect = () => {
        console.log('✅ WebSocket 연결 완료');
        setWsConnected(true);

        waitUntilReady(() => {
          if (formattedUser.isActive) {
            setOnline(formattedUser.userId);
            console.log('🟢 ONLINE 상태 전송');
          }
        });

        // ✅ /sub/unread/{userId} 구독 추가
        const destination = `/sub/unread/${formattedUser.userId}`;
        const sub = client.subscribe(destination, (message) => {
          try {
            const payload = JSON.parse(message.body);
            const { chatRoomId, unreadMessageCount } = payload;
            console.log('📩 [UNREAD] 메시지 수신:', payload);

            setUnreadCounts((prev) => ({
              ...prev,
              [chatRoomId]: unreadMessageCount,
            }));
          } catch (err) {
            console.error('❌ [UNREAD] 메시지 처리 오류:', err);
          }
        });

        console.log(`📡 [UNREAD] 구독 등록: ${destination}`);
      };

      client.activate();
    } catch (err) {
      console.error('❌ 유저 정보 불러오기 실패:', err);
    }
  };

  // ✅ 초기 연결: 로컬 userId 사용 또는 1번 유저
  useEffect(() => {
    const storedId = localStorage.getItem('userId');
    const userId = storedId ? Number(storedId) : 1;
    setUserById(userId);
  }, []);

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        setUserById,
        wsConnected,
        unreadCounts,       // ✅ 추가
        setUnreadCounts,    // ✅ 추가
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser(): UserContextValue {
  return useContext(UserContext);
}
