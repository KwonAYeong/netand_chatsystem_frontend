// src/context/UserContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface User {
  userId: number;
  name?: string;
  profileImageUrl?: string;
  isActive?: boolean;
}

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
  const [user, setUser] = useState<User | null>({ userId: 1 });

  const setUserById = (id: number) => {
    // userId 만 세팅 → 나머지 값은 이후 profile API 호출 시 채우면 됨
    setUser({
      userId: id,
    });
  };

  return (
    <UserContext.Provider value={{ user, setUser, setUserById }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
