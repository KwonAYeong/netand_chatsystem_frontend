import { api } from './axios';
import { AlertType } from '../types/notification';
const dummyNotificationSetting: { userId: number; chatRoomId: number; alertType: AlertType; startTime: string | null; endTime: string | null; } = {
  userId: 1,
  chatRoomId: 1,
  alertType: 'ALL', 
  startTime: null,
  endTime: null,
};


const convertToAmPm = (time: string): string => {
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

export const getNotificationSettings = async (userId: number) => {
  const res = await api.get(`/notification-setting/${userId}`);
  console.log('📢 알림 설정 GET 응답:', res.data);

  const toHHMM = (timeString: string): string => timeString.substring(0, 5);

  const alertType: AlertType = res.data.muteAll ? 'NONE' : 'ALL';

  return {
    alertType,
    startTime: convertToAmPm(toHHMM(res.data.notificationStartTime)),
    endTime: convertToAmPm(toHHMM(res.data.notificationEndTime)),
  };
};
export const putGlobalNotificationLevel = async (userId: number, alertType: AlertType) => {
  const payload = {
    userId,
    alertType,
  };

  console.log('📢 PUT 알림 레벨 설정 요청:', payload);

  const res = await api.put('/notification-setting/global', payload);
  console.log('📢 PUT 알림 레벨 설정 응답:', res.data);

  return res.data;
};
export const putNotificationTimeSettings = async (
  userId: number,
  startTime?: string,
  endTime?: string
) => {
  const payload = {
    userId,
    startTime: parseAmPmTo24(startTime ?? '08:30'),
    endTime: parseAmPmTo24(endTime ?? '20:30'),
  };

  console.log('📢 PUT 알림 시간 설정 요청:', payload);

  const res = await api.put('/notification-setting/time', payload);
  console.log('📢 PUT 알림 시간 설정 응답:', res.data);

  return res.data;
};
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
export const getDMNotificationSettings = async (userId: number, chatRoomId: number) => {
  //const res = await api.get(`/api/settings/notifications/${userId}/${chatRoomId}`);
  //return res.data;
  return dummyNotificationSetting;
};