import axios from 'axios';
import { toCamel, toSnake } from '../utils/transform';

export const api = axios.create({
  baseURL: 'http://localhost:8080',
  withCredentials: true,
});

// 요청 시 snake_case로 변환
api.interceptors.request.use((config) => {
  if (config.data) {
    config.data = toSnake(config.data);
  }
  return config;
});

// 응답 시 camelCase로 변환
api.interceptors.response.use(
  (res) => {
    res.data = toCamel(res.data);
    return res;
  },
  (error) => {
    if (error.response?.data) {
      error.response.data = toCamel(error.response.data);
    }
    return Promise.reject(error);
  }
);
