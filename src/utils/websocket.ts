// src/hooks/useWebSocket.ts
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useEffect, useRef } from 'react';

const WEBSOCKET_URL = 'http://localhost:8080/ws'; // 로컬 백엔드의 엔드포인트

export default function useWebSocket(roomId: string, onMessage: (message: any) => void) {
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
          onMessage(payload);
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
  }, [roomId, onMessage]);

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
