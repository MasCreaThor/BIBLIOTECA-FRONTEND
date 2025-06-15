// src/lib/axios.ts - VERSIÓN CORREGIDA PARA AXIOS MODERNO
import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';
import { ApiError } from '@/types/api.types';

// Configuración de variables de entorno con valores por defecto
const API_CONFIG = {
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api',
  timeout: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '10000'),
  tokenKey: process.env.NEXT_PUBLIC_JWT_STORAGE_KEY || 'biblioteca_token',
  isDevelopment: process.env.NODE_ENV === 'development'
} as const;

// Interface para metadata personalizada
interface RequestMetadata {
  requestId: number;
  startTime: number;
}

// Crear instancia de axios con configuración mejorada
const axiosInstance = axios.create({
  baseURL: API_CONFIG.baseURL,
  timeout: API_CONFIG.timeout,
  headers: {
    'Content-Type': 'application/json',
  },
  // Configuración adicional para mejor manejo
  validateStatus: (status) => status < 500, // No rechazar automáticamente errores 4xx
});

// Contador de requests para debugging
let requestCounter = 0;

// Map para almacenar metadata de requests
const requestMetadataMap = new Map<number, RequestMetadata>();

// Interceptor para requests - agregar token JWT y logging
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const requestId = ++requestCounter;
    const metadata: RequestMetadata = { requestId, startTime: Date.now() };
    
    // Almacenar metadata usando URL + timestamp como key único
    const requestKey = `${config.method}-${config.url}-${metadata.startTime}`;
    requestMetadataMap.set(requestId, metadata);
    
    // Agregar ID a headers para tracking
    config.headers['X-Request-ID'] = requestId.toString();
    
    // Obtener y agregar token JWT si existe
    const token = Cookies.get(API_CONFIG.tokenKey);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Logging en desarrollo
    if (API_CONFIG.isDevelopment) {
      console.log(`🚀 API Request #${requestId}:`, {
        method: config.method?.toUpperCase(),
        url: `${config.baseURL}${config.url}`,
        params: config.params,
        data: config.data ? (typeof config.data === 'string' ? 'FormData' : config.data) : undefined,
        headers: {
          ...config.headers,
          Authorization: token ? '[TOKEN_PRESENT]' : '[NO_TOKEN]'
        }
      });
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Interceptor para responses - manejo de errores mejorado y logging
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    const { config } = response;
    const requestIdHeader = config.headers['X-Request-ID'] as string;
    const requestId = requestIdHeader ? parseInt(requestIdHeader) : 0;
    const metadata = requestMetadataMap.get(requestId);
    const duration = metadata?.startTime ? Date.now() - metadata.startTime : 0;
    
    // Logging en desarrollo
    if (API_CONFIG.isDevelopment) {
      console.log(`✅ API Response #${requestId} (${duration}ms):`, {
        status: response.status,
        statusText: response.statusText,
        url: `${config.baseURL}${config.url}`,
        success: response.data.success,
        dataLength: Array.isArray(response.data.data) ? response.data.data.length : 
                   response.data.data ? 'object' : 'null'
      });
    }
    
    // Limpiar metadata después de usar
    if (requestId) {
      requestMetadataMap.delete(requestId);
    }
    
    return response;
  },
  (error: AxiosError<ApiError>) => {
    const { config, response } = error;
    const requestIdHeader = config?.headers?.['X-Request-ID'] as string;
    const requestId = requestIdHeader ? parseInt(requestIdHeader) : 0;
    const metadata = requestMetadataMap.get(requestId);
    const duration = metadata?.startTime ? Date.now() - metadata.startTime : 0;
    
    // Logging detallado del error
    if (API_CONFIG.isDevelopment) {
      console.error(`❌ API Error #${requestId} (${duration}ms):`, {
        method: config?.method?.toUpperCase(),
        url: config ? `${config.baseURL}${config.url}` : 'Unknown URL',
        status: response?.status,
        statusText: response?.statusText,
        message: response?.data?.message || error.message,
        code: error.code,
        isTimeout: error.code === 'ECONNABORTED',
        isNetworkError: !response
      });
    }
    
    // Limpiar metadata después de usar
    if (requestId) {
      requestMetadataMap.delete(requestId);
    }
    
    // Manejo de errores específicos con mensajes más informativos
    if (response) {
      const { status } = response;
      const errorData = response.data;
      const message = Array.isArray(errorData?.message) 
        ? errorData.message.join(', ') 
        : errorData?.message || 'Error desconocido';
      
      switch (status) {
        case 400:
          // Error de validación - mostrar mensaje específico
          toast.error(`Datos inválidos: ${message}`);
          break;
          
        case 401:
          // Token inválido o expirado - redirigir al login
          console.warn('🔐 Token expirado o inválido, cerrando sesión...');
          Cookies.remove(API_CONFIG.tokenKey);
          if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
            window.location.href = '/login';
          }
          toast.error('Sesión expirada. Por favor, inicia sesión nuevamente.');
          break;
          
        case 403:
          // Sin permisos
          toast.error('No tienes permisos para realizar esta acción.');
          break;
          
        case 404:
          // Recurso no encontrado - mensaje más específico
          const resource = config?.url?.split('/').pop() || 'recurso';
          toast.error(`${resource.charAt(0).toUpperCase() + resource.slice(1)} no encontrado.`);
          break;
          
        case 409:
          // Conflicto - datos duplicados, etc.
          toast.error(`Conflicto: ${message}`);
          break;
          
        case 422:
          // Error de procesamiento - validaciones del servidor
          toast.error(`Error de validación: ${message}`);
          break;
          
        case 429:
          // Muchas requests
          toast.error('Demasiadas solicitudes. Por favor, espera un momento.');
          break;
          
        case 500:
          // Error interno del servidor
          console.error('🔥 Error interno del servidor:', errorData);
          toast.error('Error interno del servidor. El equipo técnico ha sido notificado.');
          break;
          
        case 502:
        case 503:
        case 504:
          // Errores de infraestructura
          toast.error('Servicio temporalmente no disponible. Intenta nuevamente en unos minutos.');
          break;
          
        default:
          // Error genérico
          toast.error(`Error ${status}: ${message}`);
      }
    } else {
      // Error de red o conexión
      if (error.code === 'ECONNABORTED') {
        toast.error('La solicitud tardó demasiado tiempo. Verifica tu conexión.');
      } else if (error.code === 'NETWORK_ERROR' || !navigator.onLine) {
        toast.error('Sin conexión a internet. Verifica tu red.');
      } else {
        console.error('🌐 Error de conexión:', error);
        toast.error('Error de conexión. Verifica que el servidor esté disponible.');
      }
    }
    
    return Promise.reject(error);
  }
);

// Funciones utilitarias para uso en servicios
export const axiosUtils = {
  /**
   * Verificar si hay conexión al backend
   */
  async isBackendHealthy(): Promise<boolean> {
    try {
      const response = await axiosInstance.get('/health', { timeout: 5000 });
      return response.status === 200;
    } catch (error) {
      return false;
    }
  },

  /**
   * Hacer request con retry automático
   */
  async requestWithRetry<T>(
    requestFn: () => Promise<AxiosResponse<T>>, 
    maxRetries: number = 2,
    delay: number = 1000
  ): Promise<AxiosResponse<T>> {
    let lastError: any;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await requestFn();
      } catch (error: any) {
        lastError = error;
        
        // No reintentar en errores 4xx (client errors)
        if (error.response?.status >= 400 && error.response?.status < 500) {
          break;
        }
        
        if (attempt < maxRetries) {
          console.warn(`🔄 Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms`);
          await new Promise(resolve => setTimeout(resolve, delay));
          delay *= 2; // Exponential backoff
        }
      }
    }
    
    throw lastError;
  },

  /**
   * Crear instancia de axios personalizada para casos específicos
   */
  createCustomInstance(config: Partial<InternalAxiosRequestConfig>) {
    return axios.create({
      ...axiosInstance.defaults,
      ...config
    });
  },

  /**
   * Limpiar metadata acumulada (útil para evitar memory leaks)
   */
  clearMetadata(): void {
    requestMetadataMap.clear();
  },

  /**
   * Obtener estadísticas de requests
   */
  getStats(): { activeRequests: number; totalRequests: number } {
    return {
      activeRequests: requestMetadataMap.size,
      totalRequests: requestCounter
    };
  }
};

export default axiosInstance;