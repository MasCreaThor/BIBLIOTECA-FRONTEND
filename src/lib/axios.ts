import axios, { AxiosError, AxiosResponse } from 'axios';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';
import { ApiError } from '@/types/api.types';

// Crear instancia de axios
const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api',
  timeout: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '10000'),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para requests - agregar token JWT
axiosInstance.interceptors.request.use(
  (config) => {
    const token = Cookies.get(process.env.NEXT_PUBLIC_JWT_STORAGE_KEY || 'biblioteca_token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para responses - manejo de errores
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError<ApiError>) => {
    const { response } = error;
    
    if (response) {
      const { statusCode, message } = response.data;
      
      switch (statusCode) {
        case 401:
          // Token inválido o expirado
          Cookies.remove(process.env.NEXT_PUBLIC_JWT_STORAGE_KEY || 'biblioteca_token');
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
          toast.error('Sesión expirada. Por favor, inicia sesión nuevamente.');
          break;
          
        case 403:
          toast.error('No tienes permisos para realizar esta acción.');
          break;
          
        case 404:
          toast.error('Recurso no encontrado.');
          break;
          
        case 409:
          toast.error(Array.isArray(message) ? message.join(', ') : message);
          break;
          
        case 422:
        case 400:
          toast.error(Array.isArray(message) ? message.join(', ') : message);
          break;
          
        case 500:
          toast.error('Error interno del servidor. Por favor, intenta nuevamente.');
          break;
          
        default:
          toast.error(Array.isArray(message) ? message.join(', ') : message || 'Error desconocido');
      }
    } else {
      // Error de red
      toast.error('Error de conexión. Verifica tu conexión a internet.');
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;