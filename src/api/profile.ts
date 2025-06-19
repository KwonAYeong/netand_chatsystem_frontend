import { api } from './axios';

export const getUserProfileById = async (id: number) => {
  const res = await api.get(`/user/${id}`);
  return res.data;
};
export const patchUserStatus = async (id: number, status: 'online' | 'away') => {
  const res = await api.patch(`/api/users/${id}/status`, { status });
  return res.data;
};

export const updateUserProfileInfo = async (userId: number, data: {
  name: string;
  company: string;
  position: string;
}) => {
  const res = await api.put(`/user/${userId}`, data, {
    headers: { 'Content-Type': 'application/json' },
  });
  return res.data;
};
export const uploadUserProfileImage = async (userId: number, file: File) => {
  const formData = new FormData();
  formData.append('image', file);

  const res = await api.post(`/user/${userId}/profile-image`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return res.data;
};
export const deleteUserProfileImage = async (userId: number) => {
  const res = await api.delete(`/user/${userId}/profile-image`);
  return res.data;
};
