import { api } from './axios';
import { AlertType, NotificationSettings } from '../types/notification';

const convertToAmPm = (time: string | null | undefined): string => {
  if (!time) return '';

  const [h, m] = time.split(':').map(Number);
  const period = h < 12 ? '오전' : '오후';
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${period} ${hour.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
};

const parseAmPmTo24 = (time: string | undefined | null): string | undefined => {
  if (!time || time.trim() === '') return undefined;  // 현재도 있는데

  if (!time.includes(' ')) return undefined;  // 여기를 추가해줘야 함!!

  const [period, hm] = time.split(' ');
  const [h, m] = hm.split(':').map(Number);
  let hour = period === '오전' ? h : h % 12 + 12;
  if (period === '오전' && hour === 12) hour = 0;
  return `${hour.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:00`;
};

// 변환 유틸
export const convertMuteAllToAlertType = (muteAll: boolean): AlertType => {
  return muteAll ? 'NONE' : 'ALL';
};

export const convertAlertTypeToMuteAll = (alertType: AlertType): boolean => {
  return alertType === 'NONE';
};

// NotificationSettingsContext용 (백 응답 그대로 사용 → muteAll boolean 유지)
export const getNotificationSettingsForContext = async (userId: number): Promise<NotificationSettings> => {
  const res = await api.get(`/notification-setting/${userId}`);
  console.log('📢 알림 설정 GET 응답 (for context):', res.data);

  return res.data as NotificationSettings;
};

// SettingsModal용 → muteAll → alertType 변환해서 반환 (화면에서 편하게 사용하기 위함)
export const getNotificationSettings = async (userId: number) => {
  const res = await api.get(`/notification-setting/${userId}`);
  console.log('📢 알림 설정 GET 응답:', res.data);

  const toHHMM = (timeString: string | null | undefined): string => {
    if (!timeString) return '';
    return timeString.substring(0, 5);
  };

  const alertType: AlertType = convertMuteAllToAlertType(res.data.muteAll);

  return {
    alertType,  // 여기서 alertType 으로 반환 (UI 전용)
    notificationStartTime: convertToAmPm(toHHMM(res.data.notificationStartTime)),
    notificationEndTime: convertToAmPm(toHHMM(res.data.notificationEndTime)),
  };
};

// Global Notification Level 설정 → 서버에 muteAll(boolean) 으로 전송
export const putGlobalNotificationLevel = async (userId: number, alertType: AlertType): Promise<NotificationSettings> => {
  const payload = {
    userId,
    alertType,  // ✅ 이렇게 고쳐야 네가 원하는 "서버에 alertType 주기" 상태랑 정확히 일치함
  };

  console.log('📢 PUT 알림 레벨 설정 요청:', payload);

  const res = await api.put('/notification-setting/global', payload);
  console.log('📢 PUT 알림 레벨 설정 응답:', res.data);

  return res.data as NotificationSettings;
};

// Notification Time 설정
export const putNotificationTimeSettings = async (
  userId: number,
  notificationStartTime?: string,
  notificationEndTime?: string
): Promise<NotificationSettings> => {
  const payload = {
  userId,
  notificationStartTime: notificationStartTime ? parseAmPmTo24(notificationStartTime) : undefined,
  notificationEndTime: notificationEndTime ? parseAmPmTo24(notificationEndTime) : undefined,
};

  console.log('📢 PUT 알림 시간 설정 요청:', payload);

  const res = await api.put('/notification-setting/time', payload);
  console.log('📢 PUT 알림 시간 설정 응답:', res.data);

  return res.data as NotificationSettings;
};

// DM Notification Level 설정
export const putDMNotificationLevel = async (
  userId: number,
  chatRoomId: number,
  alertType: AlertType
) => {
  const payload = {
    userId,
    chatRoomId,
    alertType, 
  };

  console.log('📢 PUT DM 알림 설정 요청:', payload);

  await api.put('/notification-setting/chat-room', payload);
};

export const getDMNotificationSettings = async (userId: number, chatRoomId: number) => {
   const res = await api.get(`/notification-setting/${userId}/${chatRoomId}`);
   return res.data;
};
