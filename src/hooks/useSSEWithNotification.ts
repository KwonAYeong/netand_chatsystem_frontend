// src/hooks/useSSEWithNotification.ts
import { useEffect, useRef } from 'react';
import { useNotificationSettings } from '../context/NotificationSettingsContext';
import { shouldShowNotification } from '../utils/shouldShowNotification';
import { useChatUI } from '../context/ChatUIContext';
import { NavigateFunction } from 'react-router-dom';

export const useSSEWithNotification = (
  userId: number,
  windowIsFocused: boolean,
  navigate: NavigateFunction
) => {
  const { notificationSettings, refreshSettings } = useNotificationSettings();
  const { currentChatRoomId, setSelectedRoom } = useChatUI();

  const refreshSettingsRef = useRef(refreshSettings);
  const currentChatRoomIdRef = useRef(currentChatRoomId);
  const notificationSettingsRef = useRef(notificationSettings);
  const windowIsFocusedRef = useRef(windowIsFocused);

  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    refreshSettingsRef.current = refreshSettings;
  }, [refreshSettings]);

  useEffect(() => {
    currentChatRoomIdRef.current = currentChatRoomId;
  }, [currentChatRoomId]);

  useEffect(() => {
    notificationSettingsRef.current = notificationSettings;
  }, [notificationSettings]);

  useEffect(() => {
    windowIsFocusedRef.current = windowIsFocused;
  }, [windowIsFocused]);

  useEffect(() => {
    if (!userId || !notificationSettings) return;

    console.log('🚀 useSSEWithNotification - EventSource 연결 시작됨 userId:', userId);

    if (Notification.permission === 'default') {
      Notification.requestPermission().then((permission) => {
        console.log('🔔 Notification permission:', permission);
      });
    }

    if (eventSourceRef.current) {
      console.log('⚠️ 기존 EventSource 닫기');
      eventSourceRef.current.close();
    }
    const eventSource = new EventSource(`http://localhost:8080/api/notification/subscribe?userId=${userId}`);
    //const eventSource = new EventSource(`http://3.39.8.219:8080/api/notification/subscribe?userId=${userId}`);
    eventSourceRef.current = eventSource;

    console.log('📢 SSE 연결 시작');

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('SSE onmessage 수신:', data);
      } catch (err) {
        console.warn('SSE 메시지 JSON 아님:', event.data);
      }
    };

    const showNotification = (data: any) => {
      const notification = new Notification(`${data.senderName}`, {
        body: data.message,
        //icon: data.senderProfileImage || '/default_profile.jpg',
      });

      notification.onclick = (event) => {
        event.preventDefault();
        window.focus();
        console.log('알림 클릭 - 채팅방 이동 시도:', data.chatRoomId);
        notification.close();

        // ✅ selectedRoom 업데이트: type: 'dm' 추가!
        setSelectedRoom({
          id: data.chatRoomId,
          type: 'dm', // 🔥 여기가 핵심
          name: data.senderName,
          profileImage: data.senderProfileImage || '/default_profile.jpg',
        });

        navigate(`/chat/${data.chatRoomId}`);
      };
    };

    const handleNotification = (data: any) => {
      const mentions = Array.isArray(data.mentionedUserIds) ? data.mentionedUserIds : [];
        const processedData = {
          chatRoomId: data.chatRoomId,
          createdAt: data.createdAt,
          mentions, // 💡 핵심
        };
       console.log('현재 currentChatRoomId:', currentChatRoomIdRef.current, 'chatRoomId:', data.chatRoomId);

      if (shouldShowNotification(notificationSettingsRef.current,processedData, userId)) {
        console.log('✅ 알림 표시 조건 통과');

        const isCurrentRoom = currentChatRoomIdRef.current === data.chatRoomId;
        const isWindowHidden = document.visibilityState === 'hidden';

        if (!isCurrentRoom || isWindowHidden || !windowIsFocusedRef.current) {
          console.log('✅ 알림 표시 → 조건 만족');

          if (Notification.permission === 'granted') {
            showNotification(data);
          } else if (Notification.permission === 'default') {
            Notification.requestPermission().then((permission) => {
              if (permission === 'granted') {
                showNotification(data);
              }
            });
          } else {
            console.log('🚫 브라우저 알림 권한 없음');
          }
        } else {
          console.log('🚫 현재 채팅방 + 브라우저 활성화 + 창 focus → 알림 표시 안 함');
        }
      } else {
        console.log('🚫 알림 표시 조건 불일치 → 표시 안 함');
      }
    };

    eventSource.addEventListener('sse', (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('📩 SSE "sse" 이벤트 수신:', data);

        if (data.type === 'NOTIFICATION_SETTINGS_UPDATED') {
          console.log('🔄 알림 설정 변경 감지 → refreshSettings 호출');
          refreshSettingsRef.current();
        } else {
          handleNotification(data);
        }
      } catch (err) {
        console.warn('SSE "sse" 이벤트 JSON 아님:', event.data);
      }
    });

    eventSource.addEventListener('chat', (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('📩 SSE "chat" 이벤트 수신:', data);

        handleNotification(data);
      } catch (err) {
        console.warn('SSE "chat" 이벤트 JSON 아님:', event.data);
      }
    });

    eventSource.onerror = (error) => {
      console.error('❌ SSE 오류:', error);
    };

    return () => {
      console.log('📢 SSE 연결 해제');
      eventSource.close();
      eventSourceRef.current = null;
    };
  }, [userId, navigate, notificationSettings]);
};
