import { api } from './axios';
import { mockStore } from '../mock/mockStore';
import { AlertType, NotificationSetting } from '../types/notification';

const USE_MOCK = true;

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
  if (USE_MOCK) {
    const found = (mockStore.notificationSettings as NotificationSetting[]).find(
      (s) => Number(s.userId) === Number(userId) && s.chatRoomId === null
    );
    if (!found) throw new Error('알림 설정 없음');

    return {
      alertType: found.alertType,
      startTime: convertToAmPm(found.notificationStartTime ?? '08:30'),
      endTime: convertToAmPm(found.notificationEndTime ?? '20:30'),
    };
  }

  const res = await api.get(`/api/settings/notifications/${userId}`);
  return res.data;
};

export const patchGlobalNotificationSettings = async (
  userId: number,
  settings: {
    alertType: AlertType;
    notificationStartTime: string;
    notificationEndTime: string;
  }
) => {
  if (USE_MOCK) {
    const idx = mockStore.notificationSettings.findIndex(
      (s: NotificationSetting) => s.userId === userId && s.chatRoomId === null
    );
    if (idx === -1) throw new Error('mock 설정 없음');

    mockStore.notificationSettings[idx] = {
      ...mockStore.notificationSettings[idx],
      alertType: settings.alertType,
      notificationStartTime: parseAmPmTo24(settings.notificationStartTime),
      notificationEndTime: parseAmPmTo24(settings.notificationEndTime),
      updatedAt: new Date().toISOString(),
    };

    return mockStore.notificationSettings[idx];
  }

  const payload = {
    ...settings,
    notificationStartTime: parseAmPmTo24(settings.notificationStartTime),
    notificationEndTime: parseAmPmTo24(settings.notificationEndTime),
  };

  const res = await api.patch(`/api/settings/notifications/${userId}`, payload);
  return res.data;
};
