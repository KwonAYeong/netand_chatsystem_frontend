import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://54.180.132.157',
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => Promise.reject(error)
);
