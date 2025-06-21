// src/hooks/useWebSocket.ts
import { useEffect, useRef } from 'react';
import {
  connectSocket,
  disconnectSocket,
  subscribeToRoom,
  unsubscribeFromRoom,
  sendMessage,
} from '../lib/websocket';

interface Props {
  roomId: number;
  activeRoomId: number;
  onMessage: (msg: any) => void;
  onUnreadIncrease: (roomId: number) => void;
  onUnreadClear: (roomId: number) => void;
}

export default function useWebSocket({
  roomId,
  activeRoomId,
  onMessage,
  onUnreadIncrease,
  onUnreadClear,
}: Props) {
  const isSubscribedRef = useRef(false);

  // 최초 mount + roomId 변경 시 구독 처리
  useEffect(() => {
    // 1. 연결
    connectSocket(() => {
      if (!isSubscribedRef.current) {
        subscribeToRoom(roomId, onMessage, onUnreadIncrease, onUnreadClear, activeRoomId);
        isSubscribedRef.current = true;
      }
    });

    return () => {
      // 2. 언마운트 시 해제
      unsubscribeFromRoom(roomId);
      isSubscribedRef.current = false;
    };
  }, [roomId, activeRoomId]);

  // 명시적 재연결 또는 외부에서 호출할 수 있도록 반환
  const connectWebSocket = () => {
    connectSocket(() => {
      if (!isSubscribedRef.current) {
        subscribeToRoom(roomId, onMessage, onUnreadIncrease, onUnreadClear, activeRoomId);
        isSubscribedRef.current = true;
      }
    });
  };

  const disconnectWebSocket = () => {
    unsubscribeFromRoom(roomId);
    disconnectSocket();
    isSubscribedRef.current = false;
  };

  return {
    sendMessage,
    connectWebSocket,
    disconnectWebSocket,
  };
}
