// src/hooks/useResourceStates.ts
import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { ResourceStateService } from '@/services/resourceState.service';
import type {
  ResourceState,
  CreateResourceStateRequest,
  UpdateResourceStateRequest,
  ResourceStateFilters,
} from '@/services/resourceState.service';
import type { PaginatedResponse } from '@/types/api.types';
import toast from 'react-hot-toast';

// Query keys para React Query
export const RESOURCE_STATE_QUERY_KEYS = {
  resourceStates: ['resource-states'] as const,
  resourceStatesList: (filters: ResourceStateFilters) => ['resource-states', 'list', filters] as const,
  resourceState: (id: string) => ['resource-states', 'detail', id] as const,
  resourceStateStats: ['resource-states', 'stats'] as const,
} as const;

/**
 * Hook para obtener lista de estados de recursos con filtros
 */
export function useResourceStates(
  filters: ResourceStateFilters = {},
  options?: Omit<UseQueryOptions<PaginatedResponse<ResourceState>>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: RESOURCE_STATE_QUERY_KEYS.resourceStatesList(filters),
    queryFn: () => ResourceStateService.getResourceStates(filters),
    staleTime: 30 * 60 * 1000, // 30 minutos - datos que cambian muy poco
    gcTime: 60 * 60 * 1000, // 1 hora
    retry: 2,
    refetchOnMount: false, // Los estados de recursos son bastante estables
    ...options,
  });
}

/**
 * Hook para obtener un estado de recurso por ID
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
 * Hook para obtener estadísticas de estados de recursos
 */

/**
 * Hook para crear un estado de recurso
 */
export function useCreateResourceState() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateResourceStateRequest) => ResourceStateService.createResourceState(data),
    onSuccess: (newResourceState) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: RESOURCE_STATE_QUERY_KEYS.resourceStates });
      queryClient.invalidateQueries({ queryKey: RESOURCE_STATE_QUERY_KEYS.resourceStateStats });
      
      // Agregar al cache
      queryClient.setQueryData(
        RESOURCE_STATE_QUERY_KEYS.resourceState(newResourceState._id),
        newResourceState
      );

      toast.success(`Estado de recurso "${newResourceState.description}" creado exitosamente`);
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || error?.message || 'Error al crear estado de recurso';
      toast.error(Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage);
    },
  });
}

/**
 * Hook para actualizar un estado de recurso
 */
export function useUpdateResourceState() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateResourceStateRequest }) => 
      ResourceStateService.updateResourceState(id, data),
    onSuccess: (updatedResourceState) => {
      // Actualizar cache específico
      queryClient.setQueryData(
        RESOURCE_STATE_QUERY_KEYS.resourceState(updatedResourceState._id),
        updatedResourceState
      );

      // Invalidar listas
      queryClient.invalidateQueries({ queryKey: RESOURCE_STATE_QUERY_KEYS.resourceStates });
      
      toast.success(`Estado de recurso "${updatedResourceState.description}" actualizado exitosamente`);
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || error?.message || 'Error al actualizar estado de recurso';
      toast.error(Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage);
    },
  });
}

/**
 * Hook para activar un estado de recurso
 */
export function useActivateResourceState() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => ResourceStateService.activateResourceState(id),
    onSuccess: (activatedResourceState) => {
      // Actualizar cache
      queryClient.setQueryData(
        RESOURCE_STATE_QUERY_KEYS.resourceState(activatedResourceState._id),
        activatedResourceState
      );

      // Invalidar listas
      queryClient.invalidateQueries({ queryKey: RESOURCE_STATE_QUERY_KEYS.resourceStates });
      
      toast.success(`Estado de recurso "${activatedResourceState.description}" activado exitosamente`);
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || error?.message || 'Error al activar estado de recurso';
      toast.error(Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage);
    },
  });
}

/**
 * Hook para desactivar un estado de recurso
 */
export function useDeactivateResourceState() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => ResourceStateService.deactivateResourceState(id),
    onSuccess: (deactivatedResourceState) => {
      // Actualizar cache
      queryClient.setQueryData(
        RESOURCE_STATE_QUERY_KEYS.resourceState(deactivatedResourceState._id),
        deactivatedResourceState
      );

      // Invalidar listas
      queryClient.invalidateQueries({ queryKey: RESOURCE_STATE_QUERY_KEYS.resourceStates });
      
      toast.success(`Estado de recurso "${deactivatedResourceState.description}" desactivado exitosamente`);
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || error?.message || 'Error al desactivar estado de recurso';
      toast.error(Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage);
    },
  });
}

/**
 * Hook para eliminar un estado de recurso
 */
export function useDeleteResourceState() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => ResourceStateService.deleteResourceState(id),
    onSuccess: (_, deletedId) => {
      // Remover del cache
      queryClient.removeQueries({ queryKey: RESOURCE_STATE_QUERY_KEYS.resourceState(deletedId) });
      
      // Invalidar listas y estadísticas
      queryClient.invalidateQueries({ queryKey: RESOURCE_STATE_QUERY_KEYS.resourceStates });
      queryClient.invalidateQueries({ queryKey: RESOURCE_STATE_QUERY_KEYS.resourceStateStats });
      
      toast.success('Estado de recurso eliminado exitosamente');
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || error?.message || 'Error al eliminar estado de recurso';
      toast.error(Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage);
    },
  });
}