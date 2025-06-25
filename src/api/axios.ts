import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost:8080',
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  console.log('📡 요청 URL:', `${config.baseURL ?? ''}${config.url ?? ''}`);
  return config;
});


api.interceptors.response.use(
  (res) => res,
  (error) => Promise.reject(error)
);
