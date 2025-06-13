import { useEffect } from 'react';
import { useNotificationSettings } from '../context/NotificationSettingsContext';
import { shouldShowNotification } from '../utils/shouldShowNotification';
import { useChatUI } from '../context/ChatUIContext';
export const useSSEWithNotification = (
  userId: number,
  windowIsFocused: boolean,
  navigate: (path: string) => void  // navigate 함수 인자로 받음
) => {
  const { notificationSettings, refreshSettings } = useNotificationSettings();
  const { currentChatRoomId } = useChatUI();

  useEffect(() => {
    if (!userId) return;

    // Notification 권한 확인 + 요청
    if (Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        console.log('🔔 Notification permission:', permission);
      });
    }

    // SSE 연결
    const eventSource = new EventSource(`http://localhost:8080/api/notification/subscribe?userId=${userId}`);

    // onmessage (기본 이벤트 → 지금은 사용 X)
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('SSE onmessage 수신:', data);
      } catch (err) {
        console.warn('SSE 메시지 JSON 아님:', event.data);
      }
    };

    // ⭐ 공통 알림 표시 함수 (중복 제거용)
   const showNotification = (data: any) => {
    const notification = new Notification(`${data.senderName}님이 보낸 메시지`, {
      body: data.message,
      icon: data.senderProfileImage || '/notification-icon.png',
    });

    notification.onclick = (event) => {
      event.preventDefault();
      window.focus();
       console.log('알림 클릭 - 채팅방 이동 시도:', data.chatRoomId);
      navigate(`/chat?chatRoomId=${data.chatRoomId}`);  // navigate 함수 사용
    };
  };

    // 공통 알림 표시 처리 함수
    const handleNotification = (data: any) => {
      console.log('현재 currentChatRoomId:', currentChatRoomId, 'chatRoomId:', data.chatRoomId);

      if (shouldShowNotification(notificationSettings, data, userId)) {
        console.log('✅ 알림 표시 조건 통과');

        const isCurrentRoom = currentChatRoomId === data.chatRoomId;
        const isWindowHidden = document.visibilityState === 'hidden';

        if (!isCurrentRoom || isWindowHidden || !windowIsFocused) {
          console.log('✅ 알림 표시 → 조건 만족');

          if (Notification.permission === 'granted') {
            showNotification(data);
          } else if (Notification.permission === 'default') {
            Notification.requestPermission().then(permission => {
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

    // "sse" 이벤트
    eventSource.addEventListener('sse', (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('📩 SSE "sse" 이벤트 수신:', data);

        if (data.type === 'NOTIFICATION_SETTINGS_UPDATED') {
          console.log('🔄 알림 설정 변경 감지 → refreshSettings 호출');
          refreshSettings();
        } else {
          handleNotification(data);
        }
      } catch (err) {
        console.warn('SSE "sse" 이벤트 JSON 아님:', event.data);
      }
    });

    // "chat" 이벤트
    eventSource.addEventListener('chat', (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('📩 SSE "chat" 이벤트 수신:', data);

        handleNotification(data);
      } catch (err) {
        console.warn('SSE "chat" 이벤트 JSON 아님:', event.data);
      }
    });

    // SSE 오류 처리
    eventSource.onerror = (error) => {
      console.error('❌ SSE 오류:', error);
    };

    return () => {
      eventSource.close();
    };
  }, [userId, notificationSettings, currentChatRoomId, refreshSettings, windowIsFocused, navigate]);
};
