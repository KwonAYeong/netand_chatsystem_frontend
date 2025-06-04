// src/api/profile.ts
import axios from 'axios';
import { mockStore } from '../mock/mockStore';

const USE_MOCK = true;

export const getUserProfileById = async (id: number) => {
  if (USE_MOCK) {
    const user = mockStore.users.find((u) => u.userId === id);
    return user ?? null;
  }

  const res = await axios.get(`/api/profile/${id}`);
  return res.data;
};

export const updateUserProfile = async (id: number, data: any) => {
  if (USE_MOCK) {
    const idx = mockStore.users.findIndex((u) => u.userId === id);
    if (idx !== -1) {
      mockStore.users[idx] = { ...mockStore.users[idx], ...data };
      return mockStore.users[idx];
    }
    throw new Error('사용자 없음');
  }

  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (value instanceof Blob) {
      formData.append(key, value);
    } else {
      formData.append(key, String(value));
    }
  });

  const res = await axios.put(`/api/profile/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};
