// src/utils/shouldShowNotification.ts
import type { NotificationSettings } from "../types/notification";

export function shouldShowNotification(
  settings: NotificationSettings | null,
  data: { chatRoomId: number; mentions?: number[]; createdAt: string },
  myUserId: number
): boolean {
  if (!settings) return false;

  // 글로벌 Mute All
  if (settings.muteAll) return false;

  // 시간 체크
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  const startMinutes = timeToMinutes(settings.notificationStartTime);
  const endMinutes = timeToMinutes(settings.notificationEndTime);

  if (nowMinutes < startMinutes || nowMinutes > endMinutes) return false;

  // 채팅방 mute
  if (settings.mutedChatRoomIds.includes(data.chatRoomId)) return false;

  // Mention Only 적용
  if (settings.receiveMentionOnly.includes(data.chatRoomId)) {
    return data.mentions?.includes(myUserId) ?? false;
  }

  // 기본은 ALL 허용
  return true;
}

function timeToMinutes(timeStr: string) {
  const [hour, min] = timeStr.split(':').map(Number);
  return hour * 60 + min;
}
