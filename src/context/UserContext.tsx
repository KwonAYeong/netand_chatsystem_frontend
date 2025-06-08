// src/context/UserContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { mockUsers } from '../mock/users';

export interface User {
  userId: number;
  name: string;
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

  useEffect(() => {
    console.log('✅ UserProvider 동작');
    console.log('✅ mockUsers:', mockUsers);

    const defaultUser = mockUsers[0];
    console.log('✅ defaultUser:', defaultUser);

    if (defaultUser) {
      setUser({
        userId: defaultUser.user_id,
        name: defaultUser.name,
        profileImageUrl: defaultUser.profile_image_url,
        isActive: defaultUser.is_active,
      });
    }
  }, []);

  const setUserById = (id: number) => {
    const found = mockUsers.find((u) => u.user_id === id);
    if (found) {
      setUser({
        userId: found.user_id,
        name: found.name,
        profileImageUrl: found.profile_image_url,
        isActive: found.is_active,
      });
    }
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