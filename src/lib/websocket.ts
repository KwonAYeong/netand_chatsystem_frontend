import SockJS from 'sockjs-client';
import { Client, IMessage, StompSubscription } from '@stomp/stompjs';

const socket = new SockJS('http://localhost:8080/ws');
const client = new Client({
  webSocketFactory: () => socket,
  reconnectDelay: 5000,
  heartbeatIncoming: 4000,
  heartbeatOutgoing: 4000,
});

let connected = false;
const subscriptions = new Map<string, StompSubscription>();

// 소켓 연결
export const connectSocket = (onConnected?: () => void) => {
  if (connected) return;

  client.onConnect = () => {
    connected = true;
    console.log('✅ WebSocket connected');
    onConnected?.();
  };

  client.onStompError = (frame) => {
    console.error('[❌ STOMP ERROR]', frame.headers['message']);
  };

  client.activate();
};

// 소켓 연결 해제
export const disconnectSocket = () => {
  if (connected) {
    subscriptions.forEach((sub) => sub.unsubscribe());
    subscriptions.clear();
    client.deactivate();
    connected = false;
    console.log('🔌 WebSocket disconnected');
  }
};

// 메시지 전송
export const sendMessage = (destination: string, payload: any) => {
  client.publish({
    destination,
    body: JSON.stringify(payload),
  });
};

// 채팅방 구독
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

    // 메시지는 항상 추가
    onMessage(parsed);

    // 뱃지 로직
    if (parsed.chatRoomId === currentChatRoomId) {
      onUnreadClear(parsed.chatRoomId);
    } else {
      onUnreadIncrease(parsed.chatRoomId);
    }
  });

  subscriptions.set(destination, sub);
  console.log(`📥 Subscribed to ${destination}`);
};

// 채팅방 구독 해제
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
