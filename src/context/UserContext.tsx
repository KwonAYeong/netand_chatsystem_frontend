import { createContext, useContext, useState } from 'react';
import { mockStore } from '../mock/mockStore';
import { User } from '../types/user';

interface UserContextValue {
  user: User | null;
  setUser: (user: User | null) => void;
  setUserById: (userId: number) => void;
  updateIsActive: (isActive: boolean) => void;
}

const UserContext = createContext<UserContextValue | undefined>(undefined);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(mockStore.users[0]);

  const setUserById = (userId: number) => {
    const found = mockStore.users.find((u: { userId: number; }) => u.userId === userId);
    if (found) setUser(found);
  };

  const updateIsActive = (isActive: boolean) => {
    if (user) setUser({ ...user, isActive });
  };

  return (
    <UserContext.Provider value={{ user, setUser, setUserById, updateIsActive }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error('UserProvider 안에서만 useUser를 사용할 수 있습니다.');
  return context;
};
