// src/context/UserContext.tsx
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
import SockJS from 'sockjs-client';
import { setOnline } from '../lib/websocket';
import { useUserStatusContext } from './UserStatusContext';

interface UserContextValue {
  user: User | null;
  setUser: Dispatch<SetStateAction<User | null>>;
  setUserById: (id: number) => Promise<void>;
  wsConnected: boolean;
}

const UserContext = createContext<UserContextValue>({
  user: null,
  setUser: () => {},
  setUserById: async () => {},
  wsConnected: false,
});

let client: Client | null = null;

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [wsConnected, setWsConnected] = useState(false);
  const { setTargetUserIds } = useUserStatusContext();

  const setUserById = async (id: number) => {
    if (client?.connected) {
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

      // ✅ 새 클라이언트 생성
      client = new Client({
        webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
        connectHeaders: {
          userId: String(formattedUser.userId), // ✅ 서버가 받을 수 있도록 userId 전달
        },
        debug: (msg) => console.log('[STOMP]', msg),
        reconnectDelay: 5000,
        onConnect: () => {
          console.log('✅ WebSocket 연결됨');
          setWsConnected(true);

          if (formattedUser.isActive) {
            setOnline(formattedUser.userId);
            console.log('🟢 ONLINE 상태 전송');
          }
        },
        onDisconnect: () => {
          console.log('🧹 WebSocket 연결 종료됨');
        },
      });

      client.activate(); // ✅ 연결 시작
      console.log('📡 client.connectHeaders:', client.connectHeaders);
    } catch (err) {
      console.error('❌ 유저 정보 불러오기 실패', err);
    }
  };

  // 처음 유저 1번 자동 연결
  useEffect(() => {
    setUserById(1);
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, setUserById, wsConnected }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser(): UserContextValue {
  return useContext(UserContext);
}
