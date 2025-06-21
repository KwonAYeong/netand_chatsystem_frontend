// src/hooks/useGroupChatSocket.ts
import { useEffect, useRef } from 'react';
import client from '../lib/websocket';
import type { IMessage, StompSubscription } from '@stomp/stompjs';

export default function useGroupChatSocket(
  roomId: number,
  onMessage: (msg: any) => void
) {
  const subscriptionRef = useRef<StompSubscription | null>(null);

  useEffect(() => {
    const destination = `/sub/group/${roomId}`;

    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
    }

    subscriptionRef.current = client.subscribe(destination, (message: IMessage) => {
      const payload = JSON.parse(message.body);
      onMessage(payload);
    });

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }
    };
  }, [roomId, onMessage]);
}
