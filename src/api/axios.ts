import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://3.39.8.219:8080',
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => Promise.reject(error)
);
