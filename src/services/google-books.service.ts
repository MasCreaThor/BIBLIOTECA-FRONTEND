import axiosInstance from '@/lib/axios';
import type {
  GoogleBooksVolume,
  CreateResourceFromGoogleBooksRequest,
  Resource,
  ApiResponse,
} from '@/types';

// ===== ENDPOINTS =====
const GOOGLE_BOOKS_ENDPOINTS = {
  STATUS: '/google-books/status',
  SEARCH: '/google-books/search',
  SEARCH_BY_ISBN: (isbn: string) => `/google-books/isbn/${isbn}`,
  VOLUME_BY_ID: (volumeId: string) => `/google-books/volume/${volumeId}`,
  CREATE_RESOURCE: '/resources/google-books',
} as const;

export class GoogleBooksService {
  
  /**
   * Verificar el estado de la API de Google Books
   */
  static async checkGoogleBooksStatus(): Promise<{ apiAvailable: boolean; lastCheck: Date }> {
    try {
      console.log('🔍 GoogleBooksService: Verificando estado de la API');
      
      const response = await axiosInstance.get<ApiResponse<{ apiAvailable: boolean; lastCheck: Date }>>(
        GOOGLE_BOOKS_ENDPOINTS.STATUS
      );
      
      if (response.data.success && response.data.data) {
        console.log('✅ GoogleBooksService: Estado de API obtenido:', response.data.data.apiAvailable);
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Error al verificar estado de Google Books API');
      
    } catch (error: any) {
      console.error('❌ GoogleBooksService: Error al verificar estado:', error);
      throw error;
    }
  }

  /**
   * Buscar libros en Google Books
   */
  static async searchGoogleBooks(query: string, maxResults: number = 10): Promise<GoogleBooksVolume[]> {
    try {
      console.log('🔍 GoogleBooksService: Buscando libros:', query);
      
      const params = new URLSearchParams({
        q: query,
        maxResults: maxResults.toString(),
      });
      
      const response = await axiosInstance.get<ApiResponse<GoogleBooksVolume[]>>(
        `${GOOGLE_BOOKS_ENDPOINTS.SEARCH}?${params.toString()}`
      );
      
      if (response.data.success && response.data.data) {
        console.log('✅ GoogleBooksService: Búsqueda completada, resultados:', response.data.data.length);
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Error al buscar en Google Books');
      
    } catch (error: any) {
      console.error('❌ GoogleBooksService: Error en búsqueda:', error);
      throw error;
    }
  }

  /**
   * Buscar libro por ISBN
   */
  static async searchByISBN(isbn: string): Promise<GoogleBooksVolume | null> {
    try {
      console.log('🔍 GoogleBooksService: Buscando por ISBN:', isbn);
      
      const response = await axiosInstance.get<ApiResponse<GoogleBooksVolume | null>>(
        GOOGLE_BOOKS_ENDPOINTS.SEARCH_BY_ISBN(isbn)
      );
      
      if (response.data.success) {
        console.log('✅ GoogleBooksService: Búsqueda por ISBN completada');
        return response.data.data || null;
      }
      
      throw new Error(response.data.message || 'Error al buscar por ISBN');
      
    } catch (error: any) {
      console.error('❌ GoogleBooksService: Error en búsqueda por ISBN:', error);
      throw error;
    }
  }

  /**
   * Obtener detalles de un volumen por ID
   */
  static async getVolumeById(volumeId: string): Promise<GoogleBooksVolume | null> {
    try {
      console.log('🔍 GoogleBooksService: Obteniendo volumen:', volumeId);
      
      const response = await axiosInstance.get<ApiResponse<GoogleBooksVolume | null>>(
        GOOGLE_BOOKS_ENDPOINTS.VOLUME_BY_ID(volumeId)
      );
      
      if (response.data.success) {
        console.log('✅ GoogleBooksService: Volumen obtenido exitosamente');
        return response.data.data || null;
      }
      
      throw new Error(response.data.message || 'Error al obtener volumen');
      
    } catch (error: any) {
      console.error('❌ GoogleBooksService: Error al obtener volumen:', error);
      throw error;
    }
  }

  /**
   * Crear recurso desde Google Books
   */
  static async createResourceFromGoogleBooks(data: CreateResourceFromGoogleBooksRequest): Promise<Resource> {
    try {
      console.log('📝 GoogleBooksService: Creando recurso desde Google Books:', data.googleBooksId);
      
      const response = await axiosInstance.post<ApiResponse<Resource>>(
        GOOGLE_BOOKS_ENDPOINTS.CREATE_RESOURCE,
        data
      );
      
      if (response.data.success && response.data.data) {
        console.log('✅ GoogleBooksService: Recurso creado desde Google Books:', response.data.data._id);
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Error al crear recurso desde Google Books');
      
    } catch (error: any) {
      console.error('❌ GoogleBooksService: Error al crear recurso:', error);
      throw error;
    }
  }
} 