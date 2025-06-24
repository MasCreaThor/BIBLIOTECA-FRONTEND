// src/hooks/useAuthors.ts - HOOK PARA GESTIÓN DE AUTORES
// ================================================================
// HOOK PERSONALIZADO PARA AUTORES CON REACT QUERY
// ================================================================

import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';
import type { 
  Author, 
  ApiResponse, 
  PaginatedResponse 
} from '@/types/api.types';
import toast from 'react-hot-toast';

// ===== INTERFACES =====
export interface CreateAuthorRequest {
  name: string;
  biography?: string;
}

export interface UpdateAuthorRequest {
  name?: string;
  biography?: string;
  active?: boolean;
}

export interface AuthorFilters {
  search?: string;
  active?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// ===== ENDPOINTS =====
const AUTHOR_ENDPOINTS = {
  AUTHORS: '/authors',
  AUTHOR_BY_ID: (id: string) => `/authors/${id}`,
  ACTIVATE: (id: string) => `/authors/${id}/activate`,
  DEACTIVATE: (id: string) => `/authors/${id}/deactivate`,
} as const;

// ===== SERVICIOS =====
class AuthorService {
  /**
   * Obtener autores con filtros
   */
  static async getAuthors(filters: AuthorFilters = {}): Promise<Author[]> {
    try {
      const params = new URLSearchParams();
      
      if (filters.search) params.append('search', filters.search);
      if (filters.active !== undefined) params.append('active', filters.active.toString());
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
      if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

      const url = params.toString() 
        ? `${AUTHOR_ENDPOINTS.AUTHORS}?${params.toString()}`
        : AUTHOR_ENDPOINTS.AUTHORS;

      const response = await axiosInstance.get<ApiResponse<PaginatedResponse<Author> | Author[]>>(url);

      if (response.data.success && response.data.data) {
        // El backend puede devolver array directo o paginado
        if (Array.isArray(response.data.data)) {
          return response.data.data;
        } else {
          return response.data.data.data || [];
        }
      }

      throw new Error(response.data.message || 'Error al obtener autores');
    } catch (error: any) {
      console.error('Error al obtener autores:', error);
      
      // Si el backend no soporta el endpoint, devolver array vacío
      if (error?.response?.status === 404) {
        return [];
      }
      
      throw error;
    }
  }

  /**
   * Obtener autor por ID
   */
  static async getAuthorById(id: string): Promise<Author> {
    const response = await axiosInstance.get<ApiResponse<Author>>(
      AUTHOR_ENDPOINTS.AUTHOR_BY_ID(id)
    );

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.message || 'Error al obtener autor');
  }

  /**
   * Crear autor
   */
  static async createAuthor(data: CreateAuthorRequest): Promise<Author> {
    const response = await axiosInstance.post<ApiResponse<Author>>(
      AUTHOR_ENDPOINTS.AUTHORS,
      data
    );

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.message || 'Error al crear autor');
  }

  /**
   * Actualizar autor
   */
  static async updateAuthor(id: string, data: UpdateAuthorRequest): Promise<Author> {
    const response = await axiosInstance.put<ApiResponse<Author>>(
      AUTHOR_ENDPOINTS.AUTHOR_BY_ID(id),
      data
    );

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.message || 'Error al actualizar autor');
  }

  /**
   * Eliminar autor
   */
  static async deleteAuthor(id: string): Promise<void> {
    const response = await axiosInstance.delete<ApiResponse<null>>(
      AUTHOR_ENDPOINTS.AUTHOR_BY_ID(id)
    );

    if (!response.data.success) {
      throw new Error(response.data.message || 'Error al eliminar autor');
    }
  }
}

// ===== QUERY KEYS =====
export const AUTHOR_QUERY_KEYS = {
  authors: ['authors'] as const,
  authorsList: (filters: AuthorFilters) => ['authors', 'list', filters] as const,
  author: (id: string) => ['authors', 'detail', id] as const,
} as const;

// ===== HOOKS =====

/**
 * Hook para obtener lista de autores
 */
export function useAuthors(
  filters: AuthorFilters = {},
  options?: Omit<UseQueryOptions<Author[]>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: AUTHOR_QUERY_KEYS.authorsList(filters),
    queryFn: () => AuthorService.getAuthors(filters),
    staleTime: 10 * 60 * 1000, // 10 minutos
    gcTime: 30 * 60 * 1000,    // 30 minutos
    retry: 2,
    ...options,
  });
}

/**
 * Hook para obtener autor por ID
 */
export function useAuthor(
  id: string,
  options?: Omit<UseQueryOptions<Author>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: AUTHOR_QUERY_KEYS.author(id),
    queryFn: () => AuthorService.getAuthorById(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 2,
    ...options,
  });
}

/**
 * Hook para crear autor
 */
export function useCreateAuthor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAuthorRequest) => AuthorService.createAuthor(data),
    onSuccess: (newAuthor) => {
      queryClient.invalidateQueries({ queryKey: AUTHOR_QUERY_KEYS.authors });
      toast.success(`Autor "${newAuthor.name}" creado exitosamente`);
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || error.message || 'Error al crear autor';
      toast.error(message);
    },
  });
}

/**
 * Hook para actualizar autor
 */
export function useUpdateAuthor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAuthorRequest }) =>
      AuthorService.updateAuthor(id, data),
    onSuccess: (updatedAuthor, { id }) => {
      queryClient.setQueryData(AUTHOR_QUERY_KEYS.author(id), updatedAuthor);
      queryClient.invalidateQueries({ queryKey: AUTHOR_QUERY_KEYS.authors });
      toast.success(`Autor "${updatedAuthor.name}" actualizado exitosamente`);
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || error.message || 'Error al actualizar autor';
      toast.error(message);
    },
  });
}

/**
 * Hook para eliminar autor
 */
export function useDeleteAuthor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => AuthorService.deleteAuthor(id),
    onSuccess: (_, deletedId) => {
      queryClient.removeQueries({ queryKey: AUTHOR_QUERY_KEYS.author(deletedId) });
      queryClient.invalidateQueries({ queryKey: AUTHOR_QUERY_KEYS.authors });
      toast.success('Autor eliminado exitosamente');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || error.message || 'Error al eliminar autor';
      toast.error(message);
    },
  });
}

/**
 * Hook para búsqueda de autores (utilidad común)
 */
export function useSearchAuthors(searchTerm: string) {
  return useAuthors(
    { 
      search: searchTerm, 
      active: true,
      limit: 50 
    },
    {
      enabled: searchTerm.length >= 2, // Solo buscar con al menos 2 caracteres
      staleTime: 2 * 60 * 1000,        // 2 minutos para búsquedas
    }
  );
}

/**
 * Hook alias para búsqueda de autores (compatibilidad)
 */
export function useAuthorSearch(searchTerm: string) {
  return useSearchAuthors(searchTerm);
}

/**
 * Hook para crear múltiples autores (bulk)
 */
export function useBulkCreateAuthors() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (authorsData: CreateAuthorRequest[]) => {
      const promises = authorsData.map(authorData => 
        AuthorService.createAuthor(authorData)
      );
      return Promise.all(promises);
    },
    onSuccess: (newAuthors) => {
      queryClient.invalidateQueries({ queryKey: AUTHOR_QUERY_KEYS.authors });
      toast.success(`${newAuthors.length} autores creados exitosamente`);
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || error.message || 'Error al crear autores';
      toast.error(message);
    },
  });
}