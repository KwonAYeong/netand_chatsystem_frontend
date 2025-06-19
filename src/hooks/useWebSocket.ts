import { useEffect, useRef } from 'react';
import { updateLastReadMessage } from '../api/chat';
import { useUser } from '../context/UserContext';
import client from '../lib/websocket';
import type { IMessage, StompSubscription } from '@stomp/stompjs';

export default function useWebSocket(
  roomId: string,
  onMessage: (message: any) => void,
  activeRoomId: string,
  refetchChatRooms?: () => void
) {
  const { user } = useUser();
  const subscriptionRef = useRef<StompSubscription | null>(null);
  const lastReadMessageIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!user) return;
    const destination = `/sub/chatroom/${roomId}`;

    const subscribeToRoom = () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }

      subscriptionRef.current = client.subscribe(destination, async (message: IMessage) => {
        const payload = JSON.parse(message.body);
        console.log(`📩 수신된 메시지 from ${destination}:`, payload);
        onMessage(payload);

        const isMine = payload.senderId === user.userId;
        const isCurrentRoom = payload.chatRoomId === Number(activeRoomId);

        if (!isMine && isCurrentRoom) {
          try {
            if (!lastReadMessageIdRef.current || payload.id > lastReadMessageIdRef.current) {
              lastReadMessageIdRef.current = payload.id;
              await updateLastReadMessage(payload.chatRoomId, user.userId, payload.id);
              refetchChatRooms?.(); // 뱃지 UI 갱신
            }
          } catch (error) {
            console.error('❌ 읽음 처리 실패:', error);
          }
        }
      });

      console.log(`🧩 WebSocket 구독됨: ${destination}`);
    };

    if (client.connected) {
      subscribeToRoom();
    } else {
      client.onConnect = () => {
        console.log('✅ WebSocket 연결됨 (onConnect)');
        subscribeToRoom();
      };

      if (!client.active) {
        client.activate();
      }
    }

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        console.log(`🧹 WebSocket 구독 해제됨: ${destination}`);
      }
    };
  }, [roomId, user, onMessage, activeRoomId, refetchChatRooms]);

  const sendMessage = (message: any) => {
    if (client.connected) {
      const destination =
        message.messageType === 'FILE'
          ? '/pub/chat.sendFile'
          : '/pub/chat.sendMessage';

      console.log(`📡 메시지 전송 (${destination}):`, message);
      client.publish({
        destination,
        body: JSON.stringify(message),
      });
    } else {
      console.warn(`⚠️ WebSocket 연결 안 됨 → 메시지 전송 실패`);
    }
  };

  return { sendMessage };
}
