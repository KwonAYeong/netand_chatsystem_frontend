import { toCamel } from '../utils/transform';
import { User } from '../types/user';

import { mockChatRoomParticipants } from './chatRoomParticipants';
import { mockChatRooms } from './chatRooms';
import { mockMessages } from './messages';
import { mockMessageInteractions } from './messageInteractions';
import { mockNotificationSettings } from './notificationSettings';
import { mockUserActivities } from './userActivities';
import { mockUsers } from './users';

export const mockStore = {
  users: toCamel(mockUsers) as User[],
  chatRooms: toCamel(mockChatRooms),
  chatRoomParticipants: toCamel(mockChatRoomParticipants),
  messages: toCamel(mockMessages),
  messageInteractions: toCamel(mockMessageInteractions),
  notificationSettings: toCamel(mockNotificationSettings),
  userActivities: toCamel(mockUserActivities),
};
