// src/hooks/usePublishers.ts - HOOK PARA GESTIÓN DE EDITORIALES
// ================================================================
// HOOK PERSONALIZADO PARA EDITORIALES CON REACT QUERY
// ================================================================

import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';
import type { 
  Publisher, 
  ApiResponse, 
  PaginatedResponse 
} from '@/types/api.types';
import toast from 'react-hot-toast';

// ===== INTERFACES =====
export interface CreatePublisherRequest {
  name: string;
  description?: string;
}

export interface UpdatePublisherRequest {
  name?: string;
  description?: string;
  active?: boolean;
}

export interface PublisherFilters {
  search?: string;
  active?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// ===== ENDPOINTS =====
const PUBLISHER_ENDPOINTS = {
  PUBLISHERS: '/publishers',
  PUBLISHER_BY_ID: (id: string) => `/publishers/${id}`,
  ACTIVATE: (id: string) => `/publishers/${id}/activate`,
  DEACTIVATE: (id: string) => `/publishers/${id}/deactivate`,
} as const;

// ===== SERVICIOS =====
class PublisherService {
  /**
   * Obtener editoriales con filtros
   */
  static async getPublishers(filters: PublisherFilters = {}): Promise<Publisher[]> {
    try {
      const params = new URLSearchParams();
      
      if (filters.search) params.append('search', filters.search);
      if (filters.active !== undefined) params.append('active', filters.active.toString());
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
      if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

      const url = params.toString() 
        ? `${PUBLISHER_ENDPOINTS.PUBLISHERS}?${params.toString()}`
        : PUBLISHER_ENDPOINTS.PUBLISHERS;

      const response = await axiosInstance.get<ApiResponse<PaginatedResponse<Publisher> | Publisher[]>>(url);

      if (response.data.success && response.data.data) {
        // El backend puede devolver array directo o paginado
        if (Array.isArray(response.data.data)) {
          return response.data.data;
        } else {
          return response.data.data.data || [];
        }
      }

      throw new Error(response.data.message || 'Error al obtener editoriales');
    } catch (error: any) {
      console.error('Error al obtener editoriales:', error);
      // Si el backend no soporta el endpoint, devolver array vacío
      if (error?.response?.status === 404) {
        return [];
      }
      throw error;
    }
  }

  /**
   * Obtener editorial por ID
   */
  static async getPublisherById(id: string): Promise<Publisher> {
    const response = await axiosInstance.get<ApiResponse<Publisher>>(
      PUBLISHER_ENDPOINTS.PUBLISHER_BY_ID(id)
    );

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.message || 'Error al obtener editorial');
  }

  /**
   * Crear editorial
   */
  static async createPublisher(data: CreatePublisherRequest): Promise<Publisher> {
    const response = await axiosInstance.post<ApiResponse<Publisher>>(
      PUBLISHER_ENDPOINTS.PUBLISHERS,
      data
    );

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.message || 'Error al crear editorial');
  }

  /**
   * Actualizar editorial
   */
  static async updatePublisher(id: string, data: UpdatePublisherRequest): Promise<Publisher> {
    const response = await axiosInstance.put<ApiResponse<Publisher>>(
      PUBLISHER_ENDPOINTS.PUBLISHER_BY_ID(id),
      data
    );

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.message || 'Error al actualizar editorial');
  }

  /**
   * Eliminar editorial
   */
  static async deletePublisher(id: string): Promise<void> {
    const response = await axiosInstance.delete<ApiResponse<null>>(
      PUBLISHER_ENDPOINTS.PUBLISHER_BY_ID(id)
    );

    if (!response.data.success) {
      throw new Error(response.data.message || 'Error al eliminar editorial');
    }
  }
}

// ===== QUERY KEYS =====
export const PUBLISHER_QUERY_KEYS = {
  publishers: ['publishers'] as const,
  publishersList: (filters: PublisherFilters) => ['publishers', 'list', filters] as const,
  publisher: (id: string) => ['publishers', 'detail', id] as const,
} as const;

// ===== HOOKS =====

/**
 * Hook para obtener lista de editoriales
 */
export function usePublishers(
  filters: PublisherFilters = {},
  options?: Omit<UseQueryOptions<Publisher[]>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: PUBLISHER_QUERY_KEYS.publishersList(filters),
    queryFn: () => PublisherService.getPublishers(filters),
    staleTime: 10 * 60 * 1000, // 10 minutos - datos que cambian poco
    gcTime: 30 * 60 * 1000,    // 30 minutos
    retry: 2,
    ...options,
  });
}

/**
 * Hook para obtener editorial por ID
 */
export function usePublisher(
  id: string,
  options?: Omit<UseQueryOptions<Publisher>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: PUBLISHER_QUERY_KEYS.publisher(id),
    queryFn: () => PublisherService.getPublisherById(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 2,
    ...options,
  });
}

/**
 * Hook para crear editorial
 */
export function useCreatePublisher() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePublisherRequest) => PublisherService.createPublisher(data),
    onSuccess: (newPublisher) => {
      queryClient.invalidateQueries({ queryKey: PUBLISHER_QUERY_KEYS.publishers });
      toast.success(`Editorial "${newPublisher.name}" creada exitosamente`);
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || error.message || 'Error al crear editorial';
      toast.error(message);
    },
  });
}

/**
 * Hook para actualizar editorial
 */
export function useUpdatePublisher() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePublisherRequest }) =>
      PublisherService.updatePublisher(id, data),
    onSuccess: (updatedPublisher, { id }) => {
      queryClient.setQueryData(PUBLISHER_QUERY_KEYS.publisher(id), updatedPublisher);
      queryClient.invalidateQueries({ queryKey: PUBLISHER_QUERY_KEYS.publishers });
      toast.success(`Editorial "${updatedPublisher.name}" actualizada exitosamente`);
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || error.message || 'Error al actualizar editorial';
      toast.error(message);
    },
  });
}

/**
 * Hook para eliminar editorial
 */
export function useDeletePublisher() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => PublisherService.deletePublisher(id),
    onSuccess: (_, deletedId) => {
      queryClient.removeQueries({ queryKey: PUBLISHER_QUERY_KEYS.publisher(deletedId) });
      queryClient.invalidateQueries({ queryKey: PUBLISHER_QUERY_KEYS.publishers });
      toast.success('Editorial eliminada exitosamente');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || error.message || 'Error al eliminar editorial';
      toast.error(message);
    },
  });
}

/**
 * Hook para buscar o crear editorial automáticamente
 */
export function useFindOrCreatePublisher() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (publisherName: string) => {
      try {
        // Primero intentar buscar
        const publishers = await PublisherService.getPublishers({ search: publisherName, active: true });
        const existing = publishers.find(p => p.name.toLowerCase() === publisherName.toLowerCase());
        
        if (existing) {
          return existing;
        }

        // Si no existe, crear uno nuevo
        return await PublisherService.createPublisher({
          name: publisherName,
          description: `Editorial: ${publisherName}`,
        });
      } catch (error) {
        throw error;
      }
    },
    onSuccess: (publisher, publisherName) => {
      queryClient.invalidateQueries({ queryKey: PUBLISHER_QUERY_KEYS.publishers });
      toast.success(`Editorial "${publisher.name}" ${publisher.createdAt ? 'creada' : 'encontrada'} exitosamente`);
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || error.message || 'Error al buscar/crear editorial';
      toast.error(message);
    },
  });
}