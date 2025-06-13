import { api } from './axios';
import { AlertType, NotificationSettings } from '../types/notification';

const convertToAmPm = (time: string | null | undefined): string => {
  if (!time) return '';

  const [h, m] = time.split(':').map(Number);
  const period = h < 12 ? '오전' : '오후';
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${period} ${hour.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
};

const parseAmPmTo24 = (time: string): string => {
  const [period, hm] = time.split(' ');
  const [h, m] = hm.split(':').map(Number);
  let hour = period === '오전' ? h : h % 12 + 12;
  if (period === '오전' && hour === 12) hour = 0;
  return `${hour.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:00`;
};

// NotificationSettingsContext용 (백 응답 그대로 사용)
export const getNotificationSettingsForContext = async (userId: number): Promise<NotificationSettings> => {
  const res = await api.get(`/notification-setting/${userId}`);
  console.log('📢 알림 설정 GET 응답 (for context):', res.data);

  return res.data as NotificationSettings;
};

// SettingsModal (UI용 → alertType 등 포함 변환해서 사용)
export const getNotificationSettings = async (userId: number) => {
  const res = await api.get(`/notification-setting/${userId}`);
  console.log('📢 알림 설정 GET 응답:', res.data);

  const toHHMM = (timeString: string | null | undefined): string => {
    if (!timeString) return '';
    return timeString.substring(0, 5);
  };

  const alertType: AlertType = res.data.isMuteAll ? 'NONE' : 'ALL';

  return {
    alertType,
    notificationStartTime: convertToAmPm(toHHMM(res.data.notificationStartTime)),
    notificationEndTime: convertToAmPm(toHHMM(res.data.notificationEndTime)),
  };
};

// Global Notification Level 설정 (Context에서 바로 반영 가능)
export const putGlobalNotificationLevel = async (userId: number, alertType: AlertType): Promise<NotificationSettings> => {
  const payload = {
    userId,
    alertType,
  };

  console.log('📢 PUT 알림 레벨 설정 요청:', payload);

  const res = await api.put('/notification-setting/global', payload);
  console.log('📢 PUT 알림 레벨 설정 응답:', res.data);

  return res.data as NotificationSettings;
};

// Notification Time 설정 (Context에서 바로 반영 가능)
export const putNotificationTimeSettings = async (
  userId: number,
  notificationStartTime?: string,
  notificationEndTime?: string
): Promise<NotificationSettings> => {
  const payload = {
    userId,
    notificationStartTime: parseAmPmTo24(notificationStartTime ?? '08:30'),
    notificationEndTime: parseAmPmTo24(notificationEndTime ?? '20:30'),
  };

  console.log('📢 PUT 알림 시간 설정 요청:', payload);

  const res = await api.put('/notification-setting/time', payload);
  console.log('📢 PUT 알림 시간 설정 응답:', res.data);

  return res.data as NotificationSettings;
};

// DM Notification Level 설정 (이건 따로 응답 없음 → void 처리)
export const putDMNotificationLevel = async (
  userId: number,
  chatRoomId: number,
  alertType: AlertType
) => {
  await api.put('/api/settings/notifications/dm', {
    user_id: userId,
    chat_room_id: chatRoomId,
    alert_type: alertType,
  });
};

// DM Notification Settings (지금 dummy 사용중 → 실제 연동 시 수정 예정)
const dummyNotificationSetting: {
  userId: number;
  chatRoomId: number;
  alertType: AlertType;
  notificationStartTime: string | null;
  notificationEndTime: string | null;
} = {
  userId: 1,
  chatRoomId: 1,
  alertType: 'ALL',
  notificationStartTime: null,
  notificationEndTime: null,
};

export const getDMNotificationSettings = async (userId: number, chatRoomId: number) => {
  // const res = await api.get(`/api/settings/notifications/${userId}/${chatRoomId}`);
  // return res.data;
  return dummyNotificationSetting;
};
