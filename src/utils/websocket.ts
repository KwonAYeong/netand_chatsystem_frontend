// src/utils/websocket.ts
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

let stompClient: Client;

export const connectWebSocket = (
  chatRoomId: number,
  onMessageReceived: (msg: any) => void
) => {
  stompClient = new Client({
    brokerURL: undefined, // SockJS 사용
    webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
    reconnectDelay: 5000,
    onConnect: () => {
      console.log('🟢 WebSocket Connected');

      stompClient.subscribe(`/topic/chatroom/${chatRoomId}`, (message) => {
        onMessageReceived(JSON.parse(message.body));
      });
    },
    onStompError: (frame) => {
      console.error('STOMP Error', frame);
    },
  });

  stompClient.activate();
};

export const sendWebSocketMessage = (message: any) => {
  if (stompClient && stompClient.connected) {
    stompClient.publish({
      destination: '/app/chat.sendMessage',
      body: JSON.stringify(message),
    });
  } else {
    console.warn('WebSocket 연결되지 않음');
  }
};

export const disconnectWebSocket = () => {
  if (stompClient && stompClient.active) {
    stompClient.deactivate();
    console.log('🔴 WebSocket Disconnected');
  }
};

export const isConnected = () => {
  return stompClient?.connected ?? false;
};
