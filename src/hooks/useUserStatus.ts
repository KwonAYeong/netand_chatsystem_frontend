import { useEffect, useRef } from 'react';
import {
  subscribeToStatus,
  unsubscribeFromStatus,
} from '../lib/websocket';

export default function useUserStatus(
  userIds: number[],
  onStatusUpdate: (userId: number, status: 'ONLINE' | 'AWAY') => void
) {
  const subscribedRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    if (!userIds || userIds.length === 0) return;

    const newIds = userIds.filter((id) => !subscribedRef.current.has(id));
    const removedIds = Array.from(subscribedRef.current).filter(
      (id) => !userIds.includes(id)
    );

    // 새로 추가된 ID 구독
    newIds.forEach((id) => {
      subscribeToStatus(id, onStatusUpdate);
      subscribedRef.current.add(id);
    });

    // 빠진 ID 해제
    removedIds.forEach((id) => {
      unsubscribeFromStatus(id);
      subscribedRef.current.delete(id);
    });

    // cleanup (전체 제거는 안 함)
  }, [userIds, onStatusUpdate]);
}
