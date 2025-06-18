// src/hooks/useResourceTypes.ts - HOOK PARA GESTIÓN DE TIPOS DE RECURSOS
// ================================================================
// HOOK PERSONALIZADO PARA TIPOS DE RECURSOS CON REACT QUERY
// ================================================================

import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';
import type { 
  ResourceType, 
  ApiResponse, 
  PaginatedResponse 
} from '@/types/api.types';
import toast from 'react-hot-toast';

// ===== INTERFACES =====
export interface CreateResourceTypeRequest {
  name: 'book' | 'game' | 'map' | 'bible';
  description: string;
}

export interface UpdateResourceTypeRequest {
  description?: string;
  active?: boolean;
}

export interface ResourceTypeFilters {
  search?: string;
  active?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// ===== ENDPOINTS =====
const RESOURCE_TYPE_ENDPOINTS = {
  RESOURCE_TYPES: '/resource-types',
  RESOURCE_TYPE_BY_ID: (id: string) => `/resource-types/${id}`,
  ACTIVATE: (id: string) => `/resource-types/${id}/activate`,
  DEACTIVATE: (id: string) => `/resource-types/${id}/deactivate`,
} as const;

// ===== SERVICIOS =====
class ResourceTypeService {
  /**
   * Obtener tipos de recursos con filtros
   */
  static async getResourceTypes(filters: ResourceTypeFilters = {}): Promise<PaginatedResponse<ResourceType>> {
    try {
      const params = new URLSearchParams();
      
      if (filters.search) params.append('search', filters.search);
      if (filters.active !== undefined) params.append('active', filters.active.toString());
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
      if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

      const url = params.toString() 
        ? `${RESOURCE_TYPE_ENDPOINTS.RESOURCE_TYPES}?${params.toString()}`
        : RESOURCE_TYPE_ENDPOINTS.RESOURCE_TYPES;

      const response = await axiosInstance.get<ApiResponse<PaginatedResponse<ResourceType> | ResourceType[]>>(url);

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

      throw new Error(response.data.message || 'Error al obtener tipos de recursos');
    } catch (error: any) {
      console.error('Error al obtener tipos de recursos:', error);
      
      // Fallback con tipos predeterminados si el backend no los tiene
      if (error?.response?.status === 404) {
        const defaultResourceTypes: ResourceType[] = [
          {
            _id: 'default-book',
            name: 'book',
            description: 'Libros',
            active: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            _id: 'default-game',
            name: 'game',
            description: 'Juegos Educativos',
            active: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            _id: 'default-map',
            name: 'map',
            description: 'Mapas',
            active: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            _id: 'default-bible',
            name: 'bible',
            description: 'Biblias',
            active: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ];

        return {
          data: defaultResourceTypes,
          pagination: {
            total: defaultResourceTypes.length,
            page: 1,
            limit: defaultResourceTypes.length,
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
   * Obtener tipo de recurso por ID
   */
  static async getResourceTypeById(id: string): Promise<ResourceType> {
    const response = await axiosInstance.get<ApiResponse<ResourceType>>(
      RESOURCE_TYPE_ENDPOINTS.RESOURCE_TYPE_BY_ID(id)
    );

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.message || 'Error al obtener tipo de recurso');
  }

  /**
   * Crear tipo de recurso
   */
  static async createResourceType(data: CreateResourceTypeRequest): Promise<ResourceType> {
    const response = await axiosInstance.post<ApiResponse<ResourceType>>(
      RESOURCE_TYPE_ENDPOINTS.RESOURCE_TYPES,
      data
    );

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.message || 'Error al crear tipo de recurso');
  }

  /**
   * Actualizar tipo de recurso
   */
  static async updateResourceType(id: string, data: UpdateResourceTypeRequest): Promise<ResourceType> {
    const response = await axiosInstance.put<ApiResponse<ResourceType>>(
      RESOURCE_TYPE_ENDPOINTS.RESOURCE_TYPE_BY_ID(id),
      data
    );

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.message || 'Error al actualizar tipo de recurso');
  }

  /**
   * Eliminar tipo de recurso
   */
  static async deleteResourceType(id: string): Promise<void> {
    const response = await axiosInstance.delete<ApiResponse<null>>(
      RESOURCE_TYPE_ENDPOINTS.RESOURCE_TYPE_BY_ID(id)
    );

    if (!response.data.success) {
      throw new Error(response.data.message || 'Error al eliminar tipo de recurso');
    }
  }
}

// ===== QUERY KEYS =====
export const RESOURCE_TYPE_QUERY_KEYS = {
  resourceTypes: ['resource-types'] as const,
  resourceTypesList: (filters: ResourceTypeFilters) => ['resource-types', 'list', filters] as const,
  resourceType: (id: string) => ['resource-types', 'detail', id] as const,
} as const;

// ===== HOOKS =====

/**
 * Hook para obtener lista de tipos de recursos
 */
export function useResourceTypes(
  filters: ResourceTypeFilters = {},
  options?: Omit<UseQueryOptions<PaginatedResponse<ResourceType>>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: RESOURCE_TYPE_QUERY_KEYS.resourceTypesList(filters),
    queryFn: () => ResourceTypeService.getResourceTypes(filters),
    staleTime: 30 * 60 * 1000, // 30 minutos - tipos muy estables
    gcTime: 60 * 60 * 1000,    // 1 hora
    retry: 2,
    refetchOnMount: false,     // Los tipos de recursos son muy estables
    ...options,
  });
}

/**
 * Hook para obtener tipo de recurso por ID
 */
export function useResourceType(
  id: string,
  options?: Omit<UseQueryOptions<ResourceType>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: RESOURCE_TYPE_QUERY_KEYS.resourceType(id),
    queryFn: () => ResourceTypeService.getResourceTypeById(id),
    enabled: !!id,
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    retry: 2,
    ...options,
  });
}

/**
 * Hook para crear tipo de recurso
 */
export function useCreateResourceType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateResourceTypeRequest) => ResourceTypeService.createResourceType(data),
    onSuccess: (newResourceType) => {
      queryClient.invalidateQueries({ queryKey: RESOURCE_TYPE_QUERY_KEYS.resourceTypes });
      toast.success(`Tipo de recurso "${newResourceType.description}" creado exitosamente`);
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || error.message || 'Error al crear tipo de recurso';
      toast.error(message);
    },
  });
}

/**
 * Hook para actualizar tipo de recurso
 */
export function useUpdateResourceType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateResourceTypeRequest }) =>
      ResourceTypeService.updateResourceType(id, data),
    onSuccess: (updatedResourceType, { id }) => {
      queryClient.setQueryData(RESOURCE_TYPE_QUERY_KEYS.resourceType(id), updatedResourceType);
      queryClient.invalidateQueries({ queryKey: RESOURCE_TYPE_QUERY_KEYS.resourceTypes });
      toast.success(`Tipo de recurso "${updatedResourceType.description}" actualizado exitosamente`);
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || error.message || 'Error al actualizar tipo de recurso';
      toast.error(message);
    },
  });
}

/**
 * Hook para eliminar tipo de recurso
 */
export function useDeleteResourceType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => ResourceTypeService.deleteResourceType(id),
    onSuccess: (_, deletedId) => {
      queryClient.removeQueries({ queryKey: RESOURCE_TYPE_QUERY_KEYS.resourceType(deletedId) });
      queryClient.invalidateQueries({ queryKey: RESOURCE_TYPE_QUERY_KEYS.resourceTypes });
      toast.success('Tipo de recurso eliminado exitosamente');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || error.message || 'Error al eliminar tipo de recurso';
      toast.error(message);
    },
  });
}

/**
 * Hook para activar tipo de recurso
 */
export function useActivateResourceType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => {
      return axiosInstance.put<ApiResponse<ResourceType>>(
        RESOURCE_TYPE_ENDPOINTS.ACTIVATE(id)
      ).then(response => {
        if (response.data.success && response.data.data) {
          return response.data.data;
        }
        throw new Error(response.data.message || 'Error al activar tipo de recurso');
      });
    },
    onSuccess: (updatedResourceType) => {
      queryClient.setQueryData(
        RESOURCE_TYPE_QUERY_KEYS.resourceType(updatedResourceType._id), 
        updatedResourceType
      );
      queryClient.invalidateQueries({ queryKey: RESOURCE_TYPE_QUERY_KEYS.resourceTypes });
      toast.success(`Tipo de recurso "${updatedResourceType.description}" activado exitosamente`);
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || error.message || 'Error al activar tipo de recurso';
      toast.error(message);
    },
  });
}

/**
 * Hook para desactivar tipo de recurso
 */
export function useDeactivateResourceType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => {
      return axiosInstance.put<ApiResponse<ResourceType>>(
        RESOURCE_TYPE_ENDPOINTS.DEACTIVATE(id)
      ).then(response => {
        if (response.data.success && response.data.data) {
          return response.data.data;
        }
        throw new Error(response.data.message || 'Error al desactivar tipo de recurso');
      });
    },
    onSuccess: (updatedResourceType) => {
      queryClient.setQueryData(
        RESOURCE_TYPE_QUERY_KEYS.resourceType(updatedResourceType._id), 
        updatedResourceType
      );
      queryClient.invalidateQueries({ queryKey: RESOURCE_TYPE_QUERY_KEYS.resourceTypes });
      toast.success(`Tipo de recurso "${updatedResourceType.description}" desactivado exitosamente`);
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || error.message || 'Error al desactivar tipo de recurso';
      toast.error(message);
    },
  });
}

/**
 * Hook para obtener solo tipos activos (utilidad común)
 */
export function useActiveResourceTypes() {
  return useQuery({
    queryKey: RESOURCE_TYPE_QUERY_KEYS.resourceTypesList({ active: true }),
    queryFn: async () => {
      const response = await ResourceTypeService.getResourceTypes({ active: true });
      return response.data; // Retornar solo el array de datos
    },
    staleTime: 60 * 60 * 1000,   // 1 hora para tipos activos
  });
}

/**
 * Hook para obtener tipos con iconos (utilidad para UI)
 */
export function useResourceTypesWithIcons() {
  const typeIcons = {
    book: '📚',
    game: '🎲',
    map: '🗺️',
    bible: '📖',
  };

  return useQuery({
    queryKey: RESOURCE_TYPE_QUERY_KEYS.resourceTypesList({ active: true }),
    queryFn: async () => {
      const response = await ResourceTypeService.getResourceTypes({ active: true });
      return response.data.map(type => ({
        ...type,
        icon: typeIcons[type.name] || '📄',
      }));
    },
    staleTime: 60 * 60 * 1000,
  });
}