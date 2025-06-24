import apiClient from '@/lib/axios';

export interface SystemConfig {
  id?: string;
  sidebarTitle: string;
  sidebarSubtitle: string;
  sidebarIcon: string;
  sidebarIconUrl?: string;
  sidebarIconImage?: string;
  version: string;
  lastUpdated: string;
  active?: boolean;
  description?: string;
}

export interface CreateSystemConfigDto {
  sidebarTitle: string;
  sidebarSubtitle: string;
  sidebarIcon: string;
  sidebarIconUrl?: string;
  sidebarIconImage?: string;
  version: string;
  description?: string;
}

export interface UpdateSystemConfigDto {
  sidebarTitle?: string;
  sidebarSubtitle?: string;
  sidebarIcon?: string;
  sidebarIconUrl?: string;
  sidebarIconImage?: string;
  version?: string;
  description?: string;
  active?: boolean;
}

class SystemConfigService {
  private readonly baseUrl = '/system-config';

  /**
   * Obtener la configuración activa del sistema
   */
  async getActiveConfig(): Promise<SystemConfig> {
    try {
      console.log('🌐 Haciendo petición GET a:', this.baseUrl);
      const response = await apiClient.get(this.baseUrl);
      console.log('✅ Respuesta del servidor:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error fetching active system config:', error);
      console.error('📊 Detalles del error:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
      });
      throw error;
    }
  }

  /**
   * Crear nueva configuración del sistema
   */
  async createConfig(config: CreateSystemConfigDto): Promise<SystemConfig> {
    try {
      console.log('🌐 Creando nueva configuración:', config);
      const response = await apiClient.post(this.baseUrl, config);
      console.log('✅ Configuración creada:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error creating system config:', error);
      console.error('📊 Detalles del error:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
      });
      throw error;
    }
  }

  /**
   * Actualizar configuración del sistema
   */
  async updateConfig(config: UpdateSystemConfigDto): Promise<SystemConfig> {
    try {
      console.log('🌐 Actualizando configuración:', config);
      const response = await apiClient.put(this.baseUrl, config);
      console.log('✅ Configuración actualizada:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error updating system config:', error);
      console.error('📊 Detalles del error:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
      });
      throw error;
    }
  }

  /**
   * Subir logo/imagen del sistema
   */
  async uploadLogo(file: File): Promise<SystemConfig> {
    try {
      console.log('🌐 Subiendo logo:', file.name, file.size, 'bytes');
      const formData = new FormData();
      formData.append('logo', file);

      const response = await apiClient.post(`${this.baseUrl}/upload-logo`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('✅ Logo subido correctamente:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error uploading system logo:', error);
      console.error('📊 Detalles del error:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
      });
      throw error;
    }
  }

  /**
   * Obtener historial de configuraciones
   */
  async getConfigHistory(limit: number = 10): Promise<SystemConfig[]> {
    try {
      console.log('🌐 Obteniendo historial de configuraciones, límite:', limit);
      const response = await apiClient.get(`${this.baseUrl}/history`, {
        params: { limit },
      });
      console.log('✅ Historial obtenido:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error fetching system config history:', error);
      console.error('📊 Detalles del error:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
      });
      throw error;
    }
  }

  /**
   * Restaurar configuración anterior
   */
  async restoreConfig(configId: string): Promise<SystemConfig> {
    try {
      console.log('🌐 Restaurando configuración:', configId);
      const response = await apiClient.post(`${this.baseUrl}/restore/${configId}`);
      console.log('✅ Configuración restaurada:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error restoring system config:', error);
      console.error('📊 Detalles del error:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
      });
      throw error;
    }
  }

  /**
   * Validar URL de imagen
   */
  async validateImageUrl(url: string): Promise<boolean> {
    try {
      console.log('🔍 Validando URL de imagen:', url);
      
      // Primero intentar con HEAD request
      try {
        const headResponse = await fetch(url, { 
          method: 'HEAD',
          mode: 'cors',
          cache: 'no-cache'
        });
        
        console.log('📊 Respuesta HEAD:', {
          status: headResponse.status,
          statusText: headResponse.statusText,
          contentType: headResponse.headers.get('content-type'),
          contentLength: headResponse.headers.get('content-length'),
        });
        
        if (headResponse.ok) {
          const contentType = headResponse.headers.get('content-type');
          const isValid = contentType ? contentType.startsWith('image/') : false;
          console.log('✅ Validación HEAD exitosa:', isValid, contentType);
          return isValid;
        }
      } catch (headError) {
        console.log('⚠️ HEAD request falló, intentando GET:', headError);
      }

      // Si HEAD falla, intentar con GET request
      try {
        const getResponse = await fetch(url, { 
          method: 'GET',
          mode: 'cors',
          cache: 'no-cache'
        });
        
        console.log('📊 Respuesta GET:', {
          status: getResponse.status,
          statusText: getResponse.statusText,
          contentType: getResponse.headers.get('content-type'),
          contentLength: getResponse.headers.get('content-length'),
        });
        
        if (getResponse.ok) {
          const contentType = getResponse.headers.get('content-type');
          const isValid = contentType ? contentType.startsWith('image/') : false;
          console.log('✅ Validación GET exitosa:', isValid, contentType);
          return isValid;
        }
      } catch (getError) {
        console.log('⚠️ GET request también falló:', getError);
      }

      // Si ambos fallan, intentar crear una imagen para validar
      try {
        return new Promise((resolve) => {
          const img = new Image();
          img.onload = () => {
            console.log('✅ Validación por carga de imagen exitosa');
            resolve(true);
          };
          img.onerror = () => {
            console.log('❌ Validación por carga de imagen falló');
            resolve(false);
          };
          img.src = url;
          
          // Timeout después de 5 segundos
          setTimeout(() => {
            console.log('⏰ Timeout en validación de imagen');
            resolve(false);
          }, 5000);
        });
      } catch (imgError) {
        console.log('❌ Error en validación por imagen:', imgError);
        return false;
      }
    } catch (error) {
      console.error('❌ Error general validando image URL:', error);
      return false;
    }
  }

  /**
   * Función de prueba para verificar una URL específica
   */
  async testImageUrl(url: string): Promise<{ isValid: boolean; details: any }> {
    try {
      console.log('🧪 Probando URL específica:', url);
      
      const result: {
        isValid: boolean;
        details: {
          url: string;
          headResponse: any;
          getResponse: any;
          imageLoad: any;
          errors: Array<{ type: string; error: string }>;
        };
      } = {
        isValid: false,
        details: {
          url,
          headResponse: null,
          getResponse: null,
          imageLoad: null,
          errors: []
        }
      };

      // Probar HEAD
      try {
        const headResponse = await fetch(url, { 
          method: 'HEAD',
          mode: 'cors',
          cache: 'no-cache'
        });
        
        result.details.headResponse = {
          status: headResponse.status,
          statusText: headResponse.statusText,
          contentType: headResponse.headers.get('content-type'),
          contentLength: headResponse.headers.get('content-length'),
          headers: Object.fromEntries(headResponse.headers.entries())
        };
        
        if (headResponse.ok) {
          const contentType = headResponse.headers.get('content-type');
          result.isValid = contentType ? contentType.startsWith('image/') : false;
        }
      } catch (error: any) {
        result.details.errors.push({ type: 'HEAD', error: error.message || 'Unknown error' });
      }

      // Si HEAD no funcionó, probar GET
      if (!result.isValid) {
        try {
          const getResponse = await fetch(url, { 
            method: 'GET',
            mode: 'cors',
            cache: 'no-cache'
          });
          
          result.details.getResponse = {
            status: getResponse.status,
            statusText: getResponse.statusText,
            contentType: getResponse.headers.get('content-type'),
            contentLength: getResponse.headers.get('content-length'),
            headers: Object.fromEntries(getResponse.headers.entries())
          };
          
          if (getResponse.ok) {
            const contentType = getResponse.headers.get('content-type');
            result.isValid = contentType ? contentType.startsWith('image/') : false;
          }
        } catch (error: any) {
          result.details.errors.push({ type: 'GET', error: error.message || 'Unknown error' });
        }
      }

      // Si ambos fallan, probar carga de imagen
      if (!result.isValid) {
        try {
          result.isValid = await new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
              result.details.imageLoad = { success: true };
              resolve(true);
            };
            img.onerror = () => {
              result.details.imageLoad = { success: false };
              resolve(false);
            };
            img.src = url;
            
            setTimeout(() => {
              result.details.imageLoad = { success: false, timeout: true };
              resolve(false);
            }, 5000);
          });
        } catch (error: any) {
          result.details.errors.push({ type: 'IMAGE_LOAD', error: error.message || 'Unknown error' });
        }
      }

      console.log('🧪 Resultado de prueba:', result);
      return result;
    } catch (error: any) {
      console.error('❌ Error en prueba de URL:', error);
      return {
        isValid: false,
        details: { url, error: error.message || 'Unknown error' }
      };
    }
  }
}

export const systemConfigService = new SystemConfigService(); 