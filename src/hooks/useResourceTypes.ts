// src/hooks/useResourceTypes.ts
import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { ResourceTypeService } from '@/services/resourceType.service';
import type {
  ResourceType,
  CreateResourceTypeRequest,
  UpdateResourceTypeRequest,
  ResourceTypeFilters,
} from '@/services/resourceType.service';
import type { PaginatedResponse } from '@/types/api.types';
import toast from 'react-hot-toast';

// Query keys para React Query
export const RESOURCE_TYPE_QUERY_KEYS = {
  resourceTypes: ['resource-types'] as const,
  resourceTypesList: (filters: ResourceTypeFilters) => ['resource-types', 'list', filters] as const,
  resourceType: (id: string) => ['resource-types', 'detail', id] as const,
  resourceTypeStats: ['resource-types', 'stats'] as const,
} as const;

/**
 * Hook para obtener lista de tipos de recursos con filtros
 */
export function useResourceTypes(
  filters: ResourceTypeFilters = {},
  options?: Omit<UseQueryOptions<PaginatedResponse<ResourceType>>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: RESOURCE_TYPE_QUERY_KEYS.resourceTypesList(filters),
    queryFn: () => ResourceTypeService.getResourceTypes(filters),
    staleTime: 30 * 60 * 1000, // 30 minutos - datos que cambian muy poco
    gcTime: 60 * 60 * 1000, // 1 hora
    retry: 2,
    refetchOnMount: false, // Los tipos de recursos son bastante estables
    ...options,
  });
}

/**
 * Hook para obtener un tipo de recurso por ID
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
 * Hook para obtener estadísticas de tipos de recursos
 */
export function useResourceTypeStats(
  options?: Omit<UseQueryOptions<Awaited<ReturnType<typeof ResourceTypeService.getResourceTypeStats>>>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: RESOURCE_TYPE_QUERY_KEYS.resourceTypeStats,
    queryFn: ResourceTypeService.getResourceTypeStats,
    staleTime: 15 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 2,
    ...options,
  });
}

/**
 * Hook para crear un tipo de recurso
 */
export function useCreateResourceType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateResourceTypeRequest) => ResourceTypeService.createResourceType(data),
    onSuccess: (newResourceType) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: RESOURCE_TYPE_QUERY_KEYS.resourceTypes });
      queryClient.invalidateQueries({ queryKey: RESOURCE_TYPE_QUERY_KEYS.resourceTypeStats });
      
      // Agregar al cache
      queryClient.setQueryData(
        RESOURCE_TYPE_QUERY_KEYS.resourceType(newResourceType._id),
        newResourceType
      );

      toast.success(`Tipo de recurso "${newResourceType.description}" creado exitosamente`);
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || error?.message || 'Error al crear tipo de recurso';
      toast.error(Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage);
    },
  });
}

/**
 * Hook para actualizar un tipo de recurso
 */
export function useUpdateResourceType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateResourceTypeRequest }) => 
      ResourceTypeService.updateResourceType(id, data),
    onSuccess: (updatedResourceType) => {
      // Actualizar cache específico
      queryClient.setQueryData(
        RESOURCE_TYPE_QUERY_KEYS.resourceType(updatedResourceType._id),
        updatedResourceType
      );

      // Invalidar listas
      queryClient.invalidateQueries({ queryKey: RESOURCE_TYPE_QUERY_KEYS.resourceTypes });
      
      toast.success(`Tipo de recurso "${updatedResourceType.description}" actualizado exitosamente`);
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || error?.message || 'Error al actualizar tipo de recurso';
      toast.error(Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage);
    },
  });
}

/**
 * Hook para activar un tipo de recurso
 */
export function useActivateResourceType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => ResourceTypeService.activateResourceType(id),
    onSuccess: (activatedResourceType) => {
      // Actualizar cache
      queryClient.setQueryData(
        RESOURCE_TYPE_QUERY_KEYS.resourceType(activatedResourceType._id),
        activatedResourceType
      );

      // Invalidar listas
      queryClient.invalidateQueries({ queryKey: RESOURCE_TYPE_QUERY_KEYS.resourceTypes });
      
      toast.success(`Tipo de recurso "${activatedResourceType.description}" activado exitosamente`);
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || error?.message || 'Error al activar tipo de recurso';
      toast.error(Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage);
    },
  });
}

/**
 * Hook para desactivar un tipo de recurso
 */
export function useDeactivateResourceType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => ResourceTypeService.deactivateResourceType(id),
    onSuccess: (deactivatedResourceType) => {
      // Actualizar cache
      queryClient.setQueryData(
        RESOURCE_TYPE_QUERY_KEYS.resourceType(deactivatedResourceType._id),
        deactivatedResourceType
      );

      // Invalidar listas
      queryClient.invalidateQueries({ queryKey: RESOURCE_TYPE_QUERY_KEYS.resourceTypes });
      
      toast.success(`Tipo de recurso "${deactivatedResourceType.description}" desactivado exitosamente`);
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || error?.message || 'Error al desactivar tipo de recurso';
      toast.error(Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage);
    },
  });
}

/**
 * Hook para eliminar un tipo de recurso
 */
export function useDeleteResourceType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => ResourceTypeService.deleteResourceType(id),
    onSuccess: (_, deletedId) => {
      // Remover del cache
      queryClient.removeQueries({ queryKey: RESOURCE_TYPE_QUERY_KEYS.resourceType(deletedId) });
      
      // Invalidar listas y estadísticas
      queryClient.invalidateQueries({ queryKey: RESOURCE_TYPE_QUERY_KEYS.resourceTypes });
      queryClient.invalidateQueries({ queryKey: RESOURCE_TYPE_QUERY_KEYS.resourceTypeStats });
      
      toast.success('Tipo de recurso eliminado exitosamente');
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || error?.message || 'Error al eliminar tipo de recurso';
      toast.error(Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage);
    },
  });
}