// src/context/UserContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from 'react';
import { getUserProfileById } from '../api/profile';
import type { User } from '../types/user'; // ✅ 공통 타입으로 통일

interface UserContextValue {
  user: User | null;
  setUser: (user: User | null) => void;
  setUserById: (id: number) => void;
}

const UserContext = createContext<UserContextValue>({
  user: null,
  setUser: () => {},
  setUserById: () => {},
});

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const setUserById = async (id: number) => {
    try {
      const data = await getUserProfileById(id);
      setUser({
        userId: data.id,
        name: data.name,
        email: data.email,
        company: data.company,
        position: data.position,
        profileImageUrl: data.profileImageUrl,
        isActive: data.active,
        createdAt: data.createdAt, // ✅ 추가
        updatedAt: data.updatedAt, // ✅ 추가
        nickname: data.nickname,   // ✅ 핵심 추가
      });
    } catch (err) {
      console.error('❌ 유저 정보 불러오기 실패', err);
    }
  };

  useEffect(() => {
    setUserById(2); // 테스트용 자동 로그인
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, setUserById }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser(): UserContextValue {
  return useContext(UserContext);
}
