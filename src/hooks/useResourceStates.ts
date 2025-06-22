// src/hooks/useResourceStates.ts - HOOK PARA GESTIÓN DE ESTADOS DE RECURSOS
// ================================================================
// HOOK PERSONALIZADO PARA ESTADOS DE RECURSOS CON REACT QUERY
// ================================================================

import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';
import type { 
  ResourceState, 
  ApiResponse, 
  PaginatedResponse 
} from '@/types/api.types';
import toast from 'react-hot-toast';

// ===== INTERFACES =====
export interface CreateResourceStateRequest {
  name: 'good' | 'deteriorated' | 'damaged' | 'lost';
  description: string;
  color?: string;
}

export interface UpdateResourceStateRequest {
  description?: string;
  color?: string;
  active?: boolean;
}

export interface ResourceStateFilters {
  search?: string;
  active?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// ===== ENDPOINTS =====
const RESOURCE_STATE_ENDPOINTS = {
  RESOURCE_STATES: '/resource-states',
  RESOURCE_STATE_BY_ID: (id: string) => `/resource-states/${id}`,
  ACTIVATE: (id: string) => `/resource-states/${id}/activate`,
  DEACTIVATE: (id: string) => `/resource-states/${id}/deactivate`,
} as const;

// ===== SERVICIOS =====
class ResourceStateService {
  /**
   * Obtener estados de recursos con filtros
   */
  static async getResourceStates(filters: ResourceStateFilters = {}): Promise<PaginatedResponse<ResourceState>> {
    try {
      const params = new URLSearchParams();
      
      if (filters.search) params.append('search', filters.search);
      if (filters.active !== undefined) params.append('active', filters.active.toString());
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
      if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

      const url = params.toString() 
        ? `${RESOURCE_STATE_ENDPOINTS.RESOURCE_STATES}?${params.toString()}`
        : RESOURCE_STATE_ENDPOINTS.RESOURCE_STATES;

      const response = await axiosInstance.get<ApiResponse<PaginatedResponse<ResourceState> | ResourceState[]>>(url);

      if (response.data.success && response.data.data) {
        // Manejar respuesta que puede ser array directo o paginada
        if (Array.isArray(response.data.data)) {
          return {
            data: response.data.data,
            pagination: {
              total: response.data.data.length,
              page: 1,
              limit: response.data.data.length,
              totalPages: 1,
              hasNextPage: false,
              hasPrevPage: false,
            }
          };
        } else {
          return response.data.data;
        }
      }

      throw new Error(response.data.message || 'Error al obtener estados de recursos');
    } catch (error: any) {
      console.error('Error al obtener estados de recursos:', error);
      
      // Fallback con estados predeterminados si el backend no los tiene
      if (error?.response?.status === 404) {
        const defaultStates: ResourceState[] = [
          {
            _id: 'default-good',
            name: 'good',
            description: 'Buen Estado',
            color: '#28a745',
            active: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            _id: 'default-deteriorated',
            name: 'deteriorated',
            description: 'Deteriorado',
            color: '#ffc107',
            active: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            _id: 'default-damaged',
            name: 'damaged',
            description: 'Dañado',
            color: '#fd7e14',
            active: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            _id: 'default-lost',
            name: 'lost',
            description: 'Perdido',
            color: '#dc3545',
            active: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ];

        return {
          data: defaultStates,
          pagination: {
            total: defaultStates.length,
            page: 1,
            limit: defaultStates.length,
            totalPages: 1,
            hasNextPage: false,
            hasPrevPage: false,
          }
        };
      }
      
      throw error;
    }
  }

  /**
   * Obtener estado de recurso por ID
   */
  static async getResourceStateById(id: string): Promise<ResourceState> {
    const response = await axiosInstance.get<ApiResponse<ResourceState>>(
      RESOURCE_STATE_ENDPOINTS.RESOURCE_STATE_BY_ID(id)
    );

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.message || 'Error al obtener estado de recurso');
  }

  /**
   * Crear estado de recurso
   */
  static async createResourceState(data: CreateResourceStateRequest): Promise<ResourceState> {
    const response = await axiosInstance.post<ApiResponse<ResourceState>>(
      RESOURCE_STATE_ENDPOINTS.RESOURCE_STATES,
      data
    );

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.message || 'Error al crear estado de recurso');
  }

  /**
   * Actualizar estado de recurso
   */
  static async updateResourceState(id: string, data: UpdateResourceStateRequest): Promise<ResourceState> {
    const response = await axiosInstance.put<ApiResponse<ResourceState>>(
      RESOURCE_STATE_ENDPOINTS.RESOURCE_STATE_BY_ID(id),
      data
    );

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.message || 'Error al actualizar estado de recurso');
  }

  /**
   * Eliminar estado de recurso
   */
  static async deleteResourceState(id: string): Promise<void> {
    const response = await axiosInstance.delete<ApiResponse<null>>(
      RESOURCE_STATE_ENDPOINTS.RESOURCE_STATE_BY_ID(id)
    );

    if (!response.data.success) {
      throw new Error(response.data.message || 'Error al eliminar estado de recurso');
    }
  }
}

// ===== QUERY KEYS =====
export const RESOURCE_STATE_QUERY_KEYS = {
  resourceStates: ['resource-states'] as const,
  resourceStatesList: (filters: ResourceStateFilters) => ['resource-states', 'list', filters] as const,
  resourceState: (id: string) => ['resource-states', 'detail', id] as const,
} as const;

// ===== HOOKS =====

/**
 * Hook para obtener lista de estados de recursos
 */
export function useResourceStates(
  filters: ResourceStateFilters = {},
  options?: Omit<UseQueryOptions<PaginatedResponse<ResourceState>>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: RESOURCE_STATE_QUERY_KEYS.resourceStatesList(filters),
    queryFn: async () => {
      try {
        return await ResourceStateService.getResourceStates(filters);
      } catch (error: any) {
        console.error('Error al obtener estados de recursos:', error);
        
        // Si es un error de permisos (403) o no autorizado (401), retornar estructura vacía
        if (error?.response?.status === 403 || error?.response?.status === 401) {
          console.warn('Usuario sin permisos para acceder a estados de recursos, usando estructura vacía');
          return {
            data: [],
            pagination: {
              total: 0,
              page: 1,
              limit: 0,
              totalPages: 1,
              hasNextPage: false,
              hasPrevPage: false,
            }
          };
        }
        
        // Si es un error de red o servidor, retornar estados por defecto
        if (error?.response?.status >= 500 || !error?.response) {
          console.warn('Error de servidor o red, usando estados por defecto');
          const defaultStates: ResourceState[] = [
            {
              _id: 'default-good',
              name: 'good',
              description: 'Buen Estado',
              color: '#28a745',
              active: true,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            {
              _id: 'default-deteriorated',
              name: 'deteriorated',
              description: 'Deteriorado',
              color: '#ffc107',
              active: true,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            {
              _id: 'default-damaged',
              name: 'damaged',
              description: 'Dañado',
              color: '#fd7e14',
              active: true,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            {
              _id: 'default-lost',
              name: 'lost',
              description: 'Perdido',
              color: '#dc3545',
              active: true,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ];
          
          return {
            data: defaultStates,
            pagination: {
              total: defaultStates.length,
              page: 1,
              limit: defaultStates.length,
              totalPages: 1,
              hasNextPage: false,
              hasPrevPage: false,
            }
          };
        }
        
        // Para otros errores, retornar estructura vacía
        return {
          data: [],
          pagination: {
            total: 0,
            page: 1,
            limit: 0,
            totalPages: 1,
            hasNextPage: false,
            hasPrevPage: false,
          }
        };
      }
    },
    staleTime: 30 * 60 * 1000, // 30 minutos - datos muy estables
    gcTime: 60 * 60 * 1000,    // 1 hora
    retry: 2,
    refetchOnMount: false,     // Los estados de recursos son muy estables
    ...options,
  });
}

/**
 * Hook para obtener estado de recurso por ID
 */
export function useResourceState(
  id: string,
  options?: Omit<UseQueryOptions<ResourceState>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: RESOURCE_STATE_QUERY_KEYS.resourceState(id),
    queryFn: () => ResourceStateService.getResourceStateById(id),
    enabled: !!id,
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    retry: 2,
    ...options,
  });
}

/**
 * Hook para crear estado de recurso
 */
export function useCreateResourceState() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateResourceStateRequest) => ResourceStateService.createResourceState(data),
    onSuccess: (newResourceState) => {
      queryClient.invalidateQueries({ queryKey: RESOURCE_STATE_QUERY_KEYS.resourceStates });
      toast.success(`Estado "${newResourceState.description}" creado exitosamente`);
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || error.message || 'Error al crear estado de recurso';
      toast.error(message);
    },
  });
}

/**
 * Hook para actualizar estado de recurso
 */
export function useUpdateResourceState() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateResourceStateRequest }) =>
      ResourceStateService.updateResourceState(id, data),
    onSuccess: (updatedResourceState, { id }) => {
      queryClient.setQueryData(RESOURCE_STATE_QUERY_KEYS.resourceState(id), updatedResourceState);
      queryClient.invalidateQueries({ queryKey: RESOURCE_STATE_QUERY_KEYS.resourceStates });
      toast.success(`Estado "${updatedResourceState.description}" actualizado exitosamente`);
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || error.message || 'Error al actualizar estado de recurso';
      toast.error(message);
    },
  });
}

/**
 * Hook para eliminar estado de recurso
 */
export function useDeleteResourceState() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => ResourceStateService.deleteResourceState(id),
    onSuccess: (_, deletedId) => {
      queryClient.removeQueries({ queryKey: RESOURCE_STATE_QUERY_KEYS.resourceState(deletedId) });
      queryClient.invalidateQueries({ queryKey: RESOURCE_STATE_QUERY_KEYS.resourceStates });
      toast.success('Estado de recurso eliminado exitosamente');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || error.message || 'Error al eliminar estado de recurso';
      toast.error(message);
    },
  });
}

/**
 * Hook para activar estado de recurso
 */
export function useActivateResourceState() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => {
      return axiosInstance.put<ApiResponse<ResourceState>>(
        RESOURCE_STATE_ENDPOINTS.ACTIVATE(id)
      ).then(response => {
        if (response.data.success && response.data.data) {
          return response.data.data;
        }
        throw new Error(response.data.message || 'Error al activar estado de recurso');
      });
    },
    onSuccess: (updatedResourceState) => {
      queryClient.setQueryData(
        RESOURCE_STATE_QUERY_KEYS.resourceState(updatedResourceState._id), 
        updatedResourceState
      );
      queryClient.invalidateQueries({ queryKey: RESOURCE_STATE_QUERY_KEYS.resourceStates });
      toast.success(`Estado "${updatedResourceState.description}" activado exitosamente`);
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || error.message || 'Error al activar estado de recurso';
      toast.error(message);
    },
  });
}

/**
 * Hook para desactivar estado de recurso
 */
export function useDeactivateResourceState() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => {
      return axiosInstance.put<ApiResponse<ResourceState>>(
        RESOURCE_STATE_ENDPOINTS.DEACTIVATE(id)
      ).then(response => {
        if (response.data.success && response.data.data) {
          return response.data.data;
        }
        throw new Error(response.data.message || 'Error al desactivar estado de recurso');
      });
    },
    onSuccess: (updatedResourceState) => {
      queryClient.setQueryData(
        RESOURCE_STATE_QUERY_KEYS.resourceState(updatedResourceState._id), 
        updatedResourceState
      );
      queryClient.invalidateQueries({ queryKey: RESOURCE_STATE_QUERY_KEYS.resourceStates });
      toast.success(`Estado "${updatedResourceState.description}" desactivado exitosamente`);
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || error.message || 'Error al desactivar estado de recurso';
      toast.error(message);
    },
  });
}

/**
 * Hook para obtener solo estados activos (utilidad común)
 */
export function useActiveResourceStates() {
  return useQuery({
    queryKey: RESOURCE_STATE_QUERY_KEYS.resourceStatesList({ active: true }),
    queryFn: async () => {
      try {
        const response = await ResourceStateService.getResourceStates({ active: true });
        return response.data; // Retornar solo el array de datos
      } catch (error: any) {
        console.error('Error al obtener estados activos de recursos:', error);
        
        // Si es un error de permisos (403) o no autorizado (401), retornar array vacío
        if (error?.response?.status === 403 || error?.response?.status === 401) {
          console.warn('Usuario sin permisos para acceder a estados de recursos, usando array vacío');
          return [];
        }
        
        // Si es un error de red o servidor, retornar estados por defecto
        if (error?.response?.status >= 500 || !error?.response) {
          console.warn('Error de servidor o red, usando estados por defecto');
          return [
            {
              _id: 'default-good',
              name: 'good',
              description: 'Buen Estado',
              color: '#28a745',
              active: true,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            {
              _id: 'default-deteriorated',
              name: 'deteriorated',
              description: 'Deteriorado',
              color: '#ffc107',
              active: true,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            {
              _id: 'default-damaged',
              name: 'damaged',
              description: 'Dañado',
              color: '#fd7e14',
              active: true,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            {
              _id: 'default-lost',
              name: 'lost',
              description: 'Perdido',
              color: '#dc3545',
              active: true,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ];
        }
        
        // Para otros errores, retornar array vacío
        return [];
      }
    },
    staleTime: 30 * 60 * 1000, // 30 minutos - datos muy estables
    gcTime: 60 * 60 * 1000,    // 1 hora
    retry: 2,
    refetchOnMount: false,     // Los estados de recursos son muy estables
  });
}