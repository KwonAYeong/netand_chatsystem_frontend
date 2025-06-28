import axios from 'axios';

export const api = axios.create({
  //baseURL: 'http://localhost:8080',
  baseURL:'http://3.39.8.219:8080',
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
