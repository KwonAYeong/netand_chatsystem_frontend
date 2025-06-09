import { api } from './axios';

export const getUserProfileById = async (id: number) => {

  const res = await api.get(`/api/profile/${id}`);
  return res.data;
};
export const getNotificationSettings = async (userId: number) => {
  const res = await api.get(`/api/settings/notifications/${userId}`);
  return res.data;
};
export const patchUserStatus = async (id: number, status: 'online' | 'away') => {
  const res = await api.patch(`/api/users/${id}/status`, { status });
  return res.data;
};

export const updateUserProfile = async (id: number, data: any) => {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (value instanceof Blob) {
      formData.append(key, value);
    } else {
      formData.append(key, String(value));
    }
  });

  const res = await api.put(`/api/profile/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};
