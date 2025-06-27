// src/context/UserStatusContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useRef,
} from 'react';
import { subscribeWithRetry, unsubscribeFromStatus } from '../lib/websocket';
import { getUserStatusesByIds } from '../api/profile'; // 상태 조회 API

// 1. 타입 정의
interface UserStatusContextValue {
  userStatuses: Record<number, 'ONLINE' | 'AWAY'>;
  setUserStatuses: React.Dispatch<
    React.SetStateAction<Record<number, 'ONLINE' | 'AWAY'>>
  >;
  subscribeUsers: (userIds: number[]) => void;
  unsubscribeUsers: (userIds: number[]) => void;
  setTargetUserIds: React.Dispatch<React.SetStateAction<number[]>>;
}

// 2. 기본값 생성
const UserStatusContext = createContext<UserStatusContextValue>({
  userStatuses: {},
  setUserStatuses: () => {},
  subscribeUsers: () => {},
  unsubscribeUsers: () => {},
  setTargetUserIds: () => {},
});

// 3. Provider 정의
export const UserStatusProvider = ({ children }: { children: ReactNode }) => {
  const [userStatuses, setUserStatuses] = useState<
    Record<number, 'ONLINE' | 'AWAY'>
  >({});
  const [targetUserIds, setTargetUserIds] = useState<number[]>([]);
  const subscribedUsersRef = useRef<Set<number>>(new Set());

  // ✅ 수신된 상태 저장
  const onStatus = (userId: number, status: 'ONLINE' | 'AWAY') => {
    setUserStatuses((prev) => ({ ...prev, [userId]: status }));
  };

  // ✅ 상태 구독
  const subscribeUsers = (userIds: number[]) => {
    userIds.forEach((id) => {
      if (!subscribedUsersRef.current.has(id)) {
        subscribeWithRetry(id, onStatus);
        subscribedUsersRef.current.add(id);
      }
    });
  };

  // ✅ 상태 구독 해제
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
const fetchedRef = useRef<Set<number>>(new Set());
const retryCountRef = useRef<Map<number, number>>(new Map()); // 👈 시도 횟수 기록

useEffect(() => {
  if (targetUserIds.length === 0) return;

  const newIds = targetUserIds.filter((id) => {
    const alreadyFetched = fetchedRef.current.has(id);
    const retryCount = retryCountRef.current.get(id) || 0;
    return !alreadyFetched && retryCount < 5; // 👈 최대 5번까지만 허용
  });

  if (newIds.length > 0) {
    console.log('🛰 상태 조회 시도:', newIds);

    getUserStatusesByIds(newIds).then((res) => {
      setUserStatuses((prev) => ({ ...prev, ...res }));
      newIds.forEach((id) => {
        fetchedRef.current.add(id); // ✅ 성공 시 기록
      });
    }).catch(() => {
      newIds.forEach((id) => {
        const prevCount = retryCountRef.current.get(id) || 0;
        retryCountRef.current.set(id, prevCount + 1); // ❗실패했을 때만 retry 카운트 증가
        console.warn(`🔁 상태 요청 재시도 예정 [id=${id}] → ${prevCount + 1}회`);
      });
    });
  }

  subscribeUsers(newIds); // 이건 중복 방지 로직 이미 있음
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

// 4. 커스텀 훅으로 context 사용
export const useUserStatusContext = () => useContext(UserStatusContext);
