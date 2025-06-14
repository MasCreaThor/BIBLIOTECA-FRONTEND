// src/lib/axios.ts - CONFIGURACIÓN COMPLETA Y MEJORADA
import axios, { AxiosError, AxiosResponse, AxiosRequestConfig } from 'axios';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';
import { ApiError } from '@/types/api.types';

// Configuración de la instancia de axios
const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api',
  timeout: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '30000'), // 30 segundos
  headers: {
    'Content-Type': 'application/json',
  },
});

// Variable para controlar los toasts de error duplicados
let lastErrorMessage = '';
let lastErrorTime = 0;
const ERROR_DEBOUNCE_TIME = 3000; // 3 segundos

// Interceptor para requests - agregar token JWT y logs
axiosInstance.interceptors.request.use(
  (config) => {
    // Agregar token de autenticación
    const token = Cookies.get(process.env.NEXT_PUBLIC_JWT_STORAGE_KEY || 'biblioteca_token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Logs para desarrollo
    if (process.env.NODE_ENV === 'development') {
      console.log('🔄 API Request:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        baseURL: config.baseURL,
        data: config.data,
        params: config.params,
        headers: {
          ...config.headers,
          Authorization: config.headers.Authorization ? '[PRESENT]' : '[NOT_PRESENT]'
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

// Interceptor para responses - manejo de errores mejorado
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    // Logs para desarrollo (respuestas exitosas)
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ API Response:', {
        status: response.status,
        statusText: response.statusText,
        url: response.config.url,
        method: response.config.method?.toUpperCase(),
        data: response.data,
        timing: response.headers['x-response-time'] || 'N/A'
      });
    }
    
    return response;
  },
  (error: AxiosError<ApiError>) => {
    const { response, request, config } = error;
    
    // Logs detallados para desarrollo
    if (process.env.NODE_ENV === 'development') {
      console.error('❌ API Error Details:', {
        message: error.message,
        code: error.code,
        url: config?.url,
        method: config?.method?.toUpperCase(),
        status: response?.status,
        statusText: response?.statusText,
        responseData: response?.data,
        stack: error.stack
      });
    }
    
    // Manejo específico de respuestas del servidor
    if (response) {
      const { status, data } = response;
      const errorMessage = data?.message || data?.error || 'Error desconocido';
      
      switch (status) {
        case 400:
          // Errores de validación - específicos para préstamos
          if (config?.url?.includes('/loans')) {
            handleLoanValidationError(errorMessage, data);
          } else {
            handleValidationError(errorMessage);
          }
          break;
          
        case 401:
          handleAuthError();
          break;
          
        case 403:
          handlePermissionError();
          break;
          
        case 404:
          handleNotFoundError(config?.url);
          break;
          
        case 409:
          handleConflictError(errorMessage);
          break;
          
        case 422:
          handleValidationError(errorMessage);
          break;
          
        case 429:
          handleRateLimitError();
          break;
          
        case 500:
          handleServerError(errorMessage);
          break;
          
        case 502:
        case 503:
        case 504:
          handleServiceUnavailableError(status);
          break;
          
        default:
          handleGenericError(status, errorMessage);
      }
    } else if (request) {
      // Error de red o timeout
      handleNetworkError(error);
    } else {
      // Error en la configuración de la request
      handleRequestConfigError(error);
    }
    
    return Promise.reject(error);
  }
);

// ===== FUNCIONES DE MANEJO DE ERRORES ESPECÍFICAS =====

function handleLoanValidationError(message: string | string[], data: any) {
  const errorText = Array.isArray(message) ? message.join(', ') : message;
  
  // Errores específicos de préstamos con mejores mensajes
  const loanSpecificErrors = {
    'ID de persona inválido': 'La persona seleccionada no es válida',
    'ID de recurso inválido': 'El recurso seleccionado no es válido',
    'La persona no existe': 'La persona seleccionada no existe en el sistema',
    'El recurso no existe': 'El recurso seleccionado no existe en el sistema',
    'El recurso no está disponible': 'El recurso ya está prestado o no está disponible',
    'El recurso ya está prestado': 'Este recurso ya está prestado a otra persona',
    'Máximo de préstamos alcanzado': 'La persona ya tiene el máximo de préstamos permitidos',
    'tiene préstamos vencidos': 'La persona tiene préstamos vencidos que debe devolver primero'
  };
  
  let friendlyMessage = errorText;
  
  // Buscar mensaje más amigable
  for (const [key, friendly] of Object.entries(loanSpecificErrors)) {
    if (errorText.toLowerCase().includes(key.toLowerCase())) {
      friendlyMessage = friendly;
      break;
    }
  }
  
  // No mostrar toast si ya se mostró el mismo error recientemente
  if (!shouldShowError(friendlyMessage)) return;
  
  toast.error(friendlyMessage, {
    duration: 6000,
    position: 'top-center',
    style: {
      background: '#fed7d7',
      color: '#c53030',
      border: '1px solid #feb2b2'
    }
  });
}

function handleValidationError(message: string | string[]) {
  const errorText = Array.isArray(message) ? message.join(', ') : message;
  
  if (!shouldShowError(errorText)) return;
  
  toast.error(`Error de validación: ${errorText}`, {
    duration: 5000,
    position: 'top-right'
  });
}

function handleAuthError() {
  // Limpiar token y redirigir a login
  Cookies.remove(process.env.NEXT_PUBLIC_JWT_STORAGE_KEY || 'biblioteca_token');
  
  if (typeof window !== 'undefined') {
    const currentPath = window.location.pathname;
    const redirectUrl = `/login?redirect=${encodeURIComponent(currentPath)}`;
    window.location.href = redirectUrl;
  }
  
  if (!shouldShowError('auth_error')) return;
  
  toast.error('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.', {
    duration: 6000,
    position: 'top-center',
    style: {
      background: '#fed7d7',
      color: '#c53030'
    }
  });
}

function handlePermissionError() {
  if (!shouldShowError('permission_error')) return;
  
  toast.error('No tienes permisos para realizar esta acción.', {
    duration: 5000,
    position: 'top-right',
    style: {
      background: '#fef5e7',
      color: '#d69e2e'
    }
  });
}

function handleNotFoundError(url?: string) {
  let message = 'Recurso no encontrado';
  
  // Mensajes específicos según la URL
  if (url?.includes('/loans/')) {
    message = 'El préstamo solicitado no existe';
  } else if (url?.includes('/people/')) {
    message = 'La persona solicitada no existe';
  } else if (url?.includes('/resources/')) {
    message = 'El recurso solicitado no existe';
  }
  
  if (!shouldShowError(message)) return;
  
  toast.error(message, {
    duration: 4000,
    position: 'top-right'
  });
}

function handleConflictError(message: string | string[]) {
  const errorText = Array.isArray(message) ? message.join(', ') : message;
  
  if (!shouldShowError(errorText)) return;
  
  toast.error(`Conflicto: ${errorText}`, {
    duration: 5000,
    position: 'top-right',
    style: {
      background: '#fef5e7',
      color: '#d69e2e'
    }
  });
}

function handleRateLimitError() {
  if (!shouldShowError('rate_limit')) return;
  
  toast.error('Demasiadas solicitudes. Por favor, espera un momento e intenta nuevamente.', {
    duration: 6000,
    position: 'top-center'
  });
}

function handleServerError(message: string | string[]) {
  const errorText = Array.isArray(message) ? message.join(', ') : message;
  
  if (!shouldShowError('server_error')) return;
  
  toast.error('Error interno del servidor. Por favor, intenta nuevamente en unos momentos.', {
    duration: 6000,
    position: 'top-center',
    style: {
      background: '#fed7d7',
      color: '#c53030'
    }
  });
  
  // Log para desarrollo
  if (process.env.NODE_ENV === 'development') {
    console.error('Server Error Details:', errorText);
  }
}

function handleServiceUnavailableError(status: number) {
  const statusMessages = {
    502: 'Servicio temporalmente no disponible (Error de Gateway)',
    503: 'Servicio en mantenimiento. Intenta más tarde',
    504: 'Tiempo de espera agotado. Intenta nuevamente'
  };
  
  const message = statusMessages[status as keyof typeof statusMessages] || 'Servicio no disponible';
  
  if (!shouldShowError(`service_unavailable_${status}`)) return;
  
  toast.error(message, {
    duration: 8000,
    position: 'top-center'
  });
}

function handleGenericError(status: number, message: string | string[]) {
  const errorText = Array.isArray(message) ? message.join(', ') : message;
  
  if (!shouldShowError(`generic_${status}`)) return;
  
  toast.error(`Error ${status}: ${errorText}`, {
    duration: 5000,
    position: 'top-right'
  });
}

function handleNetworkError(error: AxiosError) {
  let message = 'Error de conexión. Verifica tu conexión a internet.';
  
  // Mensajes específicos según el tipo de error de red
  if (error.code === 'ECONNABORTED') {
    message = 'La operación tardó demasiado tiempo. Intenta nuevamente.';
  } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
    message = 'No se puede conectar al servidor. Verifica tu conexión.';
  }
  
  if (!shouldShowError('network_error')) return;
  
  toast.error(message, {
    duration: 8000,
    position: 'top-center',
    style: {
      background: '#fed7d7',
      color: '#c53030'
    }
  });
}

function handleRequestConfigError(error: AxiosError) {
  if (process.env.NODE_ENV === 'development') {
    console.error('Request Configuration Error:', error.message);
  }
  
  if (!shouldShowError('config_error')) return;
  
  toast.error('Error en la configuración de la solicitud.', {
    duration: 4000,
    position: 'top-right'
  });
}

// ===== UTILIDADES =====

function shouldShowError(message: string): boolean {
  const now = Date.now();
  
  if (lastErrorMessage === message && (now - lastErrorTime) < ERROR_DEBOUNCE_TIME) {
    return false;
  }
  
  lastErrorMessage = message;
  lastErrorTime = now;
  return true;
}

// ===== UTILIDADES PÚBLICAS =====

export const axiosUtils = {
  /**
   * Crear una request con retry automático
   */
  createRetryRequest: <T = any>(
    config: AxiosRequestConfig,
    maxRetries: number = 3,
    retryDelay: number = 1000
  ): Promise<T> => {
    return new Promise((resolve, reject) => {
      let attempts = 0;
      
      const makeRequest = async () => {
        try {
          const response = await axiosInstance(config);
          resolve(response.data);
        } catch (error) {
          attempts++;
          
          if (attempts <= maxRetries && isRetryableError(error as AxiosError)) {
            setTimeout(makeRequest, retryDelay * attempts);
          } else {
            reject(error);
          }
        }
      };
      
      makeRequest();
    });
  },

  /**
   * Crear múltiples requests en paralelo con control de concurrencia
   */
  createBatchRequest: async <T = any>(
    configs: AxiosRequestConfig[],
    maxConcurrent: number = 5
  ): Promise<T[]> => {
    const results: T[] = [];
    
    for (let i = 0; i < configs.length; i += maxConcurrent) {
      const batch = configs.slice(i, i + maxConcurrent);
      const batchPromises = batch.map(config => axiosInstance(config));
      
      try {
        const batchResults = await Promise.allSettled(batchPromises);
        
        batchResults.forEach((result) => {
          if (result.status === 'fulfilled') {
            results.push(result.value.data);
          } else {
            console.error('Batch request failed:', result.reason);
          }
        });
      } catch (error) {
        console.error('Batch processing error:', error);
      }
    }
    
    return results;
  },

  /**
   * Verificar estado de conectividad
   */
  checkConnectivity: async (): Promise<boolean> => {
    try {
      await axiosInstance.get('/health', { timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Obtener métricas de performance
   */
  getPerformanceMetrics: () => {
    // Esta función se puede expandir para incluir métricas reales
    return {
      totalRequests: 0,
      averageResponseTime: 0,
      errorRate: 0
    };
  }
};

function isRetryableError(error: AxiosError): boolean {
  // Errores que se pueden reintentar
  const retryableStatusCodes = [408, 429, 500, 502, 503, 504];
  const retryableErrorCodes = ['ECONNABORTED', 'ENOTFOUND', 'ECONNREFUSED'];
  
  return (
    !error.response ||
    retryableStatusCodes.includes(error.response.status) ||
    retryableErrorCodes.includes(error.code || '')
  );
}

// Interceptor para métricas (opcional)
if (process.env.NODE_ENV === 'development') {
  let requestCount = 0;
  let totalResponseTime = 0;
  
  axiosInstance.interceptors.request.use((config) => {
    (config as any).startTime = Date.now();
    requestCount++;
    return config;
  });
  
  axiosInstance.interceptors.response.use((response) => {
    const responseTime = Date.now() - (response.config as any).startTime;
    totalResponseTime += responseTime;
    
    console.log(`📊 Request #${requestCount} completed in ${responseTime}ms`);
    console.log(`📈 Average response time: ${(totalResponseTime / requestCount).toFixed(2)}ms`);
    
    return response;
  });
}

export default axiosInstance;