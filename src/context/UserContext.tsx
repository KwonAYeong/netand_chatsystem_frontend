// src/context/UserContext.tsx
import { createContext, useContext, useState } from 'react';

type UserisActive = boolean;

interface User {
  id: string;
  email: string;
  profileImageUrl?: string;
  isActive: UserisActive;
}

interface UserContextValue {
  user: User | null;
  setUser: (user: User | null) => void;
  updateisActive: (isActive: UserisActive) => void;
}

const UserContext = createContext<UserContextValue | undefined>(undefined);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  const updateisActive = (isActive: UserisActive) => {
    if (user) setUser({ ...user, isActive });
  };

  return (
    <UserContext.Provider value={{ user, setUser, updateisActive }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser must be used within a UserProvider');
  return context;
};
