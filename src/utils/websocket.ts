// src/hooks/useWebSocket.ts
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useEffect, useRef } from 'react';

const WEBSOCKET_URL = 'http://localhost:8080/ws';

export default function useWebSocket(
  roomId: string,
  onMessage: (message: any) => void,
  activeRoomId: string // ✅ 현재 열려 있는 채팅방 ID 추가
) {
  const clientRef = useRef<Client | null>(null);

  useEffect(() => {
    const socket = new SockJS(WEBSOCKET_URL);
    const client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      onConnect: () => {
        console.log('🟢 WebSocket 연결됨');

        client.subscribe(`/sub/chatroom/${roomId}`, (message) => {
          const payload = JSON.parse(message.body);
          console.log('📩 수신된 메시지:', payload);

          // ✅ 현재 방이 아니면 → onMessage로 넘겨서 뱃지 처리
          if (payload.chatRoomId !== activeRoomId) {
            onMessage(payload);
          } else {
            console.log('👀 현재 열려 있는 채팅방 → 뱃지 무시');
          }
        });
      },
      onStompError: (frame) => {
        console.error('❌ STOMP 오류:', frame);
      },
    });

    client.activate();
    clientRef.current = client;

    return () => {
      client.deactivate();
    };
  }, [roomId, onMessage, activeRoomId]);

  const sendMessage = (message: any) => {
    if (clientRef.current && clientRef.current.connected) {
      clientRef.current.publish({
        destination: '/pub/send',
        body: JSON.stringify(message),
      });
    }
  };

  return { sendMessage };
}
