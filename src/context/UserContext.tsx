// src/context/UserContext.tsx
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { getUserProfileById } from '../api/profile';

export interface User {
  userId: number;
  name?: string;
  email?: string;
  company?: string;
  position?: string;
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
      });
    } catch (err) {
      console.error('❌ 유저 정보 불러오기 실패', err);
    }
  };

  useEffect(() => {
    setUserById(2);
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
