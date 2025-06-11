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
  // ELIMINADO: CATEGORY_STATS endpoint que causaba errores
} as const;

export class CategoryService {
  // ELIMINADO: Método isStatsEndpointAvailable que causaba problemas

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

  // ELIMINADOS: Todos los métodos relacionados con estadísticas:
  // - calculateStatsFromCategories()
  // - getCategoryStats()
  // Estos métodos estaban causando el error 500 al intentar acceder a endpoints inexistentes
}