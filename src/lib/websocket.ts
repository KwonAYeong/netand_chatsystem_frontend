// src/lib/websocket.ts
import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import type { RefObject } from 'react';

const client = new Client({
  webSocketFactory: () => {
    // return new WebSocket('ws://localhost:8080/ws');
    return new WebSocket('ws://3.39.8.219:8080/ws');
  },
  reconnectDelay: 5000,
  heartbeatIncoming: 4000,
  heartbeatOutgoing: 4000,
  debug: (str) => console.debug('[STOMP DEBUG]', str),
});

const subscriptions = new Map<string, StompSubscription>();

export const connectSocket = (onConnected?: () => void, userId?: number) => {

  if (client.connected || client.active) {
    console.log('⚠️ WebSocket 이미 연결됨 또는 연결 시도 중');
    onConnected?.();
    return;
  }
  client.connectHeaders = {
      userId: userId ? String(userId) : '',
  };

  client.onConnect = () => {
    console.log('✅ WebSocket 연결 완료 (client.onConnect)');
    onConnected?.();
  };

  client.onStompError = (frame) => {
    console.error('❌ STOMP 에러:', frame);
  };
client.debug = (str) => {
  console.log('%c[STOMP]', 'color: purple', str);
};
  client.activate();
};

export const disconnectSocket = () => {
   console.log('브라우저 종료 - disconnectSocket 호출됨')
  if (client.connected) {
    console.log('🔌 disconnectSocket: WebSocket 연결 종료 요청');
    subscriptions.forEach((sub) => sub.unsubscribe());
    subscriptions.clear();
    client.deactivate();
    console.log('🔌 disconnectSocket: 연결 종료 요청 완료');
  } else {
    console.log('⚠️ disconnectSocket: WebSocket이 이미 연결되지 않음');
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

export const unsubscribeFromRoom = (chatRoomId: number) => {
  const destination = `/sub/chatroom/${chatRoomId}`;
  const sub = subscriptions.get(destination);

  if (sub) {
    sub.unsubscribe();
    subscriptions.delete(destination);
    console.log(`🗑️ Unsubscribed from ${destination}`);
  }
};
export const waitUntilReady = (callback: () => void, retry = 0) => {
  if (client.connected) {
    console.log('✅ WebSocket 연결됨 → 콜백 실행');
    callback();
    return;
  }

  if (retry >= 50) {
    console.warn('❌ WebSocket 연결 준비 실패 (타임아웃)');
    return;
  }

  setTimeout(() => waitUntilReady(callback, retry + 1), 100);
};

export const subscribeToStatus = (
  userId: number,
  onStatus: (userId: number, status: 'ONLINE' | 'AWAY') => void
) => {
  const destination = `/sub/status/${userId}`;
  console.log(`📡 상태 구독 시도: ${destination}`);

  try {
    const sub = client.subscribe(
      destination,
      (message) => {
        try {
          const status = message.body as 'ONLINE' | 'AWAY';
          console.log(`📥 상태 수신됨 [userId=${userId}] → ${status}`);
          onStatus(userId, status);
        } catch (err) {
          console.error(`❌ 메시지 처리 중 오류 [${destination}]`, err);
        }
      },
      { id: destination } // 👈 중복 방지를 위한 ID 명시
    );

    subscriptions.set(destination, sub);
    console.log(`✅ subscribe() 등록 완료: ${destination}`);
  } catch (err) {
    console.error(`❌ subscribeToStatus() 실패 [${destination}]`, err);
  }
};



export const unsubscribeFromStatus = (userId: number) => {
  const destination = `/sub/status/${userId}`;
  const sub = subscriptions.get(destination);
  if (sub) {
    sub.unsubscribe();
    subscriptions.delete(destination);
    console.log(`📴 상태 구독 해제: ${destination}`);
  }
};
export const setOnline = (userId: number) => {
  if (!client.connected) {
    console.warn('⚠️ WebSocket 연결 안 됨 - ONLINE 전송 실패');
    return;
  }
  console.log('📡 setOnline 전송');
  client.publish({
    destination: '/pub/status/online',
    headers: { userId: String(userId) }, // 여기에 userId 헤더 추가
    body: '',
  });
};

export const setAway = (userId: number) => {
  if (!client.connected) {
    console.warn('⚠️ WebSocket 연결 안 됨 - AWAY 전송 실패');
    return;
  }
  console.log('📡 setAway 전송');
  client.publish({
    destination: '/pub/status/away',
    headers: { userId: String(userId) }, // 여기도 userId 헤더 추가
    body: '',
  });
};
export const resetStatusSubscriptions = () => {
  Array.from(subscriptions.keys()).forEach((key) => {
    if (key.startsWith('/sub/status/')) {
      subscriptions.get(key)?.unsubscribe();
      subscriptions.delete(key);
    }
  });
  console.log('♻️ 상태 구독 모두 해제됨');
};
export const resubscribeStatuses = (
  userId: number,  // 현재 로그인된 userId
  targetIds: number[], // 상대방 id들
  onStatus: (id: number, status: 'ONLINE' | 'AWAY') => void
) => {
  resetStatusSubscriptions(); // 먼저 기존 상태 구독 초기화

  targetIds.forEach((id) => {
    if (id !== userId) {
      subscribeToStatus(id, onStatus); // 상대만 구독
    }
  });
};
export const connectAndSubscribeUsers = (
  userIds: number[],
  onStatus: (userId: number, status: 'ONLINE' | 'AWAY') => void
) => {
  const trySubscribe = () => {
    console.log('✅ WebSocket 완전히 연결됨 → 상태 구독 시작');
    userIds.forEach((id) => {
      subscribeToStatus(id, onStatus);
    });
  };

  if (client.connected) {
    waitUntilReady(trySubscribe);
    return;
  }

  // ✅ 이 안에서만 구독 보장됨
  client.onConnect = () => {
    waitUntilReady(trySubscribe);
  };

  client.activate(); // 소켓 연결 시작
};

export const subscribeWithRetry = (
  userId: number,
  onStatus: (userId: number, status: 'ONLINE' | 'AWAY') => void,
  retry = 0
) => {
  const isConnected = client.connected;
  const isSocketReady = !!(client as any)._connection;
console.log(`📡 상태 구독 시도: /sub/status/${userId}`);
  if (isConnected && isSocketReady) {
    subscribeToStatus(userId, onStatus);
    console.log(`✅ 구독 성공: /sub/status/${userId}`);
  } else {
    if (retry >= 50) {
      console.error(`❌ 구독 재시도 실패: /sub/status/${userId}`);
      return;
    }

    console.log(`⏳ 구독 대기: /sub/status/${userId} (retry ${retry})`);
    setTimeout(() => subscribeWithRetry(userId, onStatus, retry + 1), 100);
  }
};

export const subscribeToRoom = (
  chatRoomId: number,
  onMessage: (msg: any) => void,
  onUnreadIncrease: (roomId: number) => void,
  onUnreadClear: (roomId: number) => void,
  currentChatRoomIdRef: RefObject<number>,
  currentUserId: number,
  onRoomEvent?: (data: any) => void
) => {
  const destination = `/sub/chatroom/${chatRoomId}`;

  if (subscriptions.has(destination)) {
    console.log(`⚠️ Already subscribed to ${destination}`);
    return;
  }

  waitUntilReady(() => {
    console.log(`🧪 연결됨 → ${destination} 구독 시도`);

    const sub = client.subscribe(destination, (message: IMessage) => {
      const parsed = JSON.parse(message.body);

      // ✅ 자기 메시지는 무시
      if (parsed.senderId === currentUserId) {
        console.log('🔁 자기 메시지 → 무시');
        return;
      }

      // ✅ 메시지 자체는 항상 반영
      onMessage(parsed);

      if (parsed.type === 'memberUpdate' && onRoomEvent) {
        onRoomEvent(parsed);
      }

      if (parsed.chatRoomId === currentChatRoomIdRef.current) {
        if (document.hasFocus()) {
          console.log('✅ 현재 채팅방 + 브라우저 활성화 상태 → 읽음 처리');
          onUnreadClear(parsed.chatRoomId);
        } else {
          console.log('🚫 현재 채팅방이지만 브라우저 비활성화 상태 → 읽음 처리 보류');
        }
      } else {
        console.log('🔔 다른 채팅방 → unread 증가');
    
        onUnreadIncrease(parsed.chatRoomId);
      }
    });

    subscriptions.set(destination, sub);
    console.log(`📥 Subscribed to ${destination}`);
  });
};
export const subscribeToRoomList = (
  userId: number,
  onRefresh: () => void
) => {
  const destination = `/sub/chatroom/list/${userId}`;
  if (subscriptions.has(destination)) return;

  waitUntilReady(() => {
    const sub = client.subscribe(destination, (message: IMessage) => {
      console.log('🔄 채팅방 리스트 갱신 트리거 수신');
      onRefresh(); // 예: fetchChatRooms()
    });
    subscriptions.set(destination, sub);
  });
};
export const subscribeToParticipants = (
  chatRoomId: number,
  onRefetch: () => void
) => {
  const destination = `/sub/chatroom/participants/${chatRoomId}`;
  if (subscriptions.has(destination)) return;

  waitUntilReady(() => {
    const sub = client.subscribe(destination, (message: IMessage) => {
      console.log(`👥 참여자 수 갱신 트리거 수신 [${chatRoomId}]`);
      onRefetch(); // getGroupMembers 등 호출
    });
    subscriptions.set(destination, sub);
    console.log(`📥 Subscribed to ${destination}`);
  });
};

export const unsubscribeFromParticipants = (chatRoomId: number) => {
  const destination = `/sub/chatroom/participants/${chatRoomId}`;
  const sub = subscriptions.get(destination);
  if (sub) {
    sub.unsubscribe();
    subscriptions.delete(destination);
    console.log(`📴 참여자 구독 해제: ${destination}`);
  }
};

export default client;
