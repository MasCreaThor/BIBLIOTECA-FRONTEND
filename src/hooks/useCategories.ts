// src/hooks/useCategories.ts - HOOK PARA GESTIÓN DE CATEGORÍAS
// ================================================================
// HOOK PERSONALIZADO PARA CATEGORÍAS CON REACT QUERY
// ================================================================

import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';
import type { 
  Category, 
  ApiResponse, 
  PaginatedResponse 
} from '@/types/api.types';
import toast from 'react-hot-toast';

// ===== INTERFACES =====
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

// ===== ENDPOINTS =====
const CATEGORY_ENDPOINTS = {
  CATEGORIES: '/categories',
  CATEGORY_BY_ID: (id: string) => `/categories/${id}`,
  ACTIVATE: (id: string) => `/categories/${id}/activate`,
  DEACTIVATE: (id: string) => `/categories/${id}/deactivate`,
} as const;

// ===== SERVICIOS =====
class CategoryService {
  /**
   * Obtener categorías con filtros
   */
  static async getCategories(filters: CategoryFilters = {}): Promise<Category[]> {
    try {
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

      const response = await axiosInstance.get<ApiResponse<PaginatedResponse<Category> | Category[]>>(url);

      if (response.data.success && response.data.data) {
        // El backend puede devolver array directo o paginado
        if (Array.isArray(response.data.data)) {
          return response.data.data;
        } else {
          return response.data.data.data || [];
        }
      }

      throw new Error(response.data.message || 'Error al obtener categorías');
    } catch (error: any) {
      console.error('Error al obtener categorías:', error);
      
      // Fallback con categorías predeterminadas si el backend no las tiene
      if (error?.response?.status === 404) {
        const defaultCategories: Category[] = [
          {
            _id: 'default-literatura',
            name: 'Literatura',
            description: 'Libros de literatura general',
            color: '#3b82f6',
            active: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            _id: 'default-ciencias',
            name: 'Ciencias',
            description: 'Libros de ciencias naturales y exactas',
            color: '#10b981',
            active: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            _id: 'default-historia',
            name: 'Historia',
            description: 'Libros de historia y geografía',
            color: '#f59e0b',
            active: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            _id: 'default-arte',
            name: 'Arte',
            description: 'Libros de arte y cultura',
            color: '#8b5cf6',
            active: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            _id: 'default-educacion',
            name: 'Educación',
            description: 'Material educativo y didáctico',
            color: '#ef4444',
            active: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ];
        
        return defaultCategories;
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
   * Crear categoría
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
   * Actualizar categoría
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
   * Eliminar categoría
   */
  static async deleteCategory(id: string): Promise<void> {
    const response = await axiosInstance.delete<ApiResponse<null>>(
      CATEGORY_ENDPOINTS.CATEGORY_BY_ID(id)
    );

    if (!response.data.success) {
      throw new Error(response.data.message || 'Error al eliminar categoría');
    }
  }
}

// ===== QUERY KEYS =====
export const CATEGORY_QUERY_KEYS = {
  categories: ['categories'] as const,
  categoriesList: (filters: CategoryFilters) => ['categories', 'list', filters] as const,
  category: (id: string) => ['categories', 'detail', id] as const,
} as const;

// ===== HOOKS =====

/**
 * Hook para obtener lista de categorías
 */
export function useCategories(
  filters: CategoryFilters = {},
  options?: Omit<UseQueryOptions<Category[]>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: CATEGORY_QUERY_KEYS.categoriesList(filters),
    queryFn: () => CategoryService.getCategories(filters),
    staleTime: 10 * 60 * 1000, // 10 minutos - categorías cambian poco frecuentemente
    gcTime: 30 * 60 * 1000,    // 30 minutos
    retry: 2,
    ...options,
  });
}

/**
 * Hook para obtener categoría por ID
 */
export function useCategory(
  id: string,
  options?: Omit<UseQueryOptions<Category>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: CATEGORY_QUERY_KEYS.category(id),
    queryFn: () => CategoryService.getCategoryById(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 2,
    ...options,
  });
}

/**
 * Hook para crear categoría
 */
export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCategoryRequest) => CategoryService.createCategory(data),
    onSuccess: (newCategory) => {
      queryClient.invalidateQueries({ queryKey: CATEGORY_QUERY_KEYS.categories });
      toast.success(`Categoría "${newCategory.name}" creada exitosamente`);
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || error.message || 'Error al crear categoría';
      toast.error(message);
    },
  });
}

/**
 * Hook para actualizar categoría
 */
export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCategoryRequest }) =>
      CategoryService.updateCategory(id, data),
    onSuccess: (updatedCategory, { id }) => {
      queryClient.setQueryData(CATEGORY_QUERY_KEYS.category(id), updatedCategory);
      queryClient.invalidateQueries({ queryKey: CATEGORY_QUERY_KEYS.categories });
      toast.success(`Categoría "${updatedCategory.name}" actualizada exitosamente`);
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || error.message || 'Error al actualizar categoría';
      toast.error(message);
    },
  });
}

/**
 * Hook para eliminar categoría
 */
export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => CategoryService.deleteCategory(id),
    onSuccess: (_, deletedId) => {
      queryClient.removeQueries({ queryKey: CATEGORY_QUERY_KEYS.category(deletedId) });
      queryClient.invalidateQueries({ queryKey: CATEGORY_QUERY_KEYS.categories });
      toast.success('Categoría eliminada exitosamente');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || error.message || 'Error al eliminar categoría';
      toast.error(message);
    },
  });
}

/**
 * Hook para obtener categorías activas (utilidad común)
 */
export function useActiveCategories() {
  return useCategories({ active: true }, {
    staleTime: 15 * 60 * 1000, // 15 minutos para categorías activas
  });
}

/**
 * Hook para obtener categorías con colores (utilidad para UI)
 */
export function useCategoriesWithColors() {
  return useCategories({ active: true }, {
    select: (categories) => categories.map(category => ({
      ...category,
      colorCode: category.color || '#6b7280', // Color por defecto si no tiene
    })),
    staleTime: 15 * 60 * 1000,
  });
}