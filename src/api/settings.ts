import { api } from './axios';
import { AlertType} from '../types/notification';

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
  return `${hour.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
};

export const getNotificationSettings = async (userId: number) => {
  const res = await api.get(`/api/settings/notifications/${userId}`);

  return {
    alertType: res.data.alertType,
    startTime: convertToAmPm(res.data.notificationStartTime ?? '08:30'),
    endTime: convertToAmPm(res.data.notificationEndTime ?? '20:30'),
  };
};


export const patchGlobalNotificationSettings = async (
  userId: number,
  settings: {
    alertType: AlertType;
    notificationStartTime?: string;
    notificationEndTime?: string;
  }
) => {
  const payload = {
    userId,
    alertType: settings.alertType,
    notificationStartTime: parseAmPmTo24(settings.notificationStartTime ?? '08:30'),
    notificationEndTime: parseAmPmTo24(settings.notificationEndTime ?? '20:30'),
  };

  const res = await api.put('/notification-settings/global', payload);
  return res.data;
};
