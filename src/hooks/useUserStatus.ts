import { useEffect, useRef, useMemo, useCallback } from 'react';
import {
  subscribeToStatus,
  unsubscribeFromStatus,
  default as client,
  connectAndSubscribeUsers,
} from '../lib/websocket';
import { subscribeWithRetry, waitUntilReady } from '../lib/websocket';

export default function useUserStatus(
  userIds: number[],
  onStatusUpdate: (userId: number, status: 'ONLINE' | 'AWAY') => void
) {
  const subscribedRef = useRef<Set<number>>(new Set());

  const stableUserIds = useMemo(
    () => userIds.filter((id): id is number => typeof id === 'number'),
    [userIds.join(',')] // 👉 문자열로 캐싱하면 비교 쉬움
  );

  const stableOnStatusUpdate = useCallback(onStatusUpdate, []);

useEffect(() => {
  connectAndSubscribeUsers(stableUserIds, stableOnStatusUpdate);

  return () => {
    stableUserIds.forEach((id) => {
      unsubscribeFromStatus(id);
    });
  };
}, [stableUserIds, stableOnStatusUpdate]);
}
