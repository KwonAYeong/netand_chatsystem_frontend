import { api } from './axios';

// ✅ [GET] 프로필 정보 조회
export const getUserProfileById = async (id: number) => {
  const res = await api.get(`/user/${id}`);
  return res.data;
};

// ✅ [PATCH] 유저 상태 변경
export const patchUserStatus = async (id: number, status: 'online' | 'away') => {
  const res = await api.patch(`/api/users/${id}/status`, { status });
  return res.data;
};

// ✅ [PUT] 프로필 정보 수정
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

// ✅ [POST] 프로필 이미지 업로드
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

// ✅ [DELETE] 프로필 이미지 삭제
export const deleteUserProfileImage = async (userId: number) => {
  const res = await api.delete(`/user/${userId}/profile-image`);
  return res.data;
};
