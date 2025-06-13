export type AlertType = 'ALL' | 'MENTION_ONLY' | 'NONE';

export type NotificationSettings = {
  isMuteAll: boolean;
  notificationStartTime: string;
  notificationEndTime: string;
  receiveMentionOnly: number[];
  mutedChatRoomIds: number[];
};


