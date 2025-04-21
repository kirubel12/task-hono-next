import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';

const apiClient: AxiosInstance = axios.create({
  baseURL: "http://localhost:5000/api/v1",
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling errors
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response.data,
  (error) => {
    const errorMessage = error.response?.data?.message || error.message;
    return Promise.reject(errorMessage);
  }
);

export const get = <T>(url: string, config?: InternalAxiosRequestConfig): Promise<T> => 
  apiClient.get(url, config);

export const post = <T>(url: string, data?: unknown, config?: InternalAxiosRequestConfig): Promise<T> => 
  apiClient.post(url, data, config);

export const put = <T>(url: string, data?: unknown, config?: InternalAxiosRequestConfig): Promise<T> => 
  apiClient.put(url, data, config);

export const patch = <T>(url: string, data?: unknown, config?: InternalAxiosRequestConfig): Promise<T> => 
  apiClient.patch(url, data, config);

export const del = <T>(url: string, config?: InternalAxiosRequestConfig): Promise<T> => 
  apiClient.delete(url, config);

export default apiClient;