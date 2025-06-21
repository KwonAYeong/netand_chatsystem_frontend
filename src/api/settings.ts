import { api } from './axios';
import { AlertType, NotificationSettings } from '../types/notification';

// 🕓 24시간제 → 오전/오후 변환 (프론트 UI 표시용)
const convertToAmPm = (time: string | null | undefined): string => {
  if (!time) return '';

  const [h, m] = time.split(':').map(Number);
  const period = h < 12 ? '오전' : '오후';
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${period} ${hour.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
};

// 🕓 오전/오후 시간 → 24시간 포맷으로 변환 (백엔드 전송용)
const parseAmPmTo24 = (time: string | undefined | null): string | undefined => {
  if (!time || time.trim() === '') return undefined;  

  if (!time.includes(' ')) return undefined;

  const [period, hm] = time.split(' ');
  const [h, m] = hm.split(':').map(Number);
  let hour = period === '오전' ? h : h % 12 + 12;
  if (period === '오전' && hour === 12) hour = 0;
  return `${hour.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:00`;
};

// 🧠 muteAll(boolean) → alertType(string) 변환 (UI용)
export const convertMuteAllToAlertType = (muteAll: boolean): AlertType => {
  return muteAll ? 'NONE' : 'ALL';
};

// 🧠 alertType(string) → muteAll(boolean) 변환 (서버용)
export const convertAlertTypeToMuteAll = (alertType: AlertType): boolean => {
  return alertType === 'NONE';
};





// ✅ [GET] 알림 설정 전체 조회 (Context 초기화용)
export const getNotificationSettingsForContext = async (userId: number): Promise<NotificationSettings> => {
  const res = await api.get(`/notification-setting/${userId}`);
  console.log('📢 알림 설정 GET 응답 (for context):', res.data);

  return res.data as NotificationSettings;
};

// ✅ [GET] 알림 설정 조회
export const getNotificationSettings = async (userId: number) => {
  const res = await api.get(`/notification-setting/${userId}`);
  console.log('📢 알림 설정 GET 응답:', res.data);

  const toHHMM = (timeString: string | null | undefined): string => {
    if (!timeString) return '';
    return timeString.substring(0, 5);
  };

  const alertType: AlertType = convertMuteAllToAlertType(res.data.muteAll);

  return {
    alertType,  
    notificationStartTime: convertToAmPm(toHHMM(res.data.notificationStartTime)),
    notificationEndTime: convertToAmPm(toHHMM(res.data.notificationEndTime)),
  };
};

// ✅ [PUT] 전체 알림 설정
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

// ✅ [PUT] 전체 알림 시간 설정
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

// ✅ [PUT] DM 채팅방 알림 설정
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

// ✅ [GET] DM 채팅방 알림 설정 조회
export const getChatRoomNotificationSettings = async (userId: number, chatRoomId: number) => {
   const res = await api.get(`/notification-setting/${userId}/${chatRoomId}`);
   return res.data;
};

// ✅ [PUT] 그룹 채팅방 알림 설정
export const putGroupNotificationLevel = async (
  userId: number,
  chatRoomId: number,
  alertType: AlertType
) => {
  const payload = {
    userId,
    chatRoomId,
    alertType,
  };
  console.log('📢 PUT 그룹 알림 설정 요청:', payload);
  await api.put('/notification-setting/chat-room', payload);
};