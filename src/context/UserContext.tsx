import React, { createContext, useContext, useState, ReactNode } from 'react';
import { mockStore } from '../mock/mockStore'; // ✅ mockStore 불러오기

// 유저 정보 인터페이스
export interface User {
  userId: number;
  name: string;
  profileImageUrl?: string;
  isActive?: boolean;
}

// 컨텍스트 타입 정의
interface UserContextValue {
  user: User | null;
  setUser: (user: User | null) => void;
  setUserById: (userId: number) => void;
}

// 컨텍스트 초기화
const UserContext = createContext<UserContextValue>({
  user: null,
  setUser: () => {},
  setUserById: () => {},
});

// 프로바이더 컴포넌트
export function UserProvider({ children }: { children: ReactNode }) {
  // 기본 로그인 유저는 mockStore.users[0]
  const [user, setUser] = useState<User | null>(mockStore.users[0]);

  const setUserById = (userId: number) => {
    const found = mockStore.users.find((u) => u.userId === userId);
    if (found) setUser(found);
  };

  return (
    <UserContext.Provider value={{ user, setUser, setUserById }}>
      {children}
    </UserContext.Provider>
  );
}

// 커스텀 훅
export function useUser() {
  return useContext(UserContext);
}
