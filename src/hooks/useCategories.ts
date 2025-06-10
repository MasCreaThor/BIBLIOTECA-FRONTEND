// src/hooks/useCategories.ts
import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { CategoryService } from '@/services/category.service';
import type {
  Category,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  CategoryFilters,
} from '@/services/category.service';
import type { PaginatedResponse } from '@/types/api.types';
import toast from 'react-hot-toast';

// Query keys para React Query
export const CATEGORY_QUERY_KEYS = {
  categories: ['categories'] as const,
  categoriesList: (filters: CategoryFilters) => ['categories', 'list', filters] as const,
  category: (id: string) => ['categories', 'detail', id] as const,
  categoryStats: ['categories', 'stats'] as const,
} as const;

/**
 * Hook para obtener lista de categorías con filtros
 */
export function useCategories(
  filters: CategoryFilters = {},
  options?: Omit<UseQueryOptions<PaginatedResponse<Category> | Category[]>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: CATEGORY_QUERY_KEYS.categoriesList(filters),
    queryFn: async () => {
      try {
        // Intentar obtener respuesta paginada
        const response = await CategoryService.getCategories(filters);
        return response;
      } catch (error: any) {
        // Si el backend aún no soporta paginación, manejar como array simple
        if (error?.response?.status === 404 || error?.message?.includes('pagination')) {
          console.warn('API de categorías no soporta paginación, usando formato simple');
          
          // Hacer una llamada más simple si existe endpoint alternativo
          try {
            const simpleResponse = await fetch('/api/categories');
            if (simpleResponse.ok) {
              const data = await simpleResponse.json();
              return Array.isArray(data) ? data : data.data || [];
            }
          } catch (simpleError) {
            console.error('Error en llamada simple a categorías:', simpleError);
          }
        }
        
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    retry: (failureCount, error: any) => {
      // No reintentar en errores 4xx
      if (error?.response?.status >= 400 && error?.response?.status < 500) {
        return false;
      }
      return failureCount < 2;
    },
    // En caso de error, intentar con datos en cache o devolver array vacío
    placeholderData: [] as Category[],
    ...options,
  });
}

/**
 * Hook para obtener una categoría por ID
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
    gcTime: 15 * 60 * 1000,
    retry: 2,
    ...options,
  });
}

/**
 * Hook para obtener estadísticas de categorías
 */
export function useCategoryStats(
  options?: Omit<UseQueryOptions<Awaited<ReturnType<typeof CategoryService.getCategoryStats>>>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: CATEGORY_QUERY_KEYS.categoryStats,
    queryFn: async () => {
      return await CategoryService.getCategoryStats();
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    retry: 1, // Menos reintentos para estadísticas
    
    // Configuración para manejar errores de manera más robusta
    retryOnMount: false,
    refetchOnWindowFocus: false,
    
    // Datos por defecto en caso de error
    placeholderData: {
      total: 0,
      active: 0,
      inactive: 0,
      resourceCount: {},
    },
    ...options,
  });
}

/**
 * Hook para crear una categoría
 */
export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCategoryRequest) => CategoryService.createCategory(data),
    onSuccess: (newCategory) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: CATEGORY_QUERY_KEYS.categories });
      queryClient.invalidateQueries({ queryKey: CATEGORY_QUERY_KEYS.categoryStats });
      
      // Agregar al cache
      queryClient.setQueryData(
        CATEGORY_QUERY_KEYS.category(newCategory._id),
        newCategory
      );

      toast.success(`Categoría "${newCategory.name}" creada exitosamente`);
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || error?.message || 'Error al crear categoría';
      toast.error(Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage);
    },
  });
}

/**
 * Hook para actualizar una categoría
 */
export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCategoryRequest }) => 
      CategoryService.updateCategory(id, data),
    onSuccess: (updatedCategory) => {
      // Actualizar cache específico
      queryClient.setQueryData(
        CATEGORY_QUERY_KEYS.category(updatedCategory._id),
        updatedCategory
      );

      // Invalidar listas
      queryClient.invalidateQueries({ queryKey: CATEGORY_QUERY_KEYS.categories });
      
      toast.success(`Categoría "${updatedCategory.name}" actualizada exitosamente`);
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || error?.message || 'Error al actualizar categoría';
      toast.error(Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage);
    },
  });
}

/**
 * Hook para eliminar una categoría
 */
export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => CategoryService.deleteCategory(id),
    onSuccess: (_, deletedId) => {
      // Remover del cache
      queryClient.removeQueries({ queryKey: CATEGORY_QUERY_KEYS.category(deletedId) });
      
      // Invalidar listas y estadísticas
      queryClient.invalidateQueries({ queryKey: CATEGORY_QUERY_KEYS.categories });
      queryClient.invalidateQueries({ queryKey: CATEGORY_QUERY_KEYS.categoryStats });
      
      toast.success('Categoría eliminada exitosamente');
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || error?.message || 'Error al eliminar categoría';
      toast.error(Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage);
    },
  });
}