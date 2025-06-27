import { useEffect, useRef } from 'react';
import client, {
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

// ✅ WebSocket 연결 대기 함수
const waitUntilConnected = (callback: () => void, retry = 0) => {
  const isConnected = client.connected;
  const isSocketReady = !!(client as any)._connection;

  if (isConnected && isSocketReady) {
    callback();
    return;
  }

  if (retry > 50) {
    console.warn('❌ WebSocket 구독 실패: 연결 안 됨');
    return;
  }

  setTimeout(() => waitUntilConnected(callback, retry + 1), 100);
};

export default function useWebSocket({
  roomId,
  activeRoomId,
  onMessage,
  onUnreadIncrease,
  onUnreadClear,
}: Props) {
  const isSubscribedRef = useRef(false);

  useEffect(() => {
    waitUntilConnected(() => {
      if (!isSubscribedRef.current) {
        subscribeToRoom(roomId, onMessage, onUnreadIncrease, onUnreadClear, activeRoomId);
        isSubscribedRef.current = true;
      }
    });

    return () => {
      unsubscribeFromRoom(roomId);
      isSubscribedRef.current = false;
    };
  }, [roomId, activeRoomId]);

  return {
    sendMessage,
  };
}
