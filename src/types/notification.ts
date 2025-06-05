export type AlertType = 'ALL' | 'MENTION_ONLY' | 'NONE';

export interface NotificationSetting {
  alertType: any;
  notificationSettingId: number;
  userId: number;
  chatRoomId: number | null;
  notificationStartTime: string | null;
  notificationEndTime: string | null;
  createdAt: string;
  updatedAt: string;
}

