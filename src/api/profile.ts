import { api } from './axios';

// ✅ [GET] 프로필 정보 조회
export const getUserProfileById = async (id: number) => {
  const res = await api.get(`/user/${id}`);
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

// ✅ [GET] 유저 접속 상태 조회 (status + isActive)
export const getUserStatusById = async (userId: number) => {
  const res = await api.get(`/user/api/status/${userId}`);
  return res.data; // ex) { status: 'AWAY', isActive: true }
};

// ✅ [GET] 여러 유저 접속 상태 조회
export const getUserStatusesByIds = async (userIds: number[]) => {
  try {
    const statusMap: Record<number, 'ONLINE' | 'AWAY'> = {};

    // 각 userId에 대해 상태를 개별적으로 받아옴
    for (const userId of userIds) {
      const res = await api.get(`/user/api/status/${userId}`);
      console.log(`📡 요청 URL: /user/api/status/${userId}`);  // 요청 URL 콘솔 출력
      console.log('응답 데이터:', res.data);  // 응답 데이터 콘솔 출력
      statusMap[userId] = res.data; // 상태를 userId별로 저장
    }

    return statusMap;
  } catch (error) {
    console.error('Error fetching user statuses:', error);
    throw error;  // 에러를 던져서 호출한 쪽에서 처리하도록
  }
};