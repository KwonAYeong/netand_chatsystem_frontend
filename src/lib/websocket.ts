// src/lib/websocket.ts
import SockJS from 'sockjs-client';
import { Client, IMessage, StompSubscription } from '@stomp/stompjs';

let socket: WebSocket | null = null;

const client = new Client({
  webSocketFactory: () => {
    socket = new SockJS('http://localhost:8080/ws');
    return socket;
  },
  reconnectDelay: 5000,
  heartbeatIncoming: 4000,
  heartbeatOutgoing: 4000,
  debug: (str) => console.debug('[STOMP DEBUG]', str),
});

const subscriptions = new Map<string, StompSubscription>();

export const connectSocket = (onConnected?: () => void) => {
  if (client.connected || client.active) {
    console.log('⚠️ WebSocket 이미 연결됨 또는 연결 시도 중');
    onConnected?.();
    return;
  }

  client.onConnect = () => {
    console.log('✅ WebSocket connected');
    onConnected?.();
  };

  client.onWebSocketClose = () => {
    console.warn('🔌 WebSocket 연결 해제됨');
  };

  client.onStompError = (frame) => {
    console.error('[❌ STOMP ERROR]', frame.headers['message']);
  };

  client.activate();
};

export const disconnectSocket = () => {
  if (client.connected) {
    subscriptions.forEach((sub) => sub.unsubscribe());
    subscriptions.clear();
    client.deactivate();
    console.log('🔌 WebSocket disconnected');
  }
};

export const sendMessage = (payload: any) => {
  if (!client.connected) {
    console.warn('⚠️ WebSocket 아직 연결 안 됨. 메시지 전송 실패');
    return;
  }

  client.publish({
    destination: '/pub/chat.sendMessage',
    body: JSON.stringify(payload),
  });
};

export const subscribeToRoom = (
  chatRoomId: number,
  onMessage: (msg: any) => void,
  onUnreadIncrease: (roomId: number) => void,
  onUnreadClear: (roomId: number) => void,
  currentChatRoomId: number
) => {
  const destination = `/topic/chatroom/${chatRoomId}`;

  if (subscriptions.has(destination)) {
    console.log(`⚠️ Already subscribed to ${destination}`);
    return;
  }

  const sub = client.subscribe(destination, (message: IMessage) => {
    const parsed = JSON.parse(message.body);
    onMessage(parsed);

    if (parsed.chatRoomId === currentChatRoomId) {
      onUnreadClear(parsed.chatRoomId);
    } else {
      onUnreadIncrease(parsed.chatRoomId);
    }
  });

  subscriptions.set(destination, sub);
  console.log(`📥 Subscribed to ${destination}`);
};

export const unsubscribeFromRoom = (chatRoomId: number) => {
  const destination = `/topic/chatroom/${chatRoomId}`;
  const sub = subscriptions.get(destination);

  if (sub) {
    sub.unsubscribe();
    subscriptions.delete(destination);
    console.log(`🗑️ Unsubscribed from ${destination}`);
  }
};

export default client;
