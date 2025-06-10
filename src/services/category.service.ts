// src/services/category.service.ts - VERSIÓN CORREGIDA
import axiosInstance from '@/lib/axios';
import type { ApiResponse, PaginatedResponse } from '@/types/api.types';

export interface Category {
  _id: string;
  name: string;
  description: string;
  color: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCategoryRequest {
  name: string;
  description: string;
  color?: string;
}

export interface UpdateCategoryRequest {
  name?: string;
  description?: string;
  color?: string;
  active?: boolean;
}

export interface CategoryFilters {
  search?: string;
  active?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

const CATEGORY_ENDPOINTS = {
  CATEGORIES: '/categories',
  CATEGORY_BY_ID: (id: string) => `/categories/${id}`,
  CATEGORY_STATS: '/categories/stats', // Añadido para claridad
} as const;

export class CategoryService {
  /**
   * Verificar si el endpoint de estadísticas está disponible
   */
  private static async isStatsEndpointAvailable(): Promise<boolean> {
    try {
      // Usar HEAD request para verificar sin obtener datos
      const response = await axiosInstance.head(CATEGORY_ENDPOINTS.CATEGORY_STATS);
      return response.status === 200;
    } catch (error: any) {
      // Si retorna 404, 500, etc., el endpoint no está disponible
      return false;
    }
  }

  /**
   * Obtener todas las categorías
   */
  static async getCategories(filters: CategoryFilters = {}): Promise<PaginatedResponse<Category> | Category[]> {
    const params = new URLSearchParams();
    
    if (filters.search) params.append('search', filters.search);
    if (filters.active !== undefined) params.append('active', filters.active.toString());
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

    const url = params.toString() 
      ? `${CATEGORY_ENDPOINTS.CATEGORIES}?${params.toString()}`
      : CATEGORY_ENDPOINTS.CATEGORIES;

    try {
      const response = await axiosInstance.get<ApiResponse<PaginatedResponse<Category>>>(url);

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      throw new Error(response.data.message || 'Error al obtener categorías');
    } catch (error: any) {
      // Si el backend no soporta paginación, puede devolver un array directo
      if (error?.response?.data && Array.isArray(error.response.data)) {
        return error.response.data as Category[];
      }
      
      throw error;
    }
  }

  /**
   * Obtener categoría por ID
   */
  static async getCategoryById(id: string): Promise<Category> {
    const response = await axiosInstance.get<ApiResponse<Category>>(
      CATEGORY_ENDPOINTS.CATEGORY_BY_ID(id)
    );

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.message || 'Error al obtener categoría');
  }

  /**
   * Crear una nueva categoría
   */
  static async createCategory(data: CreateCategoryRequest): Promise<Category> {
    const response = await axiosInstance.post<ApiResponse<Category>>(
      CATEGORY_ENDPOINTS.CATEGORIES,
      data
    );

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.message || 'Error al crear categoría');
  }

  /**
   * Actualizar una categoría
   */
  static async updateCategory(id: string, data: UpdateCategoryRequest): Promise<Category> {
    const response = await axiosInstance.put<ApiResponse<Category>>(
      CATEGORY_ENDPOINTS.CATEGORY_BY_ID(id),
      data
    );

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.message || 'Error al actualizar categoría');
  }

  /**
   * Eliminar una categoría
   */
  static async deleteCategory(id: string): Promise<void> {
    const response = await axiosInstance.delete<ApiResponse<null>>(
      CATEGORY_ENDPOINTS.CATEGORY_BY_ID(id)
    );

    if (!response.data.success) {
      throw new Error(response.data.message || 'Error al eliminar categoría');
    }
  }

  /**
   * Calcular estadísticas desde la lista de categorías (método local)
   */
  private static async calculateStatsFromCategories(): Promise<{
    total: number;
    active: number;
    inactive: number;
    resourceCount: Record<string, number>;
  }> {
    try {
      console.log('📊 Calculando estadísticas de categorías desde datos locales...');
      
      const categoriesResponse = await this.getCategories({ limit: 1000 });
      
      // Normalizar la respuesta (puede ser array directo o paginado)
      let categories: Category[];
      if (Array.isArray(categoriesResponse)) {
        categories = categoriesResponse;
      } else if (categoriesResponse.data && Array.isArray(categoriesResponse.data)) {
        categories = categoriesResponse.data;
      } else {
        categories = [];
      }
      
      const total = categories.length;
      const active = categories.filter(cat => cat.active !== false).length; // Por defecto, consideramos activo
      const inactive = total - active;
      
      // Por ahora, resourceCount será vacío ya que requiere consultar la relación con recursos
      const resourceCount: Record<string, number> = {};
      
      return {
        total,
        active,
        inactive,
        resourceCount,
      };
    } catch (error) {
      console.error('❌ Error calculando estadísticas locales:', error);
      
      // Último fallback: estadísticas vacías
      return {
        total: 0,
        active: 0,
        inactive: 0,
        resourceCount: {},
      };
    }
  }

  /**
   * Obtener estadísticas de categorías con fallback robusto
   */
  static async getCategoryStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    resourceCount: Record<string, number>;
  }> {
    // Intentar primero verificar si el endpoint está disponible
    const isStatsAvailable = await this.isStatsEndpointAvailable();
    
    if (isStatsAvailable) {
      try {
        console.log('📊 Obteniendo estadísticas desde endpoint dedicado...');
        
        const response = await axiosInstance.get<ApiResponse<any>>(
          CATEGORY_ENDPOINTS.CATEGORY_STATS
        );

        if (response.data.success && response.data.data) {
          return response.data.data;
        }
      } catch (error: any) {
        console.warn('⚠️ Endpoint de estadísticas falló, usando fallback...');
      }
    } else {
      console.log('🔄 Endpoint de estadísticas no disponible, calculando localmente...');
    }

    // Fallback: calcular estadísticas desde la lista de categorías
    return await this.calculateStatsFromCategories();
  }
}