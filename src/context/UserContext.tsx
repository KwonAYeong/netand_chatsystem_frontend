// src/context/UserContext.tsx
import { createContext, useContext, useState } from 'react';

type UserStatus = 'online' | 'away';

interface User {
  id: string;
  nickname: string;
  email: string;
  profileImageUrl?: string;
  status: UserStatus;
}

interface UserContextValue {
  user: User | null;
  setUser: (user: User | null) => void;
  updateStatus: (status: UserStatus) => void;
}

const UserContext = createContext<UserContextValue | undefined>(undefined);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  const updateStatus = (status: UserStatus) => {
    if (user) setUser({ ...user, status });
  };

  return (
    <UserContext.Provider value={{ user, setUser, updateStatus }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser must be used within a UserProvider');
  return context;
};
