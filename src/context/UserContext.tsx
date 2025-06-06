import React, { createContext, useContext, useState, ReactNode } from 'react';

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
  setUserById: (userId: number) => void; // ✅ 추가됨
}

// 더미 유저 목록 (이걸로 setUserById에서 유저 찾음)
const dummyUsers: User[] = [
  { userId: 1, name: '신재윤', profileImageUrl: '', isActive: true },
  { userId: 2, name: '권아영', profileImageUrl: '', isActive: false },
  { userId: 3, name: '김효민', profileImageUrl: '', isActive: true },
];

// 컨텍스트 초기화
const UserContext = createContext<UserContextValue>({
  user: null,
  setUser: () => {},
  setUserById: () => {},
});

// 프로바이더 컴포넌트
export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(dummyUsers[0]);

  const setUserById = (userId: number) => {
    const found = dummyUsers.find((u) => u.userId === userId);
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
