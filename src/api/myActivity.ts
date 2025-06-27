import { api } from './axios';

// ✅ 멘션된 메시지 목록 조회
export const getMentionActivities = async (userId: number) => {
  const res = await api.get(`/api/my-activity/mentions/${userId}`);
  return res.data;
};
