import { api } from './axios';

export const getUserProfileById = async (id: number) => {
  return {
      userId: 2,
      name: '김더미',
      email: 'dummy@example.com',
      company: '더미컴퍼니',
      position: '프론트엔드 개발자',
      profileImageUrl: '/default-profile.png',
      isActive: true,
    };
  //const res = await api.get(`/api/profile/${id}`);
  //return res.data;
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
