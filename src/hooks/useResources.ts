// src/hooks/useResources.ts - HOOK MEJORADO PARA GESTIÓN DE CANTIDADES
// ================================================================
// HOOK PERSONALIZADO PARA RECURSOS CON SOPORTE COMPLETO DE STOCK
// ================================================================

import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { ResourceService } from '@/services/resource.service';
import type {
  Resource,
  CreateResourceRequest,
  UpdateResourceRequest,
  ResourceFilters,
  ResourceSearchFilters,
  ResourceManagementFilters,
  QuantityUpdate,
  AvailabilityUpdate,
  AvailabilityCheck,
  ResourceStats,
  StockAlert,
  PaginatedResponse
} from '@/types';
import toast from 'react-hot-toast';

// ===== QUERY KEYS =====
type QueryKey = readonly [string, ...unknown[]];

export const RESOURCE_QUERY_KEYS = {
  resources: ['resources'] as QueryKey,
  resourcesList: (filters: ResourceFilters) => ['resources', 'list', filters] as QueryKey,
  resource: (id: string) => ['resources', 'detail', id] as QueryKey,
  resourcesForLoan: (filters: ResourceSearchFilters) => ['resources', 'for-loan', filters] as QueryKey,
  resourceAvailability: (id: string) => ['resources', 'availability', id] as QueryKey,
  resourceStats: ['resources', 'stats'] as QueryKey,
  lowStockResources: (threshold: number) => ['resources', 'low-stock', threshold] as QueryKey,
  noStockResources: ['resources', 'no-stock'] as QueryKey,
  advancedSearch: (filters: ResourceManagementFilters) => ['resources', 'advanced-search', filters] as QueryKey,
  googleBooksStatus: ['resources', 'google-books-status'] as QueryKey,
  googleBooksSearch: (query: string) => ['resources', 'google-books-search', query] as QueryKey,
};

// ===== HOOKS PRINCIPALES =====

/**
 * Hook para obtener lista de recursos con filtros
 */
export function useResources(
  filters: ResourceFilters = {},
  options?: Omit<UseQueryOptions<PaginatedResponse<Resource>>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: RESOURCE_QUERY_KEYS.resourcesList(filters),
    queryFn: () => ResourceService.getResources(filters),
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 30 * 60 * 1000,   // 30 minutos
    retry: 2,
    ...options,
  });
}

/**
 * Hook para obtener un recurso por ID
 */
export function useResource(
  id: string,
  options?: Omit<UseQueryOptions<Resource>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: RESOURCE_QUERY_KEYS.resource(id),
    queryFn: () => ResourceService.getResourceById(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutos
    gcTime: 30 * 60 * 1000,    // 30 minutos
    retry: 2,
    ...options,
  });
}

/**
 * ✅ NUEVO: Hook para buscar recurso por ISBN
 */
export function useResourceByISBN(
  isbn: string,
  options?: Omit<UseQueryOptions<Resource | null>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['resources', 'by-isbn', isbn],
    queryFn: async () => {
      if (!isbn || isbn.length < 10) return null;
      
      try {
        const resources = await ResourceService.getResources({
          search: isbn,
          limit: 10,
        });
        
        // Buscar coincidencia exacta por ISBN
        const exactMatch = resources.data.find(resource => 
          resource.isbn && resource.isbn.replace(/[-\s]/g, '') === isbn.replace(/[-\s]/g, '')
        );
        
        return exactMatch || null;
      } catch (error) {
        console.warn('Error buscando recurso por ISBN:', error);
        return null;
      }
    },
    enabled: !!isbn && isbn.length >= 10,
    staleTime: 15 * 60 * 1000, // 15 minutos
    gcTime: 30 * 60 * 1000,    // 30 minutos
    retry: 1,
    ...options,
  });
}

/**
 * ✅ NUEVO: Hook para obtener recursos disponibles para préstamos
 */
export function useResourcesForLoan(
  filters: ResourceSearchFilters = {},
  options?: Omit<UseQueryOptions<Resource[]>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: RESOURCE_QUERY_KEYS.resourcesForLoan(filters),
    queryFn: () => ResourceService.searchResourcesForLoan(filters),
    staleTime: 2 * 60 * 1000,  // 2 minutos (datos más dinámicos)
    gcTime: 10 * 60 * 1000,    // 10 minutos
    retry: 2,
    refetchOnMount: true,      // Siempre refrescar disponibilidad
    ...options,
  });
}

/**
 * ✅ NUEVO: Hook para verificar disponibilidad de un recurso
 */
export function useResourceAvailability(
  resourceId: string,
  options?: Omit<UseQueryOptions<AvailabilityCheck>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: RESOURCE_QUERY_KEYS.resourceAvailability(resourceId),
    queryFn: () => ResourceService.checkResourceAvailability(resourceId),
    enabled: !!resourceId,
    staleTime: 30 * 1000,      // 30 segundos (muy dinámico)
    gcTime: 5 * 60 * 1000,     // 5 minutos
    retry: 2,
    refetchOnMount: true,
    ...options,
  });
}

/**
 * Hook para obtener estadísticas de recursos
 */
export function useResourceStats(
  options?: Omit<UseQueryOptions<ResourceStats>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: RESOURCE_QUERY_KEYS.resourceStats,
    queryFn: () => ResourceService.getResourceStats(),
    staleTime: 5 * 60 * 1000,  // 5 minutos
    gcTime: 30 * 60 * 1000,    // 30 minutos
    retry: 2,
    ...options,
  });
}

/**
 * ✅ NUEVO: Hook para recursos con stock bajo
 */
export function useLowStockResources(
  threshold: number = 5,
  options?: Omit<UseQueryOptions<Resource[]>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: RESOURCE_QUERY_KEYS.lowStockResources(threshold),
    queryFn: () => ResourceService.getResourcesWithLowStock(threshold),
    staleTime: 5 * 60 * 1000,  // 5 minutos
    gcTime: 30 * 60 * 1000,    // 30 minutos
    retry: 2,
    ...options,
  });
}

/**
 * ✅ NUEVO: Hook para recursos sin stock
 */
export function useNoStockResources(
  options?: Omit<UseQueryOptions<Resource[]>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: RESOURCE_QUERY_KEYS.noStockResources,
    queryFn: () => ResourceService.getResourcesWithoutStock(),
    staleTime: 5 * 60 * 1000,  // 5 minutos
    gcTime: 30 * 60 * 1000,    // 30 minutos
    retry: 2,
    ...options,
  });
}

/**
 * Hook para búsqueda avanzada de recursos
 */
export function useAdvancedResourceSearch(
  filters: ResourceManagementFilters = {},
  options?: Omit<UseQueryOptions<PaginatedResponse<Resource>>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: RESOURCE_QUERY_KEYS.advancedSearch(filters),
    queryFn: () => ResourceService.advancedSearch(filters),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 2,
    ...options,
  });
}

// ===== MUTATIONS =====

/**
 * Hook para crear un nuevo recurso
 */
export function useCreateResource() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateResourceRequest) => ResourceService.createResource(data),
    onSuccess: (newResource) => {
      // Invalidar cache relacionado
      queryClient.invalidateQueries({ queryKey: RESOURCE_QUERY_KEYS.resources });
      queryClient.invalidateQueries({ queryKey: RESOURCE_QUERY_KEYS.resourceStats });
      
      toast.success(`Recurso "${newResource.title}" creado exitosamente`);
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || error.message || 'Error al crear recurso';
      toast.error(message);
    },
  });
}

/**
 * Hook para actualizar un recurso
 */
export function useUpdateResource() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateResourceRequest }) =>
      ResourceService.updateResource(id, data),
    onSuccess: (updatedResource, { id }) => {
      // Actualizar cache específico
      queryClient.setQueryData(RESOURCE_QUERY_KEYS.resource(id), updatedResource);
      
      // Invalidar listas y estadísticas
      queryClient.invalidateQueries({ queryKey: RESOURCE_QUERY_KEYS.resources });
      queryClient.invalidateQueries({ queryKey: RESOURCE_QUERY_KEYS.resourceStats });
      
      toast.success(`Recurso "${updatedResource.title}" actualizado exitosamente`);
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || error.message || 'Error al actualizar recurso';
      toast.error(message);
    },
  });
}

/**
 * ✅ NUEVO: Hook para actualizar cantidad de un recurso
 */
export function useUpdateResourceQuantity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (quantityUpdate: QuantityUpdate) =>
      ResourceService.updateResourceQuantity(quantityUpdate),
    onSuccess: (updatedResource, { resourceId }) => {
      // Actualizar cache específico
      queryClient.setQueryData(RESOURCE_QUERY_KEYS.resource(resourceId), updatedResource);
      
      // Invalidar cache de disponibilidad
      queryClient.invalidateQueries({ 
        queryKey: RESOURCE_QUERY_KEYS.resourceAvailability(resourceId) 
      });
      
      // Invalidar listas y estadísticas
      queryClient.invalidateQueries({ queryKey: RESOURCE_QUERY_KEYS.resources });
      queryClient.invalidateQueries({ queryKey: RESOURCE_QUERY_KEYS.resourceStats });
      queryClient.invalidateQueries({ queryKey: RESOURCE_QUERY_KEYS.lowStockResources(5) });
      queryClient.invalidateQueries({ queryKey: RESOURCE_QUERY_KEYS.noStockResources });
      
      toast.success(`Cantidad actualizada: ${updatedResource.totalQuantity} unidades`);
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || error.message || 'Error al actualizar cantidad';
      toast.error(message);
    },
  });
}

/**
 * Hook para actualizar disponibilidad de un recurso
 */
export function useUpdateResourceAvailability() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (availabilityUpdate: AvailabilityUpdate | { id: string; available: boolean; reason?: string; updatedBy?: string }) =>
      ResourceService.updateResourceAvailability(availabilityUpdate),
    onSuccess: (updatedResource, availabilityUpdate) => {
      // Normalizar el resourceId para ambos formatos
      const resourceId = 'resourceId' in availabilityUpdate ? availabilityUpdate.resourceId : availabilityUpdate.id;
      
      // Actualizar cache específico
      queryClient.setQueryData(RESOURCE_QUERY_KEYS.resource(resourceId), updatedResource);
      
      // Invalidar cache de disponibilidad
      queryClient.invalidateQueries({ 
        queryKey: RESOURCE_QUERY_KEYS.resourceAvailability(resourceId) 
      });
      
      // Invalidar listas relacionadas
      queryClient.invalidateQueries({ queryKey: RESOURCE_QUERY_KEYS.resources });
      queryClient.invalidateQueries({ queryKey: RESOURCE_QUERY_KEYS.resourcesForLoan({}) });
      queryClient.invalidateQueries({ queryKey: RESOURCE_QUERY_KEYS.resourceStats });
      
      const status = updatedResource.available ? 'disponible' : 'no disponible';
      toast.success(`Recurso marcado como ${status}`);
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || error.message || 'Error al actualizar disponibilidad';
      toast.error(message);
    },
  });
}

/**
 * Hook para eliminar un recurso
 */
export function useDeleteResource() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => ResourceService.deleteResource(id),
    onSuccess: (_, deletedId) => {
      // Remover del cache específico
      queryClient.removeQueries({ queryKey: RESOURCE_QUERY_KEYS.resource(deletedId) });
      
      // Invalidar listas y estadísticas
      queryClient.invalidateQueries({ queryKey: RESOURCE_QUERY_KEYS.resources });
      queryClient.invalidateQueries({ queryKey: RESOURCE_QUERY_KEYS.resourceStats });
      
      toast.success('Recurso eliminado exitosamente');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || error.message || 'Error al eliminar recurso';
      toast.error(message);
    },
  });
}

// ===== HOOKS AUXILIARES =====

/**
 * ✅ NUEVO: Hook para validar si un recurso puede ser prestado
 */
export function useCanResourceBeLent(resourceId: string, requestedQuantity: number = 1) {
  return useQuery({
    queryKey: ['resources', 'can-lend', resourceId, requestedQuantity],
    queryFn: () => ResourceService.canResourceBeLent(resourceId, requestedQuantity),
    enabled: !!resourceId && requestedQuantity > 0,
    staleTime: 30 * 1000,      // 30 segundos
    gcTime: 2 * 60 * 1000,     // 2 minutos
    retry: 1,
    refetchOnMount: true,
  });
}

/**
 * ✅ NUEVO: Hook personalizado para gestión completa de stock
 */
export function useResourceStockManagement(resourceId: string) {
  const queryClient = useQueryClient();
  
  const resource = useResource(resourceId);
  const availability = useResourceAvailability(resourceId);
  
  const updateQuantity = useMutation({
    mutationFn: (newQuantity: number) => ResourceService.updateResourceQuantity({
      resourceId,
      newTotalQuantity: newQuantity,
      reason: 'Actualización manual desde panel de gestión'
    }),
    onSuccess: (updatedResource) => {
      // Actualizar todos los caches relacionados
      queryClient.setQueryData(RESOURCE_QUERY_KEYS.resource(resourceId), updatedResource);
      queryClient.invalidateQueries({ 
        queryKey: RESOURCE_QUERY_KEYS.resourceAvailability(resourceId) 
      });
      queryClient.invalidateQueries({ queryKey: RESOURCE_QUERY_KEYS.resources });
      
      toast.success(`Cantidad actualizada: ${updatedResource.totalQuantity} unidades`);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Error al actualizar cantidad');
    },
  });

  return {
    resource: resource.data,
    availability: availability.data,
    isLoading: resource.isLoading || availability.isLoading,
    isError: resource.isError || availability.isError,
    error: resource.error || availability.error,
    updateQuantity: updateQuantity.mutate,
    isUpdating: updateQuantity.isPending,
    refetch: () => {
      resource.refetch();
      availability.refetch();
    },
  };
}

/**
 * ✅ NUEVO: Hook para alertas de stock
 */
export function useStockAlerts(lowStockThreshold: number = 5) {
  const lowStock = useLowStockResources(lowStockThreshold);
  const noStock = useNoStockResources();

  const alerts = [
    ...(lowStock.data || []).map(resource => ({
      type: 'low_stock' as const,
      resourceId: resource._id,
      title: resource.title,
      currentStock: resource.availableQuantity || 0,
      totalQuantity: resource.totalQuantity,
      threshold: lowStockThreshold,
    })),
    ...(noStock.data || []).map(resource => ({
      type: 'no_stock' as const,
      resourceId: resource._id,
      title: resource.title,
      currentStock: 0,
      totalQuantity: resource.totalQuantity,
    })),
  ];

  return {
    alerts,
    lowStockCount: lowStock.data?.length || 0,
    noStockCount: noStock.data?.length || 0,
    totalAlertsCount: alerts.length,
    isLoading: lowStock.isLoading || noStock.isLoading,
    isError: lowStock.isError || noStock.isError,
    refetch: () => {
      lowStock.refetch();
      noStock.refetch();
    },
  };
}

/**
 * Hook para prefetch de datos relacionados
 */
export function usePrefetchResourceData() {
  const queryClient = useQueryClient();

  const prefetchResource = (id: string) => {
    queryClient.prefetchQuery({
      queryKey: RESOURCE_QUERY_KEYS.resource(id),
      queryFn: () => ResourceService.getResourceById(id),
      staleTime: 10 * 60 * 1000,
    });
  };

  const prefetchAvailability = (id: string) => {
    queryClient.prefetchQuery({
      queryKey: RESOURCE_QUERY_KEYS.resourceAvailability(id),
      queryFn: () => ResourceService.checkResourceAvailability(id),
      staleTime: 30 * 1000,
    });
  };

  return {
    prefetchResource,
    prefetchAvailability,
  };
}

// ===== RE-EXPORTACIONES PARA COMPATIBILIDAD =====
// Estos re-exports son para mantener compatibilidad con código existente
// que importa estos hooks desde useResources

// Re-export desde useCategories
export { 
  useCategories, 
  useCategory, 
  useCreateCategory, 
  useUpdateCategory, 
  useDeleteCategory,
  useActiveCategories,
  useCategoriesWithColors
} from './useCategories';

// Re-export desde useAuthors
export { 
  useAuthors, 
  useAuthor, 
  useCreateAuthor, 
  useUpdateAuthor, 
  useDeleteAuthor,
  useSearchAuthors,
  useAuthorSearch,
  useBulkCreateAuthors
} from './useAuthors';

// Re-export desde usePublishers
export { 
  usePublishers, 
  usePublisher, 
  useCreatePublisher, 
  useUpdatePublisher, 
  useDeletePublisher,
  useFindOrCreatePublisher
} from './usePublishers';

// Re-export desde useLocations
export { 
  useLocations, 
  useLocation, 
  useCreateLocation, 
  useUpdateLocation, 
  useDeleteLocation,
  useActiveLocations
} from './useLocations';

// Re-export desde useResourceTypes
export { 
  useResourceTypes, 
  useResourceType, 
  useCreateResourceType, 
  useUpdateResourceType, 
  useDeleteResourceType,
  useActiveResourceTypes,
  useActivateResourceType,
  useDeactivateResourceType
} from './useResourceTypes';

// Re-export desde useResourceStates
export { 
  useResourceStates, 
  useResourceState, 
  useCreateResourceState, 
  useUpdateResourceState, 
  useDeleteResourceState,
  useActiveResourceStates,
  useActivateResourceState,
  useDeactivateResourceState
} from './useResourceStates';