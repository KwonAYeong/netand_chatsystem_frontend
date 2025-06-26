import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { subscribeWithRetry, unsubscribeFromStatus } from '../lib/websocket';
import { getUserStatusesByIds } from '../api/profile';  // 초기 상태 API

interface UserStatusContextValue {
  userStatuses: Record<number, 'ONLINE' | 'AWAY'>;
  setUserStatuses: React.Dispatch<React.SetStateAction<Record<number, 'ONLINE' | 'AWAY'>>>;
  subscribeUsers: (userIds: number[]) => void;
  unsubscribeUsers: (userIds: number[]) => void;
  setTargetUserIds: React.Dispatch<React.SetStateAction<number[]>>;
}

const UserStatusContext = createContext<UserStatusContextValue>({
  userStatuses: {},
  setUserStatuses: () => {},
  subscribeUsers: () => {},
  unsubscribeUsers: () => {},
  setTargetUserIds: () => {},
});

export const UserStatusProvider = ({ children }: { children: ReactNode }) => {
  const [userStatuses, setUserStatuses] = useState<Record<number, 'ONLINE' | 'AWAY'>>({});
  const subscribedUsersRef = useRef<Set<number>>(new Set());
  const [targetUserIds, setTargetUserIds] = useState<number[]>([]);

  // 상태 변경 콜백
  const onStatus = (userId: number, status: 'ONLINE' | 'AWAY') => {
    setUserStatuses((prev) => ({ ...prev, [userId]: status }));
  };

  // 유저 상태 구독 시작
  const subscribeUsers = (userIds: number[]) => {
    userIds.forEach((id) => {
      if (!subscribedUsersRef.current.has(id)) {
        subscribeWithRetry(id, onStatus);
        subscribedUsersRef.current.add(id);
      }
    });
  };

  // 유저 상태 구독 해제
  const unsubscribeUsers = (userIds: number[]) => {
    userIds.forEach((id) => {
      if (subscribedUsersRef.current.has(id)) {
        unsubscribeFromStatus(id);
        subscribedUsersRef.current.delete(id);
        setUserStatuses((prev) => {
          const copy = { ...prev };
          delete copy[id];
          return copy;
        });
      }
    });
  };

  // 초기 상태 받아오기 및 구독 처리
  useEffect(() => {
    if (targetUserIds.length === 0) return;

    // 1. 유저 상태를 getUserStatusesByIds로 받아오기
    getUserStatusesByIds(targetUserIds).then((statusMap) => {
      setUserStatuses((prev) => ({ ...prev, ...statusMap }));
    });

    // 2. 그 후 구독 시작
    subscribeUsers(targetUserIds);

    // 3. 컴포넌트 언마운트 시 구독 해제
    return () => unsubscribeUsers(targetUserIds);
  }, [targetUserIds]);

  return (
    <UserStatusContext.Provider
      value={{
        userStatuses,
        setUserStatuses,
        subscribeUsers,
        unsubscribeUsers,
        setTargetUserIds,
      }}
    >
      {children}
    </UserStatusContext.Provider>
  );
};

export const useUserStatusContext = () => useContext(UserStatusContext);
