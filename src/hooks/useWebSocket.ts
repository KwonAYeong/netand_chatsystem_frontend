import { useEffect } from 'react';
import client, {
  subscribeToRoom,
  unsubscribeFromRoom,
  sendMessage,
} from '../lib/websocket';
import { useUser } from '../context/UserContext';
interface Props {
  roomId: number;
  activeRoomId: number;
  onMessage: (msg: any) => void;
  onUnreadIncrease: (roomId: number) => void;
  onUnreadClear: (roomId: number) => void;
  onRoomEvent?: (data: any) => void;
}

const waitUntilConnected = (callback: () => void, retry = 0) => {
  if (client.connected) {
    console.log('✅ STOMP 연결됨 → 콜백 실행');
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
  onRoomEvent
}: Props) {
  const { user } = useUser();
  useEffect(() => {
    if (!user) return;
    waitUntilConnected(() => {
      unsubscribeFromRoom(roomId);
      subscribeToRoom(roomId, onMessage, onUnreadIncrease, onUnreadClear, activeRoomId,user.userId,onRoomEvent);
    });

    return () => {
      unsubscribeFromRoom(roomId);
    };
  }, [roomId, activeRoomId]);

  return {
    sendMessage,
  };
}
